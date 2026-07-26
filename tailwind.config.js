/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FEFCF9',
          100: '#FAF6EF',
          200: '#F5EEE1',
        },
        sand: {
          50: '#F5EEE1',
          100: '#EFE3CE',
          200: '#E4D4B8',
          300: '#D6C09E',
          400: '#C6A87F',
        },
        caramel: {
          300: '#D7AE7C',
          400: '#C89B6B',
          500: '#B98352',
          600: '#9C6B3E',
        },
        terracotta: {
          400: '#C97B5C',
          500: '#BC6B4A',
          600: '#A2573A',
        },
        gold: {
          300: '#D4B978',
          400: '#B99655',
          500: '#A3843F',
        },
        espresso: {
          400: '#8A6E58',
          500: '#6B4F3D',
          600: '#523A2B',
          700: '#3D2B20',
          800: '#2B1E16',
          900: '#1D140E',
        },
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgb(61 43 32 / 0.06)',
        card: '0 4px 20px -4px rgb(61 43 32 / 0.10)',
        lift: '0 12px 32px -8px rgb(61 43 32 / 0.18)',
        inset: 'inset 0 1px 2px 0 rgb(61 43 32 / 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeIn: 'fadeIn 0.5s ease both',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}
