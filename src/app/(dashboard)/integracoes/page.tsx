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
    supabase_env: { url: boolean; anonKey: boolean; serviceRoleKey: boolean };
    kommo: string;
    evolution: string;
    amigoclinic: string;
  };
  features: Record<string, boolean>;
}

interface SyncStatus {
  ready: boolean;
  missing: string[];
  subdomain: string | null;
  lastSync: string | null;
}

interface AgendaSyncStatus {
  ready: boolean;
  calendars: string[];
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
  { method: "GET/POST", path: "/api/sync/amigoclinic", what: "Status e execucao do espelho da agenda AmigoClinic" },
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
  const agendaSync = useApi<AgendaSyncStatus>("/api/sync/amigoclinic");
  const [syncing, setSyncing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [syncingAgenda, setSyncingAgenda] = React.useState(false);
  const [agendaNotice, setAgendaNotice] = React.useState<string | null>(null);

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

  const runAgendaSync = async () => {
    setSyncingAgenda(true);
    setAgendaNotice(null);
    try {
      const response = await fetch("/api/sync/amigoclinic", { method: "POST" });
      const body = await response.json();
      setAgendaNotice(
        body?.ok
          ? `${body.data.upserted} atendimento(s) espelhados de ${body.data.calendars} agenda(s) da AmigoClinic.`
          : body?.error ?? "Falha ao sincronizar a agenda."
      );
      agendaSync.reload();
      health.reload();
    } catch (err) {
      setAgendaNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncingAgenda(false);
    }
  };

  const integrations = health.data?.integrations;

  return (
    <>
      <AppTopbar title="Integrações" subtitle="Portas de entrada e saída do Reactor" />

      <div className="flex-1 space-y-6 p-9">
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
                    description={
                      integrations?.supabase_env
                        ? `URL ${integrations.supabase_env.url ? "ok" : "faltando"} · anon key ${
                            integrations.supabase_env.anonKey ? "ok" : "faltando"
                          } · service role ${
                            integrations.supabase_env.serviceRoleKey ? "ok" : "faltando"
                          }`
                        : "Banco de dados e origem de tudo que aparece na tela"
                    }
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
                  <IntegrationRow
                    name="AmigoClinic"
                    description={
                      agendaSync.data?.calendars?.length
                        ? `${agendaSync.data.calendars.length} agendas: ${agendaSync.data.calendars.join(", ")}`
                        : "Espelho da agenda (feeds .ics por profissional)"
                    }
                    state={integrations?.amigoclinic ?? "missing"}
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
                        className="rounded-pill border border-hairline-strong px-4 py-1.5 font-mono text-2xs text-ink"
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
                <p className="rounded-xl border border-hairline bg-wash/40 px-4 py-3 text-[12px] text-ink-2">{notice}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agenda AmigoClinic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs leading-relaxed text-ink-2">
                Puxa os 6 calendarios (.ics) por profissional — Dr. Rafael Erthal, Dra. Lorena,
                Leonardo Valadao, Soroterapia, Silvana e Fisioterapia — e espelha cada atendimento
                em reactor_appointments, que alimenta a pagina Agenda.
              </p>

              {agendaSync.data?.lastSync && (
                <p className="text-2xs text-ink-3">
                  Ultima sincronizacao: {new Date(agendaSync.data.lastSync).toLocaleString("pt-BR")}
                </p>
              )}

              <Button onClick={runAgendaSync} disabled={syncingAgenda}>
                {syncingAgenda ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {syncingAgenda ? "Sincronizando..." : "Sincronizar agora"}
              </Button>

              {agendaNotice && (
                <p className="rounded-xl border border-hairline bg-wash/40 px-4 py-3 text-[12px] text-ink-2">
                  {agendaNotice}
                </p>
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
                  <span className="w-20 shrink-0 font-mono text-2xs font-medium text-violet-deep">
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
