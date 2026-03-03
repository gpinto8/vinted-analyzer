import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007780",
        "background-light": "#f5f8f8",
        "background-dark": "#0f1419",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        "primary/20": "0 10px 15px -3px rgb(0 119 128 / 0.2), 0 4px 6px -4px rgb(0 119 128 / 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
