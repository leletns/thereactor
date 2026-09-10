import { NextRequest } from "next/server";
import { apiFail, apiOk } from "@/lib/api";
import { getSupabase } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

/** Teto de leads por requisição — o board nunca pinta mais que isso de uma vez. */
const MAX_LEADS = 200;
/** Quantas consultas simultâneas mandamos ao Postgres por vez. */
const CHUNK = 25;

export interface MessagePreview {
  body: string;
  direction: "in" | "out";
  createdAt: string;
  authorKind: string;
}

/**
 * Retorna o preview da última mensagem por lead — usado nos cards do
 * pipeline para exibir a última conversa antes de arrastar o card.
 *
 * Uma consulta por lead (limit 1). Parece mais caro que um `in(...)` único,
 * mas é o oposto: um único SELECT ordenado por created_at teria que trazer
 * todas as mensagens de todos os leads para garantir uma por lead — e se
 * cortássemos com um LIMIT global, um lead conversador consumiria a cota
 * inteira e os demais voltariam vazios ("Sem mensagens" mentiroso).
 *
 * GET /api/messages/preview?leadIds=uuid1,uuid2,...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("leadIds") ?? "";
    const leadIds = Array.from(
      new Set(
        raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    ).slice(0, MAX_LEADS);

    if (!leadIds.length) return apiOk({});

    const db = getSupabase();
    const preview: Record<string, MessagePreview> = {};

    for (let i = 0; i < leadIds.length; i += CHUNK) {
      const batch = leadIds.slice(i, i + CHUNK);
      const rows = await Promise.all(
        batch.map(async (leadId) => {
          const { data, error } = await db
            .from("reactor_lead_messages")
            .select("lead_id, body, direction, created_at, author_kind")
            .eq("lead_id", leadId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw new Error(error.message);
          return data;
        })
      );

      for (const msg of rows) {
        if (!msg?.lead_id) continue;
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
