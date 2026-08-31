"use client";

import React, { useMemo, useState } from "react";
import {
  Settings2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ListTodo,
  ArrowRight,
  Circle,
  XCircle,
  Bot,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MetricCard } from "@/components/reactor/MetricCard";
import { DataEmpty, DataError } from "@/components/reactor/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: "aberta" | "em_progresso" | "concluida" | "cancelada";
  priority: "baixa" | "media" | "alta" | "critica";
  category: string | null;
  due_date: string | null;
  assigned_to: string | null;
  updated_at: string;
}

interface TasksPayload {
  tasks: Task[];
  stats: {
    total: number;
    abertas: number;
    emProgresso: number;
    concluidas: number;
    canceladas: number;
    conclusao: number;
    criticas: number;
  };
}

interface LeadsPayload {
  stats: {
    byStage: { stage: string; count: number; value: number }[];
  };
}

const PRIORITY_CONFIG = {
  critica: { color: "#ff4444", label: "Critica", bg: "bg-reactor-red/10 border-reactor-red/20" },
  alta: { color: "#fbbf24", label: "Alta", bg: "bg-yellow-400/10 border-yellow-400/20" },
  media: { color: "#00f5ff", label: "Media", bg: "bg-reactor-cyan/10 border-reactor-cyan/20" },
  baixa: { color: "#00ff88", label: "Baixa", bg: "bg-reactor-green/10 border-reactor-green/20" },
};

const STATUS_CONFIG = {
  aberta: { icon: Circle, color: "text-white/30" },
  em_progresso: { icon: Clock, color: "text-reactor-cyan" },
  concluida: { icon: CheckCircle2, color: "text-reactor-green" },
  cancelada: { icon: XCircle, color: "text-reactor-red" },
};

const STAGE_LABELS: Record<string, string> = {
  prospeccao: "Prospeccao",
  qualificacao: "Qualificacao",
  proposta: "Proposta",
  fechamento: "Fechamento",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

/** Tasks closed per weekday over the last 7 days, straight from updated_at. */
function weeklyProductivity(tasks: Task[]) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - offset));
    return { date: day, dia: WEEKDAYS[day.getDay()], tarefas: 0 };
  });

  for (const task of tasks) {
    if (task.status !== "concluida") continue;
    const closed = new Date(task.updated_at);
    const slot = days.find(
      (d) => d.date.toDateString() === closed.toDateString()
    );
    if (slot) slot.tarefas += 1;
  }

  return days.map(({ dia, tarefas }) => ({ dia, tarefas }));
}

