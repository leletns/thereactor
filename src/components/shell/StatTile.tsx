"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "violet" | "grass" | "amber" | "rose" | "neutral";

/** Icons carry the accent; the tile surface stays white. */
const TONES: Record<Tone, string> = {
  violet: "text-violet",
  grass: "text-grass",
  amber: "text-amber",
  rose: "text-rose",
  neutral: "text-ink-3",
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
  return (
    <div className="rx-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        <Icon className={cn("h-4 w-4", TONES[tone])} strokeWidth={1.5} />
      </div>

      {loading ? (
        <div className="h-8 w-28 animate-pulse rounded-pill bg-sunken" />
      ) : (
        <p className="rx-figure text-[30px] leading-none text-ink">{value}</p>
      )}

      {hint && <p className="mt-2.5 text-2xs text-ink-3">{hint}</p>}
    </div>
  );
}
