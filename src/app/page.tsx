"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TheReactorUltraPremium() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const handleCTA = () => {
    // Restaure a lógica de roteamento real aqui. Por padrão, rola para preços ou abre modal.
    window.location.href = "#planos";
  };

  return (
    <main className="relative min-h-screen w-full bg-[#FAFAFA] text-slate-900 font-sans overflow-hidden selection:bg-indigo-200">

      {/* BACKGROUND IMERSIVO: Mistura de Vídeo e Gradientes Radiais */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-[#FAFAFA]/80 to-[#FAFAFA] z-10 backdrop-blur-[2px]"></div>
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          animate={{ scale: isHoveringVideo ? 1.05 : 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-[0.15] mix-blend-luminosity"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-white-sand-dunes-in-the-desert-4240-large.mp4" type="video/mp4" />
        </motion.video>
      </div>

      {/* NAV BAR */}
      <nav className="relative z-50 w-full px-6 py-6 md:px-12 flex justify-between items-center max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.2)] flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-extrabold tracking-tight">The Reactor</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-slate-500">
          <a href="#solucoes" className="hover:text-slate-900 transition-colors">Soluções</a>
          <a href="#duvidas" className="hover:text-slate-900 transition-colors">Dúvidas</a>
        </div>
        <button
          onClick={handleCTA}
          className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold hover:border-slate-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Acessar Sistema
        </button>
      </nav>

      {/* HERO SECTION */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center"
        onMouseEnter={() => setIsHoveringVideo(true)}
        onMouseLeave={() => setIsHoveringVideo(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/50 border border-indigo-100 text-indigo-600 font-medium text-sm mb-8 shadow-sm backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Sistemas online e operantes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter text-slate-900 max-w-5xl leading-[0.95]"
        >
          O motor invisível do <br className="hidden md:block" /> seu negócio.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-xl md:text-2xl text-slate-500 max-w-2xl font-light leading-relaxed"
        >
          Nós cuidamos da infraestrutura, da estabilidade e das automações. O seu único trabalho? Focar em vender.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button
            onClick={handleCTA}
            className="px-10 py-4 rounded-full bg-slate-900 text-white font-bold text-lg shadow-[0_10px_30px_rgba(15,23,42,0.2)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all w-full sm:w-auto cursor-pointer"
          >
            Ativar o Reactor
          </button>
        </motion.div>
      </div>

      {/* CARDS 3D / SOLUÇÕES */}
      <div id="solucoes" className="relative z-10 max-w-[1400px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Zero Dores de Cabeça", desc: "Sua operação rodando 24h sem travar. Sem necessidade de configurações complexas." },
            { title: "Escala Absoluta", desc: "A infraestrutura se adapta automaticamente. De 10 a 10.000 clientes, o preço e a estabilidade se mantêm justos." },
            { title: "Suporte Humano", desc: "Chega de falar com robôs quando as coisas dão errado. Acesso direto a especialistas reais." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="w-4 h-4 bg-indigo-600 rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 font-light text-lg leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
