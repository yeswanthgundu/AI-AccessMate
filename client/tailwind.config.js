/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accessibility: {
          yellow: "#ffea00",
          yellowHover: "#ffd600",
          black: "#050505",
          white: "#ffffff",
          charcoal: "#121212",
          surface: "#1e1e24",
          cardDark: "#18181b",
          borderDark: "#27272a",
        },
      },
      fontFamily: {
        sans: ["Inter", "Lexend", "system-ui", "sans-serif"],
        dyslexic: ["OpenDyslexic", "Comic Sans MS", "Arial", "sans-serif"],
        readable: ["Atkinson Hyperlegible", "Verdana", "sans-serif"],
      },
      letterSpacing: {
        dyslexic: "0.12em",
        wideReading: "0.08em",
      },
      lineHeight: {
        dyslexic: "2.1",
        spacious: "1.9",
      },
    },
  },
  plugins: [],
};
