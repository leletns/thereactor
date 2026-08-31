"use client";

import React from "react";
import { useApi } from "@/lib/hooks/useApi";

interface HealthPayload {
  status: string;
  integrations: { supabase: string; kommo: string; ai_engine: string };
}

const DOT: Record<string, string> = {
  connected: "#00852e",
  configured: "#00852e",
  unreachable: "#c8102e",
  missing: "#c9ced8",
  demo_mode: "#b26a00",
};

function Signal({ label, state }: { label: string; state: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs text-ink-3">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: DOT[state] ?? "#c9ced8" }}
      />
      {label}
    </span>
  );
}

export function AppTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { data } = useApi<HealthPayload>("/api/health");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-hairline bg-surface/90 px-8 backdrop-blur">
      <div>
        <h1 className="font-display text-[19px] font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-ink-3">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <Signal label="Banco" state={data?.integrations.supabase ?? "missing"} />
        <Signal label="Kommo" state={data?.integrations.kommo ?? "missing"} />
        <Signal label="IA" state={data?.integrations.ai_engine ?? "missing"} />
      </div>
    </header>
  );
}
