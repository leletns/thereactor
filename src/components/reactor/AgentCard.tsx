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
import { Card, CardContent } from "@/components/ui/card";

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card
        onClick={() => onClick?.(agent)}
        className={cn(
          "cursor-pointer transition-all duration-300 group",
          selected && "border-opacity-60 glow-cyan",
          onClick && "hover:cursor-pointer"
        )}
        style={{
          borderColor: selected ? agent.color : undefined,
          boxShadow: selected
            ? `0 0 20px ${agent.color}25, 0 0 60px ${agent.color}10`
            : undefined,
        }}
      >
        <CardContent className={cn("p-4", compact && "p-3")}>
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
                  className={cn(
                    "font-semibold text-white leading-tight",
                    compact ? "text-sm" : "text-base"
                  )}
                >
                  {agent.name}
                </h3>
                <p className="text-xs text-white/40 capitalize">{agent.role}</p>
              </div>
            </div>
            <StatusBadge status={agent.status} size="sm" />
          </div>

          {!compact && (
            <p className="text-xs text-white/50 mb-3 line-clamp-2 leading-relaxed">
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
                  color: `${agent.color}`,
                  border: `1px solid ${agent.color}25`,
                }}
              >
                {cap}
              </span>
            ))}
            {agent.capabilities.length > (compact ? 2 : 3) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/30 border border-white/10">
                +{agent.capabilities.length - (compact ? 2 : 3)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-reactor-border">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/30">Mensagens</span>
              <span
                className="text-xs font-semibold"
                style={{ color: agent.color }}
              >
                {agent.messagesHandled.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/30">Uptime</span>
              <span className="text-xs font-semibold text-reactor-green">
                {agent.uptime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
