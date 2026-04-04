/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge:      '#0A0A0A',
        calcaire:   '#F5F3EF',
        anthracite: '#1A1A1A',
        or:         '#FF6600',
        acier:      '#6B7280',
        alerte:     '#CC2B2B',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
