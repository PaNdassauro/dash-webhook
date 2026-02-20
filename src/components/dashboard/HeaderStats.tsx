'use client'

interface HeaderStatsProps {
  selectedMonth: Date
  lastUpdate: Date
}

export function HeaderStats({ selectedMonth, lastUpdate }: HeaderStatsProps) {
  const monthName = getMonthName(selectedMonth)
  const daysInMonth = getDaysInMonth(selectedMonth)
  const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
  const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)

  return (
    <div className="header-banner">
      <div className="header-banner-title">
        {monthName}
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 text-sm">
        <div className="header-stat-cell">
          <div className="header-stat-label">Dias do Mês</div>
          <div className="header-stat-value">{daysInMonth}</div>
        </div>
        <div className="header-stat-cell">
          <div className="header-stat-label">Data de Hoje</div>
          <div className="header-stat-value">{formatDatePtBR(new Date())}</div>
        </div>
        <div className="header-stat-cell">
          <div className="header-stat-label">Data início</div>
          <div className="header-stat-value">{formatDatePtBR(startDate)}</div>
        </div>
        <div className="header-stat-cell">
          <div className="header-stat-label">Data fim</div>
          <div className="header-stat-value">{formatDatePtBR(endDate)}</div>
        </div>
        <div className="header-stat-cell">
          <div className="header-stat-label">Data Atualização</div>
          <div className="header-stat-value">{formatDatePtBR(lastUpdate)}</div>
        </div>
        <div className="header-stat-cell">
          <div className="header-stat-label">&nbsp;</div>
          <div>&nbsp;</div>
        </div>
      </div>
    </div>
  )
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function formatDatePtBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
