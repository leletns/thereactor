"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Zap, Loader2, Settings, Copy } from "lucide-react";
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

interface EvolutionSettings {
  configured: boolean;
  url: string | null;
  hasKey: boolean;
  source: string;
}

const WEBHOOK_URL = "https://thereactor.vercel.app/api/webhook/evolution";

const ENDPOINTS: { method: string; path: string; what: string }[] = [
  { method: "GET", path: "/api/health", what: "Status do sistema e das integraÃ§Ãµes" },
  { method: "GET", path: "/api/board", what: "Quadro do pipeline com as colunas do Kommo" },
  { method: "POST", path: "/api/leads/move", what: "Move um lead de etapa e grava no Kommo" },
  { method: "GET", path: "/api/leads", what: "Leads e mÃ©tricas do funil" },
  { method: "GET/POST", path: "/api/sync/kommo", what: "Status e execuÃ§Ã£o do espelho do Kommo" },
  { method: "GET", path: "/api/finance/summary", what: "SÃ©rie mensal, categorias e totais" },
  { method: "GET", path: "/api/transactions", what: "LanÃ§amentos financeiros" },
  { method: "GET", path: "/api/appointments", what: "Agenda e taxa de comparecimento" },
  { method: "GET/POST", path: "/api/sync/amigoclinic", what: "Status e execucao do espelho da agenda AmigoClinic" },
  { method: "GET", path: "/api/tasks", what: "Tarefas operacionais" },
  { method: "GET/POST", path: "/api/ai/assist", what: "Contexto e respostas do copiloto" },
  { method: "GET/POST", path: "/api/reports", what: "HistÃ³rico e geraÃ§Ã£o de relatÃ³rios" },
  { method: "POST", path: "/api/webhook/evolution", what: "Entrada de mensagens do WhatsApp" },
];

const STATE: Record<string, { icon: typeof CheckCircle2; tone: string; label: string }> = {
  connected: { icon: CheckCircle2, tone: "text-grass", label: "Conectado" },
  configured: { icon: CheckCircle2, tone: "text-grass", label: "Configurado" },
  unreachable: { icon: XCircle, tone: "text-rose", label: "InacessÃ­vel" },
  demo_mode: { icon: AlertCircle, tone: "text-amber", label: "Modo local" },
  missing: { icon: XCircle, tone: "text-ink-3", label: "NÃ£o configurado" },
};

function IntegrationRow({
  name,
  description,
  state,
  detail,
  onConfigure,
}: {
  name: string;
  description: string;
  state: string;
  detail?: string | null;
  onConfigure?: () => void;
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
      <div className="flex items-center gap-2">
        {onConfigure && state === "missing" && (
          <Button size="sm" variant="ghost" onClick={onConfigure} className="h-7 px-2 text-2xs">
            <Settings className="mr-1 h-3 w-3" />
            Configurar
          </Button>
        )}
        <Badge variant={state === "connected" || state === "configured" ? "success" : "neutral"}>
          {config.label}
        </Badge>
      </div>
    </li>
  );
}

