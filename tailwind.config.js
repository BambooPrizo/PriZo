/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        'dark-bg': '#1A1A2E',
        'surface': '#1E293B',
        success: '#22C55E',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        border: '#334155',
      },
    },
  },
  plugins: [],
}
