'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  FunnelTable,
  KPICards,
  HeaderStats,
  MonthSelector,
  ViewToggle,
} from '@/components/dashboard'
import { getMonthProgress, calcAchievement } from '@/lib/utils'
import {
  fetchDealsForMonth,
  calculateFunnelMetrics,
  fetchMonthlyTarget,
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

function mergeMetrics(a: FunnelMetrics, b: FunnelMetrics): FunnelMetrics {
  return {
    leads: a.leads + b.leads,
    mql: a.mql + b.mql,
    agendamento: a.agendamento + b.agendamento,
    reunioes: a.reunioes + b.reunioes,
    qualificado: a.qualificado + b.qualificado,
    closerAgendada: a.closerAgendada + b.closerAgendada,
    closerRealizada: a.closerRealizada + b.closerRealizada,
    vendas: a.vendas + b.vendas,
  }
}

function mergeTargets(a: MonthlyTarget | null, b: MonthlyTarget | null): MonthlyTarget | null {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return {
    ...a,
    leads: a.leads + b.leads,
    mql: a.mql + b.mql,
    agendamento: a.agendamento + b.agendamento,
    reunioes: a.reunioes + b.reunioes,
    qualificado: a.qualificado + b.qualificado,
    closer_agendada: a.closer_agendada + b.closer_agendada,
    closer_realizada: a.closer_realizada + b.closer_realizada,
    vendas: a.vendas + b.vendas,
    cpl: (a.cpl + b.cpl) / 2,
  }
}

function TotalDashboardContent() {
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

  const selectedDate = new Date(selectedYear, selectedMonth - 1, 1)
  const monthProgress = getMonthProgress(new Date())
  const resultProgress = target
    ? calcAchievement(metrics.vendas, target.vendas)
    : 0

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch both wedding and elopement data
      const [weddingDeals, elopementDeals, weddingTarget, elopementTarget] = await Promise.all([
        fetchDealsForMonth(selectedYear, selectedMonth, 'wedding'),
        fetchDealsForMonth(selectedYear, selectedMonth, 'elopement'),
        fetchMonthlyTarget(selectedYear, selectedMonth, 'wedding'),
        fetchMonthlyTarget(selectedYear, selectedMonth, 'elopement'),
      ])

      const allDeals = [...weddingDeals, ...elopementDeals]
      setDeals(allDeals)

      const weddingMetrics = calculateFunnelMetrics(weddingDeals, selectedYear, selectedMonth)
      const elopementMetrics = calculateFunnelMetrics(elopementDeals, selectedYear, selectedMonth)

      setMetrics(mergeMetrics(weddingMetrics, elopementMetrics))
      setTarget(mergeTargets(weddingTarget, elopementTarget))

      // Previous month
      let prevYear = selectedYear
      let prevMonth = selectedMonth - 1
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear = selectedYear - 1
      }

      const [prevWedding, prevElopement] = await Promise.all([
        fetchDealsForMonth(prevYear, prevMonth, 'wedding'),
        fetchDealsForMonth(prevYear, prevMonth, 'elopement'),
      ])

      setPreviousMetrics(mergeMetrics(
        calculateFunnelMetrics(prevWedding, prevYear, prevMonth),
        calculateFunnelMetrics(prevElopement, prevYear, prevMonth)
      ))
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
    router.push(`/total?year=${year}&month=${month}`, { scroll: false })
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard - Total (WW + Elopement)
          </h1>
          <div className="flex gap-4 items-center">
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
          investment={24667.30} // Mock value (combined)
        />

        {/* Dashboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <HeaderStats
            selectedMonth={selectedDate}
            lastUpdate={new Date()}
          />
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando dados...
              </div>
            ) : (
              <FunnelTable
                metrics={metrics}
                target={target}
                previousMetrics={previousMetrics}
                monthProgress={monthProgress}
                cpl={43.76} // Mock CPL
                deals={deals}
                year={selectedYear}
                month={selectedMonth}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function TotalDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">Carregando...</div>}>
      <TotalDashboardContent />
    </Suspense>
  )
}
