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

  // Filter only 2026 and WW pipelines (not Elopement)
  const wwPipelines = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings', 'WW - Internacional']

  interface Deal {
    id: number
    pipeline: string
    stage: string
    status: string
    created: string
    mqlMotivos: string | null
  }

  const deals2026: Deal[] = []

  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const created = parseDate(String(row.getCell(6).value || ''))
    const pipeline = String(row.getCell(3).value || '')

    if (created && created.startsWith('2026') && wwPipelines.includes(pipeline)) {
      deals2026.push({
        id: Number(row.getCell(1).value),
        pipeline,
        stage: String(row.getCell(4).value || ''),
        status: String(row.getCell(5).value || ''),
        created,
        mqlMotivos: row.getCell(13).value ? String(row.getCell(13).value) : null,
      })
    }
  })

  console.log('=== 2026 WW Deals (excl Elopement) ===')
  console.log('Total Leads:', deals2026.length)

  // MQL based on motivos_qualificacao
  console.log('\nMQL (Motivos de qualificação filled):', deals2026.filter(d => d.mqlMotivos).length)

  // MQL based on stage
  console.log('MQL (stage != Novo Lead):', deals2026.filter(d => d.stage && d.stage !== 'Novo Lead').length)

  // Stage distribution
  console.log('\n=== Stage Distribution ===')
  const stages: Record<string, number> = {}
  deals2026.forEach(d => {
    stages[d.stage || 'empty'] = (stages[d.stage || 'empty'] || 0) + 1
  })
  Object.entries(stages).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Check Won deals in 2026
  console.log('\n=== Won Deals 2026 ===')
  const won = deals2026.filter(d => d.status === 'Won')
  console.log('Total:', won.length)
  won.forEach(d => console.log(`  ID=${d.id}, Pipeline=${d.pipeline}, Stage=${d.stage}`))

  // January 2026 only
  console.log('\n=== January 2026 WW ===')
  const jan = deals2026.filter(d => d.created.startsWith('2026-01'))
  console.log('Leads:', jan.length)
  console.log('MQL (motivos):', jan.filter(d => d.mqlMotivos).length)
  console.log('MQL (stage != Novo Lead):', jan.filter(d => d.stage && d.stage !== 'Novo Lead').length)
  console.log('Won:', jan.filter(d => d.status === 'Won').length)

  // What stages count as MQL?
  console.log('\n=== January 2026 - Stages breakdown ===')
  const janStages: Record<string, number> = {}
  jan.forEach(d => {
    janStages[d.stage || 'empty'] = (janStages[d.stage || 'empty'] || 0) + 1
  })
  Object.entries(janStages).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  console.log('\n=== Expected (from user) ===')
  console.log('Leads: 349')
  console.log('MQL: 237')
}

check().catch(console.error)
