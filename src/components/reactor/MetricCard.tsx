"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: "cyan" | "green" | "purple" | "orange";
  suffix?: string;
  prefix?: string;
  description?: string;
  loading?: boolean;
}

const COLOR_CONFIG = {
  cyan: {
    icon: "text-reactor-cyan",
    iconBg: "bg-reactor-cyan/10 border-reactor-cyan/20",
    glow: "hover:shadow-reactor-cyan hover:border-reactor-cyan/25",
    change: "text-reactor-cyan",
  },
  green: {
    icon: "text-reactor-green",
    iconBg: "bg-reactor-green/10 border-reactor-green/20",
    glow: "hover:shadow-reactor-green hover:border-reactor-green/25",
    change: "text-reactor-green",
  },
  purple: {
    icon: "text-reactor-purple",
    iconBg: "bg-reactor-purple/10 border-reactor-purple/20",
    glow: "hover:shadow-reactor-purple hover:border-reactor-purple/25",
    change: "text-reactor-purple",
  },
  orange: {
    icon: "text-reactor-orange",
    iconBg: "bg-reactor-orange/10 border-reactor-orange/20",
    glow: "hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:border-reactor-orange/25",
    change: "text-reactor-orange",
  },
};

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = () => {
      startTime.current = null;
      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    };
    start();
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = "cyan",
  suffix,
  prefix,
  description,
  loading = false,
}: MetricCardProps) {
  const colors = COLOR_CONFIG[color];
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  const isNumeric = !isNaN(numericValue) && typeof value === "number";
  const animatedValue = useCountUp(isNumeric ? numericValue : 0);

  const displayValue = isNumeric
    ? animatedValue.toLocaleString("pt-BR")
    : value;

  const TrendIcon =
    change === undefined || change === 0
      ? Minus
      : change > 0
      ? TrendingUp
      : TrendingDown;

  const trendColor =
    change === undefined || change === 0
      ? "text-white/30"
      : change > 0
      ? "text-reactor-green"
      : "text-reactor-red";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "transition-all duration-300 group",
          colors.glow
        )}
      >
        <CardContent className="p-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-8 w-32 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/10 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-white/50 font-medium">{title}</p>
                <div
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg border",
                    colors.iconBg
                  )}
                >
                  <Icon className={cn("h-4 w-4", colors.icon)} />
                </div>
              </div>

              <div className="mb-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {prefix && (
                    <span className="text-white/50 text-lg mr-0.5">{prefix}</span>
                  )}
                  {displayValue}
                  {suffix && (
                    <span className="text-white/50 text-lg ml-0.5">{suffix}</span>
                  )}
                </span>
              </div>

              {(change !== undefined || description) && (
                <div className="flex items-center gap-1.5">
                  {change !== undefined && (
                    <>
                      <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
                      <span className={cn("text-xs font-medium", trendColor)}>
                        {change > 0 ? "+" : ""}
                        {change}%
                      </span>
                    </>
                  )}
                  {changeLabel && (
                    <span className="text-xs text-white/30">{changeLabel}</span>
                  )}
                  {description && !changeLabel && (
                    <span className="text-xs text-white/30">{description}</span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
