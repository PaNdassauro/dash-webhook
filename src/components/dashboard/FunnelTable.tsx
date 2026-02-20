'use client'

import { useState } from 'react'
import { formatPercent, formatCurrency, calcAchievement, calcShouldBe, calcFunnelCVR } from '@/lib/utils'
import type { FunnelMetrics, MonthlyTarget, Deal } from '@/lib/types'
import { DealsModal } from './DealsModal'

interface FunnelTableProps {
  metrics: FunnelMetrics
  target: MonthlyTarget | null
  previousMetrics: FunnelMetrics | null
  monthProgress: number
  cpl: number // mock for now
  deals?: Deal[]
  year?: number
  month?: number
}

const COLUMNS = [
  'Leads',
  'MQL',
  'Agendamento',
  'Reuniões',
  'Qualificado',
  'Closer Agendada',
  'Closer realizada',
  'Vendas',
  'CPL',
  'CVR (MQL)',
  'CVR (Ag)',
  'CVR (Reu)',
  'CVR (SQL)',
  'CVR (RA)',
  'CVR (RR)',
  'CVR (Venda)',
  'Conversão',
  'Média Score',
]

// MQL pipelines
const MQL_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings']

// Helper to check if a date falls within a specific month
function isInMonth(dateStr: string | null, year: number, month: number): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

type StageKey = 'leads' | 'mql' | 'agendamento' | 'reunioes' | 'qualificado' | 'closerAgendada' | 'closerRealizada' | 'vendas'

