"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, Megaphone, Settings2,
  MessageSquare, Brain, Zap, ArrowRight,
  Activity, Network, ChevronRight,
  Phone, Mail, X, Shield, Globe, Cpu,
} from "lucide-react";
import { ReactorCore3D } from "@/components/reactor/ReactorCore3D";

/* ─────────────────────────────────────────────────────
   GlowCard — radial gradient segue o cursor por dentro
───────────────────────────────────────────────────── */
function GlowCard({
  children,
  className = "",
  glowColor = "rgba(0,168,132,0.10)",
  glowSize  = 300,
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current!.getBoundingClientRect();
    setGlow({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 });
  }, []);
  const onLeave = useCallback(() => setGlow(g => ({ ...g, opacity: 0 })), []);

  return (
    <motion.div
      ref={cardRef}
      className={`bento-card ${className}`}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {/* Cursor glow */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          pointerEvents: "none", zIndex: 0,
          opacity: glow.opacity,
          background: `radial-gradient(${glowSize}px circle at ${glow.x}px ${glow.y}px, ${glowColor}, transparent 70%)`,
          transition: "opacity 0.3s ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: TrendingUp,
    title: "Finance Agent",
    desc: "Análise de DRE, fluxo de caixa, projeções e insights em tempo real. Substitui um analista financeiro sênior.",
    color: "#059669",
    glow: "rgba(5,150,105,0.10)",
    tag: "Financeiro",
  },
  {
    icon: Users,
    title: "SDR Agent",
    desc: "Prospecção inteligente, score de leads 0–100, cadências automáticas e gestão completa de pipeline.",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.10)",
    tag: "Vendas",
  },
  {
    icon: Megaphone,
    title: "Marketing Agent",
    desc: "Copy de alta conversão, análise de campanhas, calendário editorial e growth baseado em dados.",
    color: "#EA580C",
    glow: "rgba(234,88,12,0.10)",
    tag: "Marketing",
  },
  {
    icon: Settings2,
    title: "Ops Agent",
    desc: "Automação de processos, gestão de tarefas, documentação técnica e otimização operacional contínua.",
    color: "#D97706",
    glow: "rgba(217,119,6,0.10)",
    tag: "Operações",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    desc: "Atendimento 24/7 via WhatsApp com Evolution API. Qualifica leads, responde e escala para humanos.",
    color: "#00A884",
    glow: "rgba(0,168,132,0.10)",
    tag: "Canais",
  },
  {
    icon: Network,
    title: "A2A Protocol",
    desc: "Protocolo proprietário de comunicação multi-agente. Colaboração em tempo real para resolver tarefas complexas.",
    color: "#0891B2",
    glow: "rgba(8,145,178,0.10)",
    tag: "Protocolo",
  },
];

const STATS = [
  { value: "6×",   label: "Agentes Especializados", color: "#00A884" },
  { value: "A2A",  label: "Protocolo Nativo",        color: "#6220A0" },
  { value: "24/7", label: "Disponibilidade",          color: "#0891B2" },
  { value: "MCP",  label: "Tools Integradas",         color: "#D97706" },
];

/* ─────────────────────────────────────────────────────
   Stagger container
───────────────────────────────────────────────────── */
const stagger = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
const springItem = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

