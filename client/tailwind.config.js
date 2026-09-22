/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primaryBg: '#003725',
        secondaryBg: '#011E15',
        accentGold: '#E3BA63',
        bannerCream: '#FAF7F0',
      },
    },
  },
  plugins: [],
}
