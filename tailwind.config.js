/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        astortion: {
          bg: '#14171a',
          dark: '#1a1e24',
          panel: '#222831',
          panelBorder: '#2f3640',
          teal: '#13857f',
          tealLight: '#26c6ba',
          accent: '#e67e22',
          highlight: '#00adb5'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace', 'sans-serif']
      }
    },
  },
  plugins: [],
}
