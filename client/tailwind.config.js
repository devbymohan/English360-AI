/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        grammar: {
          light: '#ecfdf5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        vocabulary: {
          light: '#f5f3ff',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
        reading: {
          light: '#eff6ff',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        writing: {
          light: '#fff7ed',
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        listening: {
          light: '#fef2f2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        tests: {
          light: '#ecfeff',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
