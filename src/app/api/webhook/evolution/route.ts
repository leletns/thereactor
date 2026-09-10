import { NextRequest, NextResponse } from "next/server";
import { agentRegistry } from "@/lib/nucleus/registry";
import { broker } from "@/lib/a2a/broker";
import { createA2AMessage } from "@/lib/a2a/protocol";
import { generateId } from "@/lib/utils";
import { getSupabase, getSupabaseAdmin } from "@/lib/fusion/supabase";
import { matchLeadByPhone, phoneFromJid } from "@/lib/fusion/lead-match";

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
    key?: {
      remoteJid?: string;
      fromMe?: boolean;
      id?: string;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: { text: string };
      imageMessage?: { caption?: string };
      audioMessage?: object;
    };
    messageType?: string;
    pushName?: string;
    timestamp?: number;
  };
  destination?: string;
  date_time?: string;
  sender?: string;
  server_url?: string;
  apikey?: string;
}

function extractMessageText(payload: EvolutionWebhookPayload): string | null {
  const msg = payload.data.message;
  if (!msg) return null;

  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  return null;
}

/**
 * Grava a mensagem recebida em reactor_lead_messages — é o que alimenta o
 * preview nos cards do pipeline e a aba "Mensagens".
 *
 * Nunca lança: a entrega do WhatsApp não pode depender do banco estar de pé.
 * Se a gravação falhar, o roteamento para os agentes segue normalmente e o
 * erro fica no log.
 */
async function persistInboundMessage(options: {
  jid: string;
  senderName: string;
  text: string;
  instance: string;
  evolutionMessageId: string | null;
  timestamp: number | null;
}) {
  const { jid, senderName, text, instance, evolutionMessageId, timestamp } = options;
  const phone = phoneFromJid(jid);

  try {
    const db = getSupabaseAdmin();

    // O Evolution reentrega o mesmo evento quando não recebe 200 a tempo.
    if (evolutionMessageId) {
      const { data: existing } = await db
        .from("reactor_lead_messages")
        .select("id")
        .eq("metadata->>evolution_message_id", evolutionMessageId)
        .limit(1)
        .maybeSingle();
      if (existing) return { stored: false, reason: "duplicate" as const };
    }

    // O telefone do Kommo vem em formato livre, então o casamento acontece em
    // memória (ver lead-match.ts). São poucos milhares de linhas de uma coluna.
    const { data: leads, error: leadsError } = await getSupabase()
      .from("reactor_leads")
      .select("id, phone, kommo_lead_id")
      .not("phone", "is", null);
    if (leadsError) throw new Error(leadsError.message);

    const lead = matchLeadByPhone(leads ?? [], phone);

    const { error } = await db.from("reactor_lead_messages").insert({
      lead_id: lead?.id ?? null,
      kommo_lead_id: lead?.kommo_lead_id ?? null,
      direction: "in",
      author_kind: "lead",
      author_name: senderName,
      body: text,
      status: "delivered",
      sent_at: timestamp ? new Date(timestamp * 1000).toISOString() : null,
      metadata: {
        source: "evolution",
        instance,
        phone,
        remote_jid: jid,
        evolution_message_id: evolutionMessageId,
        // Sem lead casado a mensagem ainda é guardada: o telefone acima permite
        // ligá-la depois, quando o lead entrar pelo sync. Perder a conversa
        // seria pior que guardá-la órfã.
        unmatched: !lead,
      },
    });
    if (error) throw new Error(error.message);

    return { stored: true, leadId: lead?.id ?? null };
  } catch (error) {
    console.error(
      "[Evolution Webhook] Falha ao gravar mensagem:",
      error instanceof Error ? error.message : error
    );
    return { stored: false, reason: "error" as const };
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: EvolutionWebhookPayload = await request.json();

    // Only handle incoming messages (not from us)
    if (
      payload.event !== "messages.upsert" &&
      payload.event !== "MESSAGES_UPSERT"
    ) {
      return NextResponse.json({ received: true, processed: false });
    }

    if (payload.data.key?.fromMe) {
      return NextResponse.json({ received: true, processed: false, reason: "own_message" });
    }

    const messageText = extractMessageText(payload);
    if (!messageText) {
      return NextResponse.json({ received: true, processed: false, reason: "no_text" });
    }

    const senderJid = payload.data.key?.remoteJid ?? "unknown";
    const senderName = payload.data.pushName ?? senderJid.split("@")[0];
    const sessionId = generateId();

    // Persistir vem antes do roteamento: é o registro da conversa, e o que
    // aparece no pipeline. Os agentes rodam em memória e são reconstruíveis.
    const persisted = await persistInboundMessage({
      jid: senderJid,
      senderName,
      text: messageText,
      instance: payload.instance,
      evolutionMessageId: payload.data.key?.id ?? null,
      timestamp: payload.data.timestamp ?? null,
    });

    // Publish A2A event to responder agent
    const a2aMessage = createA2AMessage(
      "orchestrator",
      "responder",
      "delegation",
      {
        task: `Respond to WhatsApp message from ${senderName}: "${messageText}"`,
        data: {
          phone: senderJid,
          senderName,
          message: messageText,
          instance: payload.instance,
          timestamp: payload.data.timestamp,
        },
        priority: "high",
      },
      sessionId
    );

    await broker.publish(a2aMessage);

    // Update responder agent status
    const responder = agentRegistry.getByRole("responder");
    if (responder) {
      agentRegistry.updateStatus(responder.id, "processing");
      agentRegistry.incrementMessages(responder.id);
    }

    // Also notify orchestrator
    await broker.broadcast(
      "responder",
      {
        task: "whatsapp_message_received",
        data: {
          from: senderName,
          preview: messageText.substring(0, 50),
          instance: payload.instance,
        },
        priority: "medium",
      },
      sessionId
    );

    console.log(
      `[Evolution Webhook] Message from ${senderName} (${senderJid}): "${messageText.substring(0, 50)}..."`
    );

    return NextResponse.json({
      received: true,
      processed: true,
      sessionId,
      stored: persisted.stored,
      leadId: "leadId" in persisted ? persisted.leadId : null,
      message: "Message routed to Responder agent",
    });
  } catch (error) {
    console.error("[Evolution Webhook] Error:", error);
    return NextResponse.json(
      {
        received: true,
        processed: false,
        error: "Processing error",
      },
      { status: 200 } // Always 200 to avoid retries
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "Evolution API Webhook",
    description: "Receives WhatsApp messages and routes to Responder agent",
  });
}