export default function OpsPage() {
  const [processInput, setProcessInput] = useState("");
  const [processResult, setProcessResult] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  const tasksApi = useApi<TasksPayload>("/api/tasks");
  const leadsApi = useApi<LeadsPayload>("/api/leads");

  const stats = tasksApi.data?.stats;
  const tasks = useMemo(() => tasksApi.data?.tasks ?? [], [tasksApi.data]);
  const productivity = useMemo(() => weeklyProductivity(tasks), [tasks]);
  const stages = leadsApi.data?.stats.byStage ?? [];
  const activeStageIndex = stages.findIndex((s) => s.count > 0);

  const optimizeProcess = async () => {
    if (!processInput.trim()) return;
    setOptimizing(true);
    setProcessResult("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analise e otimize este processo, identificando gargalos e propondo melhorias concretas com ROI estimado:\n\n${processInput}`,
            },
          ],
          agentRole: "ops",
        }),
      });

      if (!res.ok || !res.body) throw new Error("Error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setProcessResult((prev) => prev + parsed.text);
            } catch {}
          }
        }
      }
    } catch {
      setProcessResult("Erro ao otimizar processo. Verifique a configuração.");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Operações</h2>
          <p className="text-sm text-white/40">Ops Agent — dados ao vivo do Supabase</p>
        </div>
        <Button
          onClick={() => {
            tasksApi.reload();
            leadsApi.reload();
          }}
          variant="ghost"
          size="sm"
          disabled={tasksApi.loading}
        >
          <RefreshCw className={`h-4 w-4 ${tasksApi.loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {tasksApi.error && <DataError message={tasksApi.error} onRetry={tasksApi.reload} />}

      {!tasksApi.error && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="Tarefas Abertas"
              value={(stats?.abertas ?? 0) + (stats?.emProgresso ?? 0)}
              icon={ListTodo}
              color="orange"
              description={`${stats?.emProgresso ?? 0} em andamento`}
              loading={tasksApi.loading}
            />
            <MetricCard
              title="Concluídas"
              value={stats?.concluidas ?? 0}
              icon={CheckCircle2}
              color="green"
              description={`de ${stats?.total ?? 0} no total`}
              loading={tasksApi.loading}
            />
            <MetricCard
              title="Taxa de Conclusão"
              value={stats?.conclusao ?? 0}
              suffix="%"
              icon={TrendingUp}
              color="cyan"
              loading={tasksApi.loading}
            />
            <MetricCard
              title="Críticas em Aberto"
              value={stats?.criticas ?? 0}
              icon={Clock}
              color="purple"
              description="prioridade crítica"
              loading={tasksApi.loading}
            />
          </div>

          {/* Task list + Process map */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lista de Tarefas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-72">
                  {tasks.length === 0 ? (
                    <DataEmpty
                      message={
                        tasksApi.loading
                          ? "Carregando tarefas..."
                          : "Nenhuma tarefa em reactor_tasks. Cadastre tarefas no Supabase ou conecte uma fonte de dados."
                      }
                    />
                  ) : (
                    <div className="divide-y divide-reactor-border">
                      {tasks.map((task) => {
                        const pConfig = PRIORITY_CONFIG[task.priority];
                        const sConfig = STATUS_CONFIG[task.status];
                        const StatusIcon = sConfig.icon;

                        return (
                          <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                            <StatusIcon className={`h-4 w-4 shrink-0 ${sConfig.color}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white/75 font-medium truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-white/30">{task.category ?? "sem categoria"}</span>
                                {task.due_date && (
                                  <>
                                    <span className="text-[10px] text-white/20">·</span>
                                    <span className="text-[10px] text-white/30">
                                      vence {new Date(`${task.due_date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${pConfig.bg}`}
                                style={{ color: pConfig.color }}
                              >
                                {pConfig.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* Pipeline built from the live lead stages */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-reactor-cyan" />
                    <CardTitle className="text-sm">Mapa de Processo — Pipeline Comercial</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {stages.length === 0 ? (
                    <DataEmpty message={leadsApi.loading ? "Carregando pipeline..." : "Nenhum lead cadastrado."} />
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap">
                      {stages.map((stage, i) => (
                        <React.Fragment key={stage.stage}>
                          <div
                            className={`flex flex-col items-center px-3 py-2 rounded-lg border text-center min-w-[88px] ${
                              stage.count === 0
                                ? "bg-white/3 border-white/8"
                                : i === activeStageIndex
                                ? "bg-reactor-cyan/8 border-reactor-cyan/20 animate-pulse-glow"
                                : "bg-reactor-green/8 border-reactor-green/20"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-semibold ${
                                stage.count === 0
                                  ? "text-white/30"
                                  : i === activeStageIndex
                                  ? "text-reactor-cyan"
                                  : "text-reactor-green"
                              }`}
                            >
                              {STAGE_LABELS[stage.stage] ?? stage.stage}
                            </span>
                            <span className="text-[9px] text-white/40 mt-0.5">
                              {stage.count} {stage.count === 1 ? "lead" : "leads"}
                            </span>
                            <span className="text-[9px] text-white/20">{formatCurrency(stage.value)}</span>
                          </div>
                          {i < stages.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-white/15 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tarefas Concluídas — Últimos 7 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={productivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="dia" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "#141428", border: "1px solid #1e1e3a", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="tarefas" name="Tarefas" fill="#00f5ff" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* AI Process Optimizer */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-reactor-cyan" />
            <CardTitle className="text-sm">Otimizador de Processos com IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-2 block">Descreva o processo atual</Label>
              <Textarea
                value={processInput}
                onChange={(e) => setProcessInput(e.target.value)}
                placeholder="Ex: Processo atual de onboarding de cliente: recebe contrato, envia email manual, agenda call via WhatsApp, cria usuário manualmente..."
                className="min-h-[100px] text-xs"
              />
              <Button onClick={optimizeProcess} disabled={optimizing || !processInput.trim()} className="mt-2 w-full" size="sm">
                {optimizing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-3 w-3 border-2 border-[#0a0a0f] border-t-transparent rounded-full" />
                    Analisando processo...
                  </span>
                ) : (
                  <>
                    <Settings2 className="h-3.5 w-3.5 mr-2" />
                    Otimizar Processo
                  </>
                )}
              </Button>
            </div>
            <div>
              {processResult ? (
                <div className="p-3 rounded-lg bg-reactor-surface border border-reactor-border h-full">
                  <pre className="text-[11px] text-white/70 whitespace-pre-wrap font-sans leading-relaxed overflow-y-auto max-h-[140px]">
                    {processResult}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-sm border border-dashed border-reactor-border rounded-lg">
                  Resultado aparecerá aqui
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
