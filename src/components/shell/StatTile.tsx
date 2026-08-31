"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "violet" | "grass" | "amber" | "rose" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  violet: { bg: "bg-violet-soft", fg: "text-violet" },
  grass: { bg: "bg-grass-soft", fg: "text-grass" },
  amber: { bg: "bg-amber-soft", fg: "text-amber" },
  rose: { bg: "bg-rose-soft", fg: "text-rose" },
  neutral: { bg: "bg-sunken", fg: "text-ink-2" },
};

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  loading = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  loading?: boolean;
}) {
  const tones = TONES[tone];

  return (
    <div className="rx-card p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs font-medium text-ink-3">{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones.bg)}>
          <Icon className={cn("h-4 w-4", tones.fg)} strokeWidth={2} />
        </span>
      </div>

      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-sunken" />
      ) : (
        <p className="rx-numeric text-[26px] font-semibold leading-none text-ink">{value}</p>
      )}

      {hint && <p className="mt-2 text-2xs text-ink-3">{hint}</p>}
    </div>
  );
}
