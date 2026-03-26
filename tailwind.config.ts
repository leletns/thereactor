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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        reactor: {
          cyan: "#00f5ff",
          green: "#00ff88",
          purple: "#8b5cf6",
          orange: "#ff6b35",
          red: "#ff4444",
          bg: "#0a0a0f",
          surface: "#0f0f1a",
          card: "#141428",
          border: "#1e1e3a",
          glow: "rgba(0, 245, 255, 0.15)",
        },
      },
      backgroundImage: {
        "reactor-gradient":
          "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a1f 100%)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(0,245,255,0.15) 0%, transparent 70%)",
        "glow-green":
          "radial-gradient(ellipse at center, rgba(0,255,136,0.1) 0%, transparent 70%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "reactor-cyan":
          "0 0 20px rgba(0, 245, 255, 0.3), 0 0 60px rgba(0, 245, 255, 0.1)",
        "reactor-green":
          "0 0 20px rgba(0, 255, 136, 0.3), 0 0 60px rgba(0, 255, 136, 0.1)",
        "reactor-purple":
          "0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)",
        "reactor-card":
          "0 4px 6px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,245,255,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
