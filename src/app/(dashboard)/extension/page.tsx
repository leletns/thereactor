"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Puzzle,
  Zap,
  Bell,
  MessageSquare,
  Users,
  Activity,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Database,
  Brain,
  Star,
  Download,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LIVE_EVENTS = [
  { id: 1, type: "lead", message: "Amanda Torres abriu sua proposta no LinkedIn", time: "agora", color: "#00f5ff" },
  { id: 2, type: "followup", message: "Follow-up #4 enviado para Ricardo Mendes", time: "12s", color: "#00ff88" },
  { id: 3, type: "alert", message: "Felipe Santos visitou a pagina de precos 3x hoje", time: "45s", color: "#fbbf24" },
  { id: 4, type: "ai", message: "IA: Pedro Lima — score subiu de 71 para 88 (evento detectado)", time: "1m", color: "#8b5cf6" },
  { id: 5, type: "whatsapp", message: "Joao Silva respondeu no WhatsApp — roteado ao SDR Agent", time: "2m", color: "#00ff88" },
  { id: 6, type: "lead", message: "Novo lead detectado: Carla Mendes visitou 4 paginas", time: "3m", color: "#00f5ff" },
  { id: 7, type: "ai", message: "IA: Momento ideal para ligar para Ana Rodrigues (horario 10h-11h)", time: "4m", color: "#8b5cf6" },
];

const FEATURES = [
  {
    icon: Bell,
    color: "#00f5ff",
    title: "Alertas em Tempo Real",
    description: "Receba notificacao instantanea quando um lead abre seu email, visita seu site ou interage com sua proposta.",
  },
  {
    icon: Brain,
    color: "#8b5cf6",
    title: "IA no Contexto Certo",
    description: "O Reactor analisa o lead e entrega o insight perfeito diretamente no Puzzle enquanto voce navega no LinkedIn ou CRM.",
  },
  {
    icon: MessageSquare,
    color: "#00ff88",
    title: "WhatsApp Integrado",
    description: "Envie mensagens de follow-up diretamente pelo Puzzle sem abrir o WhatsApp. Evolution API no background.",
  },
  {
    icon: Activity,
    color: "#fbbf24",
    title: "Follow-up Automatico",
    description: "Extensao detecta quando e o momento certo (8 tentativas) e sugere a proxima acao com script pronto.",
  },
  {
    icon: Database,
    color: "#ff6b35",
    title: "Sincroniza com o Reactor",
    description: "Toda interacao vira dado no Reactor via WebSocket. Historico completo, score atualizado, CRM sempre vivo.",
  },
  {
    icon: Shield,
    color: "#00f5ff",
    title: "Dados Soberanos",
    description: "Seus dados ficam no seu Supabase. Zero terceiros. Criptografia end-to-end entre extensao e Reactor.",
  },
];

const WS_STEPS = [
  { label: "Puzzle detecta evento", detail: "Lead abre email / visita site / interage", color: "#00f5ff" },
  { label: "Extensao envia via WebSocket", detail: "ws://reactor.seudominio.com/events", color: "#8b5cf6" },
  { label: "Reactor processa com IA", detail: "SDR Agent analisa contexto e historia", color: "#fbbf24" },
  { label: "Notificacao instantanea", detail: "Popup com insight + proxima acao", color: "#00ff88" },
];

