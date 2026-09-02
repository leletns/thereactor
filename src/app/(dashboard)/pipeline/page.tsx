"use client";

import React, { useMemo, useState } from "react";
import {
  RefreshCw,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  User,
  Clock,
  TrendingUp,
  Wallet,
  Target,
  Users,
  MessageCircle,
  IdCard,
} from "lucide-react";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { StatTile } from "@/components/shell/StatTile";
import { DataEmpty, DataError, Skeleton } from "@/components/shell/DataState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency, getRelativeTime, cn } from "@/lib/utils";
import { ChatPanel } from "@/components/messaging/ChatPanel";

interface BoardLead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  score: number | null;
  value: number | null;
  source: string | null;
  notes: string | null;
  updated_at: string;
  last_activity_at: string | null;
  kommo_lead_id: number | null;
  kommo_status_name: string | null;
  responsible_name: string | null;
}

interface BoardColumn {
  key: string;
  kommoStatusId: number | null;
  name: string;
  color: string;
  terminal: boolean;
  count: number;
  value: number;
  leads: BoardLead[];
}

interface BoardPayload {
  mirrored: boolean;
  pipelines: { id: number; name: string; isMain: boolean }[];
  activePipelineId: number | null;
  activePipelineName: string;
  columns: BoardColumn[];
  stats: {
    total: number;
    open: number;
    openValue: number;
    won: number;
    wonValue: number;
    lost: number;
    conversionRate: number;
    avgScore: number;
    avgTicket: number;
  };
}

interface SyncStatus {
  ready: boolean;
  missing: string[];
  subdomain: string | null;
  lastSync: string | null;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
}

function scoreTone(score: number) {
  if (score >= 75) return { bg: "bg-grass-soft", fg: "text-grass" };
  if (score >= 50) return { bg: "bg-amber-soft", fg: "text-amber" };
  return { bg: "bg-sunken", fg: "text-ink-3" };
}

