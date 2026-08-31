"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  DollarSign,
  Bot,
  Plus,
  Phone,
  Clock,
  ChevronRight,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Activity,
  X,
  Star,
  RefreshCw,
} from "lucide-react";
import { MetricCard } from "@/components/reactor/MetricCard";
import { DataEmpty, DataError } from "@/components/reactor/DataState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency, getRelativeTime } from "@/lib/utils";

type ConsumerProfile = "imediatista" | "pesquisador" | "preco" | "qualidade" | "indefinido";
type Stage = "prospeccao" | "qualificacao" | "proposta" | "fechamento";

interface LeadRow {
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
  kommo_lead_id: number | null;
  metadata: Record<string, unknown> | null;
}

interface LeadsPayload {
  leads: LeadRow[];
  stats: {
    total: number;
    open: number;
    won: number;
    pipelineValue: number;
    wonValue: number;
    avgScore: number;
    conversionRate: number;
    byStage: { stage: string; count: number; value: number }[];
  };
}

interface SyncStatus {
  ready: boolean;
  missing: string[];
  subdomain: string | null;
}

/** A DB row plus the presentation fields the board needs. */
interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  score: number;
  source: string;
  lastContact: string;
  stage: Stage;
  avatar: string;
  followUpAttempts: number;
  maxAttempts: number;
  profile: ConsumerProfile;
  needsIntervention: boolean;
  interventionNote?: string;
  nextAction: string;
  daysSinceContact: number;
  fromKommo: boolean;
}

const PROFILE_CONFIG: Record<ConsumerProfile, { label: string; color: string; emoji: string; tip: string }> = {
  imediatista: {
    label: "Quer resultado rapido",
    color: "#ff6b35",
    emoji: "⚡",
    tip: "Foque em ROI imediato e casos de sucesso com resultados em 30 dias. Evite processos longos.",
  },
  pesquisador: {
    label: "Pesquisa muito",
    color: "#00f5ff",
    emoji: "🔍",
    tip: "Envie materiais ricos, comparativos e dados. Ele precisa de informacao para decidir.",
  },
  preco: {
    label: "Orientado a preco",
    color: "#fbbf24",
    emoji: "💰",
    tip: "Apresente o ROI e custo de NAO contratar. Mostre que e investimento, nao custo.",
  },
  qualidade: {
    label: "Busca qualidade",
    color: "#00ff88",
    emoji: "🏆",
    tip: "Destaque diferenciais tecnicos, certificacoes e casos premium. Nao briga por preco.",
  },
  indefinido: {
    label: "Perfil a definir",
    color: "#8b5cf6",
    emoji: "❓",
    tip: "Faca perguntas de qualificacao: prazo, orcamento, criterio de decisao.",
  },
};

const KANBAN_COLUMNS = [
  { id: "prospeccao" as Stage, label: "Prospeccao", color: "#8b5cf6" },
  { id: "qualificacao" as Stage, label: "Qualificacao", color: "#00f5ff" },
  { id: "proposta" as Stage, label: "Proposta", color: "#fbbf24" },
  { id: "fechamento" as Stage, label: "Fechamento", color: "#00ff88" },
] as const;

const PROFILES: ConsumerProfile[] = [
  "imediatista",
  "pesquisador",
  "preco",
  "qualidade",
  "indefinido",
];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Maps a reactor_leads row onto the board. Anything the CRM does not provide
 * lives in metadata (follow-up count, consumer profile, clinical note) — it is
 * never invented here.
 */
