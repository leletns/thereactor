import { NextRequest, NextResponse } from "next/server";
import { agentRegistry } from "@/lib/nucleus/registry";
import { broker } from "@/lib/a2a/broker";
import { createA2AMessage } from "@/lib/a2a/protocol";
import { generateId } from "@/lib/utils";

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
