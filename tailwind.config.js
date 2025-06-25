import typography from '@tailwindcss/typography';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        poppins: ["Poppins", "sans-serif"],
      },
      colors:{
          primary: "#f7ba34",
          secondary: "#69a79c",
          light: "#7f7f7",
          dark: "#333333",
          dark2: "#999999",
          maroon: '#800000',
      },
      container:{
        center:true,
        padding:{
          DEFAULT: "1rem",
          sm: "2rem",
          lg:"4rem",
          xl: "5rem",
          "2xl": "6rem",

        },

      },
    },
  },
    plugins: [typography],
}

