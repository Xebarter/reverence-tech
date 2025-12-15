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
          50: '#f0f5fa',
          100: '#e1ebf5',
          200: '#c3d7eb',
          300: '#a5c3e1',
          400: '#699bc7',
          500: '#1C3D5A', // Changed from purple (#4b0082) to #1C3D5A
          600: '#193751',
          700: '#152f45',
          800: '#112638',
          900: '#0d1d2c',
        },
      },
    },
  },
  plugins: [],
};