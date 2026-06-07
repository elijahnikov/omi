import { preset } from "@omi/tailwind-config/preset";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  // Locked to light: darkMode is "class" but `.dark` is never applied, so the
  // preset's `:root` light tokens are always in effect.
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/*.{ts,tsx}"],
  presets: [preset],
  theme: {
    extend: {
      fontFamily: {
        sans: ["OpenRunde", ...defaultTheme.fontFamily.sans],
        mono: ["IoskeleyMono", ...defaultTheme.fontFamily.mono],
      },
      // Marketing-only layer the app-UI preset doesn't provide: a display type
      // scale for hero/section headings and soft light glows/shadows.
      fontSize: {
        "display-sm": [
          "2.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        display: ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": [
          "4.5rem",
          { lineHeight: "1.02", letterSpacing: "-0.035em" },
        ],
      },
      boxShadow: {
        "soft-sm":
          "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        soft: "0 4px 12px rgba(16, 24, 40, 0.06), 0 2px 4px rgba(16, 24, 40, 0.04)",
        "soft-lg":
          "0 12px 32px rgba(16, 24, 40, 0.08), 0 4px 8px rgba(16, 24, 40, 0.04)",
        glow: "0 0 0 1px rgba(16, 24, 40, 0.04), 0 10px 28px rgba(16, 24, 40, 0.10)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "50.01%, 100%": { opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
} satisfies Config;
