import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: deals, error } = await supabase.from('deals').select('*')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Total deals:', deals.length)

  // By pipeline
  const byPipeline: Record<string, number> = {}
  deals.forEach(d => {
    const p = d.pipeline || 'null'
    byPipeline[p] = (byPipeline[p] || 0) + 1
  })
  console.log('\nBy pipeline:')
  Object.entries(byPipeline).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // Funnel - current logic
  console.log('\n=== Current funnel logic ===')
  console.log('  Leads:', deals.length)
  console.log('  MQL (stage != Novo Lead):', deals.filter(d => d.stage && d.stage !== 'Novo Lead').length)
  console.log('  Agendamento (data_reuniao_1 filled):', deals.filter(d => d.data_reuniao_1).length)
  console.log('  Reuniões (como_reuniao_1 filled):', deals.filter(d => d.como_reuniao_1).length)
  console.log('  Qualificado (qualificado_sql=true):', deals.filter(d => d.qualificado_sql === true).length)
  console.log('  Closer Agendada (data_closer filled):', deals.filter(d => d.data_closer).length)
  console.log('  Closer realizada (reuniao_closer filled):', deals.filter(d => d.reuniao_closer).length)
  console.log('  Vendas (status=Won):', deals.filter(d => d.status === 'Won').length)

  // Expected numbers
  console.log('\n=== Expected ===')
  console.log('  Leads: 349')
  console.log('  MQL: 237')
  console.log('  Agendamento: 81')
  console.log('  Reuniões: 60')
  console.log('  Qualificado: 46')
  console.log('  Closer Agendada: 40')
  console.log('  Closer realizada: 38')
  console.log('  Vendas: 2')

  // Check stages
  const stages: Record<string, number> = {}
  deals.forEach(d => {
    stages[d.stage || 'null'] = (stages[d.stage || 'null'] || 0) + 1
  })
  console.log('\nAll stages:')
  Object.entries(stages).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // Status
  const statuses: Record<string, number> = {}
  deals.forEach(d => {
    statuses[d.status || 'null'] = (statuses[d.status || 'null'] || 0) + 1
  })
  console.log('\nAll statuses:')
  Object.entries(statuses).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // Sample data_reuniao_1 values
  const withReuniao = deals.filter(d => d.data_reuniao_1)
  console.log('\nSample data_reuniao_1 values:', withReuniao.slice(0, 3).map(d => d.data_reuniao_1))

  // Sample como_reuniao_1 values
  const withComo = deals.filter(d => d.como_reuniao_1)
  console.log('Sample como_reuniao_1 values:', withComo.slice(0, 3).map(d => d.como_reuniao_1))
}

check()
