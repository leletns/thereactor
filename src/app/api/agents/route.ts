import { NextRequest, NextResponse } from "next/server";
import { agentRegistry } from "@/lib/nucleus/registry";
import { AgentStatus } from "@/lib/nucleus/registry";

export async function GET() {
  const agents = agentRegistry.getAll();
  return NextResponse.json({
    agents,
    total: agents.length,
    online: agents.filter((a) => a.status === "online").length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, status } = body as { agentId: string; status: AgentStatus };

    if (!agentId || !status) {
      return NextResponse.json(
        { error: "agentId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses: AgentStatus[] = ["online", "processing", "idle", "offline"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = agentRegistry.updateStatus(agentId, status);

    if (!updated) {
      return NextResponse.json(
        { error: `Agent with id '${agentId}' not found` },
        { status: 404 }
      );
    }

    const agent = agentRegistry.get(agentId);

    return NextResponse.json({
      success: true,
      agent,
      message: `Agent ${agent?.name} status updated to ${status}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
