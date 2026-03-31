"use client";

import React, { useRef } from "react";
import { motion, useSpring, useTransform, useAnimationFrame } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { LhexLogo } from "@/components/reactor/LhexLogo";

interface TrackingHexagonProps {
  size?: number;
  className?: string;
  intensity?: number;
}

export function TrackingHexagon({ size = 80, className = "", intensity = 18 }: TrackingHexagonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();

  const rotateX = useSpring(0, { stiffness: 280, damping: 24, mass: 0.7 });
  const rotateY = useSpring(0, { stiffness: 280, damping: 24, mass: 0.7 });
  const scale   = useSpring(1, { stiffness: 300, damping: 20 });

  useAnimationFrame(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    const dx = mouse.x - cx;
    const dy = mouse.y - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.5;
    const factor  = Math.min(intensity, (intensity * dist) / maxDist);

    rotateY.set( (dx / (window.innerWidth  / 2)) * factor);
    rotateX.set(-(dy / (window.innerHeight / 2)) * factor);
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective: 600,
        display: "inline-block",
        cursor: "default",
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={() => scale.set(1.08)}
      onMouseLeave={() => scale.set(1)}
    >
      <LhexLogo size={size} />
    </motion.div>
  );
}