/* ─────────────────────────────────────────────────────
   Floating Support Button
───────────────────────────────────────────────────── */
function FloatingSupport() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="glass rounded-2xl p-5 w-72"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.6)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ color: "#111827" }}>
                Suporte L.H.E.X
              </p>
              <button
                onClick={() => setOpen(false)}
                className="h-6 w-6 flex items-center justify-center rounded-full transition-all"
                style={{ background: "rgba(0,0,0,0.06)" }}
              >
                <X className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />
              </button>
            </div>
            <div className="space-y-3">
              <a
                href="mailto:contato@lhexsystems.com"
                className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                style={{ background: "rgba(0,168,132,0.06)", border: "1px solid rgba(0,168,132,0.12)" }}
              >
                <Mail className="h-4 w-4 shrink-0" style={{ color: "#00A884" }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: "#111827" }}>E-mail</p>
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>contato@lhexsystems.com</p>
                </div>
              </a>
              <a
                href="tel:+5521987587047"
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: "rgba(98,32,160,0.05)", border: "1px solid rgba(98,32,160,0.10)" }}
              >
                <Phone className="h-4 w-4 shrink-0" style={{ color: "#6220A0" }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: "#111827" }}>WhatsApp</p>
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>+55 21 98758-7047</p>
                </div>
              </a>
              <Link
                href="/suporte"
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
                onClick={() => setOpen(false)}
              >
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#9CA3AF" }} />
                <p className="text-xs font-medium" style={{ color: "#374151" }}>Ver FAQ completo</p>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="h-14 w-14 rounded-full flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, #00A884, #007A62)",
          boxShadow: "0 8px 30px rgba(0,168,132,0.35), 0 0 0 3px rgba(0,168,132,0.15)",
          color: "#FFFFFF",
        }}
        aria-label="Suporte"
      >
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "rgba(0,168,132,0.20)", animationDuration: "2.5s" }}
        />
        <MessageSquare className="h-5 w-5 relative z-10" />
      </motion.button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Landing Page
