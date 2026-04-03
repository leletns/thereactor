"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  TrendingUp, Users, Megaphone, Settings2,
  MessageSquare, Brain, Zap, ArrowRight,
  Activity, Network, ChevronRight,
  Phone, Mail, X, Shield, Globe, Cpu,
} from "lucide-react";
import { GlowCard } from "@/components/ui/GlowCard";
import { TrackingHexagon } from "@/components/reactor/TrackingHexagon";

/* ─── dynamic 3D import (SSR off) ─── */
const ReactorCore3D = dynamic(
  () => import("@/components/reactor/ReactorCore3D").then((m) => m.ReactorCore3D),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <div style={{ width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(98,32,160,0.18) 0%, rgba(0,194,212,0.10) 50%, transparent 70%)", animation: "float 3s ease-in-out infinite" }} />
      </div>
    ),
  }
);

/* ─── Variants ─── */
const stagger: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } as never },
};
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } as never },
};

/* ─── Data ─── */
const FEATURES = [
  { icon: TrendingUp,    title: "Finance Agent",        tag: "Financeiro", color: "#059669", glow: "rgba(5,150,105,0.10)",   desc: "Análise de DRE, fluxo de caixa e projeções em tempo real. Substitui um analista financeiro sênior." },
  { icon: Users,         title: "SDR Agent",            tag: "Vendas",     color: "#7C3AED", glow: "rgba(124,58,237,0.10)",  desc: "Prospecção inteligente, score de leads 0–100, cadências automáticas e pipeline completo." },
  { icon: Megaphone,     title: "Marketing Agent",      tag: "Marketing",  color: "#EA580C", glow: "rgba(234,88,12,0.10)",   desc: "Copy de alta conversão, análise de campanhas, calendário editorial e growth baseado em dados." },
  { icon: Settings2,     title: "Ops Agent",            tag: "Operações",  color: "#D97706", glow: "rgba(217,119,6,0.10)",   desc: "Automação de processos, gestão de tarefas, documentação e otimização operacional contínua." },
  { icon: MessageSquare, title: "WhatsApp Integration", tag: "Canais",     color: "#00A884", glow: "rgba(0,168,132,0.10)",   desc: "Atendimento 24/7 via WhatsApp com Evolution API. Qualifica leads e escala para humanos." },
  { icon: Network,       title: "A2A Protocol",         tag: "Protocolo",  color: "#0891B2", glow: "rgba(8,145,178,0.10)",   desc: "Protocolo proprietário de comunicação multi-agente. Colaboração em tempo real." },
];

const STATS = [
  { value: "6×",   label: "Agentes Especializados", color: "#6220A0" },
  { value: "A2A",  label: "Protocolo Nativo",        color: "#00A884" },
  { value: "24/7", label: "Disponibilidade",          color: "#00C2D4" },
  { value: "MCP",  label: "Tools Integradas",         color: "#D97706" },
];

/* ─── Floating Support ─── */
function FloatingSupport() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="glass rounded-2xl p-5 w-72"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.6)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ color: "#111827" }}>Suporte L.H.E.X</p>
              <button onClick={() => setOpen(false)} className="h-6 w-6 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                <X className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />
              </button>
            </div>
            <div className="space-y-3">
              <a href="mailto:contato@lhexsystems.com" className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(0,168,132,0.06)", border: "1px solid rgba(0,168,132,0.12)" }}>
                <Mail className="h-4 w-4 shrink-0" style={{ color: "#00A884" }} />
                <div><p className="text-xs font-medium" style={{ color: "#111827" }}>E-mail</p><p className="text-[11px]" style={{ color: "#9CA3AF" }}>contato@lhexsystems.com</p></div>
              </a>
              <a href="tel:+5521987587047" className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(98,32,160,0.05)", border: "1px solid rgba(98,32,160,0.10)" }}>
                <Phone className="h-4 w-4 shrink-0" style={{ color: "#6220A0" }} />
                <div><p className="text-xs font-medium" style={{ color: "#111827" }}>WhatsApp</p><p className="text-[11px]" style={{ color: "#9CA3AF" }}>+55 21 98758-7047</p></div>
              </a>
              <Link href="/suporte" className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }} onClick={() => setOpen(false)}>
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
        style={{ background: "linear-gradient(135deg, #00A884, #007A62)", boxShadow: "0 8px 30px rgba(0,168,132,0.35), 0 0 0 3px rgba(0,168,132,0.15)", color: "#FFFFFF" }}
        aria-label="Suporte"
      >
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(0,168,132,0.20)", animationDuration: "2.5s" }} />
        <MessageSquare className="h-5 w-5 relative z-10" />
      </motion.button>
    </div>
  );
}

