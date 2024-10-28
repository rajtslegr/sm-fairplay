/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: { inter: 'Inter, Avenir, Helvetica, Arial, sans-serif' },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#982054',
          dark: '#721818',
        },
        secondary: {
          DEFAULT: '#689820',
          dark: '#4d7118',
        },
        background: {
          DEFAULT: '#242424',
          card: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
};
