"use client";

import React, { useState } from "react";
import {
  Settings2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ListTodo,
  ArrowRight,
  Circle,
  Bot,
  Zap,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Task {
  id: number;
  title: string;
  status: "aberta" | "em_progresso" | "concluida";
  priority: "baixa" | "media" | "alta" | "critica";
  category: string;
  due: string;
  assignee: string;
  progress: number;
}

const TASKS: Task[] = [
  { id: 1, title: "Migrar banco de dados para Supabase", status: "em_progresso", priority: "critica", category: "Tech", due: "27/03", assignee: "DevOps", progress: 65 },
  { id: 2, title: "Implementar webhook Evolution API", status: "em_progresso", priority: "alta", category: "Integração", due: "28/03", assignee: "Backend", progress: 80 },
  { id: 3, title: "Documentar processos de onboarding", status: "aberta", priority: "media", category: "RH", due: "01/04", assignee: "CS", progress: 0 },
  { id: 4, title: "Revisar contratos de clientes Q1", status: "aberta", priority: "alta", category: "Jurídico", due: "30/03", assignee: "Legal", progress: 0 },
  { id: 5, title: "Setup monitoramento Sentry + Datadog", status: "em_progresso", priority: "media", category: "Tech", due: "02/04", assignee: "DevOps", progress: 40 },
  { id: 6, title: "Atualizar política de privacidade LGPD", status: "concluida", priority: "alta", category: "Compliance", due: "20/03", assignee: "Legal", progress: 100 },
  { id: 7, title: "Criar playbook de resposta a incidentes", status: "concluida", priority: "media", category: "Tech", due: "22/03", assignee: "DevOps", progress: 100 },
  { id: 8, title: "Onboarding DataCore Sistemas", status: "concluida", priority: "alta", category: "CS", due: "23/03", assignee: "CS", progress: 100 },
];

const PRODUCTIVITY_DATA = [
  { dia: "Seg", tarefas: 12, horas: 48 },
  { dia: "Ter", tarefas: 8, horas: 36 },
  { dia: "Qua", tarefas: 15, horas: 52 },
  { dia: "Qui", tarefas: 11, horas: 44 },
  { dia: "Sex", tarefas: 9, horas: 38 },
];

const PROCESS_STEPS = [
  { id: 1, label: "Lead Recebido", status: "done", time: "0min" },
  { id: 2, label: "Qualificação SDR", status: "done", time: "~15min" },
  { id: 3, label: "Demo Agendada", status: "done", time: "~2h" },
  { id: 4, label: "Proposta Enviada", status: "active", time: "~24h" },
  { id: 5, label: "Negociação", status: "pending", time: "~3 dias" },
  { id: 6, label: "Fechamento", status: "pending", time: "~1 dia" },
];

const PRIORITY_CONFIG = {
  critica: { color: "#ff4444", label: "Crítica", bg: "bg-reactor-red/10 border-reactor-red/20" },
  alta: { color: "#fbbf24", label: "Alta", bg: "bg-yellow-400/10 border-yellow-400/20" },
  media: { color: "#00f5ff", label: "Média", bg: "bg-reactor-cyan/10 border-reactor-cyan/20" },
  baixa: { color: "#00ff88", label: "Baixa", bg: "bg-reactor-green/10 border-reactor-green/20" },
};

const STATUS_CONFIG = {
  aberta: { icon: Circle, color: "text-white/30" },
  em_progresso: { icon: Clock, color: "text-reactor-cyan" },
  concluida: { icon: CheckCircle2, color: "text-reactor-green" },
};

export default function OpsPage() {
  const [processInput, setProcessInput] = useState("");
  const [processResult, setProcessResult] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  const openTasks = TASKS.filter((t) => t.status === "aberta").length;
  const inProgressTasks = TASKS.filter((t) => t.status === "em_progresso").length;
  const doneTodayTasks = TASKS.filter((t) => t.status === "concluida").length;
  const efficiency = Math.round((doneTodayTasks / TASKS.length) * 100);

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
          <p className="text-sm text-white/40">Ops Agent — Processos & Eficiência</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Tarefas Abertas" value={openTasks + inProgressTasks} icon={ListTodo} color="orange" description={`${inProgressTasks} em andamento`} />
        <MetricCard title="Concluídas Hoje" value={doneTodayTasks} change={15} icon={CheckCircle2} color="green" />
        <MetricCard title="Eficiência" value={efficiency} suffix="%" change={4.2} icon={TrendingUp} color="cyan" />
        <MetricCard title="Tempo Médio" value="2.4" suffix="h" change={-12.8} changeLabel="por tarefa" icon={Clock} color="purple" />
      </div>

      {/* Task list + Process map */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lista de Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
              <div className="divide-y divide-reactor-border">
                {TASKS.map((task) => {
                  const pConfig = PRIORITY_CONFIG[task.priority];
                  const sConfig = STATUS_CONFIG[task.status];
                  const StatusIcon = sConfig.icon;

                  return (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                      <StatusIcon className={`h-4 w-4 shrink-0 ${sConfig.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/75 font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/30">{task.category}</span>
                          <span className="text-[10px] text-white/20">·</span>
                          <span className="text-[10px] text-white/30">vence {task.due}</span>
                        </div>
                        {task.status === "em_progresso" && (
                          <Progress value={task.progress} color="cyan" className="mt-1.5 h-1" />
                        )}
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
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Process Map + Productivity Chart */}
        <div className="space-y-4">
          {/* Process Map */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-reactor-cyan" />
                <CardTitle className="text-sm">Mapa de Processo — Pipeline Comercial</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 flex-wrap">
                {PROCESS_STEPS.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex flex-col items-center px-3 py-2 rounded-lg border text-center min-w-[80px] ${
                        step.status === "done"
                          ? "bg-reactor-green/8 border-reactor-green/20"
                          : step.status === "active"
                          ? "bg-reactor-cyan/8 border-reactor-cyan/20 animate-pulse-glow"
                          : "bg-white/3 border-white/8"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-semibold ${
                          step.status === "done" ? "text-reactor-green" : step.status === "active" ? "text-reactor-cyan" : "text-white/30"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[9px] text-white/20 mt-0.5">{step.time}</span>
                    </div>
                    {i < PROCESS_STEPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-white/15 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productivity Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Produtividade da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={PRODUCTIVITY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="dia" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#141428", border: "1px solid #1e1e3a", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="tarefas" name="Tarefas" fill="#00f5ff" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

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