/* ─── Landing Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FAFAFA" }}>

      {/* ══ NAV ══ */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 py-3"
        style={{ background: "rgba(250,250,250,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <TrackingHexagon size={36} intensity={14} />
          <div>
            <div className="text-sm font-bold tracking-widest uppercase" style={{ color: "#111827", letterSpacing: "0.12em" }}>THE REACTOR</div>
            <div className="text-[9px] font-medium uppercase tracking-widest" style={{ color: "#9CA3AF", letterSpacing: "0.18em" }}>L.H.E.X Systems</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,168,132,0.07)", border: "1px solid rgba(0,168,132,0.14)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full opacity-70" style={{ background: "#00A884" }} />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: "#00A884" }} />
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: "#00A884" }}>Reactor Online</span>
          </div>
          <Link href="/nucleus">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #111827, #374151)", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(17,24,39,0.20)" }}
            >
              Acessar <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <section className="relative flex flex-col items-center" style={{ minHeight: "100vh", paddingBottom: "4rem" }}>

        {/* Glow halos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="hero-glow-purple absolute inset-0" />
          <div className="hero-glow-cyan absolute inset-0" />
          <div className="hero-glow-teal absolute inset-0" />
        </div>

        {/* 3D Hexagon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.1 }}
          style={{ width: "100%", height: "58vh", position: "relative", zIndex: 1 }}
        >
          <ReactorCore3D style={{ width: "100%", height: "100%" }} />
        </motion.div>

        {/* Text */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-6 md:px-10 flex flex-col items-center"
          style={{ marginTop: "-80px", maxWidth: "920px", width: "100%" }}
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-7" style={{ background: "rgba(98,32,160,0.06)", border: "1px solid rgba(98,32,160,0.16)", color: "#6220A0", letterSpacing: "0.06em" }}>
              <Activity className="h-3.5 w-3.5" />
              L.H.E.X Systems · Plataforma Soberana de IA
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-balance tracking-hero mb-6"
            style={{ fontWeight: 900, lineHeight: 1.02, fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)", color: "#0A0A0F", letterSpacing: "-0.035em" }}
          >
            O SISTEMA<br />
            <span style={{ background: "linear-gradient(135deg, #6220A0 0%, #00C2D4 60%, #00A884 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              OPERACIONAL
            </span>
            <br />DE IA
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl" style={{ color: "#4B5563" }}>
            Seis agentes autônomos especializados em{" "}
            <span className="font-medium" style={{ color: "#111827" }}>Finanças, Vendas, Marketing e Operações</span>
            {" "}— funcionando 24/7, colaborando entre si via protocolo A2A.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/nucleus">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 14px 44px rgba(17,24,39,0.28)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold w-full sm:w-auto justify-center"
                style={{ background: "linear-gradient(135deg, #111827, #1F2937)", color: "#FFFFFF", boxShadow: "0 8px 28px rgba(17,24,39,0.22)" }}
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
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold w-full sm:w-auto justify-center"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.10)", color: "#374151", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
              >
                <Network className="h-4 w-4" />
                Ver Agentes
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ STATS ══ */}
      <section className="px-6 md:px-10 pb-16 max-w-4xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center py-7 rounded-2xl" style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div className="text-3xl font-black mb-1.5 tracking-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium" style={{ color: "#9CA3AF" }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="px-6 md:px-10 pb-20 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-title mb-3" style={{ color: "#111827" }}>
            Inteligência Especializada<br />
            <span style={{ color: "#9CA3AF", fontWeight: 600 }}>em Cada Área do Negócio</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#9CA3AF" }}>
            Cada agente domina sua especialidade e colabora com os demais em tempo real.
          </p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={fadeUp}>
                <GlowCard glowColor={f.glow} className="h-full">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold mb-4" style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}25`, letterSpacing: "0.06em" }}>{f.tag}</div>
                  <div className="h-11 w-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${f.color}10`, border: `1px solid ${f.color}20` }}>
                    <Icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#111827" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{f.desc}</p>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══ TRUST ══ */}
      <section className="px-6 md:px-10 pb-20 max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Infraestrutura Soberana", desc: "Seus dados nunca saem do seu ambiente. Controle total sobre processamento e armazenamento." },
            { icon: Globe,  title: "Integração Universal",    desc: "API-first. Conecta com qualquer ERP, CRM ou plataforma via webhooks e integrações nativas." },
            { icon: Cpu,    title: "Modelos de Elite",        desc: "Roda os melhores LLMs: GPT-4o, Claude, Gemini. Escolha o certo para cada tarefa." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} variants={fadeUp}>
                <GlowCard glowColor="rgba(0,168,132,0.08)" className="h-full">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,168,132,0.08)", border: "1px solid rgba(0,168,132,0.15)" }}>
                    <Icon className="h-5 w-5" style={{ color: "#00A884" }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: "#111827" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══ CTA ══ */}
      <section className="px-6 md:px-10 pb-24 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
          <GlowCard glowColor="rgba(0,168,132,0.14)" glowSize={500} className="text-center" style={{ padding: "3.5rem 2rem" }}>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #00A884, #007A62)", boxShadow: "0 8px 30px rgba(0,168,132,0.28)" }}>
              <Zap className="h-8 w-8" style={{ color: "#FFFFFF" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-title mb-4" style={{ color: "#111827" }}>Pronto para ativar o Reactor?</h2>
            <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "#6B7280" }}>Em minutos sua empresa opera com inteligência autônoma de nível enterprise.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/nucleus">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(17,24,39,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #111827, #1F2937)", color: "#FFFFFF", boxShadow: "0 8px 28px rgba(17,24,39,0.22)" }}
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
                  style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.10)", color: "#374151", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
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
      <footer className="px-6 md:px-10 py-8 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00A884, #007A62)" }}>
              <Zap className="h-4 w-4" style={{ color: "#FFFFFF" }} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#111827" }}>THE REACTOR</span>
            <span style={{ color: "#D1D5DB" }}>·</span>
            <span className="text-sm" style={{ color: "#9CA3AF" }}>L.H.E.X Systems</span>
          </div>
          <div className="flex items-center gap-6">
            {[{ href: "/nucleus", label: "Nucleus" }, { href: "/finance", label: "Financeiro" }, { href: "/sdr", label: "SDR" }, { href: "/agents", label: "Agentes" }, { href: "/suporte", label: "Suporte" }].map((link) => (
              <Link key={link.href} href={link.href} className="text-xs transition-colors hover:text-[#111827]" style={{ color: "#9CA3AF" }}>{link.label}</Link>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>&copy; 2025 L.H.E.X Systems.</p>
        </div>
      </footer>

      <FloatingSupport />
    </div>
  );
}
