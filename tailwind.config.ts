import type { Config } from "tailwindcss";

/**
 * Design system v3 — 「白瓷 · 黛青」
 * Light porcelain canvas + indigo primary + soft rose accents.
 * Intentionally different from v1 paper/cinnabar and v2 dark cyan observatory.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        porcelain: {
          DEFAULT: "#f7f8fa",
          card: "#ffffff",
          muted: "#eef1f5",
        },
        daiqing: {
          DEFAULT: "#1a3a52",
          deep: "#0f2740",
          soft: "rgba(26, 58, 82, 0.08)",
          mid: "#2c5470",
        },
        rose: {
          DEFAULT: "#c45c4a",
          soft: "rgba(196, 92, 74, 0.1)",
          strong: "#a84838",
        },
        sage: {
          DEFAULT: "#3d7a62",
          soft: "rgba(61, 122, 98, 0.1)",
        },
        // Compatibility aliases used across components
        void: {
          DEFAULT: "#f7f8fa",
          50: "#ffffff",
          800: "#ffffff",
          900: "#f7f8fa",
          950: "#eef1f5",
        },
        mist: {
          DEFAULT: "#5a6b7d",
          soft: "#8a9aab",
          faint: "#9aabba",
        },
        accent: {
          DEFAULT: "#1a3a52",
          strong: "#0f2740",
          soft: "rgba(26, 58, 82, 0.08)",
          glow: "rgba(26, 58, 82, 0.15)",
        },
        star: {
          DEFAULT: "#c45c4a",
          soft: "rgba(196, 92, 74, 0.1)",
        },
        danger: {
          DEFAULT: "#c45c4a",
          soft: "rgba(196, 92, 74, 0.1)",
        },
        success: {
          DEFAULT: "#3d7a62",
          soft: "rgba(61, 122, 98, 0.1)",
        },
        paper: {
          DEFAULT: "#f7f8fa",
          light: "#ffffff",
          deep: "#eef1f5",
        },
        ink: "#1a2332",
        "ink-2": "#2c3a4a",
        muted: "#5a6b7d",
        faint: "#8a9aab",
        cinnabar: {
          DEFAULT: "#c45c4a",
          strong: "#a84838",
          soft: "rgba(196, 92, 74, 0.1)",
        },
        gold: {
          DEFAULT: "#1a3a52",
          light: "#2c5470",
          soft: "rgba(26, 58, 82, 0.08)",
        },
        jade: {
          DEFAULT: "#3d7a62",
          soft: "rgba(61, 122, 98, 0.1)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        song: [
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        kai: [
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        display: [
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        chart: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,39,64,0.04), 0 12px 32px -16px rgba(15,39,64,0.12)",
        glow: "0 8px 28px -12px rgba(26,58,82,0.25)",
        seal: "0 6px 20px -8px rgba(196,92,74,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
