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
    { key: "extension" as const, href: "/extension", icon: Puzzle        },
  ];

  const handleNav = () => { if (mobile && onClose) onClose(); };

  return (
    <aside
      className="reactor-sidebar h-full w-[240px] flex flex-col"
      style={{ position: mobile ? "relative" : "fixed", left: 0, top: 0 }}
    >
      {/* ── Logo ── */}
      <div
        className="px-4 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "var(--reactor-border-color)" }}
      >
        <Link href="/" className="flex items-center gap-2.5" onClick={handleNav}>
          <div className="lhex-logo-pulse shrink-0">
            <LhexLogo size={32} />
          </div>
          <div>
            {/* L.H.E.X mark */}
            <div className="flex items-center font-mono text-[11px] font-semibold tracking-[0.15em]">
              <span style={{ color: "var(--lhex-green)" }}>L</span>
              <span style={{ color: "var(--reactor-text-muted)" }}>.</span>
              <span style={{ color: "var(--lhex-purple)" }}>H</span>
              <span style={{ color: "var(--reactor-text-muted)" }}>.</span>
              <span style={{ color: "var(--lhex-green)" }}>E</span>
              <span style={{ color: "var(--reactor-text-muted)" }}>.</span>
              <span style={{ color: "var(--lhex-green)" }}>X</span>
              <span className="text-[7px] ml-0.5" style={{ color: "var(--reactor-text-muted)" }}>®</span>
            </div>
            <p
              className="text-[9px] font-medium uppercase tracking-[0.18em] mt-0.5"
              style={{ color: "var(--reactor-text-muted)" }}
            >
              The Reactor
            </p>
          </div>
        </Link>

        {mobile && onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--reactor-text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p
          className="px-2 mb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--reactor-text-muted)" }}
        >
          {t.sidebar.modules}
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} onClick={handleNav}>
              <div
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all text-[13px] font-medium",
                  isActive
                    ? "font-semibold"
                    : "hover:bg-[var(--reactor-nav-hover)]"
                )}
                style={{
                  color: isActive ? "var(--lhex-green)" : "var(--reactor-text-2)",
                  background: isActive ? "var(--reactor-nav-active-bg)" : "transparent",
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                    style={{ background: "var(--lhex-green)" }}
                  />
                )}
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ opacity: isActive ? 1 : 0.5 }}
                />
                <span>{t.nav[item.key]}</span>
              </div>
            </Link>
          );
        })}

        {/* Divider + Suporte */}
        <div className="pt-3 mt-1 border-t" style={{ borderColor: "var(--reactor-border-color)" }}>
          <Link href="/suporte" onClick={handleNav}>
            <div
              className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all text-[13px] font-medium"
              style={{
                color: pathname === "/suporte" ? "var(--lhex-green)" : "var(--reactor-text-2)",
                background: pathname === "/suporte" ? "var(--reactor-nav-active-bg)" : "transparent",
              }}
            >
              <HelpCircle className="h-4 w-4 shrink-0" style={{ opacity: 0.5 }} />
              <span>{lang === "en" ? "Help & FAQ" : lang === "es" ? "Ayuda" : "Ajuda e FAQ"}</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div
        className="px-3 py-3 border-t space-y-2"
        style={{ borderColor: "var(--reactor-border-color)" }}
      >
        {/* User row */}
        <div
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors"
          style={{ color: "var(--reactor-text-2)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          {/* Avatar text */}
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0"
            style={{
              background: "rgba(0,168,133,0.1)",
              color: "var(--lhex-green)",
              border: "1px solid rgba(0,168,133,0.15)",
            }}
          >
            LX
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate" style={{ color: "var(--reactor-text)" }}>
              lhex systems
            </p>
            <p className="font-mono text-[9px] truncate" style={{ color: "var(--reactor-text-muted)" }}>
              admin
            </p>
          </div>
          <Link href="/settings" onClick={e => e.stopPropagation()}>
            <Settings className="h-3.5 w-3.5" style={{ color: "var(--reactor-text-muted)" }} />
          </Link>
        </div>

        {/* Language switcher */}
        <div className="flex gap-1">
          {(["pt", "en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-1 rounded font-mono text-[9px] font-semibold uppercase tracking-widest transition-all"
              style={
                lang === l
                  ? {
                      background: "rgba(0,168,133,0.1)",
                      color: "var(--lhex-green)",
                      border: "1px solid rgba(0,168,133,0.2)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--reactor-text-muted)",
                      border: "1px solid transparent",
                    }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-2 px-2">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: "var(--lhex-green)" }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: "var(--lhex-green)" }}
            />
          </span>
          <span className="font-mono text-[9px] tracking-widest" style={{ color: "var(--reactor-text-muted)" }}>
            {t.sidebar.status}
          </span>
        </div>
      </div>
    </aside>
  );
}
