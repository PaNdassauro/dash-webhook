import { format, getDaysInMonth, differenceInDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FunnelMetrics } from './types'

// Format currency in BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

// Get month progress percentage
export function getMonthProgress(date: Date = new Date()): number {
  const daysInMonth = getDaysInMonth(date)
  const dayOfMonth = date.getDate()
  return (dayOfMonth / daysInMonth) * 100
}

// Get days elapsed in month
export function getDaysElapsed(date: Date = new Date()): number {
  const start = startOfMonth(date)
  return differenceInDays(date, start) + 1
}

// Format month name in Portuguese
export function getMonthName(date: Date): string {
  return format(date, 'MMMM', { locale: ptBR }).toUpperCase()
}

// Calculate conversion rate
export function calcConversionRate(from: number, to: number): number {
  if (from === 0) return 0
  return (to / from) * 100
}

// Calculate achievement percentage
export function calcAchievement(actual: number, target: number): number {
  if (target === 0) return 0
  return (actual / target) * 100
}

// Calculate "deveria" (should be) based on month progress
export function calcShouldBe(target: number, progressPercent: number): number {
  return Math.round(target * (progressPercent / 100))
}

// Calculate all conversion rates for funnel
export function calcFunnelCVR(metrics: FunnelMetrics): Record<string, number> {
  return {
    cvrMql: calcConversionRate(metrics.leads, metrics.mql),
    cvrAg: calcConversionRate(metrics.mql, metrics.agendamento),
    cvrReu: calcConversionRate(metrics.agendamento, metrics.reunioes),
    cvrSql: calcConversionRate(metrics.reunioes, metrics.qualificado),
    cvrRa: calcConversionRate(metrics.qualificado, metrics.closerAgendada),
    cvrRr: calcConversionRate(metrics.closerAgendada, metrics.closerRealizada),
    cvrVenda: calcConversionRate(metrics.closerRealizada, metrics.vendas),
    conversaoTotal: calcConversionRate(metrics.leads, metrics.vendas),
  }
}

// Get date range for month
export function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

// Format date for display
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy')
}

// Parse AC date string to Date
export function parseACDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

// Check if value is negative (for styling)
export function isNegative(value: number): boolean {
  return value < 0
}
