"use client";

import React from "react";

interface LhexLogoProps {
  size?: number;
  className?: string;
}

export function LhexLogo({ size = 40, className = "" }: LhexLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow */}
      <defs>
        <filter id="lhex-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="eye-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="facet-top-r" x1="60" y1="10" x2="96" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2d0838" />
          <stop offset="100%" stopColor="#1a0520" />
        </linearGradient>
        <linearGradient id="facet-top-l" x1="60" y1="10" x2="24" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4A0E4E" />
          <stop offset="100%" stopColor="#2d0838" />
        </linearGradient>
        <linearGradient id="facet-mid-r" x1="96" y1="30" x2="96" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#200630" />
          <stop offset="100%" stopColor="#150420" />
        </linearGradient>
        <linearGradient id="facet-mid-l" x1="24" y1="30" x2="24" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3d0d4a" />
          <stop offset="100%" stopColor="#2d0838" />
        </linearGradient>
        <linearGradient id="facet-bot-r" x1="96" y1="90" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a0520" />
          <stop offset="100%" stopColor="#0d0314" />
        </linearGradient>
        <linearGradient id="facet-bot-l" x1="24" y1="90" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2d0838" />
          <stop offset="100%" stopColor="#1a0520" />
        </linearGradient>
      </defs>

      {/* Base hexagon fill */}
      <path
        d="M60 8 L96 28 L96 88 L60 108 L24 88 L24 28 Z"
        fill="#100318"
      />

      {/* Facets */}
      <path d="M60 8 L96 28 L60 58 Z"  fill="url(#facet-top-r)" />
      <path d="M60 8 L24 28 L60 58 Z"  fill="url(#facet-top-l)" />
      <path d="M96 28 L96 88 L60 58 Z" fill="url(#facet-mid-r)" />
      <path d="M24 28 L24 88 L60 58 Z" fill="url(#facet-mid-l)" />
      <path d="M96 88 L60 108 L60 58 Z" fill="url(#facet-bot-r)" />
      <path d="M24 88 L60 108 L60 58 Z" fill="url(#facet-bot-l)" />

      {/* Internal dividing lines */}
      <line x1="60" y1="8"  x2="60" y2="108" stroke="rgba(95,255,215,0.12)" strokeWidth="0.6"/>
      <line x1="24" y1="28" x2="96" y2="88"  stroke="rgba(95,255,215,0.10)" strokeWidth="0.6"/>
      <line x1="96" y1="28" x2="24" y2="88"  stroke="rgba(95,255,215,0.10)" strokeWidth="0.6"/>

      {/* Eye shapes (left and right) */}
      <path
        d="M38 58 C38 50 49 45 60 48 C49 58 38 66 38 58 Z"
        fill="#7B2FBE"
        opacity="0.7"
        filter="url(#eye-glow)"
      />
      <path
        d="M82 58 C82 50 71 45 60 48 C71 58 82 66 82 58 Z"
        fill="#4A0E4E"
        opacity="0.8"
      />
      {/* Pupil glow */}
      <ellipse cx="60" cy="56" rx="7" ry="5" fill="#3d0d5a" />
      <ellipse
        cx="60" cy="55"
        rx="2.5" ry="2"
        fill="#5FFFD7"
        opacity="0.55"
        filter="url(#eye-glow)"
      />

      {/* Edge highlights — teal glow */}
      <path
        d="M60 8 L96 28"
        stroke="#5FFFD7"
        strokeWidth="1.8"
        strokeLinecap="round"
        filter="url(#lhex-glow)"
        opacity="0.9"
      />
      <path
        d="M60 8 L24 28"
        stroke="#5FFFD7"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M96 28 L96 88"
        stroke="#5FFFD7"
        strokeWidth="0.6"
        opacity="0.25"
      />
      <path
        d="M24 28 L24 88"
        stroke="#5FFFD7"
        strokeWidth="0.6"
        opacity="0.2"
      />
      <path
        d="M60 108 L96 88"
        stroke="#5FFFD7"
        strokeWidth="0.8"
        opacity="0.3"
      />
      <path
        d="M60 108 L24 88"
        stroke="#5FFFD7"
        strokeWidth="0.6"
        opacity="0.25"
      />
    </svg>
  );
}
