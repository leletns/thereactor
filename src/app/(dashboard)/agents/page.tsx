"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowRight,
  Settings2,
  Code2,
  Cpu,
  Activity,
} from "lucide-react";
import { AgentCard } from "@/components/reactor/AgentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { REACTOR_AGENTS, Agent } from "@/lib/nucleus/registry";
import { MCP_TOOLS } from "@/lib/mcp/tools";

interface A2ALogEntry {
  id: number;
  from: string;
  to: string;
  type: string;
  task: string;
  time: string;
  color: string;
}


const MOCK_LOG: A2ALogEntry[] = [
  { id: 1, from: "orchestrator", to: "finance", type: "delegation", task: "Analisar fluxo de caixa Q1 2025", time: "10:42:15", color: "#00f5ff" },
  { id: 2, from: "finance", to: "orchestrator", type: "response", task: "Análise concluída — margem 44.9%", time: "10:42:18", color: "#00ff88" },
  { id: 3, from: "orchestrator", to: "sdr", type: "delegation", task: "Qualificar lead TechCorp Solutions", time: "10:43:02", color: "#00f5ff" },
  { id: 4, from: "sdr", to: "orchestrator", type: "response", task: "Lead score: 87/100 — prioridade alta", time: "10:43:05", color: "#00ff88" },
  { id: 5, from: "responder", to: "broadcast", type: "event", task: "Mensagem WhatsApp recebida — João Silva", time: "10:44:11", color: "#fbbf24" },
  { id: 6, from: "orchestrator", to: "marketing", type: "request", task: "Gerar copy para produto SaaS B2B", time: "10:45:33", color: "#8b5cf6" },
  { id: 7, from: "marketing", to: "orchestrator", type: "response", task: "Copy gerado — 3 variações criadas", time: "10:45:41", color: "#00ff88" },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [a2aLog, setA2aLog] = useState<A2ALogEntry[]>(MOCK_LOG);
  const [liveMode, setLiveMode] = useState(true);

  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      const sources = MOCK_LOG;
      const entry = sources[Math.floor(Math.random() * sources.length)];
      setA2aLog((prev) => [
        { ...entry, id: Date.now(), time: new Date().toLocaleTimeString("pt-BR") },
        ...prev.slice(0, 19),
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveMode]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Agent Studio</h2>
          <p className="text-sm text-white/40">Configure e monitore os agentes do Reactor</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Criar Agente Custom
        </Button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-3 gap-4">
        {REACTOR_AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            selected={selectedAgent?.id === agent.id}
            onClick={setSelectedAgent}
          />
        ))}
      </div>

      {/* Selected Agent Config */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-reactor-cyan" />
                  <CardTitle className="text-sm">
                    Configuração — {selectedAgent.name}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setSelectedAgent(null)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Identidade</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Ativo</Label>
                      <Switch defaultChecked={selectedAgent.status !== "offline"} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Auto-routing</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Notificações</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Capacidades</h4>
                  <div className="space-y-1.5">
                    {selectedAgent.capabilities.map((cap) => (
                      <div key={cap} className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-reactor-cyan/50 shrink-0" />
                        <span className="text-xs text-white/60">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Estatísticas</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Mensagens processadas", value: selectedAgent.messagesHandled.toLocaleString("pt-BR") },
                      { label: "Uptime", value: selectedAgent.uptime },
                      { label: "Role", value: selectedAgent.role },
                      { label: "Engine", value: "Reactor Core v1" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-xs text-white/40">{stat.label}</span>
                        <span className="text-xs font-medium text-white/70">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* A2A + MCP Tools */}
      <div className="grid grid-cols-2 gap-4">
        {/* A2A Protocol Visualizer */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-reactor-cyan" />
                <CardTitle className="text-sm">A2A Protocol — Message Log</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] text-white/40">Live</Label>
                <Switch
                  checked={liveMode}
                  onCheckedChange={setLiveMode}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
              <div className="divide-y divide-reactor-border">
                {a2aLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span className="text-[9px] text-white/20 font-mono shrink-0 w-16">
                      {entry.time}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-white/60 font-medium">{entry.from}</span>
                      <ArrowRight className="h-3 w-3 text-white/20" />
                      <span className="text-[10px] text-white/60 font-medium">{entry.to}</span>
                    </div>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0"
                      style={{ color: entry.color, backgroundColor: `${entry.color}15` }}
                    >
                      {entry.type}
                    </span>
                    <span className="text-[10px] text-white/40 truncate">{entry.task}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* MCP Tools */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-reactor-purple" />
              <CardTitle className="text-sm">MCP Tools — {MCP_TOOLS.length} disponíveis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
              <div className="divide-y divide-reactor-border">
                {MCP_TOOLS.map((tool) => (
                  <div key={tool.name}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors text-left"
                      onClick={() =>
                        setExpandedTool(expandedTool === tool.name ? null : tool.name)
                      }
                    >
                      <Cpu className="h-3.5 w-3.5 text-reactor-purple/60 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/70 font-mono">{tool.name}</p>
                        <p className="text-[10px] text-white/30 truncate">{tool.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] shrink-0">
                        {tool.category}
                      </Badge>
                      {expandedTool === tool.name ? (
                        <ChevronUp className="h-3 w-3 text-white/30 shrink-0" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-white/30 shrink-0" />
                      )}
                    </button>

                    {expandedTool === tool.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-3 bg-reactor-surface/50"
                      >
                        <div className="space-y-1.5 mt-2">
                          {Object.entries(tool.parameters).map(([key, param]) => (
                            <div key={key} className="flex items-start gap-2">
                              <code className="text-[9px] text-reactor-cyan/70 font-mono mt-0.5">
                                {key}
                              </code>
                              <span className="text-[9px] text-white/30">
                                ({param.type})
                                {tool.requiredParams.includes(key) && (
                                  <span className="text-reactor-red ml-1">*</span>
                                )}
                              </span>
                              <span className="text-[9px] text-white/20 leading-relaxed">
                                {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
