import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        // Grayscale design system
        mono: {
          50:  "#f9f9f9",
          100: "#eeeeee",
          200: "#cccccc",
          300: "#aaaaaa",
          400: "#888888",
          500: "#666666",
          600: "#444444",
          700: "#2a2a2a",
          800: "#1a1a1a",
          900: "#111111",
          950: "#0a0a0a",
        },
        // Keep jade/earth/night/fasting for logic (not UI display)
        jade: {
          50:"#edfaf4",100:"#d2f4e4",200:"#a9e8cc",300:"#74d5af",
          400:"#3cbc8e",500:"#1fa374",600:"#12845d",700:"#0e6a4c",
          800:"#0d553d",900:"#0c4633",950:"#05271d",
        },
        night: {
          50:"#f3f4f6",100:"#e5e7eb",200:"#d1d5db",300:"#9ca3af",
          400:"#6b7280",500:"#4b5563",600:"#374151",700:"#1f2937",
          800:"#111827",900:"#0a0e1a",950:"#060913",
        },
        earth: {
          400:"#be9d81",500:"#ac8363",600:"#9e7257",
        },
        warning: "#D4854A",
        danger:  "#C0392B",
        success: "#4caf7d",
        fasting: "#6366f1",
      },
    },
  },
  plugins: [],
};
export default config;
