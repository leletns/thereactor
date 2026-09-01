"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  TrendingUp,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { StatTile } from "@/components/shell/StatTile";
import { DataEmpty, DataError, Skeleton } from "@/components/shell/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import type { ReactorSnapshot } from "@/lib/reactor/snapshot";

interface AssistPayload {
  findings: string[];
  snapshot: ReactorSnapshot;
  aiEnabled: boolean;
}

export default function OverviewPage() {
  const { data, loading, error, reload } = useApi<AssistPayload>("/api/ai/assist?days=30");
  const snapshot = data?.snapshot;
  const commercial = snapshot?.commercial;
  const finance = snapshot?.finance;
  const clinic = snapshot?.clinic;

  return (
    <>
      <AppTopbar
        title="Visão geral"
        subtitle="Tudo que está acontecendo na clínica agora"
      />

      <div className="flex-1 space-y-6 p-9">
        {error && <DataError message={error} onRetry={reload} />}

        {!error && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                label="Leads em aberto"
                value={commercial?.openLeads ?? 0}
                hint={`${commercial?.newLeads ?? 0} novos em 30 dias`}
                icon={Users}
                tone="violet"
                loading={loading}
              />
              <StatTile
                label="Pipeline em aberto"
                value={formatCurrency(commercial?.openValue ?? 0)}
                hint={`conversão de ${commercial?.conversionRate ?? 0}%`}
                icon={Wallet}
                tone="grass"
                loading={loading}
              />
              <StatTile
                label="Resultado"
                value={formatCurrency(finance?.lucro ?? 0)}
                hint={`margem de ${finance?.margem ?? 0}%`}
                icon={TrendingUp}
                tone={finance && finance.lucro < 0 ? "rose" : "amber"}
                loading={loading}
              />
              <StatTile
                label="Agenda futura"
                value={(clinic?.agendados ?? 0) + (clinic?.confirmados ?? 0)}
                hint={`${formatCurrency(clinic?.receitaPrevista ?? 0)} previstos`}
                icon={CalendarDays}
                tone="neutral"
                loading={loading}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Copilot findings */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
<Sparkles className="h-4 w-4 text-violet" strokeWidth={1.5} />
                    <CardTitle>Leitura do copiloto</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/copiloto">
                      Abrir
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-9" />
                      ))}
                    </div>
                  ) : data?.findings.length ? (
                    <ul className="space-y-2">
                      {data.findings.map((finding, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-xl border border-hairline px-4 py-3 text-[13px] leading-relaxed text-ink-2"
                        >
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-pill bg-violet" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <DataEmpty message="Sem dados suficientes para gerar uma leitura." />
                  )}
                </CardContent>
              </Card>

              {/* Stalled leads */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
<AlertTriangle className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    <CardTitle>Leads parados</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pb-2">
                  {loading ? (
                    <div className="space-y-2 px-6">
                      {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : commercial?.stalled.length ? (
                    <ul className="divide-y divide-hairline">
                      {commercial.stalled.slice(0, 6).map((lead) => (
                        <li key={lead.name} className="flex items-center gap-3 px-6 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-ink">{lead.name}</p>
                            <p className="truncate text-2xs text-ink-3">{lead.stage}</p>
                          </div>
                          <div className="text-right">
                            <p className="rx-numeric text-xs font-semibold text-ink">
                              {formatCurrency(lead.value)}
                            </p>
                            <Badge variant={lead.days >= 7 ? "danger" : "warning"}>
                              {lead.days}d parado
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <DataEmpty message="Nenhum lead parado há mais de 3 dias." />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Top opportunities */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Maiores oportunidades abertas</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/pipeline">
                      Pipeline
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0 pb-2">
                  {loading ? (
                    <div className="space-y-2 px-6">
                      {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : commercial?.topLeads.length ? (
                    <ul className="divide-y divide-hairline">
                      {commercial.topLeads.map((lead) => (
                        <li key={lead.name} className="flex items-center gap-3 px-6 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-ink">{lead.name}</p>
                            <p className="truncate text-2xs text-ink-3">{lead.stage}</p>
                          </div>
                          <span className="rounded-pill border border-hairline-strong px-2 py-0.5 text-2xs font-medium text-ink-2">
                            {lead.score}
                          </span>
                          <span className="rx-numeric w-24 text-right text-xs font-semibold text-ink">
                            {formatCurrency(lead.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <DataEmpty message="Nenhum lead aberto no funil." />
                  )}
                </CardContent>
              </Card>

              {/* Stage distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por etapa</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-40" />
                  ) : commercial?.byStage.length ? (
                    <div className="space-y-3">
                      {commercial.byStage.slice(0, 7).map((stage) => {
                        const max = Math.max(
                          ...commercial.byStage.map((s) => s.count),
                          1
                        );
                        return (
                          <div key={stage.stage}>
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                              <span className="truncate font-medium text-ink">{stage.stage}</span>
                              <span className="rx-numeric text-ink-3">
                                {stage.count} · {formatCurrency(stage.value)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-pill bg-sunken">
                              <div
                                className="h-full rounded-pill bg-violet"
                                style={{ width: `${(stage.count / max) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <DataEmpty message="Sem leads para distribuir." />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
