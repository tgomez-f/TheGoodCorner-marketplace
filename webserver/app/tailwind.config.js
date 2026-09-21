// webserver/app/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
        colors: {
        'brand-blue': '#0052CC',
        'brand-dark': '#1a1a1a',
        }
    },
  },
  plugins: [],
};
