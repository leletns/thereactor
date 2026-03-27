"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, Users, Megaphone,
  Settings2, Bot, MessageSquare, Settings, Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLang } from "@/lib/i18n";

export function ReactorSidebar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();

  const NAV_ITEMS = [
    { key: "nucleus"   as const, href: "/nucleus",   icon: Brain          },
    { key: "finance"   as const, href: "/finance",   icon: TrendingUp     },
    { key: "sdr"       as const, href: "/sdr",       icon: Users          },
    { key: "marketing" as const, href: "/marketing", icon: Megaphone      },
    { key: "ops"       as const, href: "/ops",       icon: Settings2      },
    { key: "agents"    as const, href: "/agents",    icon: Bot            },
    { key: "channels"  as const, href: "/channels",  icon: MessageSquare  },
    { key: "extension" as const, href: "/extension", icon: Puzzle, badge: "BETA" },
  ];

  return (
    <aside className="reactor-sidebar fixed left-0 top-0 h-full w-[240px] flex flex-col z-40">

      {/* ── Logo LHEX ── */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--reactor-border-color)" }}>
        <Link href="/" className="group flex flex-col gap-0.5">
          {/* L.H.E.X mark */}
          <div className="flex items-center gap-0 font-mono text-[13px] font-semibold tracking-[0.2em]">
            <span style={{ color: "#5FFFD7", textShadow: "0 0 14px rgba(95,255,215,0.8)" }}>L</span>
            <span style={{ color: "#5FFFD7", textShadow: "0 0 14px rgba(95,255,215,0.8)" }}>.</span>
            <span style={{ color: "#7B2FBE", textShadow: "0 0 14px rgba(123,47,190,0.9)" }}>H</span>
            <span style={{ color: "#5FFFD7", textShadow: "0 0 14px rgba(95,255,215,0.8)" }}>.</span>
            <span style={{ color: "#5FFFD7", textShadow: "0 0 14px rgba(95,255,215,0.8)" }}>E</span>
            <span style={{ color: "#5FFFD7", textShadow: "0 0 14px rgba(95,255,215,0.8)" }}>.</span>
            <span style={{ color: "#5FFFD7", textShadow: "0 0 14px rgba(95,255,215,0.8)" }}>X</span>
            <span className="ml-1 text-[9px] font-light" style={{ color: "var(--reactor-text-muted)" }}>®</span>
          </div>
          {/* Product name */}
          <div className="flex items-baseline gap-2">
            <span
              className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--reactor-text-muted)", letterSpacing: "0.22em" }}
            >
              The Reactor
            </span>
            <span
              className="text-[8px] font-mono px-1 py-px rounded"
              style={{
                background: "rgba(95,255,215,0.08)",
                border: "1px solid rgba(95,255,215,0.15)",
                color: "#5FFFD7",
                letterSpacing: "0.1em",
              }}
            >
              v2
            </span>
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="mb-3 px-2">
          <span
            className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--reactor-text-muted)" }}
          >
            {t.sidebar.modules}
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.12 }}
                className={cn("relative flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer group")}
                style={
                  isActive
                    ? {
                        background: "var(--reactor-nav-active-bg)",
                        border: "1px solid var(--reactor-nav-active-border)",
                        color: "#5FFFD7",
                      }
                    : {
                        border: "1px solid transparent",
                        color: "var(--reactor-text-2)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--reactor-text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--reactor-text-2)";
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
                    style={{ background: "#5FFFD7", boxShadow: "0 0 8px rgba(95,255,215,0.9)" }}
                  />
                )}

                <Icon className="h-[15px] w-[15px] shrink-0" style={{ opacity: isActive ? 1 : 0.45 }} />

                <span className="flex-1 text-[13px] font-medium tracking-wide">
                  {t.nav[item.key]}
                </span>

                {"badge" in item && item.badge && (
                  <span
                    className="font-mono text-[9px] px-1.5 py-px rounded tracking-widest"
                    style={{
                      background: "rgba(95,255,215,0.08)",
                      border: "1px solid rgba(95,255,215,0.18)",
                      color: "#5FFFD7",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-3 pt-2 border-t space-y-2" style={{ borderColor: "var(--reactor-border-color)" }}>

        {/* User */}
        <div
          className="flex items-center gap-3 px-2 py-2 rounded cursor-pointer"
          style={{ borderRadius: "4px" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <Avatar className="h-7 w-7 rounded" style={{ borderRadius: "4px" }}>
            <AvatarFallback
              className="font-mono text-[11px] font-bold rounded"
              style={{
                background: "rgba(95,255,215,0.08)",
                border: "1px solid rgba(95,255,215,0.18)",
                color: "#5FFFD7",
                borderRadius: "4px",
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
            <Settings className="h-3.5 w-3.5 transition-colors" style={{ color: "var(--reactor-text-muted)" }} />
          </Link>
        </div>

        {/* Language */}
        <div className="flex gap-1">
          {(["pt", "en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest rounded transition-all"
              style={
                lang === l
                  ? {
                      background: "rgba(95,255,215,0.08)",
                      color: "#5FFFD7",
                      border: "1px solid rgba(95,255,215,0.2)",
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

        {/* Status */}
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded"
          style={{
            background: "rgba(95,255,215,0.04)",
            border: "1px solid rgba(95,255,215,0.08)",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#5FFFD7" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#5FFFD7" }} />
          </span>
          <span className="font-mono text-[9px] font-semibold tracking-widest" style={{ color: "#5FFFD7" }}>
            {t.sidebar.status}
          </span>
        </div>
      </div>
    </aside>
  );
}