function daysSince(iso: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default function PipelinePage() {
  const [pipelineId, setPipelineId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<BoardLead | null>(null);
  const [drawerTab, setDrawerTab] = useState<"detalhes" | "mensagens">("detalhes");
  const [syncing, setSyncing] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const path = pipelineId ? `/api/board?pipeline=${pipelineId}` : "/api/board";
  const { data, loading, error, reload } = useApi<BoardPayload>(path);
  const syncStatus = useApi<SyncStatus>("/api/sync/kommo");

  const columns = useMemo(() => {
    if (!data) return [];
    const term = query.trim().toLowerCase();
    if (!term) return data.columns;
    return data.columns.map((column) => {
      const leads = column.leads.filter((lead) =>
        [lead.name, lead.company, lead.email, lead.phone, lead.responsible_name]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term))
      );
      return {
        ...column,
        leads,
        count: leads.length,
        value: leads.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
      };
    });
  }, [data, query]);

  const runSync = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/sync/kommo", { method: "POST" });
      const body = await response.json();
      if (body?.ok) {
        setNotice({
          tone: "ok",
          text: `${body.data.synced} lead(s), ${body.data.pipelines} pipeline(s) e ${body.data.statuses} etapa(s) espelhados do Kommo.`,
        });
        reload();
      } else {
        setNotice({ tone: "warn", text: body?.error ?? "Falha ao sincronizar." });
      }
    } catch (err) {
      setNotice({ tone: "warn", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setSyncing(false);
      syncStatus.reload();
    }
  };

  const moveLead = async (lead: BoardLead, target: BoardColumn) => {
    setMoving(lead.id);
    setNotice(null);
    try {
      const response = await fetch("/api/leads/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          toStatusId: target.kommoStatusId,
          toStatusKey: target.key,
        }),
      });
      const body = await response.json();
      if (body?.ok) {
        setNotice({
          tone: "ok",
          text: body.data.syncedToKommo
            ? `${lead.name} movido para "${target.name}" — replicado no Kommo.`
            : `${lead.name} movido para "${target.name}".`,
        });
        setSelected(null);
        reload();
      } else {
        setNotice({ tone: "warn", text: body?.error ?? "Não foi possível mover o lead." });
      }
    } catch (err) {
      setNotice({ tone: "warn", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setMoving(null);
    }
  };

  const stats = data?.stats;

  return (
    <>
      <AppTopbar
        title="Pipeline"
        subtitle={
          data?.mirrored
            ? `Espelho do Kommo · ${data.activePipelineName}`
            : "Funil interno — sincronize o Kommo para espelhar o CRM"
        }
        actions={
          <>
            <Button variant="ghost" size="icon-sm" onClick={reload} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                strokeWidth={1.5}
              />
            </Button>
            <Button size="sm" onClick={runSync} disabled={syncing}>
              <Zap className={`h-3.5 w-3.5 ${syncing ? "animate-pulse" : ""}`} strokeWidth={1.5} />
              {syncing ? "Sincronizando..." : "Sincronizar Kommo"}
            </Button>
          </>
        }
      />

      <div className="flex-1 space-y-6 p-9">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {data && data.pipelines.length > 1 && (
            <select
              value={pipelineId ?? data.activePipelineId ?? ""}
              onChange={(e) => setPipelineId(Number(e.target.value))}
              className="rx-field h-9 px-4 text-[13px] font-medium"
            >
              {data.pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar lead, telefone, responsável..."
              className="rx-field h-9 w-full pl-10 pr-4 text-[13px]"
            />
          </div>

        </div>

        {notice && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs ${
              notice.tone === "ok"
                ? "border-grass/20 bg-grass-soft text-grass"
                : "border-amber/20 bg-amber-soft text-amber"
            }`}
          >
            {notice.text}
          </div>
        )}

        {!notice && syncStatus.data && !syncStatus.data.ready && (
          <div className="rounded-xl border border-hairline bg-surface px-4 py-3 text-xs text-ink-2">
            Espelho do Kommo inativo — falta configurar{" "}
            <span className="font-semibold text-ink">
              {syncStatus.data.missing.join(", ")}
            </span>
            . O quadro abaixo usa o funil interno enquanto isso.
          </div>
        )}

        {error && <DataError message={error} onRetry={reload} />}

        {!error && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                label="Leads no funil"
                value={stats?.total ?? 0}
                hint={`${stats?.open ?? 0} em aberto`}
                icon={Users}
                tone="violet"
                loading={loading}
              />
              <StatTile
                label="Valor em aberto"
                value={formatCurrency(stats?.openValue ?? 0)}
                hint={`ticket médio ${formatCurrency(stats?.avgTicket ?? 0)}`}
                icon={Wallet}
                tone="grass"
                loading={loading}
              />
              <StatTile
                label="Conversão"
                value={`${stats?.conversionRate ?? 0}%`}
                hint={`${stats?.won ?? 0} ganhos · ${stats?.lost ?? 0} perdidos`}
                icon={TrendingUp}
                tone="amber"
                loading={loading}
              />
              <StatTile
                label="Score médio"
                value={stats?.avgScore ?? 0}
                hint="0 a 100"
                icon={Target}
                tone="neutral"
                loading={loading}
              />
            </div>

            {/* Board */}
            {loading && !data ? (
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 flex-1" />
                ))}
              </div>
            ) : columns.length === 0 ? (
              <div className="rx-card">
                <DataEmpty message="Nenhuma etapa para exibir." />
              </div>
            ) : (
              <div className="rx-scroll flex gap-4 overflow-x-auto pb-4">
                {columns.map((column, index) => (
                  <section key={column.key} className="w-[286px] shrink-0">
                    <header className="mb-3 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-pill"
                        style={{ background: column.color }}
                      />
                      <h2 className="text-[13px] font-semibold text-ink">{column.name}</h2>
                      <span className="ml-auto rounded-pill border border-hairline-strong px-2 py-0.5 text-2xs font-medium text-ink-2">
                        {column.count}
                      </span>
                    </header>
                    <p className="mb-3 text-2xs text-ink-3">{formatCurrency(column.value)}</p>

                    <div className="space-y-2.5">
                      {column.leads.length === 0 && (
                        <div className="rounded-xl border border-dashed border-hairline-strong py-10 text-center text-2xs text-ink-3">
                          Vazio
                        </div>
                      )}

                      {column.leads.map((lead) => {
                        const score = Number(lead.score ?? 0);
                        const tone = scoreTone(score);
                        const idle = daysSince(lead.last_activity_at ?? lead.updated_at);

                        return (
                          <article
                            key={lead.id}
                            onClick={() => {
                              setSelected(lead);
                              setDrawerTab("detalhes");
                            }}
                            className="group cursor-pointer rounded-xl border border-hairline bg-surface p-4 transition-colors hover:border-hairline-strong"
                          >
                            <div className="mb-2.5 flex items-start gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-hairline-strong text-2xs font-medium text-ink-2">
                                {initials(lead.name)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-ink">
                                  {lead.name}
                                </p>
                                <p className="truncate text-2xs text-ink-3">
                                  {lead.company ?? lead.source ?? "—"}
                                </p>
                              </div>
                              <span
                                className={`rounded-pill px-2 py-0.5 text-2xs font-medium ${tone.bg} ${tone.fg}`}
                              >
                                {score}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="rx-numeric text-[13px] font-semibold text-ink">
                                {formatCurrency(Number(lead.value ?? 0))}
                              </span>
                              {idle !== null && (
                                <span
                                  className={`flex items-center gap-1 text-2xs ${
                                    idle >= 3 ? "text-amber" : "text-ink-3"
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {idle === 0 ? "hoje" : `${idle}d`}
                                </span>
                              )}
                            </div>

                            {lead.responsible_name && (
                              <p className="mt-2 truncate text-2xs text-ink-3">
                                {lead.responsible_name}
                              </p>
                            )}

                            {/* Quick move between adjacent columns + atalho pra mensagens */}
                            <div className="mt-2.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(lead);
                                  setDrawerTab("mensagens");
                                }}
                                className="flex h-6 flex-1 items-center justify-center rounded-md border border-hairline text-ink-3 transition-colors hover:border-violet hover:text-violet"
                                title="Ver mensagens"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={index === 0 || moving === lead.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLead(lead, columns[index - 1]);
                                }}
                                className="flex h-6 flex-1 items-center justify-center rounded-md border border-hairline text-ink-3 transition-colors hover:border-violet hover:text-violet disabled:opacity-30 disabled:hover:border-hairline disabled:hover:text-ink-3"
                                title="Etapa anterior"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={index === columns.length - 1 || moving === lead.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLead(lead, columns[index + 1]);
                                }}
                                className="flex h-6 flex-1 items-center justify-center rounded-md border border-hairline text-ink-3 transition-colors hover:border-violet hover:text-violet disabled:opacity-30 disabled:hover:border-hairline disabled:hover:text-ink-3"
                                title="Próxima etapa"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lead drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <aside
            className={cn(
              "rx-float fixed inset-y-0 right-0 z-50 flex flex-col border-l border-hairline bg-surface transition-[width]",
              drawerTab === "mensagens" ? "w-[420px]" : "w-[390px]"
            )}
          >
            <div className="shrink-0 space-y-4 p-6 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-wash text-[13px] font-medium text-violet-deep">
                    {initials(selected.name)}
                  </span>
                  <div>
                    <p className="text-[19px] font-thin tracking-[-0.02em] text-ink">
                      {selected.name}
                    </p>
                    <p className="text-xs text-ink-3">{selected.company ?? "—"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-ink-3 transition-colors hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-1 rounded-pill bg-sunken p-1">
                <button
                  onClick={() => setDrawerTab("detalhes")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-pill py-1.5 text-[12px] font-medium transition-colors",
                    drawerTab === "detalhes" ? "bg-surface text-ink" : "text-ink-3"
                  )}
                >
                  <IdCard className="h-3.5 w-3.5" />
                  Detalhes
                </button>
                <button
                  onClick={() => setDrawerTab("mensagens")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-pill py-1.5 text-[12px] font-medium transition-colors",
                    drawerTab === "mensagens" ? "bg-surface text-ink" : "text-ink-3"
                  )}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Mensagens
                </button>
              </div>
            </div>

            {drawerTab === "detalhes" ? (
              <div className="rx-scroll flex-1 space-y-5 overflow-y-auto p-6">
                <div className="flex flex-wrap gap-1.5">
                  {selected.kommo_lead_id ? (
                    <Badge>Kommo #{selected.kommo_lead_id}</Badge>
                  ) : (
                    <Badge variant="neutral">Lead local</Badge>
                  )}
                  {selected.kommo_status_name && (
                    <Badge variant="outline">{selected.kommo_status_name}</Badge>
                  )}
                  {selected.source && <Badge variant="neutral">{selected.source}</Badge>}
                </div>

                <div className="rx-card divide-y divide-hairline">
                  <Row icon={Wallet} label="Valor" value={formatCurrency(Number(selected.value ?? 0))} />
                  <Row icon={Target} label="Score" value={String(selected.score ?? 0)} />
                  <Row icon={User} label="Responsável" value={selected.responsible_name ?? "—"} />
                  <Row icon={Phone} label="Telefone" value={selected.phone ?? "—"} />
                  <Row icon={Mail} label="E-mail" value={selected.email ?? "—"} />
                  <Row
                    icon={Clock}
                    label="Última atividade"
                    value={getRelativeTime(selected.last_activity_at ?? selected.updated_at)}
                  />
                </div>

                {selected.notes && (
                  <div className="rx-card p-5">
                    <p className="rx-eyebrow mb-2">Observações</p>
                    <p className="text-xs leading-relaxed text-ink-2">{selected.notes}</p>
                  </div>
                )}

                <div>
                  <p className="rx-eyebrow mb-2.5">Mover para</p>
                  <div className="space-y-1.5">
                    {columns.map((column) => {
                      const current =
                        (column.kommoStatusId !== null &&
                          column.name === selected.kommo_status_name) ||
                        (column.kommoStatusId === null && column.key === selected.status);
                      return (
                        <button
                          key={column.key}
                          disabled={current || moving === selected.id}
                          onClick={() => moveLead(selected, column)}
                          className="flex w-full items-center gap-2.5 rounded-pill border border-hairline-strong px-4 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:border-violet hover:text-violet disabled:cursor-default disabled:border-hairline disabled:bg-sunken disabled:text-ink-3"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-pill"
                            style={{ background: column.color }}
                          />
                          {column.name}
                          {current && <span className="ml-auto text-2xs text-ink-3">atual</span>}
                        </button>
                      );
                    })}
                  </div>
                  {selected.kommo_lead_id && (
                    <p className="mt-2.5 text-2xs text-ink-3">
                      A mudança é gravada no Kommo antes de aparecer aqui.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 p-3">
                <ChatPanel
                  leadId={selected.id}
                  leadName={selected.name}
                  kommoLeadId={selected.kommo_lead_id}
                  className="h-full"
                />
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
      <span className="text-xs text-ink-3">{label}</span>
      <span className="ml-auto truncate text-xs font-medium text-ink">{value}</span>
    </div>
  );
}
