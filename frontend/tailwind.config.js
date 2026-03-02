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
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        aurora: {
          cyan: '#22d3ee',
          violet: '#7c3aed',
          rose: '#e11d48',
          teal: '#0d9488',
          'cyan-soft': '#cffafe',
          'violet-soft': '#ede9fe',
          'rose-soft': '#ffe4e6',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #22d3ee, #0d9488, #7c3aed, #e11d48)',
        'aurora-text': 'linear-gradient(90deg, #0891b2, #7c3aed)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-1': 'auroraFloat1 18s ease-in-out infinite',
        'aurora-2': 'auroraFloat2 22s ease-in-out infinite',
        'aurora-3': 'auroraFloat3 26s ease-in-out infinite',
        'page-enter': 'pageEnter 0.35s ease-out forwards',
        'chart-grow': 'chartGrow 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        auroraFloat1: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(6%, -8%) scale(1.08)' },
          '66%': { transform: 'translate(-4%, 5%) scale(0.95)' },
        },
        auroraFloat2: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '40%': { transform: 'translate(-8%, 6%) scale(1.12)' },
          '70%': { transform: 'translate(5%, -4%) scale(0.92)' },
        },
        auroraFloat3: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '25%': { transform: 'translate(4%, 8%) scale(0.96)' },
          '75%': { transform: 'translate(-6%, -5%) scale(1.06)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        chartGrow: {
          '0%': { opacity: '0', transform: 'scaleY(0.6)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
}
