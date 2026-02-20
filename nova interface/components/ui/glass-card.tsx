import { cn } from '../../lib/cn';
import { type ReactNode } from 'react';

/**
 * GlassCard — Base glassmorphism card.
 *
 * Variants:
 *   default  — static card (`.glass-card`)
 *   hover    — lifts on hover (`.glass-card-hover`)
 *   elevated — raised with deeper shadow (`.glass-card-elevated`)
 *
 * Accent: optional color gradient bleeding from top-left corner.
 */

type Accent = 'brand' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'none';
type Variant = 'default' | 'hover' | 'elevated';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  accent?: Accent;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClass: Record<Variant, string> = {
  default: 'glass-card',
  hover: 'glass-card-hover',
  elevated: 'glass-card-elevated',
};

const accentClass: Record<Accent, string> = {
  brand: 'accent-brand',
  emerald: 'accent-emerald',
  rose: 'accent-rose',
  amber: 'accent-amber',
  violet: 'accent-violet',
  cyan: 'accent-cyan',
  none: '',
};

const glowClass: Record<Accent, string> = {
  brand: 'glow-brand',
  emerald: 'glow-emerald',
  rose: 'glow-rose',
  amber: 'glow-amber',
  violet: 'glow-violet',
  cyan: 'glow-cyan',
  none: '',
};

const paddingClass = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function GlassCard({
  children,
  className,
  variant = 'default',
  accent = 'none',
  glow = false,
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variantClass[variant],
        paddingClass[padding],
        accentClass[accent],
        glow && glowClass[accent],
        className
      )}
    >
      {children}
    </div>
  );
}
