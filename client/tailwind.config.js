/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'enva-bg': '#F9F6F0', // Warm golden off-white / champagne cream
        'enva-card': '#EFE8DC', // Subtle gold-tinted card background
        'enva-gold': '#C5A880', // Elegant accent gold
        'enva-text': '#1A1A1A', // Rich dark text
        'amber-brand': '#B86526', // Warm cognac amber
        'amber-dark': '#3B1D11', // Deep brown
        'amber-gold': '#D4AF37', // Polished gold
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
