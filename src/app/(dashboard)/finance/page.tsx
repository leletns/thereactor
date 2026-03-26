"use client";

import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NucleusChat } from "@/components/reactor/NucleusChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

const MONTHLY_DATA = [
  { mes: "Mar/24", receita: 142000, despesas: 89000, lucro: 53000 },
  { mes: "Abr/24", receita: 158000, despesas: 95000, lucro: 63000 },
  { mes: "Mai/24", receita: 171000, despesas: 102000, lucro: 69000 },
  { mes: "Jun/24", receita: 165000, despesas: 98000, lucro: 67000 },
  { mes: "Jul/24", receita: 183000, despesas: 108000, lucro: 75000 },
  { mes: "Ago/24", receita: 197000, despesas: 115000, lucro: 82000 },
  { mes: "Set/24", receita: 214000, despesas: 121000, lucro: 93000 },
  { mes: "Out/24", receita: 229000, despesas: 130000, lucro: 99000 },
  { mes: "Nov/24", receita: 241000, despesas: 138000, lucro: 103000 },
  { mes: "Dez/24", receita: 267000, despesas: 148000, lucro: 119000 },
  { mes: "Jan/25", receita: 234000, despesas: 135000, lucro: 99000 },
  { mes: "Fev/25", receita: 258000, despesas: 142000, lucro: 116000 },
];

const CATEGORY_DATA = [
  { categoria: "SaaS", valor: 112000 },
  { categoria: "Consultoria", valor: 78000 },
  { categoria: "Suporte", valor: 34000 },
  { categoria: "Licenças", valor: 22000 },
  { categoria: "Outros", valor: 12000 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, desc: "MRR — TechVision Ltda", amount: 18500, type: "receita", date: "26/03/25", cat: "SaaS", status: "confirmado" },
  { id: 2, desc: "Consultoria estratégica — Grupo Alpha", amount: 25000, type: "receita", date: "25/03/25", cat: "Consultoria", status: "confirmado" },
  { id: 3, desc: "AWS — Infraestrutura", amount: -8420, type: "despesa", date: "24/03/25", cat: "Tecnologia", status: "confirmado" },
  { id: 4, desc: "Salários equipe — Março", amount: -68000, type: "despesa", date: "24/03/25", cat: "RH", status: "confirmado" },
  { id: 5, desc: "MRR — DataCore Sistemas", amount: 12800, type: "receita", date: "23/03/25", cat: "SaaS", status: "confirmado" },
  { id: 6, desc: "Marketing Digital — Meta Ads", amount: -4200, type: "despesa", date: "22/03/25", cat: "Marketing", status: "confirmado" },
  { id: 7, desc: "Licença Anual — StartupX", amount: 22000, type: "receita", date: "21/03/25", cat: "Licenças", status: "pendente" },
  { id: 8, desc: "Suporte Premium — InnovateBR", amount: 5400, type: "receita", date: "20/03/25", cat: "Suporte", status: "confirmado" },
  { id: 9, desc: "Contabilidade + Jurídico", amount: -3800, type: "despesa", date: "19/03/25", cat: "Serviços", status: "confirmado" },
  { id: 10, desc: "Aluguel escritório + Coworking", amount: -6500, type: "despesa", date: "18/03/25", cat: "Infraestrutura", status: "confirmado" },
];

const AI_INSIGHTS = [
  {
    id: 1,
    title: "Oportunidade de crescimento",
    content: "Receita cresceu 12.7% MoM. Segmento SaaS representa 43% da receita — considere aumentar CAC em aquisição para escalar.",
    type: "success",
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Alerta de margem",
    content: "Despesas com RH cresceram 8.5% sem aumento proporcional de receita. Revise estrutura salarial para manter margem líquida acima de 40%.",
    type: "warning",
    icon: TrendingDown,
  },
  {
    id: 3,
    title: "Fluxo de caixa saudável",
    content: "Runway atual de 14 meses. Burn rate: R$ 142k/mês. Recomendo manter reserva de 6 meses em caixa antes de novo headcount.",
    type: "info",
    icon: DollarSign,
  },
];

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

export default function FinancePage() {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Painel Financeiro</h2>
          <p className="text-sm text-white/40">Março 2025 — Análise em tempo real</p>
        </div>
        <Button onClick={() => setShowAIChat(true)} variant="outline" size="sm">
          <Bot className="h-4 w-4 mr-2" />
          Perguntar ao Agente Financeiro
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Receita Mensal"
          value={258000}
          prefix="R$"
          change={10.3}
          changeLabel="vs fevereiro"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Despesas"
          value={142000}
          prefix="R$"
          change={5.9}
          changeLabel="vs fevereiro"
          icon={BarChart2}
          color="orange"
        />
        <MetricCard
          title="Lucro Líquido"
          value={116000}
          prefix="R$"
          change={17.2}
          changeLabel="vs fevereiro"
          icon={DollarSign}
          color="cyan"
        />
        <MetricCard
          title="Margem Líquida"
          value={44.9}
          suffix="%"
          change={2.4}
          changeLabel="pts percentuais"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart - 2/3 width */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white/70">
              Receita vs Despesas — 12 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="receita" name="Receita" stroke="#00ff88" fill="url(#colorReceita)" strokeWidth={2} />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ff6b35" fill="url(#colorDespesas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category chart - 1/3 width */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white/70">
              Receita por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="categoria" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={72} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: "#141428", border: "1px solid #1e1e3a", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="valor" fill="#00f5ff" radius={[0, 4, 4, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights + Transactions */}
      <div className="grid grid-cols-2 gap-4">
        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-reactor-cyan" />
              <CardTitle className="text-sm">Insights do Agente Financeiro</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_INSIGHTS.map((insight, i) => {
              const Icon = insight.icon;
              const colorMap = {
                success: { bg: "bg-reactor-green/8", border: "border-reactor-green/15", text: "text-reactor-green" },
                warning: { bg: "bg-orange-500/8", border: "border-orange-500/15", text: "text-orange-400" },
                info: { bg: "bg-reactor-cyan/8", border: "border-reactor-cyan/15", text: "text-reactor-cyan" },
              } as const;
              const colors = colorMap[insight.type as keyof typeof colorMap];

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
            })}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Últimas Transações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="divide-y divide-reactor-border">
                {RECENT_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/2 transition-colors">
                    <div className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${tx.type === "receita" ? "bg-reactor-green/10" : "bg-reactor-red/10"}`}>
                      {tx.type === "receita" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-reactor-green" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-reactor-red" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 truncate">{tx.desc}</p>
                      <p className="text-[10px] text-white/30">{tx.date} · {tx.cat}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-semibold ${tx.amount > 0 ? "text-reactor-green" : "text-reactor-red"}`}>
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
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
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
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
