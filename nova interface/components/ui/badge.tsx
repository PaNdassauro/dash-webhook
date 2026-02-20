import { cn } from '../../lib/cn';
import { type ReactNode } from 'react';

/**
 * Badge — Status pill with semantic color coding.
 *
 * Usage:
 *   <Badge color="emerald">On Track</Badge>
 *   <Badge color="rose" dot>Behind</Badge>
 *   <Badge color="amber" size="lg">Attention</Badge>
 */

type BadgeColor = 'brand' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'violet' | 'slate';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;         // Show a colored dot before text
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  brand: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const dotClasses: Record<BadgeColor, string> = {
  brand: 'bg-indigo-400',
  emerald: 'bg-emerald-400',
  rose: 'bg-rose-400',
  amber: 'bg-amber-400',
  cyan: 'bg-cyan-400',
  violet: 'bg-violet-400',
  slate: 'bg-slate-400',
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function Badge({
  children,
  color = 'brand',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[color])} />
      )}
      {children}
    </span>
  );
}
