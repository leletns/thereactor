import { NextRequest } from "next/server";
import { apiFail, apiOk } from "@/lib/api";
import { getSupabase } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

/**
 * Retorna o preview da última mensagem por lead — usado nos cards do
 * pipeline para exibir a última conversa antes de arrastar o card.
 *
 * GET /api/messages/preview?leadIds=uuid1,uuid2,...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("leadIds") ?? "";
    const leadIds = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!leadIds.length) return apiOk({});

    const { data, error } = await getSupabase()
      .from("reactor_lead_messages")
      .select("lead_id, body, direction, created_at, author_kind")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false })
      .limit(leadIds.length * 5); // generous but bounded

    if (error) throw new Error(error.message);

    // Keep only the most recent message per lead
    const preview: Record<
      string,
      { body: string; direction: "in" | "out"; createdAt: string; authorKind: string }
    > = {};

    for (const msg of data ?? []) {
      if (msg.lead_id && !preview[msg.lead_id]) {
        preview[msg.lead_id] = {
          body: msg.body,
          direction: msg.direction as "in" | "out",
          createdAt: msg.created_at,
          authorKind: msg.author_kind,
        };
      }
    }

    return apiOk(preview);
  } catch (error) {
    return apiFail(error);
  }
}
