"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AgentStatus } from "@/lib/nucleus/registry";

interface StatusBadgeProps {
  status: AgentStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; dotColor: string; textColor: string; bgColor: string; animated: boolean }
> = {
  online: {
    label: "Online",
    dotColor: "bg-reactor-green",
    textColor: "text-reactor-green",
    bgColor: "bg-reactor-green/10 border-reactor-green/20",
    animated: false,
  },
  processing: {
    label: "Processando",
    dotColor: "bg-reactor-cyan",
    textColor: "text-reactor-cyan",
    bgColor: "bg-reactor-cyan/10 border-reactor-cyan/20",
    animated: true,
  },
  idle: {
    label: "Aguardando",
    dotColor: "bg-yellow-400",
    textColor: "text-yellow-400",
    bgColor: "bg-yellow-400/10 border-yellow-400/20",
    animated: false,
  },
  offline: {
    label: "Offline",
    dotColor: "bg-white/30",
    textColor: "text-white/40",
    bgColor: "bg-white/5 border-white/10",
    animated: false,
  },
};

const SIZE_CONFIG = {
  sm: { dot: "h-1.5 w-1.5", text: "text-xs", padding: "px-2 py-0.5 gap-1" },
  md: { dot: "h-2 w-2", text: "text-xs", padding: "px-2.5 py-1 gap-1.5" },
  lg: { dot: "h-2.5 w-2.5", text: "text-sm", padding: "px-3 py-1.5 gap-2" },
};

export function StatusBadge({
  status,
  showLabel = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border transition-colors",
        sizeConfig.padding,
        config.bgColor,
        className
      )}
    >
      <span className={cn("relative flex shrink-0", sizeConfig.dot)}>
        {config.animated && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              config.dotColor
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full",
            sizeConfig.dot,
            config.dotColor,
            !config.animated &&
              status === "online" &&
              "shadow-[0_0_6px_rgba(0,255,136,0.6)]"
          )}
        />
      </span>
      {showLabel && (
        <span className={cn("font-medium", sizeConfig.text, config.textColor)}>
          {config.label}
        </span>
      )}
    </span>
  );
}
