import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence.
 * Combines clsx (conditional classes) + tailwind-merge (dedup).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-brand-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
