/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          light:   "#818CF8",
          muted:   "var(--brand-muted)",
          border:  "var(--brand-border)",
        },
        text1: "var(--text-1)",
        text2: "var(--text-2)",
        text3: "var(--text-3)",
        card:  "var(--card)",
        bg:    "var(--bg)",
        border: {
          DEFAULT: "var(--border)",
          light:   "var(--border-light)",
        },
        surface2:     "var(--surface-2)",
        surfaceInset: "var(--surface-inset)",
        rowHover:     "var(--row-hover)",
        profit: { DEFAULT: "var(--profit)", bg: "var(--profit-bg)", subtle: "var(--profit-subtle)" },
        loss:   { DEFAULT: "var(--loss)",   bg: "var(--loss-bg)" },
      },
      borderRadius: { card: "14px" },
      gridTemplateColumns: {
        kpi:    "1.4fr 1fr 1fr 1fr",
        bottom: "360px 1fr",
      },
    },
  },
  plugins: [],
};
