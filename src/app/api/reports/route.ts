import { apiFail, apiOk, isConfigError } from "@/lib/api";
import {
  getSupabase,
  getSupabaseAdmin,
  type Json,
  type ReactorReport,
} from "@/lib/fusion/supabase";
import { writeReportNarrative } from "@/lib/ai/copilot";
import { buildSnapshot } from "@/lib/reactor/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PERIOD_DAYS = { diario: 1, semanal: 7, mensal: 30 } as const;
type Period = keyof typeof PERIOD_DAYS;

function parsePeriod(value: unknown): Period {
  return value === "diario" || value === "mensal" ? value : "semanal";
}

/** Previously generated reports, newest first. */
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("reactor_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);
    if (error) throw new Error(error.message);
    return apiOk({ reports: (data ?? []) as ReactorReport[] });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}

/**
 * Generates a report from live data. Persisting needs the service role key, so
 * without it the report is still returned — just not saved.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const period = parsePeriod((body as { period?: string })?.period);
    const days = PERIOD_DAYS[period];

    const snapshot = await buildSnapshot(days);
    const { summary, source, findings } = await writeReportNarrative(snapshot);

    const label = { diario: "Diário", semanal: "Semanal", mensal: "Mensal" }[period];
    const title = `Relatório ${label} — ${new Date(snapshot.period.end).toLocaleDateString("pt-BR")}`;

    const report = {
      period,
      period_start: snapshot.period.start,
      period_end: snapshot.period.end,
      title,
      summary,
      metrics: snapshot as unknown as Json,
      highlights: findings as unknown as Json,
      generated_by: source === "groq" ? "reactor-ai" : "reactor",
    };

    let saved = false;
    let id: string | null = null;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = getSupabaseAdmin();
      const { data, error } = await db
        .from("reactor_reports")
        .insert(report)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      saved = true;
      id = data?.id ?? null;

      await db.from("reactor_events").insert({
        type: "report.generated",
        source: "reactor",
        payload: { period, id },
        processed: true,
        processed_at: new Date().toISOString(),
      });
    }

    return apiOk({ ...report, id, saved, source });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
