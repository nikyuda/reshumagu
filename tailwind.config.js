/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#5B2EFF",   // фиолетовый
        accent: "#FF5A1F",  // оранжевый
        leaf: "#8CE62C",    // салатовый
        paper: "#EEEEF2",   // фон страницы
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
