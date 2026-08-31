import { agentRegistry } from "@/lib/nucleus/registry";
import { apiOk } from "@/lib/api";
import { getSupabase, isSupabaseConfigured } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

/** Actually round-trips to Postgres instead of only checking env vars. */
async function pingDatabase() {
  if (!isSupabaseConfigured()) return { reachable: false, detail: "env vars ausentes" };
  try {
    const { error } = await getSupabase()
      .from("reactor_leads")
      .select("id", { count: "exact", head: true });
    if (error) return { reachable: false, detail: error.message };
    return { reachable: true, detail: null as string | null };
  } catch (error) {
    return {
      reachable: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const agents = agentRegistry.getAll();
  const onlineAgents = agents.filter((a) => a.status !== "offline");

  const hasAI = !!process.env.GROQ_API_KEY;
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasEvolution =
    !!process.env.EVOLUTION_API_URL && !!process.env.EVOLUTION_API_KEY;
  const hasKommo =
    !!process.env.KOMMO_SUBDOMAIN && !!process.env.KOMMO_ACCESS_TOKEN;

  const database = await pingDatabase();
  const status = database.reachable ? "operational" : "degraded";

  // Same { ok, data } envelope as every other route, so one client works for all.
  return apiOk({
    status,
    reactor: {
      version: "1.0.0",
      codename: "The Reactor",
      organization: "lhex systems",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    agents: {
      total: agents.length,
      online: onlineAgents.length,
      list: agents.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        status: a.status,
      })),
    },
    integrations: {
      ai_engine: hasAI ? "configured" : "demo_mode",
      supabase: !hasSupabase
        ? "missing"
        : database.reachable
        ? "connected"
        : "unreachable",
      supabase_error: database.detail,
      kommo: hasKommo ? "configured" : "missing",
      evolution: hasEvolution ? "configured" : "missing",
    },
    features: {
      ai_chat: hasAI,
      database: database.reachable,
      crm_sync: hasKommo && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      whatsapp: hasEvolution,
      a2a_protocol: true,
      mcp_tools: true,
    },
  });
}
