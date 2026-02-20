'use client'

import { useState } from 'react'

interface MonthSelectorProps {
  selectedYear: number
  selectedMonth: number
  onChange: (year: number, month: number) => void
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function MonthSelector({ selectedYear, selectedMonth, onChange }: MonthSelectorProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="flex gap-2 items-center">
      <select
        value={selectedMonth}
        onChange={(e) => onChange(selectedYear, Number(e.target.value))}
        className="border border-gray-300 rounded px-3 py-2 bg-white"
      >
        {MONTHS.map((month, i) => (
          <option key={i} value={i + 1}>
            {month}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => onChange(Number(e.target.value), selectedMonth)}
        className="border border-gray-300 rounded px-3 py-2 bg-white"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}
