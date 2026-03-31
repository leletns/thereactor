"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function GlowCard({
  children,
  className,
  glowColor,
  glowSize = 280,
  style,
  onClick,
}: GlowCardProps) {
  const ref  = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlow(prev => ({ ...prev, opacity: 0 }));
  }, []);

  const color = glowColor ?? "rgba(0,168,133,0.12)";

  return (
    <motion.div
      ref={ref}
      className={cn("reactor-card relative overflow-hidden", className)}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Cursor glow overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          transition: "opacity 0.35s ease",
          opacity: glow.opacity,
          background: `radial-gradient(${glowSize}px circle at ${glow.x}px ${glow.y}px, ${color}, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Content above glow */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
