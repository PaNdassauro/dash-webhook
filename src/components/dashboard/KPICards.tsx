'use client'

import { formatPercent, formatCurrency } from '@/lib/utils'

interface KPICardsProps {
  monthProgress: number
  resultProgress: number
  investment: number
}

export function KPICards({ monthProgress, resultProgress, investment }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="kpi-card">
        <div className="kpi-label">Percorrido Mês</div>
        <div className="kpi-value">{formatPercent(monthProgress)}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Resultado Até o Momento</div>
        <div className="kpi-value">{formatPercent(resultProgress)}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Investimento Até o Momento</div>
        <div className="kpi-value">{formatCurrency(investment)}</div>
      </div>
    </div>
  )
}
