import { cn } from '../../lib/cn';

/**
 * ProgressRing — SVG circular progress indicator.
 *
 * Usage:
 *   <ProgressRing value={72} max={100} color="emerald" size={64} />
 *   <ProgressRing value={65.5} max={100} color="brand" size={48} label="65%" />
 */

type ColorPreset = 'brand' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'violet';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: ColorPreset;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const colorMap: Record<ColorPreset, { stroke: string; glow: string }> = {
  brand: { stroke: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)' },
  emerald: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
  rose: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)' },
  amber: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
  cyan: { stroke: '#22d3ee', glow: 'rgba(34, 211, 238, 0.3)' },
  violet: { stroke: '#a78bfa', glow: 'rgba(167, 139, 250, 0.3)' },
};

/**
 * Auto-select color based on percentage: green ≥80%, amber ≥50%, red <50%
 */
export function autoColor(pct: number): ColorPreset {
  if (pct >= 80) return 'emerald';
  if (pct >= 50) return 'amber';
  return 'rose';
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  color = 'brand',
  label,
  showValue = true,
  className,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const { stroke, glow } = colorMap[color];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out',
            filter: `drop-shadow(0 0 6px ${glow})`,
          }}
        />
      </svg>
      {/* Center label */}
      {(showValue || label) && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono font-bold tabular-nums text-slate-200"
            style={{ fontSize: size * 0.22 }}
          >
            {label ?? `${Math.round(pct)}%`}
          </span>
        </span>
      )}
    </div>
  );
}