───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FAFAFA" }}>

      {/* ══ NAVIGATION ══ */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: "rgba(250,250,250,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00A884, #007A62)", boxShadow: "0 4px 12px rgba(0,168,132,0.25)" }}
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-widest uppercase" style={{ color: "#111827", letterSpacing: "0.12em" }}>
              THE REACTOR
            </div>
            <div className="text-[9px] font-medium uppercase tracking-widest" style={{ color: "#9CA3AF", letterSpacing: "0.18em" }}>
              L.H.E.X Systems
            </div>
          </div>
        </div>

        {/* Status + CTA */}
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,168,132,0.07)", border: "1px solid rgba(0,168,132,0.14)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full opacity-70" style={{ background: "#00A884" }} />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: "#00A884" }} />
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: "#00A884" }}>
              Reactor Online
            </span>
          </div>
          <Link href="/nucleus">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #111827, #374151)",
                boxShadow: "0 4px 14px rgba(17,24,39,0.20)",
              }}
            >
              Acessar
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <section className="relative px-6 md:px-10 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={springItem}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
                style={{
                  background: "rgba(0,168,132,0.07)",
                  border: "1px solid rgba(0,168,132,0.18)",
                  color: "#00A884",
                  letterSpacing: "0.06em",
                }}
              >
                <Activity className="h-3.5 w-3.5" />
                Plataforma Soberana de IA Empresarial
              </div>
            </motion.div>

            <motion.h1
              variants={springItem}
              className="text-5xl md:text-6xl xl:text-7xl font-black tracking-hero mb-6 text-balance"
              style={{ color: "#111827", lineHeight: 1.05 }}
            >
              O Sistema
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #00A884 0%, #00C2D4 60%, #6220A0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Operacional
              </span>
              <br />
              de IA
            </motion.h1>

            <motion.p
              variants={springItem}
              className="text-lg md:text-xl font-light leading-relaxed mb-4 max-w-lg"
              style={{ color: "#374151" }}
            >
              Seis agentes autônomos especializados em{" "}
              <span className="font-medium" style={{ color: "#111827" }}>
                Finanças, Vendas, Marketing e Operações
              </span>{" "}
              — funcionando 24/7, colaborando entre si.
            </motion.p>

            <motion.p
              variants={springItem}
              className="text-sm leading-relaxed mb-10 max-w-md"
              style={{ color: "#9CA3AF" }}
            >
              Protocolo A2A nativo. WhatsApp integrado. Infraestrutura soberana.
              Tudo em uma única plataforma de controle.
            </motion.p>

            <motion.div
              variants={springItem}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/nucleus">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(17,24,39,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white w-full sm:w-auto justify-center"
                  style={{
                    background: "linear-gradient(135deg, #111827, #1F2937)",
                    boxShadow: "0 8px 28px rgba(17,24,39,0.22)",
                  }}
                >
                  <Brain className="h-4 w-4" />
                  Acessar o Reactor
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/agents">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold w-full sm:w-auto justify-center"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(0,0,0,0.10)",
                    color: "#374151",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  <Network className="h-4 w-4" />
                  Ver Agentes
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: 3D Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
            className="relative flex items-center justify-center"
            style={{ minHeight: 400 }}
          >
            {/* Radial background glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,194,212,0.10), transparent)",
                filter: "blur(32px)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(98,32,160,0.07), transparent)",
                filter: "blur(48px)",
              }}
            />
            <ReactorCore3D className="w-full h-full" style={{ minHeight: 380 }} />
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="px-6 md:px-10 pb-14">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={springItem}
                className="text-center py-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="text-3xl font-black mb-1 tracking-tight"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="text-xs font-medium" style={{ color: "#9CA3AF" }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ BENTO FEATURES GRID ══ */}
      <section className="px-6 md:px-10 pb-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-black tracking-title mb-3"
            style={{ color: "#111827" }}
          >
            Inteligência Especializada
            <br />
            <span style={{ color: "#9CA3AF", fontWeight: 600 }}>em Cada Área do Negócio</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#9CA3AF" }}>
            Cada agente é treinado para dominar sua especialidade e colaborar com os demais em tempo real.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={springItem}>
                <GlowCard glowColor={f.glow}>
                  <div
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold mb-4"
                    style={{
                      background: `${f.color}12`,
                      color: f.color,
                      border: `1px solid ${f.color}25`,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {f.tag}
                  </div>
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}10`, border: `1px solid ${f.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#111827" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                    {f.desc}
                  </p>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══ TRUST BAR ══ */}
      <section className="px-6 md:px-10 pb-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Shield, title: "Infraestrutura Soberana", desc: "Seus dados nunca saem do seu ambiente. Controle total sobre processamento e armazenamento." },
            { icon: Globe, title: "Integração Universal", desc: "API-first. Conecta com qualquer ERP, CRM ou plataforma via webhooks e integrações nativas." },
            { icon: Cpu, title: "Modelos de Elite", desc: "Roda os melhores LLMs do mercado: GPT-4o, Claude, Gemini. Escolha o certo para cada tarefa." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <GlowCard key={item.title} glowColor="rgba(0,168,132,0.08)">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(0,168,132,0.08)", border: "1px solid rgba(0,168,132,0.15)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#00A884" }} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: "#111827" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
              </GlowCard>
            );
          })}
        </motion.div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section className="px-6 md:px-10 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <GlowCard
            glowColor="rgba(0,168,132,0.14)"
            glowSize={500}
            className="text-center"
            style={{ padding: "3.5rem 2rem" }}
          >
            <div
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-6"
              style={{
                background: "linear-gradient(135deg, #00A884, #007A62)",
                boxShadow: "0 8px 30px rgba(0,168,132,0.28)",
              }}
            >
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-black tracking-title mb-4"
              style={{ color: "#111827" }}
            >
              Pronto para ativar o Reactor?
            </h2>
            <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "#6B7280" }}>
              Em minutos sua empresa opera com inteligência autônoma de nível enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/nucleus">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(17,24,39,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #111827, #1F2937)",
                    boxShadow: "0 8px 28px rgba(17,24,39,0.22)",
                  }}
                >
                  <Brain className="h-4 w-4" />
                  Acessar o Nucleus
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>
              <a href="mailto:contato@lhexsystems.com">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(0,0,0,0.10)",
                    color: "#374151",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Falar com Especialista
                </motion.button>
              </a>
            </div>
          </GlowCard>
        </motion.div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer
        className="px-6 md:px-10 py-8 border-t"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00A884, #007A62)" }}
            >
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#111827" }}>
              THE REACTOR
            </span>
            <span style={{ color: "#D1D5DB" }}>·</span>
            <span className="text-sm" style={{ color: "#9CA3AF" }}>L.H.E.X Systems</span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { href: "/nucleus",   label: "Nucleus"     },
              { href: "/finance",   label: "Financeiro"  },
              { href: "/sdr",       label: "SDR"         },
              { href: "/agents",    label: "Agentes"     },
              { href: "/suporte",   label: "Suporte"     },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs transition-colors hover:text-[#111827]"
                style={{ color: "#9CA3AF" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            &copy; 2025 L.H.E.X Systems. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* ══ FLOATING SUPPORT ══ */}
      <FloatingSupport />
    </div>
  );
}
