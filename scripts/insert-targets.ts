import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const targets = [
  // ═══════════════════════════════════════════════════════════
  // WEDDING TARGETS
  // ═══════════════════════════════════════════════════════════
  {
    month: '2026-01-01',
    pipeline_type: 'wedding',
    leads: 300,
    mql: 210,
    agendamento: 95,
    reunioes: 67,
    qualificado: 44,
    closer_agendada: 44,
    closer_realizada: 38,
    vendas: 13,
    cpl: 52.22, // R$ 15.667 / 300
  },
  {
    month: '2026-02-01',
    pipeline_type: 'wedding',
    leads: 321,
    mql: 225,
    agendamento: 101,
    reunioes: 71,
    qualificado: 46,
    closer_agendada: 46,
    closer_realizada: 40,
    vendas: 14,
    cpl: 48.81, // R$ 15.667,30 / 321
  },
  {
    month: '2026-03-01',
    pipeline_type: 'wedding',
    leads: 449,
    mql: 314,
    agendamento: 141,
    reunioes: 99,
    qualificado: 64,
    closer_agendada: 64,
    closer_realizada: 56,
    vendas: 20,
    cpl: 44.47, // R$ 19.967 / 449
  },

  // ═══════════════════════════════════════════════════════════
  // ELOPEMENT TARGETS (simplified funnel: Leads → Vendas)
  // ═══════════════════════════════════════════════════════════
  {
    month: '2026-01-01',
    pipeline_type: 'elopement',
    leads: 90,
    mql: 0,
    agendamento: 0,
    reunioes: 0,
    qualificado: 0,
    closer_agendada: 0,
    closer_realizada: 0,
    vendas: 4,
    cpl: 100.00, // R$ 9.000 / 90
  },
  {
    month: '2026-02-01',
    pipeline_type: 'elopement',
    leads: 100,
    mql: 0,
    agendamento: 0,
    reunioes: 0,
    qualificado: 0,
    closer_agendada: 0,
    closer_realizada: 0,
    vendas: 5,
    cpl: 90.00, // R$ 9.000 / 100
  },
  {
    month: '2026-03-01',
    pipeline_type: 'elopement',
    leads: 120,
    mql: 0,
    agendamento: 0,
    reunioes: 0,
    qualificado: 0,
    closer_agendada: 0,
    closer_realizada: 0,
    vendas: 6,
    cpl: 83.33, // R$ 10.000 / 120
  },
]

async function insertTargets() {
  for (const target of targets) {
    // Upsert: update if exists, insert if not
    const { error } = await supabase
      .from('monthly_targets')
      .upsert(target, { onConflict: 'month,pipeline_type' })

    if (error) {
      console.error(`Error inserting target for ${target.month}:`, error)
    } else {
      console.log(`Inserted/updated target for ${target.month}`)
    }
  }
}

insertTargets().then(() => {
  console.log('Done!')
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
