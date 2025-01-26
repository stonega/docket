import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  plugins: [
    require("@tailwindcss/typography"),
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdf9f7',
          100: '#f9f2ec', // Your cream color
          200: '#f3e3d4',
          300: '#e9cdb3',
          400: '#deb08c',
          500: '#d39366',
          600: '#c77b4d',
          700: '#b66541',
          800: '#95523a',
          900: '#794634',
          950: '#402218',
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
};
export default config;
