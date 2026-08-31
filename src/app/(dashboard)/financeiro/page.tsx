"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { StatTile } from "@/components/shell/StatTile";
import { DataEmpty, DataError, Skeleton } from "@/components/shell/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  totals: { receita: number; despesas: number; lucro: number; margem: number; transacoes: number };
  currentMonth: MonthPoint | null;
  growth: number | null;
  monthly: MonthPoint[];
  categories: { categoria: string; valor: number }[];
  recent: Transaction[];
}

// Tooltips genuinely float, so they are one of the few places a shadow belongs.
const CHART_TOOLTIP = {
  background: "#ffffff",
  border: "1px solid #ebe5ff",
  borderRadius: 14,
  fontSize: 12,
  boxShadow: "0 16px 40px rgba(16,15,18,0.10), 0 2px 8px rgba(16,15,18,0.05)",
  color: "#100f12",
};

export default function FinancePage() {
  const { data, loading, error, reload } = useApi<FinanceSummary>("/api/finance/summary");
  const hasData = !!data && data.totals.transacoes > 0;
  const current = data?.currentMonth ?? null;

  return (
    <>
      <AppTopbar
        title="Financeiro"
        subtitle={current ? `${current.mes} · dados ao vivo` : "Receitas, despesas e margem"}
        actions={
          <Button variant="ghost" size="icon-sm" onClick={reload} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              strokeWidth={1.5}
            />
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-9">
        {error && <DataError message={error} onRetry={reload} />}

        {!error && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                label="Receita do mês"
                value={formatCurrency(current?.receita ?? 0)}
                hint={
                  data?.growth !== null && data?.growth !== undefined
                    ? `${data.growth > 0 ? "+" : ""}${data.growth}% vs mês anterior`
                    : "mês corrente"
                }
                icon={TrendingUp}
                tone="grass"
                loading={loading}
              />
              <StatTile
                label="Despesas do mês"
                value={formatCurrency(current?.despesas ?? 0)}
                hint="mês corrente"
                icon={TrendingDown}
                tone="amber"
                loading={loading}
              />
              <StatTile
                label="Lucro líquido"
                value={formatCurrency(current?.lucro ?? 0)}
                hint="mês corrente"
                icon={Wallet}
                tone={current && current.lucro < 0 ? "rose" : "violet"}
                loading={loading}
              />
              <StatTile
                label="Margem acumulada"
                value={`${data?.totals.margem ?? 0}%`}
                hint={`${data?.totals.transacoes ?? 0} transações`}
                icon={Percent}
                tone="neutral"
                loading={loading}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Receita vs despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-56" />
                  ) : hasData ? (
                    <ResponsiveContainer width="100%" height={230}>
                      <AreaChart data={data!.monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rxReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1f7a4d" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#1f7a4d" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="rxDespesa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8d6fde" stopOpacity={0.16} />
                            <stop offset="100%" stopColor="#8d6fde" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f2eeff" vertical={false} />
                        <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={CHART_TOOLTIP}
                          formatter={(v, name) => [formatCurrency(Number(v)), String(name)]}
                        />
                        <Area
                          isAnimationActive={false}
                          type="monotone"
                          dataKey="receita"
                          name="Receita"
                          stroke="#1f7a4d"
                          strokeWidth={2}
                          fill="url(#rxReceita)"
                          dot={{ r: 2.5, fill: "#1f7a4d", strokeWidth: 0 }}
                        />
                        <Area
                          isAnimationActive={false}
                          type="monotone"
                          dataKey="despesas"
                          name="Despesas"
                          stroke="#8d6fde"
                          strokeWidth={2}
                          fill="url(#rxDespesa)"
                          dot={{ r: 2.5, fill: "#8d6fde", strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <DataEmpty message="Nenhuma transação registrada ainda." />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Receita por categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-56" />
                  ) : data?.categories.length ? (
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart
                        data={data.categories}
                        layout="vertical"
                        margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f2eeff" horizontal={false} />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="categoria"
                          tickLine={false}
                          axisLine={false}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={CHART_TOOLTIP}
                          formatter={(v) => formatCurrency(Number(v))}
                        />
                        <Bar isAnimationActive={false} dataKey="valor" fill="#8d6fde" radius={[0, 999, 999, 0]} maxBarSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <DataEmpty message="Sem receitas categorizadas." />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Últimas transações</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                {loading ? (
                  <div className="space-y-2 px-6">
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : data?.recent.length ? (
                  <ul className="divide-y divide-hairline">
                    {data.recent.map((tx) => {
                      const income = tx.type === "receita";
                      return (
                        <li key={tx.id} className="flex items-center gap-3 px-6 py-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill ${
                              income ? "bg-grass-soft" : "bg-wash"
                            }`}
                          >
                            {income ? (
                              <ArrowUpRight className="h-4 w-4 text-grass" strokeWidth={1.5} />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-violet-deep" strokeWidth={1.5} />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-ink">
                              {tx.description}
                            </p>
                            <p className="text-2xs text-ink-3">
                              {new Date(`${tx.date}T00:00:00`).toLocaleDateString("pt-BR")} ·{" "}
                              {tx.category}
                            </p>
                          </div>
                          <Badge variant={tx.status === "confirmado" ? "success" : "warning"}>
                            {tx.status}
                          </Badge>
                          <span
                            className={`rx-numeric w-28 text-right text-xs font-semibold ${
                              income ? "text-grass" : "text-ink"
                            }`}
                          >
                            {income ? "+" : "−"}
                            {formatCurrency(Math.abs(Number(tx.amount)))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <DataEmpty message="Nenhuma transação registrada." />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
