import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12121c",
        coral: "#ff6b5a",
        gold: "#f5c542",
        teal: "#2ec4b6",
        mint: "#14F195",
        sol: "#9945FF",
        night: "#1b1433",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(153,69,255,0.45)",
        mint: "0 0 32px rgba(20,241,149,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
