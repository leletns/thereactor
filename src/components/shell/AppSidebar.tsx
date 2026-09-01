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
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[232px] flex-col border-r border-hairline bg-surface">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-[12px] font-medium text-white">
          R
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-medium tracking-[-0.01em] text-ink">The Reactor</p>
          <p className="text-2xs text-ink-3">Sistema da clínica</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-pill px-3.5 py-2 text-[14px] tracking-[-0.01em] transition-colors",
                active
                  ? "bg-wash font-semibold text-ink"
                  : "font-medium text-ink-2 hover:bg-wash/60 hover:text-ink"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active ? "text-violet" : "text-ink-3")}
                strokeWidth={1.5}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-pill border border-hairline-strong text-[10px] font-medium text-ink-2">
            BC
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-medium text-ink">Blue Clínica</p>
            <p className="text-2xs text-ink-3">Comercial</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
