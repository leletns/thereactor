"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Users,
  Megaphone,
  Settings2,
  Bot,
  MessageSquare,
  Settings,
  Zap,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLang } from "@/lib/i18n";

export function ReactorSidebar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();

  const NAV_ITEMS = [
    { key: "nucleus"   as const, href: "/nucleus",   icon: Brain       },
    { key: "finance"   as const, href: "/finance",   icon: TrendingUp  },
    { key: "sdr"       as const, href: "/sdr",       icon: Users       },
    { key: "marketing" as const, href: "/marketing", icon: Megaphone   },
    { key: "ops"       as const, href: "/ops",       icon: Settings2   },
    { key: "agents"    as const, href: "/agents",    icon: Bot         },
    { key: "channels"  as const, href: "/channels",  icon: MessageSquare },
    { key: "extension" as const, href: "/extension", icon: Puzzle, badge: "NEW" },
  ];

  return (
    <aside className="reactor-sidebar fixed left-0 top-0 h-full w-[240px] flex flex-col z-40">
      {/* Logo */}
      <div
        className="p-5 pb-4 border-b"
        style={{ borderColor: "var(--reactor-border-color)" }}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-reactor-cyan/10 border border-reactor-cyan/20 group-hover:border-reactor-cyan/40 transition-all duration-200">
            <Zap style={{ width: 18, height: 18 }} className="text-reactor-cyan" />
          </div>
          <div>
            <div
              className="text-sm font-bold text-reactor-cyan tracking-widest uppercase glow-text-cyan"
              style={{ letterSpacing: "0.15em" }}
            >
              THE REACTOR
            </div>
            <div
              className="text-[10px] tracking-widest uppercase"
              style={{ color: "var(--reactor-text-muted)", letterSpacing: "0.12em" }}
            >
              lhex systems
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="mb-3 px-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
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
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-200 cursor-pointer group relative",
                  isActive ? "nav-item-active" : ""
                )}
                style={
                  isActive
                    ? {
                        background: "rgba(0, 245, 255, 0.06)",
                        border: "1px solid rgba(0, 245, 255, 0.12)",
                        boxShadow: "0 0 20px rgba(0, 245, 255, 0.05)",
                        color: "#00f5ff",
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
                {isActive && (
                  <div
                    className="nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{
                      background: "#00f5ff",
                      boxShadow: "0 0 8px rgba(0, 245, 255, 0.8)",
                    }}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" style={{ opacity: isActive ? 1 : 0.5 }} />
                <span className="flex-1">{t.nav[item.key]}</span>
                {"badge" in item && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-reactor-cyan/15 text-reactor-cyan border border-reactor-cyan/20">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-3 border-t"
        style={{ borderColor: "var(--reactor-border-color)" }}
      >
        {/* User row */}
        <div
          className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors cursor-pointer group"
          style={{ color: "var(--reactor-text)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--reactor-nav-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <Avatar className="h-8 w-8 border border-reactor-cyan/20">
            <AvatarFallback className="bg-reactor-cyan/10 text-reactor-cyan text-xs font-bold">
              LH
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--reactor-text-2)" }}>
              lhex systems
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--reactor-text-muted)" }}>
              admin@lhex.com
            </p>
          </div>
          <Link href="/settings">
            <Settings
              className="h-4 w-4 transition-colors"
              style={{ color: "var(--reactor-text-muted)" }}
            />
          </Link>
        </div>

        {/* Language switcher */}
        <div className="mt-2 flex gap-1 px-1">
          {(["pt", "en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest transition-all"
              style={
                lang === l
                  ? {
                      background: "rgba(0, 245, 255, 0.12)",
                      color: "#00f5ff",
                      border: "1px solid rgba(0, 245, 255, 0.2)",
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

        {/* System status */}
        <div
          className="mt-2 px-2 py-2 rounded-lg"
          style={{
            background: "rgba(0, 255, 136, 0.05)",
            border: "1px solid rgba(0, 255, 136, 0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-reactor-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-reactor-green" />
            </span>
            <span className="text-[10px] text-reactor-green font-medium tracking-widest">
              {t.sidebar.status}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
