/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(56, 189, 248)',
          secondary: 'rgb(16, 185, 129)',
          accent: 'rgb(124, 58, 237)',
        }
      }
    },
  },
  plugins: [],
}
