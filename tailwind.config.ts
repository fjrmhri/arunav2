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
        jade: {
          50: "#edfaf4",
          100: "#d2f4e4",
          200: "#a9e8cc",
          300: "#74d5af",
          400: "#3cbc8e",
          500: "#1fa374",
          600: "#12845d",
          700: "#0e6a4c",
          800: "#0d553d",
          900: "#0c4633",
          950: "#05271d",
        },
        earth: {
          50: "#faf7f4",
          100: "#f3ede6",
          200: "#e6d9cc",
          300: "#d4bea8",
          400: "#be9d81",
          500: "#ac8363",
          600: "#9e7257",
          700: "#845e49",
          800: "#6d4e3f",
          900: "#5a4135",
        },
        night: {
          50: "#f3f4f6",
          100: "#e5e7eb",
          200: "#d1d5db",
          300: "#9ca3af",
          400: "#6b7280",
          500: "#4b5563",
          600: "#374151",
          700: "#1f2937",
          800: "#111827",
          900: "#0a0e1a",
          950: "#060913",
        },
        warning: "#D4854A",
        danger: "#C0392B",
        recovery: "#7B8794",
        fasting: "#6366f1",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-jade":
          "radial-gradient(at 40% 20%, hsla(152,65%,30%,0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