function toLead(row: LeadRow): Lead {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const updatedAt = new Date(row.updated_at);
  const daysSinceContact = Math.max(
    0,
    Math.floor((Date.now() - updatedAt.getTime()) / 86_400_000)
  );
  const rawProfile = String(meta.profile ?? "");
  const profile = PROFILES.includes(rawProfile as ConsumerProfile)
    ? (rawProfile as ConsumerProfile)
    : "indefinido";
  const interventionNote =
    typeof meta.intervention_note === "string" ? meta.intervention_note : undefined;

  return {
    id: row.id,
    name: row.name,
    company: row.company ?? row.source ?? "—",
    value: Number(row.value ?? 0),
    score: Number(row.score ?? 0),
    source: row.source ?? "—",
    lastContact: getRelativeTime(updatedAt),
    stage: (KANBAN_COLUMNS.some((c) => c.id === row.status)
      ? row.status
      : "prospeccao") as Stage,
    avatar: initials(row.name) || "??",
    followUpAttempts: Number(meta.follow_up_attempts ?? 0),
    maxAttempts: Number(meta.max_follow_up_attempts ?? 8),
    profile,
    needsIntervention: Boolean(interventionNote),
    interventionNote,
    nextAction:
      typeof meta.next_action === "string"
        ? meta.next_action
        : row.notes ?? "Sem proxima acao registrada.",
    daysSinceContact,
    fromKommo: row.kommo_lead_id !== null,
  };
}

