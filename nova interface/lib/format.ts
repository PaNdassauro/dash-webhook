/**
 * ANTIGRAVITY DESIGN SYSTEM — pt-BR Formatters
 *
 * All numbers formatted for Brazilian Portuguese locale.
 * Currency in BRL (R$), comma as decimal separator.
 */

/** Format value in cents as BRL: R$ 1.234,56 */
export function formatBRL(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format value in cents as compact BRL: R$ 1,2M or R$ 450K */
export function formatBRLCompact(cents: number): string {
  const value = cents / 100;
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}K`;
  }
  return formatBRL(cents);
}

/** Format as percentage: 85,3% */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/** Format integer with thousands separator: 1.234 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('pt-BR');
}

/** Format days: "12 dias" */
export function formatDays(value: number): string {
  const rounded = Math.round(value);
  return `${rounded} ${rounded === 1 ? 'dia' : 'dias'}`;
}

/** Determine trend direction */
export function getTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
  if (current > previous * 1.01) return 'up';
  if (current < previous * 0.99) return 'down';
  return 'neutral';
}

/** Calculate percentage change */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
