"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Zap, Loader2 } from "lucide-react";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { DataError, Skeleton } from "@/components/shell/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";

interface HealthPayload {
  status: string;
  integrations: {
    ai_engine: string;
    supabase: string;
    supabase_error: string | null;
    kommo: string;
    evolution: string;
  };
  features: Record<string, boolean>;
}

interface SyncStatus {
  ready: boolean;
  missing: string[];
  subdomain: string | null;
  lastSync: string | null;
}

/** Every public door of the system, so nothing has to be reverse-engineered. */
const ENDPOINTS: { method: string; path: string; what: string }[] = [
  { method: "GET", path: "/api/health", what: "Status do sistema e das integrações" },
  { method: "GET", path: "/api/board", what: "Quadro do pipeline com as colunas do Kommo" },
  { method: "POST", path: "/api/leads/move", what: "Move um lead de etapa e grava no Kommo" },
  { method: "GET", path: "/api/leads", what: "Leads e métricas do funil" },
  { method: "GET/POST", path: "/api/sync/kommo", what: "Status e execução do espelho do Kommo" },
  { method: "GET", path: "/api/finance/summary", what: "Série mensal, categorias e totais" },
  { method: "GET", path: "/api/transactions", what: "Lançamentos financeiros" },
  { method: "GET", path: "/api/appointments", what: "Agenda e taxa de comparecimento" },
  { method: "GET", path: "/api/tasks", what: "Tarefas operacionais" },
  { method: "GET/POST", path: "/api/ai/assist", what: "Contexto e respostas do copiloto" },
  { method: "GET/POST", path: "/api/reports", what: "Histórico e geração de relatórios" },
  { method: "POST", path: "/api/webhook/evolution", what: "Entrada de mensagens do WhatsApp" },
];

const STATE: Record<string, { icon: typeof CheckCircle2; tone: string; label: string }> = {
  connected: { icon: CheckCircle2, tone: "text-grass", label: "Conectado" },
  configured: { icon: CheckCircle2, tone: "text-grass", label: "Configurado" },
  unreachable: { icon: XCircle, tone: "text-rose", label: "Inacessível" },
  demo_mode: { icon: AlertCircle, tone: "text-amber", label: "Modo local" },
  missing: { icon: XCircle, tone: "text-ink-3", label: "Não configurado" },
};

function IntegrationRow({
  name,
  description,
  state,
  detail,
}: {
  name: string;
  description: string;
  state: string;
  detail?: string | null;
}) {
  const config = STATE[state] ?? STATE.missing;
  const Icon = config.icon;

  return (
    <li className="flex items-start gap-3.5 px-6 py-4">
      <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${config.tone}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">{name}</p>
        <p className="text-2xs text-ink-3">{description}</p>
        {detail && <p className="mt-1 text-2xs text-rose">{detail}</p>}
      </div>
      <Badge variant={state === "connected" || state === "configured" ? "success" : "neutral"}>
        {config.label}
      </Badge>
    </li>
  );
}

export default function IntegrationsPage() {
  const health = useApi<HealthPayload>("/api/health");
  const sync = useApi<SyncStatus>("/api/sync/kommo");
  const [syncing, setSyncing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const runSync = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/sync/kommo", { method: "POST" });
      const body = await response.json();
      setNotice(
        body?.ok
          ? `${body.data.synced} lead(s), ${body.data.pipelines} pipeline(s) e ${body.data.statuses} etapa(s) espelhados.`
          : body?.error ?? "Falha ao sincronizar."
      );
      sync.reload();
      health.reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
    }
  };

  const integrations = health.data?.integrations;

  return (
    <>
      <AppTopbar title="Integrações" subtitle="Portas de entrada e saída do Reactor" />

      <div className="flex-1 space-y-6 p-8">
        {health.error && <DataError message={health.error} onRetry={health.reload} />}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Conexões</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              {health.loading ? (
                <div className="space-y-2 px-6">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-hairline">
                  <IntegrationRow
                    name="Supabase"
                    description="Banco de dados e origem de tudo que aparece na tela"
                    state={integrations?.supabase ?? "missing"}
                    detail={integrations?.supabase_error}
                  />
                  <IntegrationRow
                    name="Kommo CRM"
                    description={
                      sync.data?.subdomain
                        ? `${sync.data.subdomain}.kommo.com`
                        : "Espelho de pipelines, etapas e leads"
                    }
                    state={integrations?.kommo ?? "missing"}
                  />
                  <IntegrationRow
                    name="Motor de IA (Groq)"
                    description="Redação do copiloto e dos resumos executivos"
                    state={integrations?.ai_engine ?? "missing"}
                  />
                  <IntegrationRow
                    name="Evolution API"
                    description="Entrada de mensagens de WhatsApp"
                    state={integrations?.evolution ?? "missing"}
                  />
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Espelho do Kommo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sync.loading ? (
                <Skeleton className="h-24" />
              ) : sync.data?.ready ? (
                <p className="text-xs leading-relaxed text-ink-2">
                  Tudo configurado. Cada sincronização traz pipelines, etapas com cores, leads,
                  responsáveis e contatos — e mover um card aqui grava a etapa no Kommo.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-ink-2">Faltam variáveis de ambiente:</p>
                  <ul className="space-y-1">
                    {(sync.data?.missing ?? []).map((key) => (
                      <li
                        key={key}
                        className="rounded-md bg-sunken px-3 py-2 font-mono text-2xs text-ink"
                      >
                        {key}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sync.data?.lastSync && (
                <p className="text-2xs text-ink-3">
                  Última sincronização: {new Date(sync.data.lastSync).toLocaleString("pt-BR")}
                </p>
              )}

              <Button onClick={runSync} disabled={syncing || !sync.data?.ready}>
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {syncing ? "Sincronizando..." : "Sincronizar agora"}
              </Button>

              {notice && (
                <p className="rounded-lg bg-sunken px-3 py-2.5 text-2xs text-ink-2">{notice}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API do Reactor</CardTitle>
            <p className="text-2xs text-ink-3">
              Todas as rotas respondem no formato{" "}
              <code className="rounded bg-sunken px-1 py-0.5 font-mono">
                {`{ ok: true, data }`}
              </code>{" "}
              ou{" "}
              <code className="rounded bg-sunken px-1 py-0.5 font-mono">
                {`{ ok: false, error }`}
              </code>
              , então qualquer automação externa consegue tratar erro sem adivinhar.
            </p>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <ul className="divide-y divide-hairline">
              {ENDPOINTS.map((endpoint) => (
                <li key={endpoint.path} className="flex items-center gap-4 px-6 py-2.5">
                  <span className="w-20 shrink-0 font-mono text-2xs font-semibold text-violet">
                    {endpoint.method}
                  </span>
                  <code className="w-56 shrink-0 font-mono text-2xs text-ink">
                    {endpoint.path}
                  </code>
                  <span className="truncate text-2xs text-ink-3">{endpoint.what}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
