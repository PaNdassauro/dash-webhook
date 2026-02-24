'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const VIEWS = [
  { href: '/wedding', label: 'WW' },
  { href: '/elopement', label: 'Elopement' },
  { href: '/total', label: 'Total' },
]

interface ViewToggleProps {
  year?: number
  month?: number
}

export function ViewToggle({ year, month }: ViewToggleProps) {
  const pathname = usePathname()

  const getHref = (baseHref: string) => {
    if (year && month) {
      return `${baseHref}?year=${year}&month=${month}`
    }
    return baseHref
  }

  return (
    <div className="view-toggle">
      {VIEWS.map((view) => (
        <Link
          key={view.href}
          href={getHref(view.href)}
          className={
            pathname === view.href
              ? 'view-toggle-btn-active'
              : 'view-toggle-btn'
          }
        >
          {view.label}
        </Link>
      ))}
    </div>
  )
}
