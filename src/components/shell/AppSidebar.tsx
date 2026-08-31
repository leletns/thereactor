"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Wallet,
  CalendarDays,
  FileBarChart,
  Sparkles,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/visao-geral", label: "Visão geral", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/copiloto", label: "Copiloto", icon: Sparkles },
  { href: "/integracoes", label: "Integrações", icon: Plug },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[236px] flex-col border-r border-hairline bg-surface">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6161ff,#9450fd)" }}
        >
          R
        </span>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-ink">The Reactor</p>
          <p className="text-2xs text-ink-3">Sistema da clínica</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-violet-soft text-violet"
                  : "text-ink-2 hover:bg-ink/[0.04] hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sunken text-[11px] font-semibold text-ink-2">
            BC
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium text-ink">Blue Clínica</p>
            <p className="text-2xs text-ink-3">Comercial</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
