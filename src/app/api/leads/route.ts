import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, type ReactorLead } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

const PIPELINE_STAGES = [
  "prospeccao",
  "qualificacao",
  "proposta",
  "fechamento",
] as const;

const LEAD_STATUSES = [
  ...PIPELINE_STAGES,
  "ganho",
  "perdido",
] as const;

type LeadStatus = (typeof LEAD_STATUSES)[number];

function parseStatus(value: string | null): LeadStatus | null {
  return LEAD_STATUSES.includes(value as LeadStatus) ? (value as LeadStatus) : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = parseStatus(searchParams.get("status"));
    const limit = Number(searchParams.get("limit") ?? 200);

    let query = getSupabase()
      .from("reactor_leads")
      .select("*")
      .order("score", { ascending: false, nullsFirst: false })
      .limit(Number.isFinite(limit) ? Math.min(limit, 500) : 200);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const leads = (data ?? []) as ReactorLead[];
    const open = leads.filter((l) =>
      (PIPELINE_STAGES as readonly string[]).includes(l.status)
    );
    const won = leads.filter((l) => l.status === "ganho");
    const closed = won.length + leads.filter((l) => l.status === "perdido").length;
    const scored = leads.filter((l) => typeof l.score === "number");

    return apiOk({
      leads,
      stats: {
        total: leads.length,
        open: open.length,
        won: won.length,
        pipelineValue: open.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
        wonValue: won.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
        avgScore: scored.length
          ? Math.round(
              scored.reduce((sum, l) => sum + Number(l.score), 0) / scored.length
            )
          : 0,
        conversionRate: closed ? Math.round((won.length / closed) * 100) : 0,
        byStage: PIPELINE_STAGES.map((stage) => ({
          stage,
          count: leads.filter((l) => l.status === stage).length,
          value: leads
            .filter((l) => l.status === stage)
            .reduce((sum, l) => sum + Number(l.value ?? 0), 0),
        })),
      },
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
