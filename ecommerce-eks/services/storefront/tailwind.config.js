/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          black: '#000000',
          dark: '#121212',
          gray: '#181818',
          lightgray: '#282828',
          green: '#1DB954',
          white: '#FFFFFF',
          text: '#B3B3B3',
        },
      },
    },
  },
  plugins: [],
}