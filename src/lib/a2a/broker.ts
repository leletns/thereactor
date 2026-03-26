import { A2AMessage, createA2AMessage } from "./protocol";
import { AgentRole } from "@/lib/nucleus/registry";
import { generateId } from "@/lib/utils";

type MessageHandler = (message: A2AMessage) => void | Promise<void>;

export class A2ABroker {
  private queues: Map<string, A2AMessage[]>;
  private subscribers: Map<string, MessageHandler[]>;
  private history: Map<string, A2AMessage[]>;
  private globalHistory: A2AMessage[];
  private maxHistorySize: number;

  constructor(maxHistorySize = 1000) {
    this.queues = new Map();
    this.subscribers = new Map();
    this.history = new Map();
    this.globalHistory = [];
    this.maxHistorySize = maxHistorySize;
  }

  subscribe(agentId: string, handler: MessageHandler): () => void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, []);
    }
    this.subscribers.get(agentId)!.push(handler);

    return () => {
      const handlers = this.subscribers.get(agentId) ?? [];
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  }

  async publish(message: A2AMessage): Promise<void> {
    this.recordMessage(message);

    if (message.to === "broadcast") {
      const allSubscribers = Array.from(this.subscribers.entries());
      await Promise.all(
        allSubscribers.map(([, handlers]) =>
          Promise.all(handlers.map((h) => h(message)))
        )
      );
      return;
    }

    const targetHandlers = this.subscribers.get(message.to) ?? [];
    if (targetHandlers.length > 0) {
      await Promise.all(targetHandlers.map((h) => h(message)));
    } else {
      if (!this.queues.has(message.to)) {
        this.queues.set(message.to, []);
      }
      this.queues.get(message.to)!.push(message);
    }
  }

  async broadcast(
    from: AgentRole,
    payload: A2AMessage["payload"],
    sessionId?: string
  ): Promise<void> {
    const message = createA2AMessage(
      from,
      "broadcast",
      "event",
      payload,
      sessionId ?? generateId()
    );
    await this.publish(message);
  }

  getPendingMessages(agentId: string): A2AMessage[] {
    const messages = this.queues.get(agentId) ?? [];
    this.queues.set(agentId, []);
    return messages;
  }

  getHistory(sessionId: string): A2AMessage[] {
    return this.history.get(sessionId) ?? [];
  }

  getGlobalHistory(limit = 50): A2AMessage[] {
    return this.globalHistory.slice(-limit);
  }

  clearHistory(sessionId: string): void {
    this.history.delete(sessionId);
  }

  private recordMessage(message: A2AMessage): void {
    if (!this.history.has(message.sessionId)) {
      this.history.set(message.sessionId, []);
    }
    const sessionHistory = this.history.get(message.sessionId)!;
    sessionHistory.push(message);

    this.globalHistory.push(message);
    if (this.globalHistory.length > this.maxHistorySize) {
      this.globalHistory.shift();
    }
  }

  getStats(): {
    totalMessages: number;
    activeSessions: number;
    subscriberCount: number;
  } {
    return {
      totalMessages: this.globalHistory.length,
      activeSessions: this.history.size,
      subscriberCount: Array.from(this.subscribers.values()).reduce(
        (acc, handlers) => acc + handlers.length,
        0
      ),
    };
  }
}

export const broker = new A2ABroker();
