"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { MetricCard } from "@/components/reactor/MetricCard";
import { DataEmpty, DataError } from "@/components/reactor/DataState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NucleusChat } from "@/components/reactor/NucleusChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency } from "@/lib/utils";

interface MonthPoint {
  key: string;
  mes: string;
  receita: number;
  despesas: number;
  lucro: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  category: string;
  status: "confirmado" | "pendente" | "cancelado";
}

interface FinanceSummary {
  totals: {
    receita: number;
    despesas: number;
    lucro: number;
    margem: number;
    transacoes: number;
  };
  currentMonth: MonthPoint | null;
  growth: number | null;
  monthly: MonthPoint[];
  categories: { categoria: string; valor: number }[];
  recent: Transaction[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="reactor-card p-3 rounded-lg border border-reactor-border text-xs">
        <p className="text-white/60 mb-2 font-medium">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/** Insights are read off the live numbers — never hardcoded copy. */
function buildInsights(summary: FinanceSummary) {
  const insights: { id: string; title: string; content: string; type: "success" | "warning" | "info"; icon: typeof TrendingUp }[] = [];
  const { totals, categories, growth, monthly } = summary;

  if (growth !== null) {
    insights.push({
      id: "growth",
      title: growth >= 0 ? "Receita em alta" : "Receita em queda",
      content: `A receita variou ${growth > 0 ? "+" : ""}${growth}% em relacao ao mes anterior (${formatCurrency(monthly[monthly.length - 1]?.receita ?? 0)} no mes corrente).`,
      type: growth >= 0 ? "success" : "warning",
      icon: growth >= 0 ? TrendingUp : TrendingDown,
    });
  }

  insights.push({
    id: "margin",
    title: totals.margem >= 30 ? "Margem saudavel" : "Margem sob pressao",
    content: `Margem liquida de ${totals.margem}% sobre ${formatCurrency(totals.receita)} de receita e ${formatCurrency(totals.despesas)} de despesas.`,
    type: totals.margem >= 30 ? "success" : "warning",
    icon: totals.margem >= 30 ? TrendingUp : TrendingDown,
  });

  const top = categories[0];
  if (top && totals.receita > 0) {
    insights.push({
      id: "category",
      title: "Concentracao de receita",
      content: `${top.categoria} responde por ${Math.round((top.valor / totals.receita) * 100)}% da receita (${formatCurrency(top.valor)}). Diversificar reduz risco.`,
      type: "info",
      icon: DollarSign,
    });
  }

  return insights;
}

export default function FinancePage() {
  const [showAIChat, setShowAIChat] = useState(false);
  const { data, loading, error, reload } = useApi<FinanceSummary>("/api/finance/summary");

  const insights = useMemo(() => (data ? buildInsights(data) : []), [data]);
  const hasData = !!data && data.totals.transacoes > 0;
  const current = data?.currentMonth ?? null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Painel Financeiro</h2>
          <p className="text-sm text-white/40">
            {current
              ? `${current.mes} — dados ao vivo do Supabase`
              : "Dados ao vivo do Supabase"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={reload} variant="ghost" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowAIChat(true)} variant="outline" size="sm">
            <Bot className="h-4 w-4 mr-2" />
            Perguntar ao Agente Financeiro
          </Button>
        </div>
      </div>

      {error && <DataError message={error} onRetry={reload} />}

      {!error && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="Receita do Mes"
              value={current?.receita ?? 0}
              prefix="R$"
              change={data?.growth ?? undefined}
              changeLabel="vs mes anterior"
              icon={TrendingUp}
              color="green"
              loading={loading}
            />
            <MetricCard
              title="Despesas do Mes"
              value={current?.despesas ?? 0}
              prefix="R$"
              changeLabel="mes corrente"
              icon={BarChart2}
              color="orange"
              loading={loading}
            />
            <MetricCard
              title="Lucro Liquido"
              value={current?.lucro ?? 0}
              prefix="R$"
              changeLabel="mes corrente"
              icon={DollarSign}
              color="cyan"
              loading={loading}
            />
            <MetricCard
              title="Margem Liquida"
              value={data?.totals.margem ?? 0}
              suffix="%"
              changeLabel="acumulado"
              icon={TrendingUp}
              color="purple"
              loading={loading}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white/70">
                  Receita vs Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data!.monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff88" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
                      <Area type="monotone" dataKey="receita" name="Receita" stroke="#00ff88" fill="url(#colorReceita)" strokeWidth={2} dot={{ r: 3, fill: "#00ff88" }} />
                      <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ff6b35" fill="url(#colorDespesas)" strokeWidth={2} dot={{ r: 3, fill: "#ff6b35" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <DataEmpty message={loading ? "Carregando transacoes..." : "Nenhuma transacao registrada em reactor_transactions."} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white/70">
                  Receita por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasData && data!.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data!.categories} layout="vertical" margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="categoria" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={72} />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: "#141428", border: "1px solid #1e1e3a", borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="valor" fill="#00f5ff" radius={[0, 4, 4, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <DataEmpty message={loading ? "Carregando..." : "Sem receitas categorizadas."} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights + Transactions */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-reactor-cyan" />
                  <CardTitle className="text-sm">Insights do Agente Financeiro</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.length === 0 ? (
                  <DataEmpty message={loading ? "Analisando..." : "Sem dados suficientes para gerar insights."} />
                ) : (
                  insights.map((insight, i) => {
                    const Icon = insight.icon;
                    const colorMap = {
                      success: { bg: "bg-reactor-green/8", border: "border-reactor-green/15", text: "text-reactor-green" },
                      warning: { bg: "bg-orange-500/8", border: "border-orange-500/15", text: "text-orange-400" },
                      info: { bg: "bg-reactor-cyan/8", border: "border-reactor-cyan/15", text: "text-reactor-cyan" },
                    } as const;
                    const colors = colorMap[insight.type];

                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                          <span className={`text-xs font-semibold ${colors.text}`}>{insight.title}</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{insight.content}</p>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ultimas Transacoes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  {!data || data.recent.length === 0 ? (
                    <DataEmpty message={loading ? "Carregando..." : "Nenhuma transacao registrada."} />
                  ) : (
                    <div className="divide-y divide-reactor-border">
                      {data.recent.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/2 transition-colors">
                          <div className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${tx.type === "receita" ? "bg-reactor-green/10" : "bg-reactor-red/10"}`}>
                            {tx.type === "receita" ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-reactor-green" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5 text-reactor-red" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/70 truncate">{tx.description}</p>
                            <p className="text-[10px] text-white/30">
                              {new Date(`${tx.date}T00:00:00`).toLocaleDateString("pt-BR")} · {tx.category}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-semibold ${tx.type === "receita" ? "text-reactor-green" : "text-reactor-red"}`}>
                              {tx.type === "receita" ? "+" : "-"}{formatCurrency(Math.abs(Number(tx.amount)))}
                            </p>
                            <Badge
                              variant={tx.status === "confirmado" ? "success" : "warning"}
                              className="text-[9px] px-1"
                            >
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="max-w-2xl h-[600px] bg-reactor-surface border-reactor-border flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-reactor-cyan">Agente Financeiro</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <NucleusChat initialAgent="finance" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
