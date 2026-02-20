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
      // Focus search on open
      setTimeout(() => searchRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {title} ({filteredDeals.length}{search ? ` de ${deals.length}` : ''})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por ID, título, pipeline, stage ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Título</th>
                <th className="text-left p-2">Pipeline</th>
                <th className="text-left p-2">Stage</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Criado</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{deal.id}</td>
                  <td className="p-2">{deal.title || '-'}</td>
                  <td className="p-2">{deal.pipeline || '-'}</td>
                  <td className="p-2">{deal.stage || '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      deal.status === 'Won' ? 'bg-green-100 text-green-800' :
                      deal.status === 'Lost' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {deal.status || 'Open'}
                    </span>
                  </td>
                  <td className="p-2">
                    {deal.created_at
                      ? new Date(deal.created_at).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                </tr>
              ))}
              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    {search ? 'Nenhum resultado encontrado' : 'Nenhum deal encontrado'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
