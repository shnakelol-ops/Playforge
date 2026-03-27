import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f18",
        bg2: "#131924",
        bg3: "#1a2233",
        acc: "#00d46e",
        acc2: "#00b862",
        txt: "#dde4f0",
        txt2: "#7a8ba8",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Bebas Neue", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
