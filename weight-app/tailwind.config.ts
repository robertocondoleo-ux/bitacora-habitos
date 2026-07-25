import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        line: "var(--line)",
        moss: "var(--moss)",
        clay: "var(--clay)",
        amber: "var(--amber)",
        soft: "var(--soft)",
        hero: "var(--hero-bg)",
        herotext: "var(--hero-text)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
