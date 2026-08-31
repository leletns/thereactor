import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase } from "@/lib/fusion/supabase";
import { agentRegistry } from "@/lib/nucleus/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getSupabase();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [messagesToday, sessions, events, leads] = await Promise.all([
      db
        .from("reactor_messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString()),
      db
        .from("reactor_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      db
        .from("reactor_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      db.from("reactor_leads").select("id", { count: "exact", head: true }),
    ]);

    const firstError =
      messagesToday.error ?? sessions.error ?? events.error ?? leads.error;
    if (firstError) throw new Error(firstError.message);

    const agents = agentRegistry.getAll();

    return apiOk({
      messagesToday: messagesToday.count ?? 0,
      activeSessions: sessions.count ?? 0,
      totalLeads: leads.count ?? 0,
      agents: {
        total: agents.length,
        online: agents.filter((a) => a.status !== "offline").length,
      },
      events: events.data ?? [],
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
