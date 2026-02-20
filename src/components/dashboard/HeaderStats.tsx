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
    <div className="bg-primary text-white rounded-t-lg">
      <div className="text-center py-2 text-2xl font-bold border-b border-primary-dark">
        {monthName}
      </div>
      <div className="grid grid-cols-6 text-sm">
        <div className="border-r border-primary-dark p-2">
          <div className="text-primary-light text-xs">Dias do Mês</div>
          <div className="font-semibold">{daysInMonth}</div>
        </div>
        <div className="border-r border-primary-dark p-2">
          <div className="text-primary-light text-xs">Data de Hoje</div>
          <div className="font-semibold">{formatDatePtBR(new Date())}</div>
        </div>
        <div className="border-r border-primary-dark p-2">
          <div className="text-primary-light text-xs">Data início</div>
          <div className="font-semibold">{formatDatePtBR(startDate)}</div>
        </div>
        <div className="border-r border-primary-dark p-2">
          <div className="text-primary-light text-xs">Data fim</div>
          <div className="font-semibold">{formatDatePtBR(endDate)}</div>
        </div>
        <div className="border-r border-primary-dark p-2">
          <div className="text-primary-light text-xs">Data Atualização</div>
          <div className="font-semibold">{formatDatePtBR(lastUpdate)}</div>
        </div>
        <div className="p-2">
          <div className="text-primary-light text-xs">&nbsp;</div>
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
