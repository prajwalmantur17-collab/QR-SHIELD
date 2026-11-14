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
          secondary: '#5F6D7E',
          muted: '#6B7885',
          subtle: '#7E8B97',
          white: '#FFFFFF',
        },
        brand: {
          teal: {
            DEFAULT: '#167D73',
            hover: '#12645C',
            active: '#0E534D',
            subtle: '#E7F3F1',
            text: '#0E534D',
            border: '#B6DDD8',
          },
          blue: {
            DEFAULT: '#527DA8',
            hover: '#43668A',
            active: '#345271',
            subtle: '#EDF3F8',
            text: '#345271',
            border: '#BDD2E6',
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
          muted: '#8795A5',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'hairline': '0 0 0 1px rgba(16, 24, 40, 0.06)',
        'subtle': '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px -1px rgba(16, 24, 40, 0.03)',
        'card-hover': '0 4px 12px 0 rgba(16, 24, 40, 0.06), 0 2px 4px -1px rgba(16, 24, 40, 0.03)',
        'elevated': '0 4px 6px -1px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.04)',
        'modal': '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.04)',
        // alias: `shadow-elevation` is used by the preview dialogs but was never defined
        'elevation': '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.04)',
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.625rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      spacing: {
        // Used across the UI (w-4.5, h-4.5, py-4.5, py-0.2) but missing from Tailwind's default scale,
        // which silently produced no CSS. Defined here so those classes actually apply.
        '4.5': '1.125rem',
        '0.2': '0.125rem',
        'sidebar-expanded': '248px',
        'sidebar-collapsed': '68px',
      }
    },
  },
  plugins: [],
}
