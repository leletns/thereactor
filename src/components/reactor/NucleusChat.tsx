"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  TrendingUp,
  Users,
  Megaphone,
  Settings2,
  MessageSquare,
  Bot,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentRole } from "@/lib/nucleus/registry";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentRole?: AgentRole;
  timestamp: Date;
  streaming?: boolean;
}

const AGENT_CONFIG: Record<AgentRole, { label: string; icon: React.ElementType; color: string }> = {
  orchestrator: { label: "Nucleus", icon: Brain, color: "#00f5ff" },
  finance: { label: "Financeiro", icon: TrendingUp, color: "#00ff88" },
  sdr: { label: "SDR", icon: Users, color: "#8b5cf6" },
  marketing: { label: "Marketing", icon: Megaphone, color: "#ff6b35" },
  ops: { label: "Operações", icon: Settings2, color: "#fbbf24" },
  responder: { label: "Responder", icon: MessageSquare, color: "#34d399" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: "Olá! Sou o **Nucleus**, o orquestrador central do Reactor. Estou conectado a todos os agentes especializados:\n\n• **Financeiro** — análise de DRE, fluxo de caixa e insights\n• **SDR** — qualificação de leads e pipeline de vendas\n• **Marketing** — copy, campanhas e estratégias de crescimento\n• **Operações** — processos, tarefas e automações\n• **Responder** — atendimento multicanal via WhatsApp\n\nComo posso ajudar sua empresa hoje?",
    agentRole: "orchestrator",
    timestamp: new Date(Date.now() - 5000),
  },
];

interface NucleusChatProps {
  initialAgent?: AgentRole;
  className?: string;
}

export function NucleusChat({ initialAgent = "orchestrator", className }: NucleusChatProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>(initialAgent);
  const [sessionId] = useState(() => generateId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      agentRole: selectedAgent,
      timestamp: new Date(),
      streaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    const historyMessages = messages
      .filter((m) => !m.streaming)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: [...historyMessages, { role: "user", content: userMessage.content }],
          agentRole: selectedAgent,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("API error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: accumulated }
                      : m
                  )
                );
              }
            } catch {
              // not JSON, skip
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, streaming: false } : m
        )
      );
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: "Desculpe, ocorreu um erro ao processar sua mensagem. Verifique a configuração da API.",
                  streaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedAgent, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, "<br/>")
      .replace(/• /g, '<span class="text-reactor-cyan mr-1">•</span> ');
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Agent Switcher */}
      <div className="flex items-center gap-1 p-3 border-b border-reactor-border bg-reactor-surface/50 flex-wrap">
        {(Object.entries(AGENT_CONFIG) as [AgentRole, typeof AGENT_CONFIG[AgentRole]][]).map(
          ([role, config]) => {
            const Icon = config.icon;
            const isSelected = selectedAgent === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedAgent(role)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isSelected
                    ? "border"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
                )}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${config.color}12`,
                        color: config.color,
                        borderColor: `${config.color}30`,
                      }
                    : {}
                }
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </button>
            );
          }
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const agentConfig = message.agentRole
                ? AGENT_CONFIG[message.agentRole]
                : null;
              const AgentIcon = agentConfig?.icon ?? Bot;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-xl shrink-0 mt-0.5 border",
                      message.role === "user"
                        ? "bg-white/8 border-white/15"
                        : "border"
                    )}
                    style={
                      message.role === "assistant" && agentConfig
                        ? {
                            backgroundColor: `${agentConfig.color}12`,
                            borderColor: `${agentConfig.color}30`,
                          }
                        : {}
                    }
                  >
                    {message.role === "user" ? (
                      <span className="text-[10px] font-bold text-white/60">EU</span>
                    ) : (
                      <AgentIcon
                        className="h-4 w-4"
                        style={{ color: agentConfig?.color ?? "#00f5ff" }}
                      />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "flex-1 max-w-[80%]",
                      message.role === "user" && "flex justify-end"
                    )}
                  >
                    {message.role === "assistant" && agentConfig && (
                      <p
                        className="text-[10px] font-semibold mb-1 uppercase tracking-wider"
                        style={{ color: agentConfig.color }}
                      >
                        {agentConfig.label}
                      </p>
                    )}
                    <div
                      className={cn(
                        "rounded-xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-reactor-cyan/10 text-white/80 border border-reactor-cyan/15"
                          : "bg-reactor-surface border border-reactor-border text-white/75"
                      )}
                    >
                      {message.content ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatContent(message.content),
                          }}
                        />
                      ) : message.streaming ? (
                        <div className="flex items-center gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-reactor-cyan/60"
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      ) : null}
                      {message.streaming && message.content && (
                        <span className="cursor-blink" />
                      )}
                    </div>
                    <p className="text-[10px] text-white/20 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-reactor-border bg-reactor-surface/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pergunte ao ${AGENT_CONFIG[selectedAgent].label}...`}
                className="min-h-[52px] max-h-32 pr-4 resize-none"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-[52px] px-4 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-white/20 mt-2 text-center">
            Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}
