"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, Users, Megaphone,
  Settings2, Bot, MessageSquare, Settings,
  Puzzle, HelpCircle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLang } from "@/lib/i18n";
import { LhexLogo } from "@/components/reactor/LhexLogo";

interface ReactorSidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export function ReactorSidebar({ onClose, mobile }: ReactorSidebarProps) {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();

  const NAV_ITEMS = [
    { key: "nucleus"   as const, href: "/nucleus",   icon: Brain         },
    { key: "finance"   as const, href: "/finance",   icon: TrendingUp    },
    { key: "sdr"       as const, href: "/sdr",       icon: Users         },
    { key: "marketing" as const, href: "/marketing", icon: Megaphone     },
    { key: "ops"       as const, href: "/ops",       icon: Settings2     },
    { key: "agents"    as const, href: "/agents",    icon: Bot           },
    { key: "channels"  as const, href: "/channels",  icon: MessageSquare },
    { key: "extension" as const, href: "/extension", icon: Puzzle, badge: "BETA" },
  ];

  const handleNav = () => { if (mobile && onClose) onClose(); };

  return (
    <aside
      className="reactor-sidebar h-full w-[240px] flex flex-col"
      style={{ position: mobile ? "relative" : "fixed", left: 0, top: 0 }}
    >
      {/* ── Logo ── */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--reactor-border-color)" }}>
        <Link href="/" className="group flex items-center gap-3" onClick={handleNav}>
          {/* LHEX crystal logo */}
          <div className="shrink-0 animate-lhex-float" style={{ filter: "drop-shadow(0 0 12px rgba(95,255,215,0.35))" }}>
            <LhexLogo size={38} />
          </div>

          {/* Brand text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-0 font-mono text-[12px] font-semibold tracking-[0.18em]">
              <span style={{ color: "#5FFFD7", textShadow: "0 0 10px rgba(95,255,215,0.7)" }}>L</span>
              <span style={{ color: "#5FFFD7", opacity: 0.6 }}>.</span>
              <span style={{ color: "#7B2FBE", textShadow: "0 0 10px rgba(123,47,190,0.8)" }}>H</span>
              <span style={{ color: "#5FFFD7", opacity: 0.6 }}>.</span>
              <span style={{ color: "#5FFFD7", textShadow: "0 0 10px rgba(95,255,215,0.7)" }}>E</span>
              <span style={{ color: "#5FFFD7", opacity: 0.6 }}>.</span>
              <span style={{ color: "#5FFFD7", textShadow: "0 0 10px rgba(95,255,215,0.7)" }}>X</span>
              <span className="ml-0.5 text-[8px]" style={{ color: "var(--reactor-text-muted)" }}>®</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="font-sans text-[9px] font-medium uppercase tracking-[0.2em]"
                style={{ color: "var(--reactor-text-muted)" }}
              >
                The Reactor
              </span>
              <span
                className="font-mono text-[7px] px-1 py-px"
                style={{
                  background: "rgba(95,255,215,0.08)",
                  border: "1px solid rgba(95,255,215,0.15)",
                  color: "#5FFFD7",
                  borderRadius: 2,
                }}
              >
                v2
              </span>
            </div>
          </div>

          {/* Mobile close */}
          {mobile && onClose && (
            <button
              onClick={(e) => { e.preventDefault(); onClose(); }}
              className="shrink-0 h-7 w-7 flex items-center justify-center rounded transition-colors"
              style={{ color: "var(--reactor-text-muted)" }}
              onMouseEnter={e => { (e.currentTarget).style.color = "#5FFFD7"; }}
              onMouseLeave={e => { (e.currentTarget).style.color = "var(--reactor-text-muted)"; }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="mb-2 px-3">
          <span
            className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--reactor-text-muted)" }}
          >
            {t.sidebar.modules}
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} onClick={handleNav}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1 }}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer"
                style={
                  isActive
                    ? {
                        background: "var(--reactor-nav-active-bg)",
                        border: "1px solid var(--reactor-nav-active-border)",
                        color: "var(--lhex-green)",
                      }
                    : { border: "1px solid transparent", color: "var(--reactor-text-2)" }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--reactor-text)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--reactor-text-2)";
                  }
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
                    style={{ background: "var(--lhex-green)", boxShadow: "0 0 8px var(--lhex-green)" }}
                  />
                )}
                <Icon className="h-[15px] w-[15px] shrink-0" style={{ opacity: isActive ? 1 : 0.45 }} />
                <span className="flex-1 text-[13px] font-medium">{t.nav[item.key]}</span>
                {"badge" in item && item.badge && (
                  <span
                    className="font-mono text-[8px] px-1.5 py-px tracking-widest"
                    style={{
                      background: "rgba(95,255,215,0.07)",
                      border: "1px solid rgba(95,255,215,0.15)",
                      color: "var(--lhex-green)",
                      borderRadius: 2,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Suporte link */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--reactor-border-color)" }}>
          <Link href="/suporte" onClick={handleNav}>
            <motion.div
              whileHover={{ x: 2 }}
              transition={{ duration: 0.1 }}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer"
              style={
                pathname === "/suporte"
                  ? { background: "var(--reactor-nav-active-bg)", border: "1px solid var(--reactor-nav-active-border)", color: "var(--lhex-green)" }
                  : { border: "1px solid transparent", color: "var(--reactor-text-2)" }
              }
              onMouseEnter={e => {
                if (pathname !== "/suporte") {
                  (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)";
                  (e.currentTarget as HTMLDivElement).style.color = "var(--reactor-text)";
                }
              }}
              onMouseLeave={e => {
                if (pathname !== "/suporte") {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.color = "var(--reactor-text-2)";
                }
              }}
            >
              <HelpCircle className="h-[15px] w-[15px] shrink-0" style={{ opacity: 0.45 }} />
              <span className="flex-1 text-[13px] font-medium">
                {lang === "en" ? "Help & FAQ" : lang === "es" ? "Ayuda y FAQ" : "Ajuda e FAQ"}
              </span>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-2 pb-3 pt-2 border-t space-y-2" style={{ borderColor: "var(--reactor-border-color)" }}>
        {/* User */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded cursor-pointer"
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <Avatar className="h-7 w-7 shrink-0" style={{ borderRadius: 4 }}>
            <AvatarFallback
              className="font-mono text-[10px] font-bold"
              style={{
                background: "rgba(95,255,215,0.08)",
                border: "1px solid rgba(95,255,215,0.15)",
                color: "var(--lhex-green)",
                borderRadius: 4,
              }}
            >
              LX
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate" style={{ color: "var(--reactor-text-2)" }}>
              lhex systems
            </p>
            <p className="font-mono text-[9px] truncate" style={{ color: "var(--reactor-text-muted)" }}>
              admin
            </p>
          </div>
          <Link href="/settings">
            <Settings className="h-3.5 w-3.5" style={{ color: "var(--reactor-text-muted)" }} />
          </Link>
        </div>

        {/* Language */}
        <div className="flex gap-1 px-1">
          {(["pt", "en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest rounded transition-all"
              style={
                lang === l
                  ? { background: "rgba(95,255,215,0.08)", color: "var(--lhex-green)", border: "1px solid rgba(95,255,215,0.2)" }
                  : { background: "transparent", color: "var(--reactor-text-muted)", border: "1px solid transparent" }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* Status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded mx-1"
          style={{ background: "rgba(95,255,215,0.04)", border: "1px solid rgba(95,255,215,0.08)" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--lhex-green)" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--lhex-green)" }} />
          </span>
          <span className="font-mono text-[9px] font-semibold tracking-widest" style={{ color: "var(--lhex-green)" }}>
            {t.sidebar.status}
          </span>
        </div>
      </div>
    </aside>
  );
}
