"use client";

import React, { useState } from "react";
import { FileBarChart, Sparkles, Loader2, Download, Clock } from "lucide-react";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { DataEmpty, DataError, Skeleton } from "@/components/shell/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import type { ReactorSnapshot } from "@/lib/reactor/snapshot";

type Period = "diario" | "semanal" | "mensal";

interface Report {
  id: string | null;
  created_at?: string;
  period: Period;
  period_start: string;
  period_end: string;
  title: string;
  summary: string | null;
  metrics: ReactorSnapshot;
  highlights: string[];
  generated_by: string;
  saved?: boolean;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "diario", label: "Diário" },
  { key: "semanal", label: "Semanal" },
  { key: "mensal", label: "Mensal" },
];

function downloadReport(report: Report) {
  const lines = [
    report.title,
    "=".repeat(report.title.length),
    `Período: ${report.period_start} a ${report.period_end}`,
    "",
    "RESUMO",
    report.summary ?? "—",
    "",
    "DESTAQUES",
    ...report.highlights.map((h) => `- ${h}`),
    "",
    "MÉTRICAS (JSON)",
    JSON.stringify(report.metrics, null, 2),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.title.replace(/[^\w-]+/g, "_")}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("semanal");
  const [generating, setGenerating] = useState(false);
  const [fresh, setFresh] = useState<Report | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const history = useApi<{ reports: Report[] }>("/api/reports");

  const generate = async () => {
    setGenerating(true);
    setFailure(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const body = await response.json();
      if (body?.ok) {
        setFresh(body.data as Report);
        history.reload();
      } else {
        setFailure(body?.error ?? "Não foi possível gerar o relatório.");
      }
    } catch (err) {
      setFailure(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  const shown = fresh;

  return (
    <>
      <AppTopbar
        title="Relatórios"
        subtitle="Gerados a partir dos dados reais, com resumo executivo automático"
      />

      <div className="flex-1 space-y-6 p-9">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-5">
            <div className="flex rounded-pill border border-hairline-strong p-1">
              {PERIODS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setPeriod(option.key)}
                  className={`rounded-pill px-4 py-1.5 text-[13px] font-medium transition-colors ${
                    period === option.key
                      ? "bg-ink text-white"
                      : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Button onClick={generate} disabled={generating} className="ml-auto">
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? "Gerando..." : "Gerar relatório"}
            </Button>
          </CardContent>
        </Card>

        {failure && <DataError message={failure} />}

        {shown && (
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="text-[22px] font-thin tracking-[-0.02em]">{shown.title}</CardTitle>
                <p className="mt-1 text-2xs text-ink-3">
                  {shown.period_start} → {shown.period_end}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={shown.generated_by === "reactor-ai" ? "default" : "neutral"}>
                  {shown.generated_by === "reactor-ai" ? "resumo por IA" : "análise local"}
                </Badge>
                {shown.saved === false && <Badge variant="warning">não salvo</Badge>}
                <Button variant="outline" size="sm" onClick={() => downloadReport(shown)}>
                  <Download className="h-3.5 w-3.5" />
                  Baixar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="whitespace-pre-wrap text-[14px] leading-[1.6] text-ink-2">
                {shown.summary}
              </p>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric
                  label="Pipeline aberto"
                  value={formatCurrency(shown.metrics.commercial.openValue)}
                />
                <Metric label="Conversão" value={`${shown.metrics.commercial.conversionRate}%`} />
                <Metric label="Receita" value={formatCurrency(shown.metrics.finance.receita)} />
                <Metric label="Margem" value={`${shown.metrics.finance.margem}%`} />
              </div>

              <div>
                <p className="rx-eyebrow mb-2.5">Destaques</p>
                <ul className="space-y-2">
                  {shown.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl border border-hairline px-4 py-3 text-[13px] leading-relaxed text-ink-2"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-pill bg-violet" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {history.loading ? (
              <div className="space-y-2 px-6">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : history.error ? (
              <DataError message={history.error} onRetry={history.reload} />
            ) : history.data?.reports.length ? (
              <ul className="divide-y divide-hairline">
                {history.data.reports.map((report) => (
                  <li key={report.id ?? report.title} className="flex items-center gap-3 px-6 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sunken">
                      <FileBarChart className="h-4 w-4 text-ink-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{report.title}</p>
                      <p className="text-2xs text-ink-3">
                        {report.period_start} → {report.period_end}
                      </p>
                    </div>
                    <Badge variant={report.generated_by === "reactor-ai" ? "default" : "neutral"}>
                      {report.period}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFresh(report)}
                    >
                      Abrir
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <DataEmpty
                message="Nenhum relatório gerado ainda. O histórico só é gravado com a SUPABASE_SERVICE_ROLE_KEY configurada."
              />
            )}
          </CardContent>
        </Card>

        <p className="flex items-center gap-2 text-2xs text-ink-3">
          <Clock className="h-3.5 w-3.5" />
          Para gerar sozinho todo dia, chame{" "}
          <code className="rounded bg-sunken px-1.5 py-0.5 font-mono">POST /api/reports</code> por
          um cron (Vercel Cron, n8n ou o agendador da sua preferência).
        </p>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline px-4 py-3.5">
      <p className="text-2xs text-ink-3">{label}</p>
      <p className="rx-figure mt-1.5 text-[19px] text-ink">{value}</p>
    </div>
  );
}
