/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // you can add custom colors if needed
      },
    },
  },
  plugins: [],
};
