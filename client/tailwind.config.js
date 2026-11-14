/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B1020',
          surface: '#111936',
          elevated: '#18224A',
          border: '#26325F',
          text: '#E5E9F7',
          muted: '#8B95B8',
        },
        brand: {
          indigo: '#6366F1',
          cyan: '#22D3EE',
          dark: '#4F46E5',
          light: '#818CF8'
        },
        verdict: {
          safe: '#22C55E',
          suspicious: '#F59E0B',
          dangerous: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.25)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
        'glow-safe': '0 0 25px -5px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
