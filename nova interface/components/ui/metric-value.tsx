import { cn } from '../../lib/cn';

/**
 * MetricValue — Large formatted number with optional trend indicator.
 *
 * Usage:
 *   <MetricValue value="R$ 2,3M" />
 *   <MetricValue value="R$ 450.200" trend="up" trendLabel="+12,5%" />
 *   <MetricValue value="72" suffix="%" size="xl" />
 */

interface MetricValueProps {
  value: string | number;
  suffix?: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;       // Tailwind text color class
  className?: string;
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

const trendIcon = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

const trendColor = {
  up: 'text-emerald-400',
  down: 'text-rose-400',
  neutral: 'text-slate-500',
};

export function MetricValue({
  value,
  suffix,
  prefix,
  trend,
  trendLabel,
  size = 'md',
  color,
  className,
}: MetricValueProps) {
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      {/* Main value */}
      <span
        className={cn(
          'font-mono font-bold tabular-nums tracking-tight animate-count-up',
          sizeMap[size],
          color ?? 'text-slate-100'
        )}
      >
        {prefix}
        {value}
        {suffix && (
          <span className="text-[0.6em] font-semibold text-slate-400 ml-0.5">
            {suffix}
          </span>
        )}
      </span>

      {/* Trend badge */}
      {trend && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
            trendColor[trend]
          )}
        >
          <span className="text-[10px]">{trendIcon[trend]}</span>
          {trendLabel}
        </span>
      )}
    </div>
  );
}
