import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          bg: "#F5F7FA",
          surface: "#FFFFFF",
          border: "#E1E7EB",
          "border-strong": "#CBD2D6",
          text: "#2C2E2F",
          "text-secondary": "#6C7378",
          navy: "#003087",
          blue: "#0070BA",
          "blue-hover": "#005EA6",
          "blue-light": "#009CDE",
          gold: "#FFC439",
          "gold-hover": "#F2BA36",
          success: "#0B7A3E",
          "success-bg": "#E8F5EC",
          error: "#C72C2C",
          "error-bg": "#FDECEC",
          warning: "#8A5A00",
          "warning-bg": "#FFF4DB",
        },
      },
      borderRadius: {
        card: "12px",
        input: "8px",
      },
      boxShadow: {
        "paypal-sm": "0 1px 2px rgba(0, 0, 0, 0.06)",
        paypal: "0 2px 8px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
