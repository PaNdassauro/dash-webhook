/**
 * ANTIGRAVITY DESIGN SYSTEM
 *
 * Premium dark glassmorphism design system for revenue dashboards.
 *
 * Files:
 *   globals.css         — Import this in your app's root CSS
 *   tailwind.config.ts  — Extend your Tailwind config with these tokens
 *
 * Components:
 *   GlassCard           — Base glassmorphism card (default, hover, elevated)
 *   ProgressRing        — SVG circular progress indicator
 *   ProgressBar         — Linear progress bar with gradient fill
 *   MetricValue         — Large formatted number + trend arrow
 *   Badge               — Status pill with semantic colors
 *   Skeleton            — Shimmer loading placeholders
 *   MonthSelector       — Month navigation ◀ MONTH YEAR ▶
 *
 * Utilities:
 *   cn()                — clsx + tailwind-merge
 *   colors              — Color palette constants + helpers
 *   format*             — pt-BR formatters (BRL, percent, number)
 */

// Components
export { GlassCard } from './components/ui/glass-card';
export { ProgressRing, autoColor } from './components/ui/progress-ring';
export { ProgressBar } from './components/ui/progress-bar';
export { MetricValue } from './components/ui/metric-value';
export { Badge } from './components/ui/badge';
export { Skeleton, SkeletonCard, SkeletonBUCard } from './components/ui/skeleton';
export { MonthSelector } from './components/ui/month-selector';

// Utilities
export { cn } from './lib/cn';
export { colors, getHealthColor, getHealthClass, getBuColor } from './lib/colors';
export {
  formatBRL,
  formatBRLCompact,
  formatPercent,
  formatNumber,
  formatDays,
  getTrend,
  percentChange,
} from './lib/format';
