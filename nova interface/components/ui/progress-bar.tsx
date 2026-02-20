import { cn } from '../../lib/cn';

/**
 * ProgressBar — Linear progress bar with gradient fill.
 *
 * Usage:
 *   <ProgressBar value={72} max={100} color="emerald" />
 *   <ProgressBar value={45} max={100} color="rose" marker={80} />
 *   <ProgressBar value={120} max={100} color="emerald" label="+20%" />
 */

type ColorPreset = 'brand' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'violet' | 'auto';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ColorPreset;
  size?: 'sm' | 'md' | 'lg';
  marker?: number;         // Optional target marker position (as % of max)
  label?: string;          // Optional right-side label
  showPercent?: boolean;   // Show percentage on the bar
  className?: string;
}

const sizeClass = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const gradientMap: Record<Exclude<ColorPreset, 'auto'>, string> = {
  brand: 'from-indigo-600 to-indigo-400',
  emerald: 'from-emerald-600 to-emerald-400',
  rose: 'from-rose-600 to-rose-400',
  amber: 'from-amber-600 to-amber-400',
  cyan: 'from-cyan-600 to-cyan-400',
  violet: 'from-violet-600 to-violet-400',
};

const glowMap: Record<Exclude<ColorPreset, 'auto'>, string> = {
  brand: 'shadow-[0_0_8px_rgba(99,102,241,0.4)]',
  emerald: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
  rose: 'shadow-[0_0_8px_rgba(244,63,94,0.4)]',
  amber: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
  cyan: 'shadow-[0_0_8px_rgba(34,211,238,0.4)]',
  violet: 'shadow-[0_0_8px_rgba(167,139,250,0.4)]',
};

function resolveColor(color: ColorPreset, pct: number): Exclude<ColorPreset, 'auto'> {
  if (color !== 'auto') return color;
  if (pct >= 80) return 'emerald';
  if (pct >= 50) return 'amber';
  return 'rose';
}

export function ProgressBar({
  value,
  max = 100,
  color = 'brand',
  size = 'md',
  marker,
  label,
  showPercent = false,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const resolved = resolveColor(color, pct);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3">
        {/* Track */}
        <div
          className={cn(
            'relative flex-1 rounded-full bg-white/[0.06] overflow-hidden',
            sizeClass[size]
          )}
        >
          {/* Fill */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
              gradientMap[resolved],
              glowMap[resolved]
            )}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
          {/* Target marker */}
          {marker !== undefined && (
            <div
              className="absolute inset-y-0 w-0.5 bg-white/30"
              style={{ left: `${Math.min((marker / (max || 1)) * 100, 100)}%` }}
            />
          )}
          {/* Percent on bar */}
          {showPercent && size === 'lg' && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">
              {Math.round(pct)}%
            </span>
          )}
        </div>
        {/* Right label */}
        {label && (
          <span className={cn(
            'text-xs font-mono font-medium tabular-nums shrink-0',
            resolved === 'emerald' && 'text-emerald-400',
            resolved === 'rose' && 'text-rose-400',
            resolved === 'amber' && 'text-amber-400',
            resolved === 'brand' && 'text-brand-400',
            resolved === 'cyan' && 'text-cyan-400',
            resolved === 'violet' && 'text-violet-400',
          )}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
