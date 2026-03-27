"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, Phone, Zap, Shield, CreditCard, Wifi, HelpCircle, MessageCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Primeiros Passos",
    icon: Zap,
    color: "#5FFFD7",
    questions: [
      {
        q: "O que é o Reactor e para que serve?",
        a: "O Reactor é a plataforma de inteligência da sua empresa. Ele substitui horas de trabalho manual em financeiro, vendas, marketing e operações por agentes autônomos que trabalham 24 horas por dia, 7 dias por semana. Pense nele como ter uma equipe completa de especialistas disponível a qualquer momento.",
      },
      {
        q: "Preciso saber programar para usar o Reactor?",
        a: "Não. O Reactor foi desenvolvido para qualquer pessoa. A interface é intuitiva como um aplicativo de mensagens. Você digita o que precisa em português e o sistema entende e age. Sem códigos, sem configurações técnicas complexas.",
      },
      {
        q: "Por onde começo?",
        a: "Acesse o menu lateral e explore os módulos. Recomendamos começar pela Central de IA (ícone de cérebro) e fazer uma pergunta simples como 'qual é o resumo do negócio hoje?'. O sistema vai guiar você naturalmente.",
      },
    ],
  },
  {
    category: "Inteligência Artificial",
    icon: HelpCircle,
    color: "#7B2FBE",
    questions: [
      {
        q: "Como a IA do Reactor funciona?",
        a: "O Reactor usa modelos de linguagem avançados para entender suas perguntas e dados da empresa. Ela não apenas responde perguntas — ela analisa padrões, identifica oportunidades e toma decisões baseadas nos dados reais do seu negócio.",
      },
      {
        q: "A IA pode cometer erros?",
        a: "Como qualquer ferramenta de apoio, a IA pode ter imprecisões. Sempre revise decisões importantes com sua equipe. O Reactor é um copiloto poderoso, mas você é o piloto. Toda ação relevante passa pela sua aprovação.",
      },
      {
        q: "Em quais idiomas o sistema funciona?",
        a: "O Reactor funciona em português, inglês e espanhol. Você pode alternar o idioma no rodapé do menu lateral. A IA responde sempre no idioma em que você faz a pergunta.",
      },
    ],
  },
  {
    category: "Segurança e Privacidade",
    icon: Shield,
    color: "#5FFFD7",
    questions: [
      {
        q: "Meus dados estão seguros?",
        a: "Sim. Todos os dados ficam no seu próprio banco de dados (Supabase), não em servidores compartilhados. A L.H.E.X Systems tem como princípio fundamental a soberania de dados — suas informações são suas, ponto final.",
      },
      {
        q: "Outras empresas podem ver meus dados?",
        a: "Não. Cada empresa tem um ambiente isolado e criptografado. Nem a equipe da L.H.E.X Systems tem acesso aos seus dados operacionais. É como ter um cofre digital exclusivo.",
      },
      {
        q: "O que acontece se eu cancelar?",
        a: "Seus dados são exportados completamente para você antes de qualquer encerramento. Nenhum dado é retido. Você tem controle total a qualquer momento.",
      },
    ],
  },
  {
    category: "Integrações",
    icon: Wifi,
    color: "#fbbf24",
    questions: [
      {
        q: "Como integro meu WhatsApp?",
        a: "Acesse o módulo Canais no menu lateral. Você vai encontrar o passo a passo para conectar seu WhatsApp Business via QR Code. O processo leva menos de 5 minutos. Após conectado, o Reactor pode enviar e receber mensagens automaticamente.",
      },
      {
        q: "O sistema funciona com meu CRM atual?",
        a: "O Reactor pode ser integrado com os principais CRMs do mercado. Para integrações específicas, entre em contato com nossa equipe em contato@lhexsystems.com e faremos o mapeamento da integração ideal para o seu caso.",
      },
      {
        q: "Posso usar a extensão do Chrome junto com o sistema?",
        a: "Sim! A Extensão CRM (disponível em breve) funciona em paralelo com o sistema web. Você navega no LinkedIn ou em qualquer site e o Reactor aparece como um popup com informações do lead em tempo real.",
      },
    ],
  },
  {
    category: "Planos e Pagamento",
    icon: CreditCard,
    color: "#5FFFD7",
    questions: [
      {
        q: "Quanto custa o Reactor?",
        a: "Os planos são personalizados de acordo com o tamanho da empresa e as funcionalidades necessárias. Entre em contato pelo email contato@lhexsystems.com ou WhatsApp +55 21 98758-7047 para receber uma proposta sob medida.",
      },
      {
        q: "Existe período de teste gratuito?",
        a: "Sim. Oferecemos uma demonstração completa da plataforma com dados reais da sua empresa. Entre em contato para agendar uma sessão de onboarding personalizada.",
      },
      {
        q: "Como funciona o suporte técnico?",
        a: "Clientes ativos têm acesso a suporte por email e WhatsApp em horário comercial (seg–sex, 9h–18h). Planos premium incluem suporte prioritário com SLA de 4 horas.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded overflow-hidden transition-all"
      style={{
        border: "1px solid var(--reactor-border-color)",
        background: open ? "rgba(95,255,215,0.03)" : "transparent",
      }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[13px] font-medium leading-snug" style={{ color: "var(--reactor-text)" }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown className="h-4 w-4" style={{ color: "#5FFFD7" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div
              className="px-4 pb-4 text-[13px] leading-relaxed"
              style={{ color: "var(--reactor-text-2)", borderTop: "1px solid var(--reactor-border-color)" }}
            >
              <div className="pt-3">{a}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SuportePage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="text-center pt-4 space-y-2">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-[11px] font-semibold tracking-wider mb-2"
          style={{
            background: "rgba(95,255,215,0.06)",
            border: "1px solid rgba(95,255,215,0.15)",
            color: "#5FFFD7",
          }}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          CENTRAL DE AJUDA
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--reactor-text)" }}>
          Como podemos ajudar?
        </h1>
        <p className="text-sm" style={{ color: "var(--reactor-text-2)" }}>
          Respostas rápidas para as dúvidas mais comuns sobre o Reactor.
        </p>
      </div>

      {/* FAQ sections */}
      {FAQ_ITEMS.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.category} className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-7 w-7 rounded flex items-center justify-center"
                style={{ background: `${section.color}12`, border: `1px solid ${section.color}22` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: section.color }} />
              </div>
              <h2 className="text-[13px] font-semibold tracking-wide" style={{ color: "var(--reactor-text)" }}>
                {section.category}
              </h2>
            </div>
            <div className="space-y-1.5">
              {section.questions.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Contact CTA */}
      <div
        className="rounded p-6 text-center space-y-4"
        style={{
          background: "rgba(95,255,215,0.04)",
          border: "1px solid rgba(95,255,215,0.12)",
        }}
      >
        <MessageCircle className="h-8 w-8 mx-auto" style={{ color: "#5FFFD7" }} />
        <div>
          <p className="font-semibold text-[15px]" style={{ color: "var(--reactor-text)" }}>
            Não encontrou o que procurava?
          </p>
          <p className="text-[13px] mt-1" style={{ color: "var(--reactor-text-2)" }}>
            Fale diretamente com nossa equipe.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:contato@lhexsystems.com"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-sm transition-all"
            style={{
              background: "#5FFFD7",
              color: "#000000",
            }}
            onMouseEnter={e => { (e.currentTarget).style.filter = "brightness(1.1)"; }}
            onMouseLeave={e => { (e.currentTarget).style.filter = "none"; }}
          >
            <Mail className="h-4 w-4" />
            contato@lhexsystems.com
          </a>
          <a
            href="tel:+5521987587047"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-sm transition-all"
            style={{
              background: "rgba(123,47,190,0.12)",
              border: "1px solid rgba(123,47,190,0.25)",
              color: "#7B2FBE",
            }}
            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(123,47,190,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget).style.background = "rgba(123,47,190,0.12)"; }}
          >
            <Phone className="h-4 w-4" />
            +55 21 98758-7047
          </a>
        </div>
      </div>
    </div>
  );
}
