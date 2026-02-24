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
  cpl: number
  deals?: Deal[]
  year?: number
  month?: number
  impressions?: number
  clicks?: number
}

const FUNNEL_COLUMNS = [
  'Leads',
  'MQL',
  'Agendamento',
  'Reuniões',
  'Qualificado',
  'Closer Agendada',
  'Closer Realizada',
  'Vendas',
]

// WW Pipelines: 1 (SDR), 3 (Closer), 4 (Planejamento), 17 (Internacional), 31 (Desqualificados)
const WW_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings', 'WW - Internacional', 'Outros Desqualificados | Wedding']

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
  impressions = 0,
  clicks = 0,
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
        return deals.filter(d => d.pipeline && WW_PIPELINES.includes(d.pipeline))
      case 'mql':
        return deals.filter(d => d.pipeline && WW_PIPELINES.includes(d.pipeline))
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

  // Atingimento = Realizado / Deveria
  const shouldBeLeads = calcShouldBe(defaultTarget.leads, monthProgress)
  const shouldBeMql = calcShouldBe(defaultTarget.mql, monthProgress)
  const shouldBeAgendamento = calcShouldBe(defaultTarget.agendamento, monthProgress)
  const shouldBeReunioes = calcShouldBe(defaultTarget.reunioes, monthProgress)
  const shouldBeQualificado = calcShouldBe(defaultTarget.qualificado, monthProgress)
  const shouldBeCloserAgendada = calcShouldBe(defaultTarget.closer_agendada, monthProgress)
  const shouldBeCloserRealizada = calcShouldBe(defaultTarget.closer_realizada, monthProgress)
  const shouldBeVendas = calcShouldBe(defaultTarget.vendas, monthProgress)

  // Main funnel data (8 columns only)
  const planejado = [
    defaultTarget.leads,
    defaultTarget.mql,
    defaultTarget.agendamento,
    defaultTarget.reunioes,
    defaultTarget.qualificado,
    defaultTarget.closer_agendada,
    defaultTarget.closer_realizada,
    defaultTarget.vendas,
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
  ]

  const atingimento = [
    formatPercent(calcAchievement(metrics.leads, shouldBeLeads) - 100),
    formatPercent(calcAchievement(metrics.mql, shouldBeMql) - 100),
    formatPercent(calcAchievement(metrics.agendamento, shouldBeAgendamento) - 100),
    formatPercent(calcAchievement(metrics.reunioes, shouldBeReunioes) - 100),
    formatPercent(calcAchievement(metrics.qualificado, shouldBeQualificado) - 100),
    formatPercent(calcAchievement(metrics.closerAgendada, shouldBeCloserAgendada) - 100),
    formatPercent(calcAchievement(metrics.closerRealizada, shouldBeCloserRealizada) - 100),
    formatPercent(calcAchievement(metrics.vendas, shouldBeVendas) - 100),
  ]

  const deveria = [
    shouldBeLeads,
    shouldBeMql,
    shouldBeAgendamento,
    shouldBeReunioes,
    shouldBeQualificado,
    shouldBeCloserAgendada,
    shouldBeCloserRealizada,
    shouldBeVendas,
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
      formatPercent(calcAchievement(metrics.vendas, previousMetrics.vendas) - 100),
    ]
    : Array(8).fill('')

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
    ]
    : Array(8).fill('')

  const custos = [
    formatCurrency(cpl * metrics.leads),
    formatCurrency(cpl * 1.5 * metrics.mql),
    formatCurrency(cpl * 2 * metrics.agendamento),
    formatCurrency(cpl * 2.5 * metrics.reunioes),
    formatCurrency(cpl * 3 * metrics.qualificado),
    formatCurrency(cpl * 3.5 * metrics.closerAgendada),
    formatCurrency(cpl * 4 * metrics.closerRealizada),
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

  // CVR cards data
  const cvrCards = [
    { label: 'Leads → MQL', value: cvr.cvrMql, prev: prevCvr?.cvrMql, target: 70 },
    { label: 'MQL → Agend.', value: cvr.cvrAg, prev: prevCvr?.cvrAg, target: 45 },
    { label: 'Agend. → Reunião', value: cvr.cvrReu, prev: prevCvr?.cvrReu, target: 70 },
    { label: 'Reunião → SQL', value: cvr.cvrSql, prev: prevCvr?.cvrSql, target: 65 },
    { label: 'SQL → Closer Ag.', value: cvr.cvrRa, prev: prevCvr?.cvrRa, target: 100 },
    { label: 'Closer Ag. → Real.', value: cvr.cvrRr, prev: prevCvr?.cvrRr, target: 87 },
    { label: 'Closer → Venda', value: cvr.cvrVenda, prev: prevCvr?.cvrVenda, target: 35 },
  ]

  return (
    <>
      {/* Main Funnel Table */}
      <div className="overflow-x-auto">
        <table className="funnel-table">
          <thead>
            <tr>
              <th className="w-32"></th>
              {FUNNEL_COLUMNS.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={row.className}>
                <td className="row-label">{row.label}</td>
                {row.data.map((value, colIndex) => {
                  const isRealizadoRow = row.label === 'Realizado'
                  const isClickable = isRealizadoRow && colIndex < 8 && deals.length > 0

                  return (
                    <td
                      key={colIndex}
                      className={`${typeof value === 'string' && value.startsWith('-') ? 'negative' : ''
                        } ${isClickable ? 'cell-clickable' : ''}`}
                      onClick={isClickable ? () => handleStageClick(clickableStages[colIndex].stage, clickableStages[colIndex].label) : undefined}
                    >
                      {isClickable ? (
                        <span className="underline decoration-dotted decoration-wedding-gold/50">{value}</span>
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

      {/* Metrics Cards Section */}
      <div className="mt-6 space-y-4">
        {/* CPL & Conversão Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="metric-card-label">CPL</div>
            <div className="metric-card-value">{formatCurrency(cpl)}</div>
            <div className="metric-card-target">Meta: {formatCurrency(defaultTarget.cpl)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">Conversão Total</div>
            <div className="metric-card-value text-wedding-gold">{formatPercent(cvr.conversaoTotal)}</div>
            <div className="metric-card-target">Leads → Vendas</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">Custo por Venda</div>
            <div className="metric-card-value">
              {metrics.vendas > 0 ? formatCurrency((cpl * metrics.leads) / metrics.vendas) : '—'}
            </div>
            <div className="metric-card-target">Investimento / Vendas</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">Média Score</div>
            <div className="metric-card-value">50</div>
            <div className="metric-card-target">Qualidade dos Leads</div>
          </div>
        </div>

        {/* CVR Flow */}
        <div className="cvr-flow">
          <div className="cvr-flow-title">Taxas de Conversão do Funil</div>
          <div className="cvr-flow-cards">
            {cvrCards.map((card, i) => {
              const isAboveTarget = card.value >= card.target
              const diff = card.prev !== undefined ? card.value - card.prev : null

              return (
                <div key={i} className="cvr-card">
                  <div className="cvr-card-label">{card.label}</div>
                  <div className={`cvr-card-value ${isAboveTarget ? 'text-success' : 'text-danger'}`}>
                    {formatPercent(card.value)}
                  </div>
                  <div className="cvr-card-meta">
                    <span className="cvr-card-target">Meta: {card.target}%</span>
                    {diff !== null && (
                      <span className={`cvr-card-diff ${diff >= 0 ? 'text-success' : 'text-danger'}`}>
                        {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Meta Ads Stats */}
        {impressions > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="metric-card-label">Impressões</div>
              <div className="metric-card-value">{impressions.toLocaleString('pt-BR')}</div>
              <div className="metric-card-target">Meta Ads</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">Cliques</div>
              <div className="metric-card-value">{clicks.toLocaleString('pt-BR')}</div>
              <div className="metric-card-target">Meta Ads</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">CTR</div>
              <div className="metric-card-value">
                {impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0'}%
              </div>
              <div className="metric-card-target">Cliques / Impressões</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">CPC</div>
              <div className="metric-card-value">
                {clicks > 0 ? formatCurrency((cpl * metrics.leads) / clicks) : '—'}
              </div>
              <div className="metric-card-target">Custo por Clique</div>
            </div>
          </div>
        )}
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
