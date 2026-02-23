import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const AC_API_URL = process.env.AC_API_URL
const AC_API_KEY = process.env.AC_API_KEY

// Palavras-chave que indicam deals a serem removidos
const EXCLUSION_KEYWORDS = [
  'teste', 'test',
  'fake', 'falso',
  'inválido', 'invalido', 'invalid',
  'duplicado', 'duplicate', 'repetido',
]

// IDs dos campos de motivo de perda no AC
const MOTIVO_PERDA_FIELD_ID = '2'
const MOTIVO_DESQUALIFICACAO_FIELD_ID = '303'

interface ACDealResponse {
  deal?: {
    id: string
    title: string
    fields?: Array<{
      id: string
      val: string
    }>
  }
}

async function fetchDealFromAC(dealId: number): Promise<ACDealResponse | null> {
  if (!AC_API_URL || !AC_API_KEY) return null

  try {
    const response = await fetch(`${AC_API_URL}/api/3/deals/${dealId}`, {
      headers: { 'Api-Token': AC_API_KEY },
    })

    if (response.status === 404) {
      return null // Deal não existe mais
    }

    if (!response.ok) {
      console.error(`AC API error for deal ${dealId}:`, response.status)
      return { deal: undefined }
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching deal ${dealId} from AC:`, error)
    return { deal: undefined }
  }
}

async function fetchDealFieldsFromAC(dealId: number): Promise<Record<string, string>> {
  if (!AC_API_URL || !AC_API_KEY) return {}

  try {
    const response = await fetch(`${AC_API_URL}/api/3/deals/${dealId}/dealCustomFieldData`, {
      headers: { 'Api-Token': AC_API_KEY },
    })

    if (!response.ok) return {}

    const data = await response.json()
    const fields: Record<string, string> = {}

    for (const field of data.dealCustomFieldData || []) {
      fields[field.customFieldId] = field.fieldValue || ''
    }

    return fields
  } catch {
    return {}
  }
}

function shouldExcludeDeal(title: string, fields: Record<string, string>): { exclude: boolean; reason: string } {
  const titleLower = title.toLowerCase()

  // Verificar título
  if (titleLower.includes('teste') || titleLower.includes('test')) {
    return { exclude: true, reason: 'título contém teste' }
  }

  // Verificar motivo de perda (field 2)
  const motivoPerda = (fields[MOTIVO_PERDA_FIELD_ID] || '').toLowerCase()
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (motivoPerda.includes(keyword)) {
      return { exclude: true, reason: `motivo_perda contém "${keyword}"` }
    }
  }

  // Verificar motivo desqualificação (field 303)
  const motivoDesqualificacao = (fields[MOTIVO_DESQUALIFICACAO_FIELD_ID] || '').toLowerCase()
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (motivoDesqualificacao.includes(keyword)) {
      return { exclude: true, reason: `motivo_desqualificacao contém "${keyword}"` }
    }
  }

  return { exclude: false, reason: '' }
}

async function processDealBatch(
  supabase: ReturnType<typeof createServerClient>,
  deals: Array<{ id: number }>,
  results: {
    deleted: number
    notFound: number
    excluded: number
    kept: number
    deletedDeals: Array<{ id: number; reason: string }>
  }
) {
  for (const deal of deals) {
    const dealId = deal.id

    // Buscar deal no AC
    const acDeal = await fetchDealFromAC(dealId)

    // Deal não existe mais no AC → deletar
    if (acDeal === null) {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

      if (!deleteError) {
        results.notFound++
        results.deleted++
        results.deletedDeals.push({ id: dealId, reason: 'não existe no AC' })
      }
      continue
    }

    // Erro ao buscar, pular
    if (!acDeal?.deal) {
      results.kept++
      continue
    }

    // Buscar campos customizados
    const fields = await fetchDealFieldsFromAC(dealId)

    // Verificar se deve excluir
    const { exclude, reason } = shouldExcludeDeal(acDeal.deal.title, fields)

    if (exclude) {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

      if (!deleteError) {
        results.excluded++
        results.deleted++
        results.deletedDeals.push({ id: dealId, reason })
      }
    } else {
      results.kept++
    }

    // Delay entre requisições para não sobrecarregar a API do AC
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

export async function GET(request: NextRequest) {
  // Verificar autorização (Vercel Cron ou CRON_SECRET)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!AC_API_URL || !AC_API_KEY) {
    return NextResponse.json({ error: 'AC credentials not configured' }, { status: 500 })
  }

  try {
    const supabase = createServerClient()

    const results = {
      total: 0,
      deleted: 0,
      notFound: 0,
      excluded: 0,
      kept: 0,
      deletedDeals: [] as Array<{ id: number; reason: string }>,
    }

    // Buscar deals em batches paginados do Supabase
    const PAGE_SIZE = 100
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const { data: deals, error } = await supabase
        .from('deals')
        .select('id')
        .range(offset, offset + PAGE_SIZE - 1)
        .order('id', { ascending: true })

      if (error) {
        console.error('Error fetching deals from Supabase:', error)
        return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
      }

      if (!deals || deals.length === 0) {
        hasMore = false
        break
      }

      results.total += deals.length

      // Processar batch
      await processDealBatch(supabase, deals as Array<{ id: number }>, results)

      // Verificar se há mais páginas
      if (deals.length < PAGE_SIZE) {
        hasMore = false
      } else {
        offset += PAGE_SIZE
      }
    }

    return NextResponse.json({
      success: true,
      cleanedAt: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('Error in deals cleanup:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
