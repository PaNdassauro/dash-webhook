import { cn } from '../../lib/cn';

/**
 * MonthSelector — Navigate between months with ◀ ▶ controls.
 *
 * Usage:
 *   <MonthSelector
 *     month={2}
 *     year={2026}
 *     onPrev={() => ...}
 *     onNext={() => ...}
 *   />
 */

interface MonthSelectorProps {
  month: number;         // 1-12
  year: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

const MONTH_NAMES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];

export function MonthSelector({
  month,
  year,
  onPrev,
  onNext,
  className,
}: MonthSelectorProps) {
  const monthName = MONTH_NAMES[month - 1] ?? '';

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {/* Prev button */}
      <button
        onClick={onPrev}
        className="w-8 h-8 flex items-center justify-center rounded-lg
                   bg-white/[0.04] border border-white/[0.06]
                   text-slate-400 hover:text-white hover:bg-white/[0.08]
                   hover:border-white/[0.12] transition-all duration-200"
        aria-label="Previous month"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Month label */}
      <div className="min-w-[180px] text-center">
        <span className="text-sm font-semibold tracking-wider text-slate-200">
          {monthName}
        </span>
        <span className="text-sm font-medium text-slate-500 ml-2">
          {year}
        </span>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-8 h-8 flex items-center justify-center rounded-lg
                   bg-white/[0.04] border border-white/[0.06]
                   text-slate-400 hover:text-white hover:bg-white/[0.08]
                   hover:border-white/[0.12] transition-all duration-200"
        aria-label="Next month"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
