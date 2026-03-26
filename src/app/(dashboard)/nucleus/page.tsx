"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Cpu, Clock, Activity, Zap } from "lucide-react";
import { NucleusChat } from "@/components/reactor/NucleusChat";
import { AgentCard } from "@/components/reactor/AgentCard";
import { MetricCard } from "@/components/reactor/MetricCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { REACTOR_AGENTS, Agent } from "@/lib/nucleus/registry";

const MOCK_A2A_EVENTS = [
  {
    id: 1,
    from: "orchestrator",
    to: "finance",
    type: "delegation",
    task: "Analyze Q1 2025 revenue trends",
    time: "agora",
  },
  {
    id: 2,
    from: "sdr",
    to: "orchestrator",
    type: "response",
    task: "Lead TechCorp scored 87/100",
    time: "12s",
  },
  {
    id: 3,
    from: "orchestrator",
    to: "marketing",
    type: "request",
    task: "Generate campaign copy for SaaS product",
    time: "34s",
  },
  {
    id: 4,
    from: "responder",
    to: "sdr",
    type: "delegation",
    task: "WhatsApp lead from João Silva qualificado",
    time: "1m",
  },
  {
    id: 5,
    from: "ops",
    to: "broadcast",
    type: "event",
    task: "Processo de onboarding atualizado",
    time: "2m",
  },
  {
    id: 6,
    from: "finance",
    to: "orchestrator",
    type: "response",
    task: "DRE análise concluída — margem 34.2%",
    time: "3m",
  },
];

const TYPE_COLORS: Record<string, string> = {
  delegation: "#00f5ff",
  response: "#00ff88",
  request: "#8b5cf6",
  event: "#fbbf24",
};

export default function NucleusPage() {
  const [agents] = useState<Agent[]>(REACTOR_AGENTS);
  const [a2aEvents, setA2aEvents] = useState(MOCK_A2A_EVENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setA2aEvents((prev) => {
        const newEvent = {
          ...MOCK_A2A_EVENTS[Math.floor(Math.random() * MOCK_A2A_EVENTS.length)],
          id: Date.now(),
          time: "agora",
        };
        return [newEvent, ...prev.slice(0, 9)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Metrics bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-reactor-border">
          <MetricCard
            title="Mensagens Hoje"
            value={1847}
            change={12.4}
            changeLabel="vs ontem"
            icon={MessageSquare}
            color="cyan"
          />
          <MetricCard
            title="Agentes Ativos"
            value={5}
            icon={Cpu}
            color="green"
            description="de 6 total"
          />
          <MetricCard
            title="Tempo de Resposta"
            value="1.2"
            suffix="s"
            change={-8.3}
            changeLabel="mais rápido"
            icon={Clock}
            color="purple"
          />
          <MetricCard
            title="Req / Minuto"
            value={34}
            change={6.1}
            changeLabel="média"
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <NucleusChat className="h-full" />
        </div>
      </div>

      {/* Right sidebar */}
      <div
        className="w-72 shrink-0 flex flex-col border-l border-reactor-border"
        style={{ background: "#0f0f1a" }}
      >
        {/* Agents */}
        <div className="p-3 border-b border-reactor-border">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            Agentes do Reactor
          </h3>
          <ScrollArea className="h-64">
            <div className="space-y-2 pr-2">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  compact
                  selected={selectedAgent?.id === agent.id}
                  onClick={setSelectedAgent}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* A2A Events */}
        <div className="flex-1 p-3 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-3.5 w-3.5 text-reactor-cyan" />
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              A2A Protocol
            </h3>
            <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-reactor-cyan animate-pulse" />
          </div>

          <ScrollArea className="h-full">
            <div className="space-y-2 pr-2">
              {a2aEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2.5 rounded-lg bg-reactor-card border border-reactor-border"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        color: TYPE_COLORS[event.type],
                        backgroundColor: `${TYPE_COLORS[event.type]}15`,
                      }}
                    >
                      {event.type}
                    </span>
                    <span className="text-[10px] text-white/30 ml-auto">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50">
                    <span className="text-white/70">{event.from}</span>
                    {" → "}
                    <span className="text-white/70">{event.to}</span>
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                    {event.task}
                  </p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
