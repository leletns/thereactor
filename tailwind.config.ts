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
        canvas: "#f5f6f8",
        surface: "#ffffff",
        sunken: "#f0f2f7",
        ink: {
          DEFAULT: "#021422",
          2: "#45566a",
          3: "#7d8b99",
        },
        hairline: {
          DEFAULT: "#e4e8f0",
          strong: "#d0d4e4",
        },
        violet: {
          DEFAULT: "#6161ff",
          soft: "#eeeeff",
          deep: "#4a4ae0",
        },
        grass: {
          DEFAULT: "#00852e",
          soft: "#e6f6ec",
        },
        amber: {
          DEFAULT: "#b26a00",
          soft: "#fff3e0",
        },
        rose: {
          DEFAULT: "#c8102e",
          soft: "#fdeaed",
        },
        pastel: {
          mint: "#bcfe90",
          sky: "#abf0ff",
          lavender: "#eddff7",
          periwinkle: "#e7ecff",
          aqua: "#d1faff",
          peach: "#ffe1c4",
          peony: "#fcd0f8",
        },
      },

      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },

      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4" }],
      },

      borderRadius: {
        DEFAULT: "10px",
        sm: "6px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        pill: "160px",
        full: "9999px",
      },

      boxShadow: {
        card: "rgba(205, 208, 223, 0.4) 0px 2px 48px 0px",
        lift: "rgba(2, 20, 34, 0.10) 0px 6px 28px 0px",
        pop: "rgba(2, 20, 34, 0.14) 0px 10px 40px 0px",
      },

      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "slide-up": "slide-up 0.35s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