export default function IntegrationsPage() {
  const health = useApi<HealthPayload>("/api/health");
  const sync = useApi<SyncStatus>("/api/sync/kommo");
  const agendaSync = useApi<AgendaSyncStatus>("/api/sync/amigoclinic");
  const evolutionSettings = useApi<EvolutionSettings>("/api/settings/evolution");

  const [syncing, setSyncing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [syncingAgenda, setSyncingAgenda] = React.useState(false);
  const [agendaNotice, setAgendaNotice] = React.useState<string | null>(null);

  // Evolution API config state
  const [showEvolutionConfig, setShowEvolutionConfig] = React.useState(false);
  const [evolutionUrl, setEvolutionUrl] = React.useState("");
  const [evolutionKey, setEvolutionKey] = React.useState("");
  const [savingEvolution, setSavingEvolution] = React.useState(false);
  const [evolutionNotice, setEvolutionNotice] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const runSync = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/sync/kommo", { method: "POST" });
      // Safely parse JSON â the function can timeout and return plain text
      let body: Record<string, unknown> | null = null;
      try { body = await response.json(); } catch { /* not JSON */ }
      setNotice(
        body?.ok
          ? `${(body.data as { synced: number; pipelines: number; statuses: number }).synced} lead(s), ${(body.data as { synced: number; pipelines: number; statuses: number }).pipelines} pipeline(s) e ${(body.data as { synced: number; pipelines: number; statuses: number }).statuses} etapa(s) espelhados.`
          : (body?.error as string) ?? "Falha ao sincronizar."
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
      let body: Record<string, unknown> | null = null;
      try { body = await response.json(); } catch { /* not JSON */ }
      setAgendaNotice(
        body?.ok
          ? `${(body.data as { upserted: number; calendars: number }).upserted} atendimento(s) espelhados de ${(body.data as { upserted: number; calendars: number }).calendars} agenda(s) da AmigoClinic.`
          : (body?.error as string) ?? "Falha ao sincronizar a agenda."
      );
      agendaSync.reload();
      health.reload();
    } catch (err) {
      setAgendaNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncingAgenda(false);
    }
  };

  const saveEvolutionConfig = async () => {
    if (!evolutionUrl.trim() || !evolutionKey.trim()) {
      setEvolutionNotice("Preencha a URL e a API Key.");
      return;
    }
    setSavingEvolution(true);
    setEvolutionNotice(null);
    try {
      const res = await fetch("/api/settings/evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: evolutionUrl.trim(), key: evolutionKey.trim() }),
      });
      const body = await res.json();
      if (body?.ok) {
        setEvolutionNotice("â ConfiguraÃ§Ã£o salva! Recarregando status...");
        setEvolutionUrl("");
        setEvolutionKey("");
        setTimeout(() => {
          setShowEvolutionConfig(false);
          setEvolutionNotice(null);
          health.reload();
          evolutionSettings.reload();
        }, 1500);
      } else {
        setEvolutionNotice(body?.error ?? "Erro ao salvar.");
      }
    } catch (err) {
      setEvolutionNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingEvolution(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const integrations = health.data?.integrations;
  const evolutionMissing = integrations?.evolution === "missing";

  return (
    <>
      <AppTopbar title="IntegraÃ§Ãµes" subtitle="Portas de entrada e saÃ­da do Reactor" />

      <div className="flex-1 space-y-6 p-9">
        {health.error && <DataError message={health.error} onRetry={health.reload} />}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ConexÃµes</CardTitle>
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
                        ? `URL ${integrations.supabase_env.url ? "ok" : "faltando"} Â· anon key ${
                            integrations.supabase_env.anonKey ? "ok" : "faltando"
                          } Â· service role ${
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
                    description="RedaÃ§Ã£o do copiloto e dos resumos executivos"
                    state={integrations?.ai_engine ?? "missing"}
                  />
                  <IntegrationRow
                    name="Evolution API"
                    description={
                      evolutionSettings.data?.url
                        ? evolutionSettings.data.url
                        : "Entrada de mensagens de WhatsApp"
                    }
                    state={integrations?.evolution ?? "missing"}
                    onConfigure={() => setShowEvolutionConfig(true)}
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
                  Tudo configurado. Cada sincronizaÃ§Ã£o traz pipelines, etapas com cores, leads,
                  responsÃ¡veis e contatos â e mover um card aqui grava a etapa no Kommo.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-ink-2">Faltam variÃ¡veis de ambiente:</p>
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
                  Ãltima sincronizaÃ§Ã£o: {new Date(sync.data.lastSync).toLocaleString("pt-BR")}
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

          {/* Evolution API Configuration Panel */}
          {(showEvolutionConfig || evolutionMissing) && !health.loading && (
            <Card className={showEvolutionConfig ? "border-violet-deep/30 ring-1 ring-violet-deep/20" : ""}>
              <CardHeader>
                <CardTitle>
                  {showEvolutionConfig ? "Configurar Evolution API" : "Evolution API â WhatsApp"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showEvolutionConfig ? (
                  <>
                    <p className="text-xs leading-relaxed text-ink-2">
                      Conecte o WhatsApp da clÃ­nica para receber mensagens diretamente no Reactor.
                      VocÃª precisa de uma instÃ¢ncia da Evolution API rodando (Railway, VPS, etc.).
                    </p>
                    <Button onClick={() => setShowEvolutionConfig(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar agora
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-ink-2">
                      Insira a URL base e a API Key da sua instÃ¢ncia da Evolution API.
                    </p>

                    <div className="space-y-2">
                      <label className="text-2xs font-medium text-ink">URL da Evolution API</label>
                      <input
                        type="url"
                        value={evolutionUrl}
                        onChange={(e) => setEvolutionUrl(e.target.value)}
                        placeholder="https://sua-evolution-api.com"
                        className="w-full rounded-lg border border-hairline-strong bg-wash px-3 py-2 font-mono text-xs text-ink placeholder-ink-4 focus:outline-none focus:ring-1 focus:ring-violet-deep"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-2xs font-medium text-ink">API Key</label>
                      <input
                        type="password"
                        value={evolutionKey}
                        onChange={(e) => setEvolutionKey(e.target.value)}
                        placeholder="â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢â¢"
                        className="w-full rounded-lg border border-hairline-strong bg-wash px-3 py-2 font-mono text-xs text-ink placeholder-ink-4 focus:outline-none focus:ring-1 focus:ring-violet-deep"
                      />
                    </div>

                    <div className="rounded-lg border border-hairline bg-wash/60 px-4 py-3 space-y-1">
                      <p className="text-2xs font-medium text-ink">Webhook URL do Reactor</p>
                      <p className="text-2xs text-ink-3 mb-2">Configure este endpoint na sua instÃ¢ncia Evolution API:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-sunken px-2 py-1 font-mono text-2xs text-violet-deep break-all">
                          {WEBHOOK_URL}
                        </code>
                        <button
                          onClick={copyWebhook}
                          className="shrink-0 rounded p-1 text-ink-3 hover:text-ink"
                          title="Copiar"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {copied && <p className="text-2xs text-grass">Copiado!</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveEvolutionConfig} disabled={savingEvolution}>
                        {savingEvolution ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {savingEvolution ? "Salvando..." : "Salvar configuraÃ§Ã£o"}
                      </Button>
                      <Button variant="ghost" onClick={() => { setShowEvolutionConfig(false); setEvolutionNotice(null); }}>
                        Cancelar
                      </Button>
                    </div>

                    {evolutionNotice && (
                      <p className="rounded-xl border border-hairline bg-wash/40 px-4 py-3 text-[12px] text-ink-2">
                        {evolutionNotice}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Agenda AmigoClinic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs leading-relaxed text-ink-2">
                Puxa os 6 calendarios (.ics) por profissional â Dr. Rafael Erthal, Dra. Lorena,
                Leonardo Valadao, Soroterapia, Silvana e Fisioterapia â e espelha cada atendimento
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
              , entÃ£o qualquer automaÃ§Ã£o externa consegue tratar erro sem adivinhar.
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
