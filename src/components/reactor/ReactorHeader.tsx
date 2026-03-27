"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, Activity, Terminal, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MODULE_NAMES: Record<string, string> = {
  "/nucleus": "Nucleus — Central de IA",
  "/finance": "Financeiro — Análise & Insights",
  "/sdr": "SDR — Pipeline de Vendas",
  "/marketing": "Marketing — Campanhas & Conteúdo",
  "/ops": "Operações — Processos & Tarefas",
  "/agents": "Agent Studio — Configuração",
  "/channels": "Canais — WhatsApp & Integrações",
};

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Lead qualificado: TechCorp Solutions (Score: 87)", time: "2m", read: false },
  { id: 2, text: "Fluxo de caixa abaixo do esperado em R$ 12.400", time: "15m", read: false },
  { id: 3, text: "3 mensagens WhatsApp sem resposta", time: "32m", read: true },
];

export function ReactorHeader() {
  const pathname = usePathname();
  const [a2aCount, setA2aCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [commandValue, setCommandValue] = useState("");
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  const { theme, setTheme } = useTheme();
  const moduleName = MODULE_NAMES[pathname] ?? "The Reactor";
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setA2aCount((prev) => (prev + Math.floor(Math.random() * 3)) % 9999);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-6 border-b border-reactor-border sticky top-0 z-30"
        style={{
          background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Module name */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white/80">{moduleName}</h1>
        </div>

        {/* Center: status indicators */}
        <div className="flex items-center gap-4">
          {/* Reactor Online */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-reactor-green/8 border border-reactor-green/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-reactor-green opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-reactor-green" />
            </span>
            <span className="text-[11px] font-semibold text-reactor-green tracking-wider">
              REACTOR ONLINE
            </span>
          </div>

          {/* A2A Activity */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-reactor-cyan/8 border border-reactor-cyan/15">
            <Activity className="h-3 w-3 text-reactor-cyan" />
            <span className="text-[11px] font-medium text-reactor-cyan tabular-nums">
              A2A: {a2aCount.toLocaleString("pt-BR")} msgs
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-white/40 hover:text-reactor-cyan"
            title="Alternar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Quick command */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowCommand(true)}
            className="text-white/40 hover:text-reactor-cyan"
            title="Comando rápido (⌘K)"
          >
            <Terminal className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-white/40 hover:text-white relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-reactor-cyan text-[9px] font-bold text-[#0a0a0f]">
                  {unreadCount}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-reactor-border bg-reactor-card shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-reactor-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      Notificações
                    </span>
                    <span className="text-xs text-white/30">{unreadCount} não lidas</span>
                  </div>
                  <div className="divide-y divide-reactor-border">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer",
                          !n.read && "bg-reactor-cyan/3"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && (
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-reactor-cyan shrink-0" />
                          )}
                          <div className={cn(!n.read ? "" : "pl-3.5")}>
                            <p className="text-xs text-white/70 leading-relaxed">{n.text}</p>
                            <p className="text-[10px] text-white/30 mt-1">há {n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-reactor-border">
                    <button
                      className="text-xs text-reactor-cyan hover:text-white transition-colors w-full text-center"
                      onClick={() => setShowNotifications(false)}
                    >
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Quick Command Dialog */}
      <Dialog open={showCommand} onOpenChange={setShowCommand}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-reactor-cyan" />
              Comando Rápido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
              placeholder="Digite um comando ou pergunta para o Reactor..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && commandValue.trim()) {
                  window.location.href = `/nucleus?q=${encodeURIComponent(commandValue)}`;
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {[
                "Analisar fluxo de caixa",
                "Score dos leads de hoje",
                "Gerar copy para campanha",
                "Tarefas pendentes",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setCommandValue(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-reactor-surface border border-reactor-border text-white/50 hover:text-white hover:border-reactor-cyan/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30">
              Pressione Enter para enviar ao Nucleus
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
