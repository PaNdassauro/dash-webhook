'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface BusinessToggleProps {
  current: 'ww' | 'trips'
  year?: number
  month?: number
}

export function BusinessToggle({ current, year, month }: BusinessToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentYear = year ?? parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const currentMonth = month ?? parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))

  const handleChange = (value: 'ww' | 'trips') => {
    if (value === current) return
    const path = value === 'trips' ? '/trips' : '/wedding'
    router.push(`${path}?year=${currentYear}&month=${currentMonth}`)
  }

  return (
    <div className="inline-flex rounded-lg border border-border-light dark:border-border-dark bg-bg-card dark:bg-bg-dark-card p-1 shadow-sm">
      <button
        onClick={() => handleChange('ww')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${current === 'ww'
            ? 'bg-wedding-gold text-white shadow-sm'
            : 'text-txt-muted dark:text-txt-dark-muted hover:text-txt-dark dark:hover:text-txt-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Wedding
      </button>
      <button
        onClick={() => handleChange('trips')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${current === 'trips'
            ? 'bg-trips-blue text-white shadow-sm'
            : 'text-txt-muted dark:text-txt-dark-muted hover:text-txt-dark dark:hover:text-txt-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Trips
      </button>
    </div>
  )
}
