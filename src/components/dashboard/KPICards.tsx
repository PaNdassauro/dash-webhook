'use client'

import { formatPercent, formatCurrency } from '@/lib/utils'

interface KPICardsProps {
  monthProgress: number
  resultProgress: number
  investment: number
}

export function KPICards({ monthProgress, resultProgress, investment }: KPICardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
        <div className="text-sm text-gray-500 mb-1">Percorrido Mês</div>
        <div className="text-2xl font-bold text-primary">
          {formatPercent(monthProgress)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
        <div className="text-sm text-gray-500 mb-1">Resultado Até o Momento</div>
        <div className="text-2xl font-bold text-primary">
          {formatPercent(resultProgress)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
        <div className="text-sm text-gray-500 mb-1">Investimento Até o Momento</div>
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(investment)}
        </div>
      </div>
    </div>
  )
}
