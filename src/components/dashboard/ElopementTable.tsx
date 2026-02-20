'use client'

import { useState } from 'react'
import { formatPercent, calcAchievement, calcConversionRate } from '@/lib/utils'
import type { FunnelMetrics, MonthlyTarget, Deal } from '@/lib/types'
import { DealsModal } from './DealsModal'

interface ElopementTableProps {
  metrics: FunnelMetrics
  target: MonthlyTarget | null
  previousMetrics: FunnelMetrics | null
  deals?: Deal[]
  year?: number
  month?: number
}

const COLUMNS = ['Leads', 'Vendas', 'CVR (Leads → Vendas)', 'Média Score']

// Helper to check if a date falls within a specific month
function isInMonth(dateStr: string | null, year: number, month: number): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

type StageKey = 'leads' | 'vendas'

export function ElopementTable({
  metrics,
  target,
  previousMetrics,
  deals = [],
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}: ElopementTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalDeals, setModalDeals] = useState<Deal[]>([])

  const cvr = calcConversionRate(metrics.leads, metrics.vendas)

  // Filter deals by stage
  const getDealsForStage = (stage: StageKey): Deal[] => {
    switch (stage) {
      case 'leads':
        return deals
      case 'vendas':
        return deals.filter(d => isInMonth(d.data_fechamento, year, month))
      default:
        return []
    }
  }

  const handleStageClick = (stage: StageKey, title: string) => {
    if (!deals.length) return
    setModalTitle(title)
    setModalDeals(getDealsForStage(stage))
    setModalOpen(true)
  }

  const clickableStages: { stage: StageKey; label: string }[] = [
    { stage: 'leads', label: 'Leads' },
    { stage: 'vendas', label: 'Vendas' },
  ]

  const defaultTarget = target || {
    leads: 0,
    vendas: 0,
  }

  const rows = [
    {
      label: 'Planejado',
      data: [defaultTarget.leads, defaultTarget.vendas, '—', '—'],
      className: 'row-planejado',
    },
    {
      label: 'Realizado',
      data: [metrics.leads, metrics.vendas, formatPercent(cvr), '50'],
      className: 'row-realizado',
    },
    {
      label: 'Atingimento (%)',
      data: [
        formatPercent(calcAchievement(metrics.leads, defaultTarget.leads)),
        formatPercent(calcAchievement(metrics.vendas, defaultTarget.vendas)),
        '—',
        '—',
      ],
      className: 'row-atingimento',
    },
    {
      label: 'Período Anterior',
      data: previousMetrics
        ? [previousMetrics.leads, previousMetrics.vendas, formatPercent(calcConversionRate(previousMetrics.leads, previousMetrics.vendas)), '—']
        : ['—', '—', '—', '—'],
      className: 'row-periodo-anterior',
    },
  ]

  return (
    <>
      <div className="overflow-x-auto">
        <table className="funnel-table">
          <thead>
            <tr>
              <th className="w-32"></th>
              {COLUMNS.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={row.className}>
                <td className="font-semibold text-left bg-gray-100">{row.label}</td>
                {row.data.map((value, colIndex) => {
                  // Make "Realizado" row Leads and Vendas clickable (first 2 columns)
                  const isRealizadoRow = row.label === 'Realizado'
                  const isClickable = isRealizadoRow && colIndex < 2 && deals.length > 0

                  return (
                    <td
                      key={colIndex}
                      className={isClickable ? 'cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors' : ''}
                      onClick={isClickable ? () => handleStageClick(clickableStages[colIndex].stage, clickableStages[colIndex].label) : undefined}
                    >
                      {isClickable ? (
                        <span className="underline decoration-dotted">{value}</span>
                      ) : (
                        value
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DealsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        deals={modalDeals}
      />
    </>
  )
}
