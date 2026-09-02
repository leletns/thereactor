import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, getSupabaseAdmin, type Json } from "@/lib/fusion/supabase";
import { isKommoChatConfigured, sendKommoChatMessage } from "@/lib/fusion/kommo-chats";

export const dynamic = "force-dynamic";

/** Conversa de um lead — ordem cronológica, mais antiga primeiro (como um chat de verdade). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    if (!leadId) return apiFail("Parametro leadId e obrigatorio.", 400);

    const { data, error } = await getSupabase()
      .from("reactor_lead_messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);

    return apiOk({ messages: data ?? [], kommoChatReady: isKommoChatConfigured() });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}

interface SendBody {
  leadId: string;
  text: string;
  kommoLeadId?: number | null;
  kommoChatId?: string | null;
  authorName?: string;
}

/**
 * Registra a mensagem na conversa do Reactor e, quando o canal de chat do
 * Kommo estiver configurado E a conversa tiver um conversation_id conhecido,
 * também tenta enviar de verdade pelo WhatsApp. Sem isso, a mensagem fica
 * salva (status "pending") — visivel pro time, mas ainda nao confirmada
 * como entregue de verdade.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendBody;
    if (!body?.leadId || !body?.text?.trim()) {
      return apiFail("Parametros leadId e text sao obrigatorios.", 400);
    }

    const db = getSupabaseAdmin();
    const text = body.text.trim();

    let status: "pending" | "sent" | "failed" = "pending";
    const metadata: Record<string, unknown> = { delivered_via: "reactor_only" };

    if (isKommoChatConfigured() && body.kommoChatId) {
      const result = await sendKommoChatMessage({
        conversationId: body.kommoChatId,
        text,
        senderName: body.authorName ?? "Blue Clinica",
      });
      if (result.ok) {
        status = "sent";
        metadata.delivered_via = "kommo";
        metadata.kommo_msgid = result.msgid;
      } else {
        status = "failed";
        metadata.delivered_via = "kommo";
        metadata.error = result.error;
      }
    }

    const { data, error } = await db
      .from("reactor_lead_messages")
      .insert({
        lead_id: body.leadId,
        kommo_lead_id: body.kommoLeadId ?? null,
        kommo_chat_id: body.kommoChatId ?? null,
        direction: "out",
        author_kind: "agent",
        author_name: body.authorName ?? "Equipe Blue Clinica",
        body: text,
        status,
        sent_at: status === "sent" ? new Date().toISOString() : null,
        metadata: metadata as unknown as Json,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return apiOk({ message: data });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
