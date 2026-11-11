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
        brand: {
          navy: {
            DEFAULT: "#0B2240",
            dark: "#07172B",
            light: "#143765",
            soft: "#1E4A82",
          },
          gold: {
            DEFAULT: "#D4A017",
            light: "#E5A93C",
            dark: "#B8860B",
            soft: "#FDF6E2",
          },
          pearl: "#F8F9FA",
          cream: "#FAF8F5",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      animation: {
        "shimmer": "shimmer 1.5s infinite",
        "marquee": "marquee 25s linear infinite",
        "marquee-slow": "marquee 40s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
