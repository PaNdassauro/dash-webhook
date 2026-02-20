import { cn } from '../../lib/cn';

/**
 * Skeleton — Loading placeholder with shimmer animation.
 *
 * Usage:
 *   <Skeleton className="h-8 w-32" />
 *   <Skeleton className="h-4 w-full" rounded="full" />
 *   <SkeletonCard />
 */

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedClass = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  return (
    <div className={cn('skeleton', roundedClass[rounded], className)} />
  );
}

/** Skeleton for a KPI card */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-5 space-y-3', className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/** Skeleton for a full BU card */
export function SkeletonBUCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-5 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-10" rounded="full" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-1.5 w-full" rounded="full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 pt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-full" rounded="full" />
        ))}
      </div>
    </div>
  );
}
