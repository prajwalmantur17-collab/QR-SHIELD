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
        // Core Palette (Stripe/Linear/Enterprise light SaaS inspired)
        canvas: {
          DEFAULT: '#F7F8F6',
          subtle: '#F0F3F2',
          pure: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8E5',
          subtle: '#EDF1EF',
          strong: '#CBD5D1',
        },
        content: {
          primary: '#202B35',
          secondary: '#687782',
          muted: '#89959D',
          white: '#FFFFFF',
        },
        brand: {
          teal: {
            DEFAULT: '#167D73',
            hover: '#12645C',
            subtle: '#E7F3F1',
            text: '#0E534D',
          },
          blue: {
            DEFAULT: '#527DA8',
            hover: '#43668A',
            subtle: '#EDF3F8',
            text: '#345271',
          }
        },
        status: {
          success: {
            DEFAULT: '#23845D',
            bg: '#E9F6F0',
            border: '#BDE4D2',
            text: '#175E42',
          },
          warning: {
            DEFAULT: '#C58A32',
            bg: '#FDF6EA',
            border: '#F6DFB3',
            text: '#8E601B',
          },
          danger: {
            DEFAULT: '#D45B61',
            bg: '#FCEEEE',
            border: '#F8BFC2',
            text: '#A6383E',
          }
        },
        // Dark mode equivalents
        dark: {
          bg: '#12181F',
          surface: '#1A232C',
          secondary: '#222D38',
          border: '#2C3A47',
          primary: '#F0F4F8',
          secondaryText: '#9AA7B4',
          muted: '#6C7B8B',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)',
        'elevated': '0 4px 6px -1px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.04)',
        'modal': '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.04)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
