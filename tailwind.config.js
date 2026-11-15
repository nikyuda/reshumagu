/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#5B25F0",   // фиолетовый
        accent: "#FF5F2A",  // оранжевый
        leaf: "#8DE62A",    // салатовый
        paper: "#EDEEF2",   // фон страницы
        tint: "#EEF1FF",    // светло-фиолетовая плашка
        muted: "#5B6272",   // второстепенный текст
        line: "#E3E5EC",    // рамки
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
