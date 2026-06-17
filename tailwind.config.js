/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4338CA",
          light:   "#818CF8",
          muted:   "#EEF2FF",
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
        profit: { DEFAULT: "#059669", bg: "#F0FDF4", subtle: "#10B981" },
        loss:   { DEFAULT: "#EF4444", bg: "#FEF2F2" },
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
      },
      gridTemplateColumns: {
        kpi:    "2fr 1fr 1fr 1fr",
        bottom: "360px 1fr",
      },
    },
  },
  plugins: [],
};
