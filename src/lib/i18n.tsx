"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Lang = "pt" | "en" | "es";

const T = {
  pt: {
    nav: {
      nucleus:   "Central de IA",
      finance:   "Financeiro",
      sdr:       "Vendas",
      marketing: "Marketing",
      ops:       "Operações",
      agents:    "Automações",
      channels:  "Canais",
      extension: "Extensão CRM",
    },
    sidebar: {
      modules: "Módulos",
      status:  "SISTEMA ATIVO",
    },
    header: {
      online:      "SISTEMA ATIVO",
      a2a:         "msgs",
      toggleTheme: "Alternar tema",
      command:     "Comando rápido",
      notifications: "Notificações",
      unread:      "não lidas",
      viewAll:     "Ver todas",
      commandTitle: "Comando Rápido",
      commandPlaceholder: "Digite um comando ou pergunta...",
      commandHint: "Pressione Enter para enviar",
      suggestions: ["Analisar fluxo de caixa", "Leads de hoje", "Gerar copy", "Tarefas pendentes"],
    },
    modules: {
      "/nucleus":   "Central de IA",
      "/finance":   "Financeiro — Análise e Insights",
      "/sdr":       "Vendas — Gestão de Pipeline",
      "/marketing": "Marketing — Campanhas e Conteúdo",
      "/ops":       "Operações — Processos e Tarefas",
      "/agents":    "Automações — Configuração",
      "/channels":  "Canais — WhatsApp e Integrações",
      "/extension": "Extensão CRM",
      "/suporte":   "Central de Ajuda",
    },
  },
  en: {
    nav: {
      nucleus:   "AI Hub",
      finance:   "Finance",
      sdr:       "Sales",
      marketing: "Marketing",
      ops:       "Operations",
      agents:    "Automations",
      channels:  "Channels",
      extension: "CRM Extension",
    },
    sidebar: {
      modules: "Modules",
      status:  "SYSTEM ACTIVE",
    },
    header: {
      online:      "SYSTEM ACTIVE",
      a2a:         "msgs",
      toggleTheme: "Toggle theme",
      command:     "Quick command",
      notifications: "Notifications",
      unread:      "unread",
      viewAll:     "View all",
      commandTitle: "Quick Command",
      commandPlaceholder: "Type a command or question...",
      commandHint: "Press Enter to send",
      suggestions: ["Analyze cash flow", "Today's leads", "Generate copy", "Pending tasks"],
    },
    modules: {
      "/nucleus":   "AI Hub",
      "/finance":   "Finance — Analysis & Insights",
      "/sdr":       "Sales — Pipeline Management",
      "/marketing": "Marketing — Campaigns & Content",
      "/ops":       "Operations — Processes & Tasks",
      "/agents":    "Automations — Configuration",
      "/channels":  "Channels — WhatsApp & Integrations",
      "/extension": "CRM Extension",
      "/suporte":   "Help Center",
    },
  },
  es: {
    nav: {
      nucleus:   "Hub de IA",
      finance:   "Finanzas",
      sdr:       "Ventas",
      marketing: "Marketing",
      ops:       "Operaciones",
      agents:    "Automatizaciones",
      channels:  "Canales",
      extension: "Extensión CRM",
    },
    sidebar: {
      modules: "Módulos",
      status:  "SISTEMA ACTIVO",
    },
    header: {
      online:      "SISTEMA ACTIVO",
      a2a:         "msgs",
      toggleTheme: "Cambiar tema",
      command:     "Comando rápido",
      notifications: "Notificaciones",
      unread:      "no leídas",
      viewAll:     "Ver todas",
      commandTitle: "Comando Rápido",
      commandPlaceholder: "Escribe un comando o pregunta...",
      commandHint: "Presiona Enter para enviar",
      suggestions: ["Analizar flujo de caja", "Leads de hoy", "Generar copy", "Tareas pendientes"],
    },
    modules: {
      "/nucleus":   "Hub de IA",
      "/finance":   "Finanzas — Análisis e Insights",
      "/sdr":       "Ventas — Gestión de Pipeline",
      "/marketing": "Marketing — Campañas y Contenido",
      "/ops":       "Operaciones — Procesos y Tareas",
      "/agents":    "Automatizaciones — Configuración",
      "/channels":  "Canales — WhatsApp e Integraciones",
      "/extension": "Extensión CRM",
      "/suporte":   "Centro de Ayuda",
    },
  },
} as const;

export type Translations = typeof T.pt;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangCtx>({
  lang: "pt",
  setLang: () => {},
  t: T.pt,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("reactor-lang") as Lang | null;
    if (saved && ["pt", "en", "es"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("reactor-lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] as unknown as Translations }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
