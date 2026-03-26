import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/lib/nucleus/orchestrator";
import { AgentRole } from "@/lib/nucleus/registry";
import { agentRegistry } from "@/lib/nucleus/registry";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  agentRole?: AgentRole;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, agentRole = "orchestrator", sessionId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 503 }
      );
    }

    const validRoles: AgentRole[] = [
      "orchestrator",
      "finance",
      "sdr",
      "marketing",
      "ops",
      "responder",
    ];

    const resolvedRole = validRoles.includes(agentRole) ? agentRole : "orchestrator";

    // Update agent status to processing
    const agent = agentRegistry.getByRole(resolvedRole);
    if (agent) {
      agentRegistry.updateStatus(agent.id, "processing");
    }

    const stream = await orchestrator.chat(messages, resolvedRole);

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            if (event.type === "message_stop") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          }
        } catch (error) {
          const errMsg = JSON.stringify({
            error: error instanceof Error ? error.message : "Stream error",
          });
          controller.enqueue(encoder.encode(`data: ${errMsg}\n\n`));
        } finally {
          // Restore agent status
          if (agent) {
            agentRegistry.updateStatus(agent.id, "online");
            agentRegistry.incrementMessages(agent.id);
          }
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Session-ID": sessionId ?? "",
        "X-Agent-Role": resolvedRole,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/chat",
    description: "Reactor AI Chat API",
  });
}
