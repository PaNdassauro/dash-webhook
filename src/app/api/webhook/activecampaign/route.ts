import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// AC webhook payload schema
const WebhookPayloadSchema = z.object({
  type: z.string(),
  date_time: z.string().optional(),
  initiated_by: z.string().optional(),
  deal: z.object({
    id: z.string(),
    title: z.string().optional(),
    pipeline: z.string().optional(),
    stage: z.string().optional(),
    status: z.string().optional(),
    cdate: z.string().optional(), // created date
    mdate: z.string().optional(), // modified date
    fields: z.array(z.object({
      id: z.string(),
      value: z.string().nullable(),
    })).optional(),
  }).optional(),
})

// AC field IDs to DB columns mapping
const FIELD_MAP: Record<string, string> = {
  '6': 'data_reuniao_1',        // Data e horário do agendamento da 1ª reunião
  '17': 'como_reuniao_1',       // Como foi feita a 1ª reunião?
  '18': 'data_closer',          // Data e horário do agendamento com a Closer
  '83': 'motivos_qualificacao_sdr', // Motivos de qualificação SDR
  '87': 'data_fechamento',      // [WW] [Closer] Data-Hora Ganho
  '93': 'data_qualificado',     // Automático - WW - Data Qualificação SDR
  '169': 'qualificado_sql',     // Qualificado para SQL
  '299': 'reuniao_closer',      // WW | Como foi feita Reunião Closer
}

// Additional deal fields
const DEAL_FIELD_MAP: Record<string, string> = {
  'Nome do Noivo(a)2': 'nome_noivo',
  'Número de convidados:': 'num_convidados',
  'Orçamento:': 'orcamento',
  'Destino': 'destino',
  'Motivo de perda': 'motivo_perda',
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
    // Try ISO format
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
    return null
  } catch {
    return null
  }
}

function parseBoolean(value: string | null): boolean {
  if (!value) return false
  const lower = String(value).toLowerCase().trim()
  return lower === 'yes' || lower === 'sim' || lower === 'true' || lower === '1'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    const parsed = WebhookPayloadSchema.safeParse(body)
    if (!parsed.success) {
      console.error('Invalid payload:', parsed.error)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { type, deal } = parsed.data

    // Handle deal delete
    if (type === 'deal_delete' || type === 'deal.delete') {
      if (!deal?.id) {
        return NextResponse.json({ error: 'Missing deal ID' }, { status: 400 })
      }

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', parseInt(deal.id))

      if (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'deleted', id: deal.id })
    }

    // Handle deal create/update
    if (type === 'deal_add' || type === 'deal_update' || type === 'deal.add' || type === 'deal.update') {
      if (!deal) {
        return NextResponse.json({ error: 'Missing deal data' }, { status: 400 })
      }

      // Build deal record
      const record: Record<string, unknown> = {
        id: parseInt(deal.id),
        title: deal.title || null,
        pipeline: deal.pipeline || null,
        stage: deal.stage || null,
        status: deal.status || null,
        created_at: deal.cdate ? parseDate(deal.cdate) : null,
        updated_at: deal.mdate ? parseDate(deal.mdate) : null,
      }

      // Compute is_elopement
      record.is_elopement = deal.pipeline === 'Elopment Wedding'

      // Map custom fields
      if (deal.fields) {
        for (const field of deal.fields) {
          const dbColumn = FIELD_MAP[field.id]
          if (!dbColumn) continue

          switch (dbColumn) {
            case 'data_reuniao_1':
            case 'data_qualificado':
            case 'data_closer':
            case 'data_fechamento':
              record[dbColumn] = parseDate(field.value)
              break
            case 'qualificado_sql':
              record[dbColumn] = parseBoolean(field.value)
              break
            default:
              record[dbColumn] = field.value || null
          }
        }
      }

      // Upsert to database
      const { error } = await supabase
        .from('deals')
        .upsert(record, { onConflict: 'id' })

      if (error) {
        console.error('Upsert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        action: type.includes('add') ? 'created' : 'updated',
        id: deal.id
      })
    }

    return NextResponse.json({ success: true, action: 'ignored', type })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'activecampaign-webhook' })
}
