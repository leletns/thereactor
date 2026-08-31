import { apiFail, apiOk, isConfigError } from "@/lib/api";
import {
  getSupabase,
  type ReactorLead,
  type ReactorPipeline,
  type ReactorPipelineStatus,
} from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

export interface BoardColumn {
  key: string;
  /** null while the Kommo mirror has not run yet. */
  kommoStatusId: number | null;
  kommoPipelineId: number | null;
  name: string;
  color: string;
  sort: number;
  terminal: boolean;
  count: number;
  value: number;
  leads: ReactorLead[];
}

/**
 * Before the first Kommo sync there are no mirrored statuses, so the board
 * falls back to The Reactor's own six-stage funnel. Same shape either way, so
 * the UI never has to branch.
 */
const FALLBACK_COLUMNS: { key: string; name: string; color: string; terminal: boolean }[] = [
  { key: "prospeccao", name: "Prospecção", color: "#c9d4ff", terminal: false },
  { key: "qualificacao", name: "Qualificação", color: "#abf0ff", terminal: false },
  { key: "proposta", name: "Proposta", color: "#ffe1b8", terminal: false },
  { key: "fechamento", name: "Fechamento", color: "#d8c9ff", terminal: false },
  { key: "ganho", name: "Ganho", color: "#bcfe90", terminal: true },
  { key: "perdido", name: "Perdido", color: "#ffc9c9", terminal: true },
];

const KOMMO_WON = 142;
const KOMMO_LOST = 143;

export async function GET(request: Request) {
  try {
    const db = getSupabase();
    const { searchParams } = new URL(request.url);
    const requestedPipeline = searchParams.get("pipeline");

    const [pipelinesResult, statusesResult, leadsResult] = await Promise.all([
      db.from("reactor_pipelines").select("*").order("sort", { ascending: true }),
      db
        .from("reactor_pipeline_statuses")
        .select("*")
        .order("sort", { ascending: true }),
      db.from("reactor_leads").select("*").order("value", { ascending: false }),
    ]);

    const firstError =
      pipelinesResult.error ?? statusesResult.error ?? leadsResult.error;
    if (firstError) throw new Error(firstError.message);

    const pipelines = (pipelinesResult.data ?? []) as ReactorPipeline[];
    const allStatuses = (statusesResult.data ?? []) as ReactorPipelineStatus[];
    const allLeads = (leadsResult.data ?? []) as ReactorLead[];

    const mirrored = pipelines.length > 0 && allStatuses.length > 0;

    // Pick the pipeline: explicit request, then the main one, then the first.
    const activePipeline = mirrored
      ? pipelines.find((p) => String(p.kommo_pipeline_id) === requestedPipeline) ??
        pipelines.find((p) => p.is_main) ??
        pipelines[0]
      : null;

    let columns: BoardColumn[];
    let leads: ReactorLead[];

    if (mirrored && activePipeline) {
      leads = allLeads.filter(
        (l) => l.kommo_pipeline_id === activePipeline.kommo_pipeline_id
      );
      columns = allStatuses
        .filter((s) => s.kommo_pipeline_id === activePipeline.kommo_pipeline_id)
        .sort((a, b) => a.sort - b.sort)
        .map((status) => {
          const columnLeads = leads.filter(
            (l) => l.kommo_status_id === status.kommo_status_id
          );
          return {
            key: String(status.kommo_status_id),
            kommoStatusId: status.kommo_status_id,
            kommoPipelineId: status.kommo_pipeline_id,
            name: status.name,
            color: status.color ?? "#d0d4e4",
            sort: status.sort,
            terminal:
              status.type === 1 ||
              status.kommo_status_id === KOMMO_WON ||
              status.kommo_status_id === KOMMO_LOST,
            count: columnLeads.length,
            value: columnLeads.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
            leads: columnLeads,
          };
        });
    } else {
      leads = allLeads;
      columns = FALLBACK_COLUMNS.map((column, index) => {
        const columnLeads = leads.filter((l) => l.status === column.key);
        return {
          key: column.key,
          kommoStatusId: null,
          kommoPipelineId: null,
          name: column.name,
          color: column.color,
          sort: index,
          terminal: column.terminal,
          count: columnLeads.length,
          value: columnLeads.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
          leads: columnLeads,
        };
      });
    }

    const openColumns = columns.filter((c) => !c.terminal);
    const won = columns.find((c) => c.kommoStatusId === KOMMO_WON || c.key === "ganho");
    const lost = columns.find((c) => c.kommoStatusId === KOMMO_LOST || c.key === "perdido");
    const decided = (won?.count ?? 0) + (lost?.count ?? 0);
    const scored = leads.filter((l) => typeof l.score === "number");

    return apiOk({
      mirrored,
      pipelines: pipelines.map((p) => ({
        id: p.kommo_pipeline_id,
        name: p.name,
        isMain: p.is_main,
      })),
      activePipelineId: activePipeline?.kommo_pipeline_id ?? null,
      activePipelineName: activePipeline?.name ?? "Funil do Reactor",
      columns,
      stats: {
        total: leads.length,
        open: openColumns.reduce((sum, c) => sum + c.count, 0),
        openValue: openColumns.reduce((sum, c) => sum + c.value, 0),
        won: won?.count ?? 0,
        wonValue: won?.value ?? 0,
        lost: lost?.count ?? 0,
        conversionRate: decided ? Math.round(((won?.count ?? 0) / decided) * 100) : 0,
        avgScore: scored.length
          ? Math.round(scored.reduce((sum, l) => sum + Number(l.score), 0) / scored.length)
          : 0,
        avgTicket: leads.length
          ? Math.round(
              leads.reduce((sum, l) => sum + Number(l.value ?? 0), 0) / leads.length
            )
          : 0,
      },
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
