'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const VIEWS = [
  { href: '/total', label: 'Total' },
  { href: '/wedding', label: 'WW General' },
  { href: '/elopement', label: 'Elopement' },
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
    <div className="flex rounded-lg overflow-hidden border border-primary">
      {VIEWS.map((view) => (
        <Link
          key={view.href}
          href={getHref(view.href)}
          className={`px-4 py-2 font-medium transition-colors ${
            pathname === view.href
              ? 'bg-primary text-white'
              : 'bg-white text-primary hover:bg-primary-light hover:text-white'
          }`}
        >
          {view.label}
        </Link>
      ))}
    </div>
  )
}
