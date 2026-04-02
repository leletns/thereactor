"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

/* ─── Animated counter ──────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const raw = useMotionValue(0);
  const smoothed = useSpring(raw, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) raw.set(to);
  }, [inView, raw, to]);

  useEffect(
    () =>
      smoothed.on("change", (v) =>
        setDisplay(
          v >= 1_000_000
            ? (v / 1_000_000).toFixed(0) + "M"
            : v >= 1_000
            ? (v / 1_000).toFixed(0) + "K"
            : v < 10
            ? v.toFixed(1)
            : Math.round(v).toString()
        )
      ),
    [smoothed]
  );

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ─── Feature card ──────────────────────────────────────────────────────────── */
type Card = { icon: string; title: string; desc: string; from: string; to: string };

function FeatureCard({ card, i }: { card: Card; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.13, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative rounded-3xl p-8 bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_60px_rgba(99,102,241,0.13)] transition-shadow duration-300 cursor-default"
    >
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-6 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` }}
      >
        {card.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{card.title}</h3>
      <p className="text-gray-500 leading-relaxed text-[15px]">{card.desc}</p>
    </motion.div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────────── */
export default function Home() {
  const cards: Card[] = [
    {
      icon: "⚡",
      title: "Resposta Imediata, 24h por Dia",
      desc: "Enquanto você dorme, descansa ou está em reunião, seus clientes são atendidos na hora — sem fila, sem espera, sem reclamação.",
      from: "#F59E0B",
      to: "#EF4444",
    },
    {
      icon: "📊",
      title: "Visão Clara do Seu Negócio",
      desc: "Saiba exatamente o que está vendendo, onde está perdendo dinheiro e o que fazer a seguir — sem planilhas nem complicação.",
      from: "#6366F1",
      to: "#8B5CF6",
    },
    {
      icon: "🚀",
      title: "Escala Sem Contratar Mais",
      desc: "Dobre o volume de clientes sem dobrar a equipe. O Reactor absorve o crescimento e mantém tudo funcionando perfeitamente.",
      from: "#10B981",
      to: "#059669",
    },
  ];

  const stats = [
    { value: 10, suffix: "M+", label: "Operações realizadas" },
    { value: 99.9, suffix: "%", label: "Disponibilidade garantida" },
    { value: 3, suffix: "s", label: "Tempo médio de resposta" },
  ];

  const barHeights = [45, 72, 55, 88, 60, 95, 78];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden font-sans"
      style={{ background: "linear-gradient(160deg, #F5F7FF 0%, #FAFBFF 50%, #F0F4FF 100%)" }}
    >
      {/* ── Ambient orbs ──────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -left-32 w-[650px] h-[650px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(165,180,252,0.45) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-48 w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, 35, 0], y: [0, 60, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Reactor</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ao vivo
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <a href="#como-funciona" className="hover:text-gray-900 transition-colors">Como funciona</a>
          <a href="#resultados" className="hover:text-gray-900 transition-colors">Resultados</a>
          <a href="#depoimentos" className="hover:text-gray-900 transition-colors">Clientes</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Entrar
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.45)] transition-shadow"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Falar com Especialista
          </motion.button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-28 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full text-sm font-medium text-indigo-600 border border-indigo-100"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Gestão empresarial reimaginada
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-[72px] font-black text-gray-900 leading-[1.04] tracking-tight mb-8"
        >
          Sua empresa no{" "}
          <span className="relative inline-block">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)" }}
            >
              piloto automático.
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.85, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full origin-left"
              style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xl text-gray-500 max-w-2xl leading-relaxed mb-12"
        >
          Enquanto você foca em crescer, o Reactor cuida dos bastidores —
          atendimento, relatórios e operação rodando 24 horas sem precisar de você.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.55 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-2xl text-base font-bold text-white shadow-[0_8px_30px_rgba(99,102,241,0.40)] hover:shadow-[0_14px_40px_rgba(99,102,241,0.50)] transition-shadow"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Começar Agora — É Grátis
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-gray-700 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}
          >
            <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Ver como funciona
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48, duration: 0.55 }}
          className="mt-5 text-sm text-gray-400"
        >
          Sem cartão de crédito &nbsp;·&nbsp; Configuração em 5 minutos &nbsp;·&nbsp; Cancele quando quiser
        </motion.p>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full max-w-4xl mx-auto"
        >
          <div
            className="relative rounded-3xl overflow-hidden border border-white/80 p-6"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 30px 100px rgba(99,102,241,0.15), 0 1px 0 rgba(255,255,255,0.8) inset",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="ml-4 h-5 w-52 rounded-full bg-gray-100" />
            </div>
            {/* Bar chart */}
            <div className="grid grid-cols-7 gap-2 mb-5 items-end h-28 px-1">
              {barHeights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.65 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: `${h}%`,
                    background: "linear-gradient(180deg, #818CF8 0%, #6366F1 100%)",
                  }}
                  className="origin-bottom rounded-t-lg opacity-80"
                />
              ))}
            </div>
            {/* KPI pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Receita do mês", value: "R$ 84.320", delta: "+12%" },
                { label: "Novos clientes", value: "247", delta: "+8%" },
                { label: "Taxa de resposta", value: "99,4%", delta: "+2%" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex-1 min-w-[110px] rounded-2xl p-4 border border-gray-100"
                  style={{ background: "rgba(255,255,255,0.85)" }}
                >
                  <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold text-gray-900">{m.value}</span>
                    <span className="text-xs font-semibold text-emerald-500 mb-0.5">{m.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section
        id="resultados"
        className="relative z-10 py-16 border-y border-gray-100"
        style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="text-5xl font-black text-gray-900 mb-2 tabular-nums">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm font-medium text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="como-funciona" className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-4">
            Para você crescer sem dor
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Tudo que sua empresa precisa,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              funcionando sozinho.
            </span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <FeatureCard key={i} card={c} i={i} />
          ))}
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────────── */}
      <section id="depoimentos" className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto rounded-3xl p-10 md:p-14 text-center border border-white/70"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(99,102,241,0.10)",
          }}
        >
          <div className="flex justify-center mb-6 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-amber-400 text-xl">★</span>
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug mb-8">
            &ldquo;Em 30 dias com o Reactor, paramos de apagar incêndios e começamos a planejar o crescimento. Foi a melhor decisão do ano.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ background: "linear-gradient(135deg, #818CF8, #8B5CF6)" }}
            >
              M
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Marina Oliveira</p>
              <p className="text-gray-400 text-sm">Fundadora · Studio MO</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
          style={{ boxShadow: "0 30px 80px rgba(99,102,241,0.30)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)" }}
          />
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative p-12 md:p-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Pronto para parar de fazer tudo na mão?
            </h2>
            <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
              Junte-se a centenas de empresas que já colocaram o crescimento no piloto automático.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-2xl text-base font-bold text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.18)" }}
              >
                Começar Gratuitamente
              </motion.button>
              <button className="text-white/75 hover:text-white text-sm font-medium transition-colors">
                Falar com um especialista →
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t border-gray-100 py-10 px-6"
        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              <span className="text-white font-black text-xs">R</span>
            </div>
            <span className="font-bold text-gray-700 text-sm">Reactor</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Reactor. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Termos</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
