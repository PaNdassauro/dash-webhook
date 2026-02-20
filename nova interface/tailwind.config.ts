import type { Config } from 'tailwindcss';

/**
 * ANTIGRAVITY DESIGN SYSTEM — Tailwind Config
 *
 * Premium dark glassmorphism theme for revenue dashboards.
 * Colors, fonts, animations, and spacing tokens.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /* ── Colors ──────────────────────────────────────── */
      colors: {
        // Brand (Indigo)
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
          950: '#1e1b4b',
        },

        // Surface (dark theme layers)
        surface: {
          0: '#0a0f1e',   // deepest background
          1: '#111827',   // card backgrounds
          2: '#1e293b',   // elevated surfaces
          3: '#334155',   // borders, dividers
          4: '#475569',   // muted text
        },

        // BU Identity Colors
        bu: {
          ww: '#a78bfa',       // violet-400 — WW Weddings
          elopment: '#fb7185', // rose-400 — Elopment
          wt: '#22d3ee',       // cyan-400 — WT Trips
        },
      },

      /* ── Fonts ───────────────────────────────────────── */
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      /* ── Animations ──────────────────────────────────── */
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'count-up': 'count-up 0.8s ease-out',
        'spin-slow': 'spin-slow 8s linear infinite',
        shimmer: 'shimmer 2s infinite linear',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },

      /* ── Border Radius ───────────────────────────────── */
      borderRadius: {
        'glass': '1rem',
        'glass-sm': '0.5rem',
        'glass-lg': '1.5rem',
      },

      /* ── Backdrop Blur ───────────────────────────────── */
      backdropBlur: {
        glass: '20px',
      },

      /* ── Box Shadow ──────────────────────────────────── */
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.3)',
        'glow-brand': '0 0 15px rgba(99, 102, 241, 0.15), 0 0 45px rgba(99, 102, 241, 0.05)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.15), 0 0 45px rgba(16, 185, 129, 0.05)',
        'glow-rose': '0 0 15px rgba(244, 63, 94, 0.15), 0 0 45px rgba(244, 63, 94, 0.05)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.15), 0 0 45px rgba(245, 158, 11, 0.05)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.15), 0 0 45px rgba(6, 182, 212, 0.05)',
        'glow-violet': '0 0 15px rgba(167, 139, 250, 0.15), 0 0 45px rgba(167, 139, 250, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
