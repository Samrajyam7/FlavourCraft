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
        // Deep herb & forest green primary
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#143826',
          800: '#0f291c',
          900: '#08170f',
          DEFAULT: '#2d6a4f',
          dark: '#1b4332',
          light: '#52b788',
        },
        // Sage green secondary
        sage: {
          50: '#f4f9f6',
          100: '#e5f2eb',
          200: '#cce5d7',
          300: '#a3d1b8',
          400: '#74c69d',
          500: '#52b788',
          600: '#3d9970',
          700: '#2d7a56',
          DEFAULT: '#52b788',
        },
        // Tomato / chili red accent
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#e63946',
          600: '#d62828',
          700: '#b71c1c',
          DEFAULT: '#e63946',
        },
        // Warm golden yellow highlight
        warm: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#e9c46a',
          600: '#d4a373',
          DEFAULT: '#e9c46a',
        },
        // Surface & Background (Warm cream & Deep Charcoal)
        kitchen: {
          bg: '#faf8f5',
          card: '#ffffff',
          border: '#ede8e1',
          muted: '#f3efe8',
          text: '#1f2421',
          subtext: '#59655f',
        },
        dark: {
          bg: '#0c120f',
          surface: '#131b17',
          card: '#18241e',
          border: '#23342b',
          hover: '#1f3028',
          DEFAULT: '#0c120f',
        },
        text: {
          primary: '#f1f7f4',
          secondary: '#9ab3a6',
          muted: '#617d70',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
        editorial: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(12, 18, 15, 0.08), 0 2px 6px -1px rgba(12, 18, 15, 0.04)',
        'card-hover': '0 16px 36px -4px rgba(12, 18, 15, 0.16), 0 6px 16px -2px rgba(12, 18, 15, 0.08)',
        'glow-green': '0 0 24px -4px rgba(45, 106, 79, 0.35)',
        'glow-accent': '0 0 24px -4px rgba(230, 57, 70, 0.35)',
        'glow-gold': '0 0 24px -4px rgba(233, 196, 106, 0.35)',
        'pot': '0 24px 48px -12px rgba(12, 18, 15, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'simmer': 'simmer 2s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-3deg)' },
        },
        simmer: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.98)' },
        },
      },
    },
  },
  plugins: [],
}
