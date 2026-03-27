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
import { useLang } from "@/lib/i18n";

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Lead qualificado: TechCorp Solutions (score: 87)", time: "2m", read: false },
  { id: 2, text: "Fluxo de caixa abaixo do esperado em R$ 12.400", time: "15m", read: false },
  { id: 3, text: "3 mensagens sem resposta no WhatsApp", time: "32m", read: true },
];

export function ReactorHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  const [a2aCount, setA2aCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [commandValue, setCommandValue] = useState("");
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  const moduleName =
    (t.modules as Record<string, string>)[pathname] ?? "The Reactor";
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setA2aCount((prev) => (prev + Math.floor(Math.random() * 3)) % 9999);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const iconBtn = "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer";

  return (
    <>
      <header
        className="reactor-header h-14 flex items-center justify-between px-6 sticky top-0 z-30"
      >
        {/* Module name */}
        <h1
          className="text-sm font-semibold"
          style={{ color: "var(--reactor-text)" }}
        >
          {moduleName}
        </h1>

        {/* Center: status indicators */}
        <div className="hidden md:flex items-center gap-3">
          <div
            className="status-pill-green flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0, 255, 136, 0.06)",
              border: "1px solid rgba(0, 255, 136, 0.14)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-reactor-green opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-reactor-green" />
            </span>
            <span className="status-text-green text-[11px] font-semibold text-reactor-green tracking-wider">
              {t.header.online}
            </span>
          </div>

          <div
            className="status-pill-cyan hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0, 245, 255, 0.05)",
              border: "1px solid rgba(0, 245, 255, 0.12)",
            }}
          >
            <Activity className="h-3 w-3 text-reactor-cyan" />
            <span className="status-text-cyan text-[11px] font-medium text-reactor-cyan tabular-nums">
              A2A: {a2aCount.toLocaleString("pt-BR")} {t.header.a2a}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            className={iconBtn}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={t.header.toggleTheme}
            style={{ color: "var(--reactor-text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#00f5ff";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,245,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text-muted)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>

          {/* Quick command */}
          <button
            className={iconBtn}
            onClick={() => setShowCommand(true)}
            title={t.header.command}
            style={{ color: "var(--reactor-text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#00f5ff";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,245,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text-muted)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <Terminal className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className={cn(iconBtn, "relative")}
              onClick={() => setShowNotifications(!showNotifications)}
              title={t.header.notifications}
              style={{ color: "var(--reactor-text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--reactor-nav-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text-muted)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-reactor-cyan text-[9px] font-bold text-[#0a0a0f]">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="reactor-notif-panel absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
                  style={{ background: "var(--reactor-card-bg)" }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center justify-between"
                    style={{ borderColor: "var(--reactor-border-solid)" }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--reactor-text)" }}
                    >
                      {t.header.notifications}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--reactor-text-muted)" }}
                    >
                      {unreadCount} {t.header.unread}
                    </span>
                  </div>

                  <div
                    className="divide-y"
                    style={{ borderColor: "var(--reactor-border-solid)" }}
                  >
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "px-4 py-3 transition-colors cursor-pointer",
                          !n.read && "bg-reactor-cyan/3"
                        )}
                        style={{}}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : "rgba(0,245,255,0.02)";
                        }}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && (
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-reactor-cyan shrink-0" />
                          )}
                          <div className={cn(!n.read ? "" : "pl-3.5")}>
                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: "var(--reactor-text-2)" }}
                            >
                              {n.text}
                            </p>
                            <p
                              className="text-[10px] mt-1"
                              style={{ color: "var(--reactor-text-muted)" }}
                            >
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="px-4 py-2 border-t"
                    style={{ borderColor: "var(--reactor-border-solid)" }}
                  >
                    <button
                      className="text-xs text-reactor-cyan hover:opacity-70 transition-opacity w-full text-center"
                      onClick={() => setShowNotifications(false)}
                    >
                      {t.header.viewAll}
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
              {t.header.commandTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
              placeholder={t.header.commandPlaceholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && commandValue.trim()) {
                  window.location.href = `/nucleus?q=${encodeURIComponent(commandValue)}`;
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {t.header.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setCommandValue(s)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: "var(--reactor-surface)",
                    border: "1px solid var(--reactor-border-solid)",
                    color: "var(--reactor-text-2)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,245,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text-2)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--reactor-border-solid)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--reactor-text-muted)" }}>
              {t.header.commandHint}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
