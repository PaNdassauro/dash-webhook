'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ElopementTable,
  KPICards,
  MonthSelector,
  ViewToggle,
  CleanupButton,
} from '@/components/dashboard'
import { getMonthProgress, calcAchievement } from '@/lib/utils'
import {
  fetchDealsForMonth,
  calculateFunnelMetrics,
  fetchMonthlyTarget,
  fetchPreviousMonthMetrics,
  fetchVendasForMonth,
} from '@/lib/queries'
import type { FunnelMetrics, MonthlyTarget } from '@/lib/types'

const EMPTY_METRICS: FunnelMetrics = {
  leads: 0,
  mql: 0,
  agendamento: 0,
  reunioes: 0,
  qualificado: 0,
  closerAgendada: 0,
  closerRealizada: 0,
  vendas: 0,
}

function ElopementDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlYear = searchParams.get('year')
  const urlMonth = searchParams.get('month')
  const [selectedYear, setSelectedYear] = useState(
    urlYear ? parseInt(urlYear) : new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = useState(
    urlMonth ? parseInt(urlMonth) : new Date().getMonth() + 1
  )
  const [metrics, setMetrics] = useState<FunnelMetrics>(EMPTY_METRICS)
  const [target, setTarget] = useState<MonthlyTarget | null>(null)
  const [previousMetrics, setPreviousMetrics] = useState<FunnelMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<import('@/lib/types').Deal[]>([])

  const monthProgress = getMonthProgress(selectedYear, selectedMonth)
  const resultProgress = target
    ? calcAchievement(metrics.vendas, target.vendas)
    : 0

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [fetchedDeals, targetData, prevMetrics, vendasData] = await Promise.all([
        fetchDealsForMonth(selectedYear, selectedMonth, 'elopement'),
        fetchMonthlyTarget(selectedYear, selectedMonth, 'elopement'),
        fetchPreviousMonthMetrics(selectedYear, selectedMonth, 'elopement'),
        fetchVendasForMonth(selectedYear, selectedMonth, 'elopement'),
      ])

      // Combine deals: created_at deals + vendas deals (deduplicated)
      const allDeals = [
        ...fetchedDeals,
        ...vendasData.deals.filter(d => !fetchedDeals.some(fd => fd.id === d.id))
      ]
      setDeals(allDeals)

      // Calculate metrics using allDeals (includes deals closed in month)
      const baseMetrics = calculateFunnelMetrics(allDeals, selectedYear, selectedMonth)
      setMetrics({ ...baseMetrics, vendas: vendasData.count })
      setTarget(targetData)
      setPreviousMetrics(prevMetrics)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    router.push(`/elopement?year=${year}&month=${month}`, { scroll: false })
  }

  return (
    <main className="dash-page">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="dash-header">
          <div className="flex items-center gap-3">
            <h1 className="dash-title">
              Dashboard — Elopement Wedding
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <CleanupButton />
            <MonthSelector
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onChange={handleMonthChange}
            />
            <ViewToggle year={selectedYear} month={selectedMonth} />
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards
          monthProgress={monthProgress}
          resultProgress={resultProgress}
          investment={9000}
        />

        {/* Dashboard Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="loading-text">
                Carregando dados...
              </div>
            ) : (
              <ElopementTable
                metrics={metrics}
                target={target}
                previousMetrics={previousMetrics}
                monthProgress={monthProgress}
                deals={deals}
                year={selectedYear}
                month={selectedMonth}
              />
            )}
          </div>
        </div>

        {/* Score display */}
        <div className="mt-6 flex justify-end">
          <div className="score-display">
            <div className="score-value">50</div>
            <div className="score-label">Média Score</div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ElopementDashboard() {
  return (
    <Suspense fallback={<div className="dash-page flex items-center justify-center loading-text">Carregando...</div>}>
      <ElopementDashboardContent />
    </Suspense>
  )
}
