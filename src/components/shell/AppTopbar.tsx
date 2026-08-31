"use client";

import React from "react";
import { useApi } from "@/lib/hooks/useApi";

interface HealthPayload {
  status: string;
  integrations: { supabase: string; kommo: string; ai_engine: string };
}

const DOT: Record<string, string> = {
  connected: "#1f7a4d",
  configured: "#1f7a4d",
  unreachable: "#b3324a",
  demo_mode: "#8d6fde",
  missing: "#d9cffa",
};

function Signal({ label, state }: { label: string; state: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs font-medium text-ink-3">
      <span className="h-1.5 w-1.5 rounded-pill" style={{ background: DOT[state] ?? DOT.missing }} />
      {label}
    </span>
  );
}

export function AppTopbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { data } = useApi<HealthPayload>("/api/health");

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-hairline bg-canvas/85 px-9 backdrop-blur-sm">
      <div>
        <h1 className="text-[28px] font-thin leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="text-[13px] text-ink-2">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">
          <Signal label="Banco" state={data?.integrations.supabase ?? "missing"} />
          <Signal label="Kommo" state={data?.integrations.kommo ?? "missing"} />
          <Signal label="IA" state={data?.integrations.ai_engine ?? "missing"} />
        </div>
        {actions && (
          <div className="flex items-center gap-2 border-l border-hairline pl-5">{actions}</div>
        )}
      </div>
    </header>
  );
}
