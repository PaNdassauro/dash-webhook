'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { Deal } from '@/lib/types'

interface DealsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  deals: Deal[]
}

export function DealsModal({ isOpen, onClose, title, deals }: DealsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')

  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals
    const term = search.toLowerCase()
    return deals.filter(d =>
      d.id.toString().includes(term) ||
      d.title?.toLowerCase().includes(term) ||
      d.pipeline?.toLowerCase().includes(term) ||
      d.stage?.toLowerCase().includes(term) ||
      d.nome_noivo?.toLowerCase().includes(term)
    )
  }, [deals, search])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setTimeout(() => searchRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  if (!isOpen) return null

  const getStatusBadge = (status: string | undefined) => {
    const s = status || 'Open'
    if (s === 'Won') return <span className="badge-won">{s}</span>
    if (s === 'Lost') return <span className="badge-lost">{s}</span>
    return <span className="badge-open">{s}</span>
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={modalRef} className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {title} ({filteredDeals.length}{search ? ` de ${deals.length}` : ''})
          </h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por ID, título, pipeline, stage ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="modal-search"
          />
        </div>

        {/* Table */}
        <div className="flex-1 flex flex-col overflow-hidden px-5 pb-5">
          <table className="modal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Pipeline</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Criado</th>
              </tr>
            </thead>
          </table>
          <div className="overflow-auto flex-1">
            <table className="modal-table">
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td className="font-mono text-xs">{deal.id}</td>
                    <td>{deal.title || '-'}</td>
                    <td>{deal.pipeline || '-'}</td>
                    <td>{deal.stage || '-'}</td>
                    <td>{getStatusBadge(deal.status ?? undefined)}</td>
                    <td className="text-xs">
                      {deal.created_at
                        ? new Date(deal.created_at).toLocaleDateString('pt-BR')
                        : '-'
                    }
                    </td>
                  </tr>
                ))}
                {filteredDeals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 !text-txt-muted dark:!text-txt-dark-muted">
                      {search ? 'Nenhum resultado encontrado' : 'Nenhum deal encontrado'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
