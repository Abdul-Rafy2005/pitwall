/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-card': '#1a1a1a',
        'f1-red': '#E8002D',
        'neon-green': '#39FF14',
        'neon-purple': '#BF5FFF',
      },
      fontFamily: {
        'titillium': ['"Titillium Web"', 'sans-serif'],
        'jetbrains': ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
