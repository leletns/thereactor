import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border:  "hsl(var(--border))",
        input:   "hsl(var(--input))",
        ring:    "hsl(var(--ring))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        /* ── L.H.E.X Systems ── */
        reactor: {
          cyan:    "#5FFFD7",      // LHEX primary accent (mint-green)
          green:   "#5FFFD7",
          purple:  "#7B2FBE",      // jabuticaba lightened for UI contrast
          jabu:    "#4A0E4E",      // deep jabuticaba brand purple
          orange:  "#ff6b35",
          red:     "#ff4444",
          bg:      "#000000",
          surface: "#0a0a0c",
          card:    "#0f0f12",
          border:  "rgba(255,255,255,0.06)",
          glow:    "rgba(95,255,215,0.15)",
        },
      },

      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },

      /* 4px industrial — identidade LHEX */
      borderRadius: {
        DEFAULT: "4px",
        sm:    "2px",
        md:    "4px",
        lg:    "6px",
        xl:    "8px",
        "2xl": "10px",
        full:  "9999px",
      },

      backgroundImage: {
        "reactor-gradient":
          "linear-gradient(135deg, #000000 0%, #0a0a0c 50%, #0f0f12 100%)",
        "glow-green":
          "radial-gradient(ellipse at center, rgba(95,255,215,0.12) 0%, transparent 70%)",
        "glow-purple":
          "radial-gradient(ellipse at center, rgba(74,14,78,0.18) 0%, transparent 70%)",
      },

      boxShadow: {
        "reactor-cyan":
          "0 0 20px rgba(95,255,215,0.35), 0 0 60px rgba(95,255,215,0.12)",
        "reactor-green":
          "0 0 20px rgba(95,255,215,0.35), 0 0 60px rgba(95,255,215,0.12)",
        "reactor-purple":
          "0 0 20px rgba(123,47,190,0.4),  0 0 60px rgba(123,47,190,0.15)",
        "reactor-card":
          "0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(95,255,215,0.08)",
        "lhex-glow":
          "0 0 30px rgba(95,255,215,0.25), 0 0 80px rgba(95,255,215,0.08)",
        "lhex-panel":
          "0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
      },

      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float:        "float 6s ease-in-out infinite",
        "fade-in":    "fade-in 0.5s ease-out",
        "slide-up":   "slide-up 0.4s ease-out",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "brightness(1)" },
          "50%":       { opacity: "1",   filter: "brightness(1.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
