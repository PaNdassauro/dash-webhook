import { createClient } from '@supabase/supabase-js'
import ExcelJS from 'exceljs'
import path from 'path'

// Load env
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Column mapping from Excel to DB (based on FIELD_MAPPING.md)
// WW Funnel: Lead -> MQL -> Agendamento -> Reuniao -> Qualificado -> Closer Agendada -> Closer Realizada -> Venda
const COLUMN_MAP: Record<string, string> = {
  'Deal ID': 'id',
  'Title': 'title',
  'Pipeline': 'pipeline',
  'Stage': 'stage',
  'Status': 'status',
  'Created': 'created_at',
  'Updated': 'updated_at',
  'Nome do Noivo(a)2': 'nome_noivo',
  'Número de convidados:': 'num_convidados',
  'Orçamento:': 'orcamento',
  'Destino': 'destino',
  'Motivo de perda': 'motivo_perda',
  // MQL (field 83)
  'Motivos de qualificação SDR': 'motivos_qualificacao_sdr',
  // Agendamento (field 6)
  'Data e horário do agendamento da 1ª reunião': 'data_reuniao_1',
  // Reuniao (field 17)
  'Como foi feita a 1ª reunião?': 'como_reuniao_1',
  // Qualificado date (WW)
  'Automático - WW - Data Qualificação SDR': 'data_qualificado',
  // Qualificado (keeping for WT)
  'Qualificado para SQL': 'qualificado_sql',
  // Closer Agendada (field 18)
  'Data e horário do agendamento com a Closer:': 'data_closer',
  // Closer Realizada (field 299)
  'WW | Como foi feita Reunião Closer': 'reuniao_closer',
  // Venda (field 87)
  '[WW] [Closer] Data-Hora Ganho': 'data_fechamento',
}

function parseDate(value: string | null): string | null {
  if (!value || value === '') return null
  try {
    // Handle DD/MM/YYYY HH:mm format (Brazilian)
    const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2})?:?(\d{2})?/)
    if (match) {
      const [, day, month, year, hour = '00', minute = '00'] = match
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    // Fallback to standard parsing
    const date = new Date(value)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

function parseNumber(value: string | number | null): number | null {
  if (value === null || value === '' || value === undefined) return null
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''))
  return isNaN(num) ? null : num
}

function parseBoolean(value: string | null): boolean {
  if (!value) return false
  const lower = String(value).toLowerCase().trim()
  return lower === 'yes' || lower === 'sim' || lower === 'true' || lower === '1'
}

function cleanStatus(value: string | null): string | null {
  if (!value) return null
  const valid = ['Open', 'Won', 'Lost']
  if (valid.includes(value)) return value
  // Check if it's corrupted data
  if (value.length > 20) return null
  return value
}

async function importDeals() {
  const filePath = path.join(process.cwd(), 'deals-used-only.xlsx')
  console.log(`Reading: ${filePath}`)

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)

  const worksheet = workbook.getWorksheet(1)
  if (!worksheet) {
    console.error('No worksheet found')
    process.exit(1)
  }

  // Get headers from first row
  const headers: string[] = []
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value || '')
  })

  console.log(`Found ${headers.length} columns`)
  console.log(`Mapped columns:`, Object.keys(COLUMN_MAP).filter(h => headers.includes(h)))

  // Process rows
  const deals: Record<string, unknown>[] = []
  const seenIds = new Set<number>()

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // Skip header

    const deal: Record<string, unknown> = {}

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1]
      const dbColumn = COLUMN_MAP[header]

      if (!dbColumn) return

      const value = cell.value

      switch (dbColumn) {
        case 'id':
          deal.id = parseNumber(value as string)
          break
        case 'created_at':
        case 'updated_at':
        case 'data_reuniao_1':
        case 'data_qualificado':
        case 'data_closer':
        case 'data_fechamento':
          deal[dbColumn] = parseDate(String(value))
          break
        case 'num_convidados':
        case 'orcamento':
          deal[dbColumn] = parseNumber(value as string)
          break
        case 'qualificado_sql':
          deal[dbColumn] = parseBoolean(String(value))
          break
        case 'status':
          deal[dbColumn] = cleanStatus(String(value))
          break
        default:
          deal[dbColumn] = value ? String(value).substring(0, 1000) : null
      }
    })

    // Validate required fields - ID must be a valid positive integer within BIGINT range
    const dealId = deal.id as number
    const MAX_BIGINT = 9007199254740991 // JS safe integer limit

    // Only include deals created in 2026
    const createdAt = deal.created_at as string | null
    const is2026 = createdAt && createdAt.startsWith('2026')

    if (dealId && Number.isInteger(dealId) && dealId > 0 && dealId < MAX_BIGINT && is2026 && !seenIds.has(dealId)) {
      seenIds.add(dealId)
      deals.push(deal)
    }
  })

  console.log(`Parsed ${deals.length} unique deals (2026 only)`)

  // Clear existing data first
  console.log('Clearing existing deals...')
  const { error: deleteError } = await supabase.from('deals').delete().neq('id', 0)
  if (deleteError) {
    console.error('Error clearing deals:', deleteError.message)
  } else {
    console.log('Cleared existing deals')
  }

  // Insert in batches
  const BATCH_SIZE = 500
  let inserted = 0
  let errors = 0

  for (let i = 0; i < deals.length; i += BATCH_SIZE) {
    const batch = deals.slice(i, i + BATCH_SIZE)

    const { error } = await supabase
      .from('deals')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      console.log(`Inserted batch ${i / BATCH_SIZE + 1}: ${batch.length} deals`)
    }
  }

  console.log(`\nDone!`)
  console.log(`  Inserted: ${inserted}`)
  console.log(`  Errors: ${errors}`)
}

importDeals().catch(console.error)
