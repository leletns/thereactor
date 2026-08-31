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

const CHART_TOOLTIP = {
  background: "#ffffff",
  border: "1px solid #e4e8f0",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "rgba(2,20,34,0.10) 0px 6px 28px 0px",
  color: "#021422",
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
      />

      <div className="flex-1 space-y-6 p-8">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

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
                            <stop offset="0%" stopColor="#00852e" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#00852e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="rxDespesa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6161ff" stopOpacity={0.16} />
                            <stop offset="100%" stopColor="#6161ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
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
                          type="monotone"
                          dataKey="receita"
                          name="Receita"
                          stroke="#00852e"
                          strokeWidth={2}
                          fill="url(#rxReceita)"
                          dot={{ r: 3, fill: "#00852e", strokeWidth: 0 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="despesas"
                          name="Despesas"
                          stroke="#6161ff"
                          strokeWidth={2}
                          fill="url(#rxDespesa)"
                          dot={{ r: 3, fill: "#6161ff", strokeWidth: 0 }}
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" horizontal={false} />
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
                        <Bar dataKey="valor" fill="#6161ff" radius={[0, 6, 6, 0]} maxBarSize={22} />
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
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              income ? "bg-grass-soft" : "bg-violet-soft"
                            }`}
                          >
                            {income ? (
                              <ArrowUpRight className="h-4 w-4 text-grass" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-violet" />
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
