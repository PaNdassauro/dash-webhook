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
  isTotal?: boolean
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

// Leads Pipelines: 1 (SDR), 3 (Closer), 4 (Planejamento), 17 (Internacional), 31 (Desqualificados)
const LEADS_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings', 'WW - Internacional', 'Outros Desqualificados | Wedding']

// MQL Pipelines: only 1 (SDR), 3 (Closer), 4 (Planejamento)
const MQL_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings']

// Helper to check if deal is Elopement (title starts with EW only)
// DW = Destination Wedding, counts in WW General
function isElopementTitle(title: string | null): boolean {
  if (!title) return false
  return title.startsWith('EW')
}

// Helper to check if deal is Elopement (by is_elopement flag OR title)
function isElopementDeal(d: { is_elopement?: boolean | null; title?: string | null }): boolean {
  return d.is_elopement === true || isElopementTitle(d.title ?? null)
}

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
  isTotal = false,
}: FunnelTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalDeals, setModalDeals] = useState<Deal[]>([])
  const [modalStageKey, setModalStageKey] = useState<StageKey>('leads')

  // Helper to check if deal was created in the selected month
  const isCreatedInMonth = (d: Deal): boolean => {
    if (!d.created_at) return false
    const date = new Date(d.created_at)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  }

  // Filter deals by stage - these are the deals that will appear in modal
  const getDealsForStage = (stage: StageKey): Deal[] => {
    switch (stage) {
      case 'leads':
        // Leads must be created in the selected month
        if (isTotal) {
          // Total view: WW leads + Elopement leads
          // WW leads: pipeline in LEADS_PIPELINES and NOT elopement
          // Elopement leads: is_elopement=true OR title starts with 'EW'
          return deals.filter(d =>
            isCreatedInMonth(d) && (
              (d.pipeline && LEADS_PIPELINES.includes(d.pipeline) && !isElopementDeal(d)) ||
              isElopementDeal(d)
            )
          )
        }
        // WW only
        return deals.filter(d =>
          d.pipeline &&
          LEADS_PIPELINES.includes(d.pipeline) &&
          !isElopementDeal(d) &&
          isCreatedInMonth(d)
        )
      case 'mql':
        // MQL must be created in the selected month
        return deals.filter(d =>
          d.pipeline &&
          MQL_PIPELINES.includes(d.pipeline) &&
          !isElopementDeal(d) &&
          isCreatedInMonth(d)
        )
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
        return deals.filter(d => isInMonth(d.data_qualificado, year, month))
      case 'closerAgendada':
        return deals.filter(d => isInMonth(d.data_closer, year, month))
      case 'closerRealizada':
        return deals.filter(d =>
          isInMonth(d.data_closer, year, month) &&
          d.reuniao_closer !== null &&
          d.reuniao_closer !== ''
        )
      case 'vendas':
        // In Total view, include both WW and Elopement vendas
        // For vendas, just check data_fechamento
        return deals.filter(d =>
          isInMonth(d.data_fechamento, year, month) &&
          (isTotal || !isElopementDeal(d))
        )
      default:
        return []
    }
  }

  // Calculate actual metrics from deals (ensures table matches modal)
  // For Total view, use the pre-calculated metrics (sum of WW + Elopement) for leads and vendas
  const actualMetrics: FunnelMetrics = isTotal ? {
    leads: metrics.leads, // Use pre-calculated sum from Total page
    mql: getDealsForStage('mql').length,
    agendamento: getDealsForStage('agendamento').length,
    reunioes: getDealsForStage('reunioes').length,
    qualificado: getDealsForStage('qualificado').length,
    closerAgendada: getDealsForStage('closerAgendada').length,
    closerRealizada: getDealsForStage('closerRealizada').length,
    vendas: metrics.vendas, // Use pre-calculated sum from Total page
  } : {
    leads: getDealsForStage('leads').length,
    mql: getDealsForStage('mql').length,
    agendamento: getDealsForStage('agendamento').length,
    reunioes: getDealsForStage('reunioes').length,
    qualificado: getDealsForStage('qualificado').length,
    closerAgendada: getDealsForStage('closerAgendada').length,
    closerRealizada: getDealsForStage('closerRealizada').length,
    vendas: getDealsForStage('vendas').length,
  }

  const cvr = calcFunnelCVR(actualMetrics)
  const prevCvr = previousMetrics ? calcFunnelCVR(previousMetrics) : null

  const handleStageClick = (stage: StageKey, title: string) => {
    if (!deals.length) return
    setModalTitle(title)
    setModalDeals(getDealsForStage(stage))
    setModalStageKey(stage)
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

  // Clickable metrics for the "Realizado" row - use actualMetrics to match modal
  const clickableStages: { stage: StageKey; label: string; value: number }[] = [
    { stage: 'leads', label: 'Leads', value: actualMetrics.leads },
    { stage: 'mql', label: 'MQL', value: actualMetrics.mql },
    { stage: 'agendamento', label: 'Agendamento', value: actualMetrics.agendamento },
    { stage: 'reunioes', label: 'Reuniões', value: actualMetrics.reunioes },
    { stage: 'qualificado', label: 'Qualificado', value: actualMetrics.qualificado },
    { stage: 'closerAgendada', label: 'Closer Agendada', value: actualMetrics.closerAgendada },
    { stage: 'closerRealizada', label: 'Closer Realizada', value: actualMetrics.closerRealizada },
    { stage: 'vendas', label: 'Vendas', value: actualMetrics.vendas },
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

  // Main funnel data (8 columns only) - use actualMetrics to match modal
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
    actualMetrics.leads,
    actualMetrics.mql,
    actualMetrics.agendamento,
    actualMetrics.reunioes,
    actualMetrics.qualificado,
    actualMetrics.closerAgendada,
    actualMetrics.closerRealizada,
    actualMetrics.vendas,
  ]

  const atingimento = [
    formatPercent(calcAchievement(actualMetrics.leads, shouldBeLeads) - 100),
    formatPercent(calcAchievement(actualMetrics.mql, shouldBeMql) - 100),
    formatPercent(calcAchievement(actualMetrics.agendamento, shouldBeAgendamento) - 100),
    formatPercent(calcAchievement(actualMetrics.reunioes, shouldBeReunioes) - 100),
    formatPercent(calcAchievement(actualMetrics.qualificado, shouldBeQualificado) - 100),
    formatPercent(calcAchievement(actualMetrics.closerAgendada, shouldBeCloserAgendada) - 100),
    formatPercent(calcAchievement(actualMetrics.closerRealizada, shouldBeCloserRealizada) - 100),
    formatPercent(calcAchievement(actualMetrics.vendas, shouldBeVendas) - 100),
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
      formatPercent(calcAchievement(actualMetrics.leads, previousMetrics.leads) - 100),
      formatPercent(calcAchievement(actualMetrics.mql, previousMetrics.mql) - 100),
      formatPercent(calcAchievement(actualMetrics.agendamento, previousMetrics.agendamento) - 100),
      formatPercent(calcAchievement(actualMetrics.reunioes, previousMetrics.reunioes) - 100),
      formatPercent(calcAchievement(actualMetrics.qualificado, previousMetrics.qualificado) - 100),
      formatPercent(calcAchievement(actualMetrics.closerAgendada, previousMetrics.closerAgendada) - 100),
      formatPercent(calcAchievement(actualMetrics.closerRealizada, previousMetrics.closerRealizada) - 100),
      formatPercent(calcAchievement(actualMetrics.vendas, previousMetrics.vendas) - 100),
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
    formatCurrency(cpl * actualMetrics.leads),
    formatCurrency(cpl * 1.5 * actualMetrics.mql),
    formatCurrency(cpl * 2 * actualMetrics.agendamento),
    formatCurrency(cpl * 2.5 * actualMetrics.reunioes),
    formatCurrency(cpl * 3 * actualMetrics.qualificado),
    formatCurrency(cpl * 3.5 * actualMetrics.closerAgendada),
    formatCurrency(cpl * 4 * actualMetrics.closerRealizada),
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
              {actualMetrics.vendas > 0 ? formatCurrency((cpl * actualMetrics.leads) / actualMetrics.vendas) : '—'}
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
                {clicks > 0 ? formatCurrency((cpl * actualMetrics.leads) / clicks) : '—'}
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
        stageKey={modalStageKey}
      />
    </>
  )
}
