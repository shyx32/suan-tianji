import type { Config } from "tailwindcss";

/**
 * Design system v3.1 — 「白瓷 · 黛青 · 朱印」
 * 在 v3 浅色瓷面基础上补强：书体、纸本框线、朱砂印章与纹样语汇。
 * 兼容 v1 paper/cinnabar、v2 void/mist 别名。
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        porcelain: {
          DEFAULT: "#f6f3ec",
          card: "#fffcf7",
          muted: "#ebe6dc",
        },
        daiqing: {
          DEFAULT: "#1a3a52",
          deep: "#0f2740",
          soft: "rgba(26, 58, 82, 0.08)",
          mid: "#2c5470",
        },
        rose: {
          DEFAULT: "#b54a3c",
          soft: "rgba(181, 74, 60, 0.1)",
          strong: "#8f382c",
        },
        sage: {
          DEFAULT: "#3d7a62",
          soft: "rgba(61, 122, 98, 0.1)",
        },
        seal: {
          DEFAULT: "#b54a3c",
          soft: "rgba(181, 74, 60, 0.08)",
          ink: "#8f382c",
        },
        // Compatibility aliases
        void: {
          DEFAULT: "#f6f3ec",
          50: "#fffcf7",
          800: "#fffcf7",
          900: "#f6f3ec",
          950: "#ebe6dc",
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
          DEFAULT: "#b54a3c",
          soft: "rgba(181, 74, 60, 0.1)",
        },
        danger: {
          DEFAULT: "#b54a3c",
          soft: "rgba(181, 74, 60, 0.1)",
        },
        success: {
          DEFAULT: "#3d7a62",
          soft: "rgba(61, 122, 98, 0.1)",
        },
        paper: {
          DEFAULT: "#f6f3ec",
          light: "#fffcf7",
          deep: "#ebe6dc",
        },
        ink: "#1a2332",
        "ink-2": "#2c3a4a",
        muted: "#5a6b7d",
        faint: "#8a9aab",
        cinnabar: {
          DEFAULT: "#b54a3c",
          strong: "#8f382c",
          soft: "rgba(181, 74, 60, 0.1)",
        },
        gold: {
          DEFAULT: "#8a7348",
          light: "#b8a06a",
          soft: "rgba(138, 115, 72, 0.12)",
        },
        jade: {
          DEFAULT: "#3d7a62",
          soft: "rgba(61, 122, 98, 0.1)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        song: [
          "var(--font-song)",
          "Noto Serif SC",
          "Songti SC",
          "SimSun",
          "STSong",
          "serif",
        ],
        kai: [
          "Kaiti SC",
          "STKaiti",
          "KaiTi",
          "楷体",
          "var(--font-song)",
          "serif",
        ],
        display: [
          "var(--font-song)",
          "Noto Serif SC",
          "Songti SC",
          "SimSun",
          "serif",
        ],
        chart: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        paper: "0.5rem",
        seal: "0.2rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(26,58,82,0.04), 0 10px 28px -18px rgba(15,39,64,0.18)",
        glow: "0 8px 28px -12px rgba(26,58,82,0.22)",
        seal: "0 4px 14px -6px rgba(181,74,60,0.45)",
        paper:
          "0 0 0 1px rgba(26,58,82,0.06), 0 12px 32px -20px rgba(15,39,64,0.2)",
      },
      backgroundImage: {
        "lattice":
          "url(\"data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24h48M24 0v48' stroke='%231a3a52' stroke-opacity='0.045' fill='none'/%3E%3Cpath d='M12 12h24v24H12z' stroke='%231a3a52' stroke-opacity='0.035' fill='none'/%3E%3C/svg%3E\")",
        "meander":
          "url(\"data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6h6V2h4v8h4V2h4v8h4V2h4v8h4V6h6' stroke='%231a3a52' stroke-opacity='0.12' fill='none' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      letterSpacing: {
        seal: "0.22em",
        classic: "0.18em",
      },
      keyframes: {
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 72s linear infinite",
        "spin-slower": "spin-slow 120s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
