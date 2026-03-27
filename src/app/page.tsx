"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Megaphone,
  Settings2,
  MessageSquare,
  Brain,
  Zap,
  ArrowRight,
  Activity,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Finance Agent",
    description: "Análise de DRE, fluxo de caixa, projeções financeiras e insights em tempo real. Substitui um analista financeiro sênior.",
    color: "#00ff88",
  },
  {
    icon: Users,
    title: "SDR Agent",
    description: "Prospecção inteligente, qualificação de leads com score 0-100, cadências automatizadas e gestão de pipeline.",
    color: "#8b5cf6",
  },
  {
    icon: Megaphone,
    title: "Marketing Agent",
    description: "Geração de copy, análise de campanhas, calendário de conteúdo e estratégias de growth baseadas em dados.",
    color: "#ff6b35",
  },
  {
    icon: Settings2,
    title: "Ops Agent",
    description: "Otimização de processos, gestão de tarefas, automações operacionais e documentação técnica.",
    color: "#fbbf24",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    description: "Atendimento 24/7 via WhatsApp com Evolution API. Qualifica leads, responde clientes e escala para humanos.",
    color: "#34d399",
  },
  {
    icon: Network,
    title: "A2A Protocol",
    description: "Protocolo proprietário de comunicação entre agentes. Os agentes colaboram entre si para resolver problemas complexos.",
    color: "#00f5ff",
  },
];

const STATS = [
  { value: "6", label: "Agentes Ativos", icon: Brain, color: "#00f5ff" },
  { value: "A2A", label: "Protocolo Nativo", icon: Network, color: "#8b5cf6" },
  { value: "MCP", label: "Tools Integradas", icon: Zap, color: "#00ff88" },
  { value: "24/7", label: "WhatsApp Ativo", icon: MessageSquare, color: "#ff6b35" },
];

function Particle({ x, y, size, color, duration, delay }: {
  x: number; y: number; size: number; color: string; duration: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color, opacity: 0.4 }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  color: ["#00f5ff", "#00ff88", "#8b5cf6"][Math.floor(Math.random() * 3)],
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 4,
}));

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-60" />
        {mounted && PARTICLES.map((p) => <Particle key={p.id} {...p} />)}
        {/* Gradient orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10"
          style={{ background: "radial-gradient(circle, #00f5ff, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-8"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-5"
          style={{ background: "radial-gradient(circle, #00ff88, transparent)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-reactor-cyan/10 border border-reactor-cyan/20">
            <Zap className="h-5 w-5 text-reactor-cyan" />
          </div>
          <div>
            <span
              className="text-base font-bold text-reactor-cyan tracking-widest uppercase"
              style={{ textShadow: "0 0 10px rgba(0,245,255,0.5)", letterSpacing: "0.15em" }}
            >
              THE REACTOR
            </span>
            <div className="text-[9px] text-white/30 tracking-widest uppercase">lhex systems</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-reactor-green/8 border border-reactor-green/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-reactor-green opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-reactor-green" />
            </span>
            <span className="text-[11px] font-semibold text-reactor-green tracking-wider">REACTOR ONLINE</span>
          </div>
          <Link href="/nucleus">
            <Button size="sm">
              Acessar o Reactor
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-reactor-cyan/20 bg-reactor-cyan/5 mb-8"
          >
            <Activity className="h-3.5 w-3.5 text-reactor-cyan" />
            <span className="text-xs font-semibold text-reactor-cyan tracking-wider uppercase">
              Plataforma Soberana de IA Empresarial
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-7xl md:text-9xl font-black tracking-tight mb-6"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 40%, #00f5ff 70%, #00ff88 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 40px rgba(0,245,255,0.3))",
            }}
          >
            THE REACTOR
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-white/50 mb-4 font-light max-w-3xl mx-auto leading-relaxed"
          >
            O Sistema Operacional de IA para
            <span className="text-white font-medium"> Empresas do Futuro</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-white/30 mb-12 max-w-2xl mx-auto"
          >
            6 agentes autônomos especializados em Finanças, Vendas, Marketing e Operações.
            Comunicação A2A nativa. WhatsApp integrado. Tudo em uma única plataforma.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/nucleus">
              <Button size="xl" className="group">
                <Brain className="h-5 w-5 mr-2" />
                Acessar o Reactor
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/agents">
              <Button size="xl" variant="outline">
                <Network className="h-5 w-5 mr-2" />
                Ver Agentes
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.8 }}
                className="text-center"
              >
                <div
                  className="inline-flex items-center justify-center h-12 w-12 rounded-xl border mb-3"
                  style={{
                    backgroundColor: `${stat.color}12`,
                    borderColor: `${stat.color}25`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
                <div
                  className="text-4xl font-black mb-1"
                  style={{ color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}60)` }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Inteligência Especializada em Cada Área
            </h2>
            <p className="text-white/40 text-lg">
              Cada agente é treinado para dominar sua área e colaborar com os outros.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="reactor-card rounded-2xl p-6 cursor-pointer group transition-all duration-300"
                  style={{ borderColor: `${feature.color}15` }}
                >
                  <div
                    className="flex items-center justify-center h-12 w-12 rounded-xl border mb-4"
                    style={{
                      backgroundColor: `${feature.color}12`,
                      borderColor: `${feature.color}25`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center reactor-card rounded-3xl p-12 border border-reactor-cyan/10"
          style={{ boxShadow: "0 0 80px rgba(0,245,255,0.06)" }}
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-reactor-cyan/10 border border-reactor-cyan/20 mb-6">
            <Zap className="h-8 w-8 text-reactor-cyan" />
          </div>
          <h2
            className="text-4xl font-black text-reactor-cyan mb-4"
            style={{ textShadow: "0 0 20px rgba(0,245,255,0.4)" }}
          >
            Pronto para ativar o Reactor?
          </h2>
          <p className="text-white/40 text-lg mb-8">
            Acesse agora e ative seus agentes. Em minutos sua empresa opera com inteligencia autônoma.
          </p>
          <Link href="/nucleus">
            <Button size="xl" className="mx-auto">
              <Brain className="h-5 w-5 mr-2" />
              Acessar o Nucleus
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-reactor-cyan" />
            <span className="text-sm font-bold text-reactor-cyan tracking-widest uppercase">
              THE REACTOR
            </span>
            <span className="text-white/20 mx-2">·</span>
            <span className="text-sm text-white/30">lhex systems</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { href: "/nucleus", label: "Nucleus" },
              { href: "/finance", label: "Financeiro" },
              { href: "/sdr", label: "SDR" },
              { href: "/agents", label: "Agentes" },
              { href: "/api/health", label: "Status" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/30 hover:text-white/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-white/20">
            &copy; 2025 lhex systems. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
