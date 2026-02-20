/**
 * ANTIGRAVITY DESIGN SYSTEM — Color Palette Reference
 *
 * Semantic color tokens for use in JS/TS components.
 * CSS custom properties are defined in globals.css.
 */

export const colors = {
  // ── Background Layers ────────────────────────────────
  bg: {
    base: '#0a0f1e',
    surface0: '#111827',
    surface1: '#1e293b',
    surface2: '#334155',
    surface3: '#475569',
  },

  // ── Brand (Indigo) ───────────────────────────────────
  brand: {
    light: '#818cf8',     // brand-400
    DEFAULT: '#6366f1',   // brand-500
    dark: '#4f46e5',      // brand-600
    glow: 'rgba(99, 102, 241, 0.15)',
  },

  // ── Business Unit Identity ───────────────────────────
  bu: {
    ww: {
      color: '#a78bfa',   // violet-400
      bg: 'rgba(167, 139, 250, 0.1)',
      glow: 'rgba(167, 139, 250, 0.15)',
      label: 'WW Weddings',
    },
    elopment: {
      color: '#fb7185',   // rose-400
      bg: 'rgba(251, 113, 133, 0.1)',
      glow: 'rgba(251, 113, 133, 0.15)',
      label: 'Elopment',
    },
    wt: {
      color: '#22d3ee',   // cyan-400
      bg: 'rgba(34, 211, 238, 0.1)',
      glow: 'rgba(34, 211, 238, 0.15)',
      label: 'WT Trips',
    },
  },

  // ── Semantic ─────────────────────────────────────────
  success: '#10b981',   // emerald-500
  danger: '#f43f5e',    // rose-500
  warning: '#f59e0b',   // amber-500
  info: '#06b6d4',      // cyan-500
  neutral: '#64748b',   // slate-500

  // ── Text ─────────────────────────────────────────────
  text: {
    primary: '#e2e8f0',   // slate-200
    secondary: '#94a3b8',  // slate-400
    muted: '#64748b',      // slate-500
    inverse: '#0f172a',    // slate-900
  },

  // ── Glass ────────────────────────────────────────────
  glass: {
    bg: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    highlight: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

/**
 * Get semantic color for a value relative to a target.
 * Green if at/above target, red if below, amber if close.
 */
export function getHealthColor(value: number, target: number): string {
  const ratio = target > 0 ? value / target : 0;
  if (ratio >= 0.95) return colors.success;
  if (ratio >= 0.75) return colors.warning;
  return colors.danger;
}

/**
 * Get Tailwind class for health status.
 */
export function getHealthClass(value: number, target: number): string {
  const ratio = target > 0 ? value / target : 0;
  if (ratio >= 0.95) return 'text-emerald-400';
  if (ratio >= 0.75) return 'text-amber-400';
  return 'text-rose-400';
}

/**
 * Get BU color config by key.
 */
export function getBuColor(bu: 'ww' | 'elopment' | 'wt') {
  return colors.bu[bu];
}
