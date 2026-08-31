"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Cpu, Users, Activity, Zap } from "lucide-react";
import { NucleusChat } from "@/components/reactor/NucleusChat";
import { AgentCard } from "@/components/reactor/AgentCard";
import { MetricCard } from "@/components/reactor/MetricCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { REACTOR_AGENTS, Agent } from "@/lib/nucleus/registry";
import { useApi } from "@/lib/hooks/useApi";
import { getRelativeTime } from "@/lib/utils";

interface ReactorEventRow {
  id: string;
  created_at: string;
  type: string;
  source: string;
  payload: Record<string, unknown> | null;
  processed: boolean | null;
}

interface Overview {
  messagesToday: number;
  activeSessions: number;
  totalLeads: number;
  agents: { total: number; online: number };
  events: ReactorEventRow[];
}

const TYPE_COLORS: Record<string, string> = {
  delegation: "#00f5ff",
  response: "#00ff88",
  request: "#8b5cf6",
  event: "#fbbf24",
};

/** Unknown event types still need a colour — fall back to the neutral one. */
function eventColor(type: string) {
  return TYPE_COLORS[type] ?? "#8b5cf6";
}

export default function NucleusPage() {
  const [agents] = useState<Agent[]>(REACTOR_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { data, loading } = useApi<Overview>("/api/overview");
  const a2aEvents = data?.events ?? [];

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Metrics bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-reactor-border">
          <MetricCard
            title="Mensagens Hoje"
            value={data?.messagesToday ?? 0}
            changeLabel="registradas no banco"
            icon={MessageSquare}
            color="cyan"
            loading={loading}
          />
          <MetricCard
            title="Agentes Ativos"
            value={data?.agents.online ?? 0}
            icon={Cpu}
            color="green"
            description={`de ${data?.agents.total ?? agents.length} total`}
            loading={loading}
          />
          <MetricCard
            title="Sessões Ativas"
            value={data?.activeSessions ?? 0}
            icon={Activity}
            color="purple"
            description="conversas em aberto"
            loading={loading}
          />
          <MetricCard
            title="Leads no CRM"
            value={data?.totalLeads ?? 0}
            icon={Users}
            color="orange"
            description="em reactor_leads"
            loading={loading}
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
              {a2aEvents.length === 0 && (
                <p className="text-[10px] text-white/25 leading-relaxed">
                  {loading
                    ? "Carregando eventos..."
                    : "Nenhum evento registrado ainda. Eventos aparecem aqui conforme os agentes e integrações gravam em reactor_events."}
                </p>
              )}
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
                        color: eventColor(event.type),
                        backgroundColor: `${eventColor(event.type)}15`,
                      }}
                    >
                      {event.type}
                    </span>
                    <span className="text-[10px] text-white/30 ml-auto">
                      {getRelativeTime(event.created_at)}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50">
                    <span className="text-white/70">{event.source}</span>
                    {event.processed ? " · processado" : " · pendente"}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                    {JSON.stringify(event.payload ?? {})}
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
