/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d7c1ff',
          300: '#c2a2ff',
          400: '#9a63ff',
          500: '#4b0082', // Main purple color
          600: '#430075',
          700: '#380062',
          800: '#2d004e',
          900: '#23003f',
        },
      },
    },
  },
  plugins: [],
};