'use client'

import { useState } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface BatchResult {
  success: boolean
  done: boolean
  nextCursor: number | null
  results: {
    processed: number
    deleted: number
    kept: number
    errors: number
    deletedDeals: Array<{ id: number; reason: string }>
  }
}

interface CleanupResult {
  processed: number
  deleted: number
  kept: number
  errors: number
  deletedDeals: Array<{ id: number; reason: string }>
}

export function CleanupButton() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<CleanupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  async function handleCleanup() {
    if (loading) return

    const confirmed = window.confirm(
      'Executar limpeza de deals?\n\nIsso vai verificar todos os deals no Active Campaign e remover os inválidos (teste, fake, duplicado, deletados).'
    )

    if (!confirmed) return

    setLoading(true)
    setError(null)
    setResult(null)
    setProgress('Iniciando...')

    const accumulated: CleanupResult = {
      processed: 0,
      deleted: 0,
      kept: 0,
      errors: 0,
      deletedDeals: [],
    }

    try {
      let cursor: number | null = 0
      let done = false

      while (!done) {
        const url = cursor === 0
          ? `${SUPABASE_URL}/functions/v1/deals-cleanup`
          : `${SUPABASE_URL}/functions/v1/deals-cleanup?cursor=${cursor}`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        })

        const data: BatchResult = await response.json()

        if (!response.ok) {
          throw new Error(data.results?.toString() || 'Erro ao executar limpeza')
        }

        // Acumular resultados
        accumulated.processed += data.results.processed
        accumulated.deleted += data.results.deleted
        accumulated.kept += data.results.kept
        accumulated.errors += data.results.errors
        accumulated.deletedDeals.push(...data.results.deletedDeals)

        setProgress(`Processados: ${accumulated.processed} | Deletados: ${accumulated.deleted}`)

        done = data.done
        cursor = data.nextCursor
      }

      setResult(accumulated)
      setShowResult(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <>
      <button
        onClick={handleCleanup}
        disabled={loading}
        className="px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title="Limpar deals inválidos"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{progress || 'Limpando...'}</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Limpar</span>
          </>
        )}
      </button>

      {/* Modal de resultado */}
      {showResult && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResult(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Limpeza Concluída</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total verificados:</span>
                <span className="text-white font-medium">{result.processed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deletados:</span>
                <span className="text-red-400 font-medium">{result.deleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mantidos:</span>
                <span className="text-green-400 font-medium">{result.kept}</span>
              </div>
              {result.errors > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Erros:</span>
                  <span className="text-yellow-400 font-medium">{result.errors}</span>
                </div>
              )}
            </div>

            {result.deletedDeals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Deals removidos:</p>
                <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                  {result.deletedDeals.slice(0, 20).map((d, i) => (
                    <div key={i} className="text-gray-400">
                      ID {d.id}: <span className="text-red-400">{d.reason}</span>
                    </div>
                  ))}
                  {result.deletedDeals.length > 20 && (
                    <div className="text-gray-500">... e mais {result.deletedDeals.length - 20}</div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowResult(false)
                window.location.reload()
              }}
              className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Fechar e Atualizar
            </button>
          </div>
        </div>
      )}

      {/* Toast de erro */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          <p className="font-medium">Erro na limpeza</p>
          <p className="text-sm opacity-90">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white/70 hover:text-white">
            &times;
          </button>
        </div>
      )}
    </>
  )
}
