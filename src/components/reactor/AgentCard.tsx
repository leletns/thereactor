"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Users,
  Megaphone,
  Settings2,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Agent } from "@/lib/nucleus/registry";
import { StatusBadge } from "./StatusBadge";
import { GlowCard } from "@/components/ui/GlowCard";

const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  TrendingUp,
  Users,
  Megaphone,
  Settings2,
  MessageSquare,
};

interface AgentCardProps {
  agent: Agent;
  onClick?: (agent: Agent) => void;
  selected?: boolean;
  compact?: boolean;
}

export function AgentCard({ agent, onClick, selected, compact }: AgentCardProps) {
  const Icon = ICON_MAP[agent.icon] ?? Brain;
  const isProcessing = agent.status === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <GlowCard
        glowColor={`${agent.color}18`}
        className={cn("cursor-pointer", compact ? "p-3" : "p-4")}
        onClick={() => onClick?.(agent)}
        style={selected ? { borderColor: agent.color, boxShadow: `0 0 0 1px ${agent.color}40` } : undefined}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center rounded-xl transition-all duration-300",
                compact ? "h-9 w-9" : "h-10 w-10",
                isProcessing && "animate-pulse"
              )}
              style={{ backgroundColor: `${agent.color}18`, border: `1px solid ${agent.color}30` }}
            >
              <Icon
                className={cn(compact ? "h-4 w-4" : "h-5 w-5")}
                style={{ color: agent.color }}
              />
            </div>
            <div>
              <h3
                className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}
                style={{ color: "var(--reactor-text)" }}
              >
                {agent.name}
              </h3>
              <p className="text-xs capitalize" style={{ color: "var(--reactor-text-muted)" }}>{agent.role}</p>
            </div>
          </div>
          <StatusBadge status={agent.status} size="sm" />
        </div>

        {!compact && (
          <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: "var(--reactor-text-2)" }}>
            {agent.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {agent.capabilities.slice(0, compact ? 2 : 3).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: `${agent.color}12`,
                color: agent.color,
                border: `1px solid ${agent.color}25`,
              }}
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > (compact ? 2 : 3) && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: "var(--reactor-nav-hover)", color: "var(--reactor-text-muted)", border: "1px solid var(--reactor-border-color)" }}
            >
              +{agent.capabilities.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>

        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "var(--reactor-border-color)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: "var(--reactor-text-muted)" }}>Mensagens</span>
            <span className="text-xs font-semibold" style={{ color: agent.color }}>
              {agent.messagesHandled.toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: "var(--reactor-text-muted)" }}>Uptime</span>
            <span className="text-xs font-semibold" style={{ color: "var(--lhex-green)" }}>
              {agent.uptime}
            </span>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}
