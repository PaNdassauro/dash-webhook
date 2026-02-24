import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// WW Pipelines: 1 (SDR), 3 (Closer), 4 (Planejamento), 17 (Internacional), 31 (Desqualificados)
const WW_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings', 'WW - Internacional', 'Outros Desqualificados | Wedding']

function isInMonth(dateStr: string | null, year: number, month: number): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

async function check() {
  const { data: deals } = await supabase.from('deals').select('*')
  if (!deals) return

  const year = 2026
  const month = 1 // January

  // January 2026 WW only (is_elopement=false)
  const jan = deals.filter(d => {
    const created = d.created_at ? new Date(d.created_at) : null
    return created && created.getMonth() + 1 === month && created.getFullYear() === year && !d.is_elopement
  })

  console.log('=== January 2026 WW Only (from Supabase) ===')
  console.log('Leads:', jan.length)
  console.log('MQL (pipes 1,3,4,17):', jan.filter(d => d.pipeline && WW_PIPELINES.includes(d.pipeline)).length)
  console.log('Agendamento (date in Jan):', jan.filter(d => isInMonth(d.data_reuniao_1, year, month)).length)
  console.log('Reuniões:', jan.filter(d =>
    isInMonth(d.data_reuniao_1, year, month) &&
    d.como_reuniao_1 !== null &&
    d.como_reuniao_1 !== '' &&
    d.como_reuniao_1 !== 'Não teve reunião'
  ).length)
  console.log('Qualificado (date OR sql):', jan.filter(d =>
    isInMonth(d.data_qualificado, year, month) ||
    d.qualificado_sql === true
  ).length)
  console.log('Closer Agendada (date in Jan OR filled):', jan.filter(d =>
    isInMonth(d.data_closer, year, month) ||
    (d.data_closer !== null && d.data_closer !== '')
  ).length)
  console.log('Closer Realizada:', jan.filter(d => d.reuniao_closer).length)
  console.log('Vendas (data_fechamento in Jan, excl EW):', jan.filter(d =>
    isInMonth(d.data_fechamento, year, month) &&
    !(d.title?.startsWith('EW'))
  ).length)

  console.log('\n=== Expected ===')
  console.log('Leads: 349')
  console.log('MQL: 237')
  console.log('Agendamento: 81')
  console.log('Reuniões: 60')
  console.log('Qualificado: 46')
  console.log('Closer Agendada: 40')
  console.log('Closer realizada: 38')
  console.log('Vendas: 2')
}

check()
