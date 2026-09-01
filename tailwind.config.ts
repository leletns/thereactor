import type { Config } from "tailwindcss";

const config: Config = {
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

        /* ── The Reactor ── */
        canvas: "#fbfaff",
        surface: "#ffffff",
        sunken: "#f4f3f8",
        wash: "#ebe5ff",
        ink: {
          DEFAULT: "#100f12",
          2: "#65646e",
          3: "#787685",
        },
        hairline: {
          DEFAULT: "#ebe5ff",
          strong: "#d9cffa",
        },
        /* The single accent — outlines, strokes, thin fills. Never a flood. */
        violet: {
          DEFAULT: "#8d6fde",
          soft: "#ebe5ff",
          deep: "#4a3e8a",
        },
        /* Status semantics for a data product; not brand colours */
        grass: { DEFAULT: "#1f7a4d", soft: "#e6f4ec" },
        amber: { DEFAULT: "#96600b", soft: "#fbf1e2" },
        rose: { DEFAULT: "#b3324a", soft: "#fceef1" },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },

      fontWeight: {
        thin: "200",
        normal: "400",
        medium: "500",
        semibold: "600",
      },

      fontSize: {
        "2xs": ["10px", { lineHeight: "1.2", letterSpacing: "-0.009em" }],
        display: ["46px", { lineHeight: "1.03", letterSpacing: "-0.015em" }],
      },

      borderRadius: {
        DEFAULT: "10px",
        sm: "7px",
        md: "10px",
        lg: "12px",
        xl: "17px",
        "2xl": "17px",
        "3xl": "28px",
        pill: "1440px",
        full: "9999px",
      },

      boxShadow: {
        float: "0 16px 40px rgba(16,15,18,0.10), 0 2px 8px rgba(16,15,18,0.05)",
        panel: "0 24px 64px rgba(16,15,18,0.12), 0 4px 12px rgba(16,15,18,0.06)",
      },

      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },

      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
