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
        // #FDD7CA — fundo claro / pêssego
        cream: {
          50: '#FFF7F3',
          100: '#FDD7CA',
          200: '#F5C4B4',
        },
        // #CCAFA1 — bege / taupe
        sand: {
          50: '#F7EEE9',
          100: '#EAD9D0',
          200: '#DCC4B8',
          300: '#CCAFA1',
          400: '#B89788',
        },
        // #A35825 — marrom cobre (ações secundárias / suporte)
        caramel: {
          300: '#D49262',
          400: '#C0743D',
          500: '#A35825',
          600: '#8A4A1F',
        },
        // #E75482 — rosa destaque
        terracotta: {
          400: '#F0789E',
          500: '#E75482',
          600: '#D13D6C',
        },
        // Rosa usado onde antes era "gold"
        gold: {
          300: '#F4A0BB',
          400: '#E75482',
          500: '#C93E6A',
        },
        // Escala a partir do #A35825 (sem #6E3A18 — fundos escuros viraram branco)
        espresso: {
          400: '#CCAFA1',
          500: '#B87A52',
          600: '#A35825',
          700: '#8B4A1F',
          800: '#8A4A1F',
          900: '#4A2710',
        },
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgb(163 88 37 / 0.08)',
        card: '0 4px 20px -4px rgb(163 88 37 / 0.12)',
        lift: '0 12px 32px -8px rgb(163 88 37 / 0.18)',
        inset: 'inset 0 1px 2px 0 rgb(163 88 37 / 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
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
