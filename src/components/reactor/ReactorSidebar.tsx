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

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Nucleus", href: "/nucleus", icon: Brain },
  { label: "Financeiro", href: "/finance", icon: TrendingUp },
  { label: "SDR", href: "/sdr", icon: Users },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Operações", href: "/ops", icon: Settings2 },
  { label: "Agent Studio", href: "/agents", icon: Bot },
  { label: "Canais", href: "/channels", icon: MessageSquare },
  { label: "CRM Extension", href: "/extension", icon: Puzzle, badge: "NEW" },
];

export function ReactorSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[240px] flex flex-col z-40"
      style={{
        background: "#0f0f1a",
        borderRight: "1px solid rgba(0, 245, 255, 0.08)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-reactor-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-reactor-cyan/10 border border-reactor-cyan/20 group-hover:border-reactor-cyan/40 transition-all duration-200">
            <Zap className="h-4.5 w-4.5 text-reactor-cyan" style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <div
              className="text-sm font-bold text-reactor-cyan tracking-widest uppercase"
              style={{
                textShadow: "0 0 10px rgba(0,245,255,0.6)",
                letterSpacing: "0.15em",
              }}
            >
              THE REACTOR
            </div>
            <div className="text-[10px] text-white/30 tracking-widest uppercase">
              lhex systems
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="mb-3 px-2">
          <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">
            Módulos
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                  isActive
                    ? "text-reactor-cyan bg-reactor-cyan/8"
                    : "text-white/50 hover:text-white/80 hover:bg-white/4"
                )}
                style={
                  isActive
                    ? {
                        background: "rgba(0,245,255,0.06)",
                        border: "1px solid rgba(0,245,255,0.12)",
                        boxShadow: "0 0 20px rgba(0,245,255,0.06)",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{
                      background: "#00f5ff",
                      boxShadow: "0 0 8px rgba(0,245,255,0.8)",
                    }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-reactor-cyan"
                      : "text-white/30 group-hover:text-white/60"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
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
      <div className="p-3 border-t border-reactor-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/4 transition-colors cursor-pointer group">
          <Avatar className="h-8 w-8 border-reactor-cyan/20">
            <AvatarFallback className="bg-reactor-cyan/10 text-reactor-cyan text-xs font-bold">
              LH
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 truncate">lhex systems</p>
            <p className="text-[10px] text-white/30 truncate">admin@lhex.com</p>
          </div>
          <Link href="/settings">
            <Settings className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>
        </div>

        {/* System status */}
        <div className="mt-2 px-2 py-2 rounded-lg bg-reactor-green/5 border border-reactor-green/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-reactor-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-reactor-green" />
            </span>
            <span className="text-[10px] text-reactor-green font-medium">
              REACTOR ONLINE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
