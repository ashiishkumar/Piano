/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        studio: {
          950: '#07090e',
          900: '#0d1117',
          850: '#131822',
          800: '#1a2130',
          700: '#252f42',
          600: '#35435e',
        }
      }
    },
  },
  plugins: [],
}
