import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        walnut: {
          DEFAULT: "#3D2B1F",
          50:  "#f5ede8",
          100: "#e8d5c9",
          200: "#c9a98f",
          300: "#a97d5a",
          400: "#7a5033",
          500: "#3D2B1F",
          600: "#2e2018",
          700: "#201610",
          800: "#120d08",
          900: "#060402",
        },
        gold: {
          DEFAULT: "#B8860B",
          50:  "#fdf8e7",
          100: "#f8edb8",
          200: "#edcf6b",
          300: "#d4a820",
          400: "#B8860B",
          500: "#9a6f08",
          600: "#7a5806",
          700: "#5a4004",
          800: "#3b2a02",
          900: "#1d1401",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
