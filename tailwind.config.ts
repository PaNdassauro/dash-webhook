import type { Config } from 'tailwindcss'

/**
 * WEDDING LUXURY THEME
 * Elegant, minimalist theme for wedding sales dashboard.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wedding Luxury palette
        wedding: {
          cream: '#F9F7F2',
          gold: '#C5A059',
          'gold-dark': '#A68A3C',
          'gold-light': '#D4B978',
          charcoal: '#2D2D2D',
          'warm-gray': '#6B6B6B',
        },

        // Trips palette (light blue)
        trips: {
          blue: '#5BA4D9',
          'blue-dark': '#4A8FC2',
          'blue-light': '#7BB8E5',
        },

        // Pastel semantic colors
        pastel: {
          green: '#7CB77B',
          'green-bg': '#E8F5E8',
          yellow: '#E8A87C',
          'yellow-bg': '#FFF4E8',
          rose: '#D4848C',
          'rose-bg': '#FFE8EA',
        },

        // Surface layers (light theme)
        surface: {
          0: '#F9F7F2',
          1: '#FFFFFF',
          2: '#F5F3EE',
          3: '#E8E6E1',
          DEFAULT: '#F9F7F2',
        },

        // Text
        txt: {
          primary: '#2D2D2D',
          secondary: '#6B6B6B',
          muted: '#9B9B9B',
        },

        // Borders
        border: {
          DEFAULT: '#E8E6E1',
          gold: '#C5A059',
          hover: '#C5A059',
        },

        // Semantic (pastel versions)
        success: '#7CB77B',
        danger: '#D4848C',
        warning: '#E8A87C',
        info: '#8BBAD9',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },

      borderRadius: {
        DEFAULT: '8px',
        card: '8px',
        sm: '4px',
        lg: '12px',
      },

      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
        gold: '0 2px 8px rgba(197, 160, 89, 0.15)',
      },

      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