function FollowUpTracker({ attempts, max }: { attempts: number; max: number }) {
  const pct = max > 0 ? (attempts / max) * 100 : 0;
  const color = pct >= 87 ? "#ff4444" : pct >= 62 ? "#fbbf24" : "#00f5ff";
  const urgency = pct >= 87 ? "URGENTE" : pct >= 62 ? "ATIVO" : "INICIO";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/40 uppercase tracking-widest">Follow-ups</span>
        <span className="text-[9px] font-bold" style={{ color }}>
          {attempts}/{max} {urgency}
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < attempts ? color : "rgba(255,255,255,0.08)",
              boxShadow: i < attempts ? `0 0 4px ${color}80` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileBadge({ profile }: { profile: ConsumerProfile }) {
  const cfg = PROFILE_CONFIG[profile];
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#00ff88" : score >= 60 ? "#fbbf24" : "#ff4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-reactor-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const cfg = PROFILE_CONFIG[lead.profile];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-0 h-full w-80 z-50 border-l border-reactor-border shadow-2xl overflow-y-auto"
      style={{ background: "#0f0f1a" }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Perfil do Lead</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/80">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="reactor-card rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-reactor-purple/20 flex items-center justify-center text-xs font-bold text-reactor-purple">
              {lead.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{lead.name}</p>
              <p className="text-xs text-white/40">{lead.company}</p>
            </div>
          </div>
          <ProfileBadge profile={lead.profile} />
          {lead.fromKommo && (
            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-reactor-cyan/10 text-reactor-cyan border border-reactor-cyan/20">
              sincronizado do Kommo
            </span>
          )}
        </div>

        {lead.needsIntervention && (
          <div className="rounded-xl p-3 border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
              <span className="text-xs font-semibold text-yellow-400">Nota Clinica</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">{lead.interventionNote}</p>
          </div>
        )}

        <div className="reactor-card rounded-xl p-3 space-y-3">
          <FollowUpTracker attempts={lead.followUpAttempts} max={lead.maxAttempts} />
          <div className="h-px bg-reactor-border" />
          <ScoreBar score={lead.score} />
        </div>

        <div className="reactor-card rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-3.5 w-3.5 text-reactor-cyan" />
            <span className="text-xs font-semibold text-reactor-cyan">Insight do Perfil</span>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">{cfg.tip}</p>
        </div>

        <div className="reactor-card rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-reactor-green" />
            <span className="text-xs font-semibold text-reactor-green">Proxima Acao</span>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">{lead.nextAction}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Acoes</p>
          <Button size="sm" className="w-full">
            <MessageSquare className="h-3.5 w-3.5 mr-2" />
            Enviar WhatsApp
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            <Phone className="h-3.5 w-3.5 mr-2" />
            Registrar Ligacao
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
            Marcar Follow-up Feito
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SDRPage() {
  const [showCadencia, setShowCadencia] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const { data, loading, error, reload } = useApi<LeadsPayload>("/api/leads");
  const syncStatus = useApi<SyncStatus>("/api/sync/kommo");

  const leads = useMemo(() => (data?.leads ?? []).map(toLead), [data]);
  const stats = data?.stats;
  const hotLeads = leads.filter((l) => l.followUpAttempts >= 5).length;
  const needsAction = leads.filter((l) => l.daysSinceContact >= 3).length;
  const flagged = leads.filter((l) => l.needsIntervention);

  const runKommoSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/sync/kommo", { method: "POST" });
      const body = await response.json();
      if (body?.ok) {
        setSyncMessage(
          `${body.data.synced} lead(s) sincronizado(s) do Kommo de ${body.data.leads} encontrado(s).`
        );
        reload();
      } else {
        setSyncMessage(body?.error ?? "Falha ao sincronizar com o Kommo.");
      }
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
      syncStatus.reload();
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Pipeline de Vendas</h2>
          <p className="text-sm text-white/40">
            SDR Agent — {hotLeads} leads quentes · {needsAction} precisam de atencao
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={runKommoSync} disabled={syncing}>
            <Zap className={`h-4 w-4 mr-2 ${syncing ? "animate-pulse" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Kommo"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCadencia(true)}>
            <Bot className="h-4 w-4 mr-2" />
            Gerar Cadencia com IA
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Sync feedback — says exactly what is missing instead of failing silently */}
      {syncMessage && (
        <div className="rounded-xl p-3 border border-reactor-cyan/25 bg-reactor-cyan/5 text-xs text-white/70">
          {syncMessage}
        </div>
      )}
      {!syncMessage && syncStatus.data && !syncStatus.data.ready && (
        <div className="rounded-xl p-3 border border-white/10 bg-white/3 text-xs text-white/45">
          Sincronizacao com o Kommo indisponivel — falta configurar:{" "}
          <span className="text-white/70">{syncStatus.data.missing.join(", ")}</span>
        </div>
      )}

      {error && <DataError message={error} onRetry={reload} />}

      {!error && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="Total de Leads"
              value={stats?.total ?? 0}
              icon={Users}
              color="cyan"
              description={`${stats?.open ?? 0} em aberto`}
              loading={loading}
            />
            <MetricCard
              title="Score Medio"
              value={stats?.avgScore ?? 0}
              icon={Activity}
              color="orange"
              description="0 a 100"
              loading={loading}
            />
            <MetricCard
              title="Taxa de Conversao"
              value={stats?.conversionRate ?? 0}
              suffix="%"
              icon={TrendingUp}
              color="green"
              description={`${stats?.won ?? 0} ganhos`}
              loading={loading}
            />
            <MetricCard
              title="Receita Pipeline"
              value={stats?.pipelineValue ?? 0}
              prefix="R$"
              icon={DollarSign}
              color="purple"
              description="negocios em aberto"
              loading={loading}
            />
          </div>

          {/* Alert bar */}
          {flagged.length > 0 && (
            <div className="rounded-xl p-3 border border-yellow-500/30 bg-yellow-500/5 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-yellow-400">Atencao: leads com notas clinicas</span>
                <span className="text-xs text-white/40 ml-2">
                  {flagged.map((l) => l.name).join(", ")} — clique para ver a nota
                </span>
              </div>
              <Star className="h-4 w-4 text-yellow-500/50" />
            </div>
          )}

          {leads.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <DataEmpty
                  message={
                    loading
                      ? "Carregando leads do Supabase..."
                      : "Nenhum lead em reactor_leads. Use \"Sincronizar Kommo\" para importar o pipeline do CRM."
                  }
                />
              </CardContent>
            </Card>
          ) : (
            /* Kanban */
            <div className="grid grid-cols-4 gap-3">
              {KANBAN_COLUMNS.map((col) => {
                const colLeads = leads.filter((l) => l.stage === col.id);
                return (
                  <div key={col.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-xs font-semibold text-white/60">{col.label}</span>
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${col.color}15`, color: col.color }}
                      >
                        {colLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {colLeads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          whileHover={{ y: -2 }}
                          onClick={() => setSelectedLead(lead)}
                          className="reactor-card rounded-xl p-3 cursor-pointer group"
                        >
                          {lead.needsIntervention && (
                            <div className="flex items-center gap-1 mb-2 px-1.5 py-0.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 w-fit">
                              <AlertTriangle className="h-2.5 w-2.5 text-yellow-500" />
                              <span className="text-[9px] text-yellow-400 font-medium">Nota clinica</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: `${col.color}20` }}
                            >
                              {lead.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white/80 truncate">{lead.name}</p>
                              <p className="text-[10px] text-white/40 truncate">{lead.company}</p>
                            </div>
                          </div>

                          <div className="mb-2">
                            <ProfileBadge profile={lead.profile} />
                          </div>

                          <div className="mb-2">
                            <ScoreBar score={lead.score} />
                          </div>

                          <div className="mb-2">
                            <FollowUpTracker attempts={lead.followUpAttempts} max={lead.maxAttempts} />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-white/60">
                              {formatCurrency(lead.value)}
                            </span>
                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {lead.lastContact}
                            </span>
                          </div>

                          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] text-reactor-cyan/70 line-clamp-2">{lead.nextAction}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cadencia Modal */}
      <Dialog open={showCadencia} onOpenChange={setShowCadencia}>
        <DialogContent className="max-w-2xl bg-reactor-surface border-reactor-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-reactor-purple" />
              Cadencia Inteligente — SDR Agent (8 Tentativas)
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-2">
              {[
                { day: 1, type: "WhatsApp", icon: MessageSquare, color: "#00ff88", action: "Mensagem de abertura personalizada com contexto do lead. 2-3 linhas. Zero pitch." },
                { day: 2, type: "Email", icon: ChevronRight, color: "#00f5ff", action: "Email com case study do mesmo segmento. Resultado especifico em 30 dias." },
                { day: 4, type: "Ligacao", icon: Phone, color: "#8b5cf6", action: "Cold call de 2 min. Referenciar email anterior. Pedir 15 minutos." },
                { day: 6, type: "WhatsApp", icon: MessageSquare, color: "#00ff88", action: "Mensagem de valor: insight do mercado relevante para o lead. Sem CTA agressivo." },
                { day: 8, type: "Email", icon: ChevronRight, color: "#00f5ff", action: "Video personalizado de 60s com demo rapida. Diferencial competitivo claro." },
                { day: 11, type: "Ligacao", icon: Phone, color: "#8b5cf6", action: "Ligacao de qualificacao BANT completa. Entender: orcamento, autoridade, necessidade, prazo." },
                { day: 14, type: "WhatsApp", icon: MessageSquare, color: "#00ff88", action: "Proposta simplificada com 3 opcoes. Ancorar no plano medio. Urgencia real." },
                { day: 17, type: "Email Final", icon: AlertTriangle, color: "#fbbf24", action: "Break-up email. 'Vou encerrar aqui mas fico disponivel.' Taxa de resposta: 34%." },
              ].map((step, i) => (
                <div key={i} className="flex gap-3 p-3 reactor-card rounded-xl">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: `${step.color}20`, color: step.color }}
                    >
                      {i + 1}
                    </div>
                    {i < 7 && <div className="w-px flex-1 bg-reactor-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: step.color }}>
                        Dia {step.day} — {step.type}
                      </span>
                      {i >= 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          tentativa {i + 1}/8
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 justify-between items-center">
            <p className="text-[11px] text-white/30">Cadencia padrao de 8 tentativas ao longo de 17 dias.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCadencia(false)}>Fechar</Button>
              <Button size="sm">Aplicar Cadencia</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedLead(null)}
            />
            <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
