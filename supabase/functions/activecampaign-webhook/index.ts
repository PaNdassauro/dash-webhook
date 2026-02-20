import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AC field KEY names to DB columns mapping
const FIELD_MAP: Record<string, string> = {
  'Data e horário do agendamento da 1ª reunião': 'data_reuniao_1',
  'Como foi feita a 1ª reunião?': 'como_reuniao_1',
  'Data e horário do agendamento com a Closer:': 'data_closer',
  'Motivos de qualificação SDR': 'motivos_qualificacao_sdr',
  '[WW] [Closer] Data-Hora Ganho': 'data_fechamento',
  'Automático - WW - Data Qualificação SDR': 'data_qualificado',
  'Qualificado para SQL': 'qualificado_sql',
  'WW | Como foi feita Reunião Closer': 'reuniao_closer',
  'Motivo de perda': 'motivo_perda',
  'Nome do Noivo(a)2': 'nome_noivo',
  'Número de convidados:': 'num_convidados',
  'Orçamento:': 'orcamento',
  'Destino': 'destino',
}

// AC status codes to string
const STATUS_MAP: Record<string, string> = {
  '0': 'Open',
  '1': 'Won',
  '2': 'Lost',
}

function parseDate(value: string | null): string | null {
  if (!value || value === '') return null
  try {
    const match1 = String(value).match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
    if (match1) {
      const [, year, month, day, hour, minute, second] = match1
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    const match2 = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2})?:?(\d{2})?/)
    if (match2) {
      const [, day, month, year, hour = '00', minute = '00'] = match2
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
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

function parseNumber(value: string | null): number | null {
  if (!value || value === '') return null
  const num = parseFloat(String(value).replace(/[^\d.-]/g, ''))
  return isNaN(num) ? null : num
}

function parseFormData(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    const keys = key.replace(/\]/g, '').split('[')
    let current: Record<string, unknown> = result

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in current)) {
        const nextKey = keys[i + 1]
        current[k] = /^\d+$/.test(nextKey) ? [] : {}
      }
      current = current[k] as Record<string, unknown>
    }

    const lastKey = keys[keys.length - 1]
    current[lastKey] = value
  }

  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', endpoint: 'activecampaign-webhook' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const contentType = req.headers.get('content-type') || ''
    let body: Record<string, unknown>

    if (contentType.includes('application/json')) {
      body = await req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      body = parseFormData(formData)
    } else {
      try {
        const text = await req.text()
        const params = new URLSearchParams(text)
        const formData = new FormData()
        for (const [key, value] of params.entries()) {
          formData.append(key, value)
        }
        body = parseFormData(formData)
      } catch {
        return new Response(
          JSON.stringify({ error: 'Unsupported content type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('Webhook received:', JSON.stringify(body, null, 2))

    const type = body.type as string
    const deal = body.deal as Record<string, unknown> | undefined

    // Handle deal delete
    if (type === 'deal_delete' || type === 'deal.delete') {
      if (!deal?.id) {
        return new Response(
          JSON.stringify({ error: 'Missing deal ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', parseInt(String(deal.id)))

      if (error) {
        console.error('Delete error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, action: 'deleted', id: deal.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle deal create/update
    if (type === 'deal_add' || type === 'deal_update' || type === 'deal.add' || type === 'deal.update') {
      if (!deal) {
        return new Response(
          JSON.stringify({ error: 'Missing deal data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const dealId = parseInt(String(deal.id))
      const statusCode = String(deal.status || '')
      const status = STATUS_MAP[statusCode] || statusCode

      // Build record with only fields that have values
      const record: Record<string, unknown> = {
        id: dealId,
      }

      // Only set base fields if they have values
      if (deal.title) record.title = deal.title
      if (deal.pipeline_title || deal.pipeline) record.pipeline = deal.pipeline_title || deal.pipeline
      if (deal.stage_title || deal.stage) record.stage = deal.stage_title || deal.stage
      if (status) record.status = status
      if (deal.create_date) record.created_at = parseDate(String(deal.create_date))
      record.updated_at = new Date().toISOString()

      // Handle fields array - only set fields that AC explicitly sends with values
      const fields = deal.fields
      if (fields && Array.isArray(fields)) {
        for (const field of fields) {
          const f = field as Record<string, unknown>
          const fieldKey = String(f.key || '')
          let fieldValue = f.value

          // Skip if no value
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue

          // Handle array values
          if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ')
          }

          const dbColumn = FIELD_MAP[fieldKey]
          if (!dbColumn) continue

          const valueStr = String(fieldValue)

          switch (dbColumn) {
            case 'data_reuniao_1':
            case 'data_qualificado':
            case 'data_closer':
            case 'data_fechamento': {
              const parsed = parseDate(valueStr)
              if (parsed) record[dbColumn] = parsed
              break
            }
            case 'qualificado_sql':
              record[dbColumn] = parseBoolean(valueStr)
              break
            case 'num_convidados':
            case 'orcamento': {
              const num = parseNumber(valueStr)
              if (num !== null) record[dbColumn] = num
              break
            }
            default:
              if (valueStr) record[dbColumn] = valueStr
          }
        }
      }

      console.log('Upserting record:', JSON.stringify(record, null, 2))

      // Use upsert with ignoreDuplicates=false to merge, not replace
      const { error } = await supabase
        .from('deals')
        .upsert(record, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Upsert error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: type.includes('add') ? 'created' : 'updated',
          id: deal.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, action: 'ignored', type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
