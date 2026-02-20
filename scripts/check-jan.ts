import ExcelJS from 'exceljs'

function parseDate(value: string | null): string | null {
  if (!value || value === '') return null
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2})?:?(\d{2})?/)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month}-${day}`
  }
  return null
}

async function check() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile('deals-used-only.xlsx')
  const ws = workbook.getWorksheet(1)!

  interface Deal {
    id: number
    pipeline: string
    stage: string
    status: string
    created: string
    mqlMotivos: string | null
    agendamento: string | null
    reuniao: string | null
    qualSql: string | null
    closerAgendada: string | null
    closerRealizada: string | null
  }

  const allDeals: Deal[] = []

  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const created = parseDate(String(row.getCell(6).value || ''))
    const pipeline = String(row.getCell(3).value || '')

    if (created && created.startsWith('2026-01')) {
      allDeals.push({
        id: Number(row.getCell(1).value),
        pipeline,
        stage: String(row.getCell(4).value || ''),
        status: String(row.getCell(5).value || ''),
        created,
        mqlMotivos: row.getCell(13).value ? String(row.getCell(13).value) : null,
        agendamento: row.getCell(14).value ? String(row.getCell(14).value) : null,
        reuniao: row.getCell(15).value ? String(row.getCell(15).value) : null,
        qualSql: row.getCell(16).value ? String(row.getCell(16).value) : null,
        closerAgendada: row.getCell(17).value ? String(row.getCell(17).value) : null,
        closerRealizada: row.getCell(18).value ? String(row.getCell(18).value) : null,
      })
    }
  })

  console.log('=== January 2026 Pipeline Breakdown ===')
  const byPipeline: Record<string, number> = {}
  allDeals.forEach(d => {
    byPipeline[d.pipeline || 'empty'] = (byPipeline[d.pipeline || 'empty'] || 0) + 1
  })
  Object.entries(byPipeline).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Excluding Elopement and Outros Desqualificados
  const wwOnly = allDeals.filter(d =>
    d.pipeline !== 'Elopment Wedding' &&
    d.pipeline !== 'Outros Desqualificados | Wedding' &&
    d.pipeline
  )

  console.log('\n=== January 2026 - WW Only (excl Elopement & Desq) ===')
  console.log('Leads:', wwOnly.length)
  console.log('MQL (motivos):', wwOnly.filter(d => d.mqlMotivos).length)
  console.log('MQL (stage != Novo Lead):', wwOnly.filter(d => d.stage && d.stage !== 'Novo Lead').length)
  console.log('Agendamento:', wwOnly.filter(d => d.agendamento).length)
  console.log('Reunião:', wwOnly.filter(d => d.reuniao).length)
  console.log('Reunião (!= Não teve):', wwOnly.filter(d => d.reuniao && d.reuniao !== 'Não teve reunião').length)
  console.log('Qualificado (= Sim):', wwOnly.filter(d => d.qualSql === 'Sim').length)
  console.log('Closer Agendada:', wwOnly.filter(d => d.closerAgendada).length)
  console.log('Closer Realizada:', wwOnly.filter(d => d.closerRealizada).length)
  console.log('Closer Realizada (!= Não teve):', wwOnly.filter(d => d.closerRealizada && d.closerRealizada !== 'Não teve reunião').length)
  console.log('Won:', wwOnly.filter(d => d.status === 'Won').length)

  // Stage distribution for WW
  console.log('\n=== WW January - Stage Distribution ===')
  const stages: Record<string, number> = {}
  wwOnly.forEach(d => {
    stages[d.stage || 'empty'] = (stages[d.stage || 'empty'] || 0) + 1
  })
  Object.entries(stages).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Try counting MQL as "not in initial stages"
  const initialStages = ['Novo Lead', 'empty', '']
  console.log('\nMQL (stage not in initial stages):', wwOnly.filter(d => !initialStages.includes(d.stage)).length)

  // What if MQL = Leads - "StandBy"?
  console.log('MQL (excl StandBy):', wwOnly.filter(d => d.stage !== 'StandBy').length)

  console.log('\n=== Expected ===')
  console.log('Leads: 349')
  console.log('MQL: 237')
  console.log('Agendamento: 81')
  console.log('Reuniões: 60')
  console.log('Qualificado: 46')
  console.log('Closer Agendada: 40')
  console.log('Closer realizada: 38')
  console.log('Vendas: 2')

  // Also show All January (WW + Elopement)
  const allNoDesq = allDeals.filter(d => d.pipeline !== 'Outros Desqualificados | Wedding' && d.pipeline)
  console.log('\n=== January 2026 - WW + Elopement (excl Desq) ===')
  console.log('Leads:', allNoDesq.length)

  // Elopement only
  const elopement = allDeals.filter(d => d.pipeline === 'Elopment Wedding')
  console.log('\n=== January 2026 - Elopement only ===')
  console.log('Leads:', elopement.length)
  console.log('Won:', elopement.filter(d => d.status === 'Won').length)
}

check().catch(console.error)
