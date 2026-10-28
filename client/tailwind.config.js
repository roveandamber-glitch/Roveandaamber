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
        'amber-dark': '#3B1D11', // Deep brown / espresso
        'amber-gold': '#D4AF37', // Polished gold
        'amber-cream': '#FBF8F3', // Light cream
        'amber-sand': '#EBE5DC', // Soft sand
        'amber-terracotta': '#8B3A1C', // Terracotta
        'amber-slate': '#4A5568', // Slate navy
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        inter: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
