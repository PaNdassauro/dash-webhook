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
  fetchPreviousMonthMetrics,
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

function WeddingDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get month from URL or default to current
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
      const [fetchedDeals, targetData, prevMetrics] = await Promise.all([
        fetchDealsForMonth(selectedYear, selectedMonth, 'wedding'),
        fetchMonthlyTarget(selectedYear, selectedMonth, 'wedding'),
        fetchPreviousMonthMetrics(selectedYear, selectedMonth, 'wedding'),
      ])

      setDeals(fetchedDeals)
      setMetrics(calculateFunnelMetrics(fetchedDeals, selectedYear, selectedMonth))
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
    // Update URL with new month
    router.push(`/wedding?year=${year}&month=${month}`, { scroll: false })
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard - Welcome Weddings
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
          investment={15667.30} // Mock value
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

export default function WeddingDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">Carregando...</div>}>
      <WeddingDashboardContent />
    </Suspense>
  )
}
