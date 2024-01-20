/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      scrollbar: ['rounded', 'thin', 'dark'],
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};
