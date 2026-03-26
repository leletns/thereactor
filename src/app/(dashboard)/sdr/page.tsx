"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Bot,
  Plus,
  Mail,
  Phone,
  Clock,
  ChevronRight,
} from "lucide-react";
import { MetricCard } from "@/components/reactor/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface Lead {
  id: number;
  name: string;
  company: string;
  value: number;
  score: number;
  source: string;
  lastContact: string;
  stage: "prospeccao" | "qualificacao" | "proposta" | "fechamento";
  avatar: string;
}

const MOCK_LEADS: Lead[] = [
  { id: 1, name: "Ricardo Mendes", company: "TechVision Ltda", value: 84000, score: 92, source: "LinkedIn", lastContact: "hoje", stage: "fechamento", avatar: "RM" },
  { id: 2, name: "Carla Oliveira", company: "InnovateBR", value: 36000, score: 78, source: "Indicação", lastContact: "ontem", stage: "fechamento", avatar: "CO" },
  { id: 3, name: "Felipe Santos", company: "DataCore Sistemas", value: 62000, score: 85, source: "Site", lastContact: "2d", stage: "proposta", avatar: "FS" },
  { id: 4, name: "Mariana Costa", company: "CloudFirst", value: 48000, score: 71, source: "LinkedIn", lastContact: "3d", stage: "proposta", avatar: "MC" },
  { id: 5, name: "João Silva", company: "Grupo Alpha", value: 120000, score: 94, source: "Evento", lastContact: "hoje", stage: "proposta", avatar: "JS" },
  { id: 6, name: "Ana Rodrigues", company: "StartupX", value: 24000, score: 63, source: "Cold Email", lastContact: "4d", stage: "qualificacao", avatar: "AR" },
  { id: 7, name: "Pedro Lima", company: "MegaCorp Brasil", value: 95000, score: 88, source: "Indicação", lastContact: "2d", stage: "qualificacao", avatar: "PL" },
  { id: 8, name: "Beatriz Rocha", company: "NexusTech", value: 18000, score: 55, source: "Cold Call", lastContact: "1d", stage: "prospeccao", avatar: "BR" },
  { id: 9, name: "Lucas Fernandes", company: "DigitalPro", value: 32000, score: 67, source: "Site", lastContact: "5d", stage: "prospeccao", avatar: "LF" },
  { id: 10, name: "Juliana Gomes", company: "InovaData", value: 44000, score: 72, source: "Webinar", lastContact: "3d", stage: "prospeccao", avatar: "JG" },
];

const KANBAN_COLUMNS = [
  { id: "prospeccao", label: "Prospecção", color: "#8b5cf6" },
  { id: "qualificacao", label: "Qualificação", color: "#00f5ff" },
  { id: "proposta", label: "Proposta", color: "#fbbf24" },
  { id: "fechamento", label: "Fechamento", color: "#00ff88" },
] as const;

const RECENT_ACTIVITY = [
  { id: 1, action: "Lead qualificado", detail: "DataCore Sistemas — Score 85", time: "5m", icon: Target },
  { id: 2, action: "Follow-up enviado", detail: "Email para Felipe Santos", time: "23m", icon: Mail },
  { id: 3, action: "Ligação realizada", detail: "Grupo Alpha — 18min", time: "1h", icon: Phone },
  { id: 4, action: "Proposta enviada", detail: "TechVision — R$ 84.000", time: "2h", icon: ChevronRight },
  { id: 5, action: "Novo lead criado", detail: "InovaData via Webinar", time: "3h", icon: Plus },
];

const MOCK_CADENCIA = `📧 CADÊNCIA IA GERADA — CloudFirst

SEQUÊNCIA DE 7 PASSOS (14 dias):

Dia 1 - Email de Prospecção
Assunto: "Como a [Nome da Empresa] está reduzindo custos operacionais em 34%"
→ Apresentação personalizada com case similar ao segmento

Dia 3 - LinkedIn Connection
→ Mensagem curta: "Vi que vocês estão expandindo para [cidade/área]. Tenho algo relevante pra compartilhar."

Dia 5 - Email de Valor
Assunto: "3 métricas que empresas de tecnologia ignoram (e pagam caro)"
→ Conteúdo educativo sem pitch

Dia 7 - Cold Call
→ Script: "Olá [Nome], sou [Seu Nome] da lhex systems. Enviei um email na semana passada sobre [contexto]. Tenho 2 minutos?"

Dia 9 - Email de Caso de Uso
Assunto: "Como a InnovateBR automatizou 80% do processo de SDR"
→ Case study com números específicos

Dia 12 - Último Contato Email
Assunto: "Deve ser uma das duas coisas..."
→ Email de break-up com call-to-action claro

Dia 14 - LinkedIn Mensagem Final
→ "Fechando a cadência por aqui, mas fico disponível quando o timing for melhor."

Taxa de resposta estimada: 24-31%`;

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#00ff88" : score >= 60 ? "#fbbf24" : "#ff4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-reactor-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function SDRPage() {
  const [showCadencia, setShowCadencia] = useState(false);

  const totalPipeline = MOCK_LEADS.reduce((s, l) => s + l.value, 0);
  const conversion = ((2 / 10) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Pipeline de Vendas</h2>
          <p className="text-sm text-white/40">SDR Agent — Prospecção Inteligente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCadencia(true)}>
            <Bot className="h-4 w-4 mr-2" />
            Gerar Cadência com IA
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total de Leads" value={MOCK_LEADS.length} change={8.3} changeLabel="este mês" icon={Users} color="cyan" />
        <MetricCard title="Em Negociação" value={7} icon={Target} color="purple" description="ativos" />
        <MetricCard title="Taxa de Conversão" value={parseFloat(conversion)} suffix="%" change={2.1} icon={TrendingUp} color="green" />
        <MetricCard title="Receita Pipeline" value={totalPipeline} prefix="R$" change={14.7} icon={DollarSign} color="orange" />
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colLeads = MOCK_LEADS.filter((l) => l.stage === col.id);
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
                    onClick={() => {}}
                    className="reactor-card rounded-xl p-3 cursor-pointer transition-all duration-200 hover:border-white/15"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: `${col.color}20` }}
                      >
                        {lead.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white/80 truncate">{lead.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{lead.company}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <ScoreBar score={lead.score} />
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
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-reactor-border last:border-0">
                  <div className="h-7 w-7 rounded-lg bg-reactor-purple/10 border border-reactor-purple/20 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-reactor-purple" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-white/70 font-medium">{item.action}</span>
                    <span className="text-xs text-white/40 mx-2">·</span>
                    <span className="text-xs text-white/40">{item.detail}</span>
                  </div>
                  <span className="text-[10px] text-white/30">{item.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cadência Modal */}
      <Dialog open={showCadencia} onOpenChange={setShowCadencia}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-reactor-purple" />
              Cadência Gerada por IA — SDR Agent
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed">
              {MOCK_CADENCIA}
            </pre>
          </ScrollArea>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowCadencia(false)}>
              Fechar
            </Button>
            <Button size="sm">
              Aplicar Cadência
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