export function FunnelTable({
  metrics,
  target,
  previousMetrics,
  monthProgress,
  cpl,
  deals = [],
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}: FunnelTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalDeals, setModalDeals] = useState<Deal[]>([])

  const cvr = calcFunnelCVR(metrics)
  const prevCvr = previousMetrics ? calcFunnelCVR(previousMetrics) : null

  // Filter deals by stage
  const getDealsForStage = (stage: StageKey): Deal[] => {
    switch (stage) {
      case 'leads':
        return deals
      case 'mql':
        return deals.filter(d => d.pipeline && MQL_PIPELINES.includes(d.pipeline))
      case 'agendamento':
        return deals.filter(d => isInMonth(d.data_reuniao_1, year, month))
      case 'reunioes':
        return deals.filter(d =>
          isInMonth(d.data_reuniao_1, year, month) &&
          d.como_reuniao_1 !== null &&
          d.como_reuniao_1 !== '' &&
          d.como_reuniao_1 !== 'Não teve reunião'
        )
      case 'qualificado':
        return deals.filter(d =>
          isInMonth(d.data_qualificado, year, month) ||
          d.qualificado_sql === true
        )
      case 'closerAgendada':
        return deals.filter(d =>
          isInMonth(d.data_closer, year, month) ||
          (d.data_closer !== null && d.data_closer !== '')
        )
      case 'closerRealizada':
        return deals.filter(d => d.reuniao_closer !== null && d.reuniao_closer !== '')
      case 'vendas':
        return deals.filter(d =>
          isInMonth(d.data_fechamento, year, month) &&
          !(d.title?.startsWith('EW'))
        )
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

  // Default target if none exists
  const defaultTarget: MonthlyTarget = target || {
    month: '',
    pipeline_type: 'wedding',
    leads: 0,
    mql: 0,
    agendamento: 0,
    reunioes: 0,
    qualificado: 0,
    closer_agendada: 0,
    closer_realizada: 0,
    vendas: 0,
    cpl: 0,
  }

  // Build row data
  const planejado = [
    defaultTarget.leads,
    defaultTarget.mql,
    defaultTarget.agendamento,
    defaultTarget.reunioes,
    defaultTarget.qualificado,
    defaultTarget.closer_agendada,
    defaultTarget.closer_realizada,
    defaultTarget.vendas,
    formatCurrency(defaultTarget.cpl),
    '70,00%',
    '45,00%',
    '70,00%',
    '65,00%',
    '100,00%',
    '87,00%',
    '35,00%',
    '4,00%',
    '',
  ]

  // Clickable metrics for the "Realizado" row
  const clickableStages: { stage: StageKey; label: string; value: number }[] = [
    { stage: 'leads', label: 'Leads', value: metrics.leads },
    { stage: 'mql', label: 'MQL', value: metrics.mql },
    { stage: 'agendamento', label: 'Agendamento', value: metrics.agendamento },
    { stage: 'reunioes', label: 'Reuniões', value: metrics.reunioes },
    { stage: 'qualificado', label: 'Qualificado', value: metrics.qualificado },
    { stage: 'closerAgendada', label: 'Closer Agendada', value: metrics.closerAgendada },
    { stage: 'closerRealizada', label: 'Closer Realizada', value: metrics.closerRealizada },
    { stage: 'vendas', label: 'Vendas', value: metrics.vendas },
  ]

  const realizado = [
    metrics.leads,
    metrics.mql,
    metrics.agendamento,
    metrics.reunioes,
    metrics.qualificado,
    metrics.closerAgendada,
    metrics.closerRealizada,
    metrics.vendas,
    formatCurrency(cpl),
    formatPercent(cvr.cvrMql),
    formatPercent(cvr.cvrAg),
    formatPercent(cvr.cvrReu),
    formatPercent(cvr.cvrSql),
    formatPercent(cvr.cvrRa),
    formatPercent(cvr.cvrRr),
    formatPercent(cvr.cvrVenda),
    formatPercent(cvr.conversaoTotal),
    '',
  ]

  const atingimento = [
    formatPercent(calcAchievement(metrics.leads, defaultTarget.leads)),
    formatPercent(calcAchievement(metrics.mql, defaultTarget.mql)),
    formatPercent(calcAchievement(metrics.agendamento, defaultTarget.agendamento)),
    formatPercent(calcAchievement(metrics.reunioes, defaultTarget.reunioes)),
    formatPercent(calcAchievement(metrics.qualificado, defaultTarget.qualificado)),
    formatPercent(calcAchievement(metrics.closerAgendada, defaultTarget.closer_agendada)),
    formatPercent(calcAchievement(metrics.closerRealizada, defaultTarget.closer_realizada)),
    formatPercent(calcAchievement(metrics.vendas, defaultTarget.vendas)),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]

  const deveria = [
    calcShouldBe(defaultTarget.leads, monthProgress),
    calcShouldBe(defaultTarget.mql, monthProgress),
    calcShouldBe(defaultTarget.agendamento, monthProgress),
    calcShouldBe(defaultTarget.reunioes, monthProgress),
    calcShouldBe(defaultTarget.qualificado, monthProgress),
    calcShouldBe(defaultTarget.closer_agendada, monthProgress),
    calcShouldBe(defaultTarget.closer_realizada, monthProgress),
    calcShouldBe(defaultTarget.vendas, monthProgress),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]

  const periodoAnteriorPct = previousMetrics
    ? [
        formatPercent(calcAchievement(metrics.leads, previousMetrics.leads) - 100),
        formatPercent(calcAchievement(metrics.mql, previousMetrics.mql) - 100),
        formatPercent(calcAchievement(metrics.agendamento, previousMetrics.agendamento) - 100),
        formatPercent(calcAchievement(metrics.reunioes, previousMetrics.reunioes) - 100),
        formatPercent(calcAchievement(metrics.qualificado, previousMetrics.qualificado) - 100),
        formatPercent(calcAchievement(metrics.closerAgendada, previousMetrics.closerAgendada) - 100),
        formatPercent(calcAchievement(metrics.closerRealizada, previousMetrics.closerRealizada) - 100),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ]
    : Array(18).fill('')

  const periodoAnterior = previousMetrics
    ? [
        previousMetrics.leads,
        previousMetrics.mql,
        previousMetrics.agendamento,
        previousMetrics.reunioes,
        previousMetrics.qualificado,
        previousMetrics.closerAgendada,
        previousMetrics.closerRealizada,
        previousMetrics.vendas,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ]
    : Array(18).fill('')

  const custos = [
    formatCurrency(cpl * metrics.leads),
    formatCurrency(cpl * 1.5 * metrics.mql),
    formatCurrency(cpl * 2 * metrics.agendamento),
    formatCurrency(cpl * 2.5 * metrics.reunioes),
    formatCurrency(cpl * 3 * metrics.qualificado),
    formatCurrency(cpl * 3.5 * metrics.closerAgendada),
    formatCurrency(cpl * 4 * metrics.closerRealizada),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]

  const rows = [
    { label: 'Planejado', data: planejado, className: 'row-planejado' },
    { label: 'Realizado', data: realizado, className: 'row-realizado' },
    { label: 'Atingimento (%)', data: atingimento, className: 'row-atingimento' },
    { label: 'Deveria', data: deveria, className: 'row-deveria' },
    { label: 'Período anterior (%)', data: periodoAnteriorPct, className: 'row-periodo-anterior-pct' },
    { label: 'Período Anterior', data: periodoAnterior, className: 'row-periodo-anterior' },
    { label: 'Custos', data: custos, className: 'row-custos' },
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
                  // Make "Realizado" row metrics clickable (first 8 columns)
                  const isRealizadoRow = row.label === 'Realizado'
                  const isClickable = isRealizadoRow && colIndex < 8 && deals.length > 0

                  return (
                    <td
                      key={colIndex}
                      className={`${
                        typeof value === 'string' && value.startsWith('-') ? 'negative' : ''
                      } ${isClickable ? 'cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors' : ''}`}
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
