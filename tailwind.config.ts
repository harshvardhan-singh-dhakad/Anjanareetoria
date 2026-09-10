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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#0008c1",
          button: "#1346af",
          buttonHover: "#3a3a3a",
          footer: "#1778f2",
          text: "#2b2b2b",
          lightGray: "#f3f3f3",
        },
      },
    },
  },
  plugins: [],
};
export default config;
