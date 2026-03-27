"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Terminal, Sun, Moon, Zap, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Lead qualificado: TechCorp Solutions (score: 87)", time: "2m",  read: false },
  { id: 2, text: "Fluxo de caixa abaixo do esperado — R$ 12.400",   time: "15m", read: false },
  { id: 3, text: "3 mensagens sem resposta no WhatsApp",             time: "32m", read: true  },
];

interface ReactorHeaderProps {
  onMenuToggle: () => void;
}

export function ReactorHeader({ onMenuToggle }: ReactorHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  const [pulse, setPulse] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [commandValue, setCommandValue] = useState("");
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  const moduleName = (t.modules as Record<string, string>)[pathname] ?? "The Reactor";
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => (p + Math.floor(Math.random() * 3)) % 9999), 2200);
    return () => clearInterval(iv);
  }, []);

  const iconBase = "h-8 w-8 rounded flex items-center justify-center cursor-pointer transition-all";

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = "var(--lhex-green)";
    e.currentTarget.style.background = "rgba(95,255,215,0.06)";
    e.currentTarget.style.borderColor = "rgba(95,255,215,0.14)";
  };
  const onLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = "var(--reactor-text-muted)";
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.borderColor = "transparent";
  };

  return (
    <>
      <header className="reactor-header h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        {/* Left: hamburger (mobile) + module name */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded transition-all"
            style={{ color: "var(--reactor-text-2)", border: "1px solid var(--reactor-border-color)" }}
            onClick={onMenuToggle}
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <h1 className="font-sans text-[13px] font-semibold truncate max-w-[180px] md:max-w-none" style={{ color: "var(--reactor-text)" }}>
            {moduleName}
          </h1>
        </div>

        {/* Centre — status pills (hidden on small screens) */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded"
            style={{ background: "rgba(95,255,215,0.04)", border: "1px solid rgba(95,255,215,0.1)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: "var(--lhex-green)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--lhex-green)" }} />
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em]" style={{ color: "var(--lhex-green)" }}>
              {t.header.online}
            </span>
          </div>

          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded"
            style={{ background: "rgba(123,47,190,0.06)", border: "1px solid rgba(123,47,190,0.13)" }}
          >
            <span className="font-mono text-[10px] font-medium tabular-nums" style={{ color: "var(--lhex-purple)" }}>
              {pulse.toLocaleString("pt-BR")} ops
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <button
            className={iconBase}
            style={{ color: "var(--reactor-text-muted)", border: "1px solid transparent" }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={t.header.toggleTheme}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            className={cn(iconBase, "hidden md:flex")}
            style={{ color: "var(--reactor-text-muted)", border: "1px solid transparent" }}
            onClick={() => setShowCommand(true)}
            title={t.header.command}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <Terminal className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              className={cn(iconBase, "relative")}
              style={{ color: "var(--reactor-text-muted)", border: "1px solid transparent" }}
              onClick={() => setShowNotifications(!showNotifications)}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full font-mono text-[9px] font-bold"
                  style={{ background: "var(--lhex-green)", color: "#000" }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.13 }}
                  className="reactor-notif-panel absolute right-0 top-full mt-2 rounded overflow-hidden z-50"
                  style={{ width: 300, background: "var(--reactor-card-bg)" }}
                >
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--reactor-border-solid)" }}>
                    <span className="font-sans text-[12px] font-semibold" style={{ color: "var(--reactor-text)" }}>
                      {t.header.notifications}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: "var(--reactor-text-muted)" }}>
                      {unreadCount} {t.header.unread}
                    </span>
                  </div>

                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className="px-4 py-3 cursor-pointer"
                      style={{ borderBottom: "1px solid var(--reactor-border-solid)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: "var(--lhex-green)" }} />}
                        <div className={cn(!n.read ? "" : "pl-3")}>
                          <p className="text-[12px] leading-relaxed" style={{ color: "var(--reactor-text-2)" }}>{n.text}</p>
                          <p className="font-mono text-[10px] mt-1" style={{ color: "var(--reactor-text-muted)" }}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="px-4 py-2">
                    <button
                      className="font-mono text-[10px] w-full text-center tracking-wide"
                      style={{ color: "var(--lhex-green)" }}
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

      {/* Command dialog */}
      <Dialog open={showCommand} onOpenChange={setShowCommand}>
        <DialogContent className="max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sans text-sm font-semibold">
              <Zap className="h-4 w-4" style={{ color: "var(--lhex-green)" }} />
              {t.header.commandTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={commandValue}
              onChange={e => setCommandValue(e.target.value)}
              placeholder={t.header.commandPlaceholder}
              autoFocus
              className="font-mono text-sm"
              onKeyDown={e => {
                if (e.key === "Enter" && commandValue.trim())
                  window.location.href = `/nucleus?q=${encodeURIComponent(commandValue)}`;
              }}
            />
            <div className="flex flex-wrap gap-2">
              {t.header.suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setCommandValue(s)}
                  className="font-mono text-[11px] px-3 py-1.5 rounded transition-all"
                  style={{ background: "var(--reactor-surface)", border: "1px solid var(--reactor-border-solid)", color: "var(--reactor-text-2)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(95,255,215,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--lhex-green)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--reactor-border-solid)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--reactor-text-2)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px]" style={{ color: "var(--reactor-text-muted)" }}>
              {t.header.commandHint}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