function LiveFeed() {
  const [events, setEvents] = useState(LIVE_EVENTS.slice(0, 4));
  const [idx, setIdx] = useState(4);

  useEffect(() => {
    const t = setInterval(() => {
      setEvents(prev => {
        const next = LIVE_EVENTS[idx % LIVE_EVENTS.length];
        return [{ ...next, id: Date.now(), time: "agora" }, ...prev.slice(0, 5)];
      });
      setIdx(i => i + 1);
    }, 3500);
    return () => clearInterval(t);
  }, [idx]);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {events.map(ev => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 p-3 reactor-card rounded-xl"
          >
            <div
              className="h-2 w-2 rounded-full mt-1.5 shrink-0 animate-pulse"
              style={{ backgroundColor: ev.color }}
            />
            <p className="text-xs text-white/70 flex-1 leading-relaxed">{ev.message}</p>
            <span className="text-[10px] text-white/30 shrink-0">{ev.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function PuzzleMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Browser frame */}
      <div className="rounded-2xl border border-reactor-border overflow-hidden shadow-[0_0_40px_rgba(0,245,255,0.1)]">
        {/* Browser bar */}
        <div className="bg-[#141428] px-3 py-2 flex items-center gap-2 border-b border-reactor-border">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-reactor-surface rounded-lg px-3 py-1 text-[10px] text-white/30">
            linkedin.com/in/amanda-torres
          </div>
          <div className="h-6 w-6 rounded-lg bg-reactor-cyan/20 border border-reactor-cyan/30 flex items-center justify-center">
            <span className="text-[8px] font-bold text-reactor-cyan">R</span>
          </div>
        </div>

        {/* Page content (simulated LinkedIn) */}
        <div className="bg-[#1a1a2e] p-3 relative" style={{ minHeight: 200 }}>
          <div className="space-y-2 opacity-30">
            <div className="h-3 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-2/3" />
            <div className="h-8 bg-white/5 rounded mt-3" />
            <div className="h-3 bg-white/10 rounded w-4/5" />
            <div className="h-3 bg-white/10 rounded w-3/5" />
          </div>

          {/* Reactor popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="absolute bottom-3 right-3 w-52 rounded-xl border border-reactor-cyan/30 shadow-reactor-cyan overflow-hidden"
            style={{ background: "#0f0f1a" }}
          >
            <div className="px-3 py-2 border-b border-reactor-border flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-reactor-green animate-pulse" />
              <span className="text-[10px] font-bold text-reactor-cyan">REACTOR CRM</span>
            </div>
            <div className="p-2.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-lg bg-reactor-purple/20 flex items-center justify-center text-[9px] font-bold text-reactor-purple">AT</div>
                <div>
                  <p className="text-[10px] font-semibold text-white">Amanda Torres</p>
                  <p className="text-[9px] text-white/40">Follow-up 3/8</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-reactor-cyan flex items-center gap-1">
                  <Brain className="h-2.5 w-2.5" />
                  Perfil: Quer resultado rapido
                </div>
                <div className="text-[9px] text-yellow-400 flex items-center gap-1">
                  <Star className="h-2.5 w-2.5" />
                  Nota clinica ativa
                </div>
              </div>
              <button className="w-full py-1 rounded-lg bg-reactor-cyan/20 border border-reactor-cyan/30 text-[9px] text-reactor-cyan font-semibold">
                Ver script de abordagem
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ExtensionPage() {
  const [wsConnected] = useState(true);

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-reactor-cyan/15 border border-reactor-cyan/30 flex items-center justify-center">
              <Puzzle className="h-5 w-5 text-reactor-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reactor CRM Extension</h2>
              <p className="text-sm text-white/40">Puzzle Extension + WebSocket em tempo real</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-reactor-green/10 border border-reactor-green/20">
            <Wifi className="h-3.5 w-3.5 text-reactor-green" />
            <span className="text-xs text-reactor-green font-medium">WebSocket {wsConnected ? "Ativo" : "Inativo"}</span>
          </div>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Instalar Extensao
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: mockup + live feed */}
        <div className="space-y-4">
          <PuzzleMockup />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-reactor-cyan" />
                Feed ao Vivo — WebSocket
                <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-reactor-green animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveFeed />
            </CardContent>
          </Card>
        </div>

        {/* Right: features + ws flow */}
        <div className="space-y-4">
          {/* WebSocket flow */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-reactor-cyan" />
                Como Funciona o WebSocket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {WS_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: `${step.color}20`, color: step.color }}
                      >
                        {i + 1}
                      </div>
                      {i < 3 && <div className="w-px h-4 mt-1" style={{ backgroundColor: `${step.color}30` }} />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-semibold text-white/80">{step.label}</p>
                      <p className="text-[10px] text-white/40 font-mono">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="reactor-card rounded-xl p-3"
                >
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${f.color}15` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: f.color }} />
                  </div>
                  <p className="text-xs font-semibold text-white/80 mb-1">{f.title}</p>
                  <p className="text-[10px] text-white/40 leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tempo medio de resposta a lead", value: "< 2min", icon: Clock, color: "#00f5ff" },
          { label: "Aumento na taxa de conversao", value: "+41%", icon: TrendingUp, color: "#00ff88" },
          { label: "Follow-ups automatizados/mes", value: "847", icon: CheckCircle2, color: "#8b5cf6" },
          { label: "Leads monitorados em tempo real", value: "Ilimitado", icon: Users, color: "#fbbf24" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="reactor-card rounded-xl p-4 text-center">
              <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: stat.color }} />
              <p className="text-lg font-bold text-white" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-white/40 leading-tight mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-6 border border-reactor-cyan/20 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(139,92,246,0.05) 100%)" }}
      >
        <div className="relative z-10">
          <Puzzle className="h-8 w-8 text-reactor-cyan mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">
            Reactor CRM — Disponivel em Breve na Puzzle Web Store
          </h3>
          <p className="text-sm text-white/50 mb-4 max-w-md mx-auto">
            A extensao que conecta o poder do Reactor diretamente no seu navegador.
            Nunca mais perca um follow-up ou um lead quente.
          </p>
          <div className="flex gap-3 justify-center">
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Quero ser notificado no lancamento
            </Button>
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Ver roadmap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
