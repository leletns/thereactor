import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, type ReactorAppointment } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = getSupabase()
      .from("reactor_appointments")
      .select("*")
      .order("scheduled_at", { ascending: true })
      .limit(500);

    if (from) query = query.gte("scheduled_at", from);
    if (to) query = query.lte("scheduled_at", to);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const appointments = (data ?? []) as ReactorAppointment[];
    const count = (s: ReactorAppointment["status"]) =>
      appointments.filter((a) => a.status === s).length;
    const attended = count("realizado");
    const missed = count("faltou") + count("cancelado");

    return apiOk({
      appointments,
      stats: {
        total: appointments.length,
        agendados: count("agendado"),
        confirmados: count("confirmado"),
        realizados: attended,
        faltas: count("faltou"),
        cancelados: count("cancelado"),
        taxaComparecimento:
          attended + missed ? Math.round((attended / (attended + missed)) * 100) : 0,
        receitaPrevista: appointments
          .filter((a) => a.status === "agendado" || a.status === "confirmado")
          .reduce((sum, a) => sum + Number(a.value ?? 0), 0),
      },
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
