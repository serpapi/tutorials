/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // Custom gradient colors for the app theme
      colors: {
        'gradient-start': '#667eea',
        'gradient-end': '#764ba2',
      },
      // Animation for loading spinner
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
      },
    },
  },
  plugins: [],
};


