import { NextResponse } from "next/server";
import { agentRegistry } from "@/lib/nucleus/registry";

export async function GET() {
  const agents = agentRegistry.getAll();
  const onlineAgents = agents.filter((a) => a.status !== "offline");

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasEvolution =
    !!process.env.EVOLUTION_API_URL && !!process.env.EVOLUTION_API_KEY;

  const status = hasAnthropicKey ? "operational" : "degraded";

  return NextResponse.json({
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
      anthropic: hasAnthropicKey ? "configured" : "missing",
      supabase: hasSupabase ? "configured" : "missing",
      evolution: hasEvolution ? "configured" : "missing",
    },
    features: {
      ai_chat: hasAnthropicKey,
      database: hasSupabase,
      whatsapp: hasEvolution,
      a2a_protocol: true,
      mcp_tools: true,
    },
  });
}
