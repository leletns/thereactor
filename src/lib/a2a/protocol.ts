import { AgentRole } from "@/lib/nucleus/registry";
import { generateId } from "@/lib/utils";

export interface A2AMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | "broadcast";
  type: "request" | "response" | "event" | "delegation";
  payload: {
    task?: string;
    result?: string;
    data?: unknown;
    priority?: "low" | "medium" | "high" | "critical";
  };
  timestamp: string;
  sessionId: string;
  parentMessageId?: string;
}

export function createA2AMessage(
  from: AgentRole,
  to: AgentRole | "broadcast",
  type: A2AMessage["type"],
  payload: A2AMessage["payload"],
  sessionId: string,
  parentMessageId?: string
): A2AMessage {
  return {
    id: generateId(),
    from,
    to,
    type,
    payload,
    timestamp: new Date().toISOString(),
    sessionId,
    parentMessageId,
  };
}

export function validateA2AMessage(msg: unknown): msg is A2AMessage {
  if (!msg || typeof msg !== "object") return false;

  const m = msg as Record<string, unknown>;

  const validRoles: Array<AgentRole | "broadcast"> = [
    "orchestrator",
    "finance",
    "sdr",
    "marketing",
    "ops",
    "responder",
    "broadcast",
  ];

  const validTypes: A2AMessage["type"][] = [
    "request",
    "response",
    "event",
    "delegation",
  ];

  return (
    typeof m.id === "string" &&
    typeof m.from === "string" &&
    validRoles.includes(m.from as AgentRole) &&
    typeof m.to === "string" &&
    validRoles.includes(m.to as AgentRole | "broadcast") &&
    typeof m.type === "string" &&
    validTypes.includes(m.type as A2AMessage["type"]) &&
    typeof m.payload === "object" &&
    m.payload !== null &&
    typeof m.timestamp === "string" &&
    typeof m.sessionId === "string"
  );
}

export function serializeA2AMessage(msg: A2AMessage): string {
  return JSON.stringify(msg);
}

export function deserializeA2AMessage(data: string): A2AMessage | null {
  try {
    const parsed = JSON.parse(data);
    if (validateA2AMessage(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}
