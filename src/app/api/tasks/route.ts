import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, type ReactorTask } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

const TASK_STATUSES = ["aberta", "em_progresso", "concluida", "cancelada"] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

function parseStatus(value: string | null): TaskStatus | null {
  return TASK_STATUSES.includes(value as TaskStatus) ? (value as TaskStatus) : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = parseStatus(searchParams.get("status"));

    let query = getSupabase()
      .from("reactor_tasks")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(300);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const tasks = (data ?? []) as ReactorTask[];
    const count = (s: ReactorTask["status"]) =>
      tasks.filter((t) => t.status === s).length;
    const finished = count("concluida");
    const relevant = tasks.filter((t) => t.status !== "cancelada").length;

    return apiOk({
      tasks,
      stats: {
        total: tasks.length,
        abertas: count("aberta"),
        emProgresso: count("em_progresso"),
        concluidas: finished,
        canceladas: count("cancelada"),
        conclusao: relevant ? Math.round((finished / relevant) * 100) : 0,
        criticas: tasks.filter(
          (t) => t.priority === "critica" && t.status !== "concluida"
        ).length,
      },
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
