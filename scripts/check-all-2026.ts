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

  // All 2026 deals
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

  const deals2026: Deal[] = []

  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const created = parseDate(String(row.getCell(6).value || ''))
    const pipeline = String(row.getCell(3).value || '')

    // Only 2026 data
    if (created && created.startsWith('2026')) {
      deals2026.push({
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

  console.log('=== ALL 2026 Deals ===')
  console.log('Total Leads:', deals2026.length)

  // Breakdown by pipeline
  console.log('\nBy Pipeline:')
  const pipelines: Record<string, number> = {}
  deals2026.forEach(d => {
    pipelines[d.pipeline || 'empty'] = (pipelines[d.pipeline || 'empty'] || 0) + 1
  })
  Object.entries(pipelines).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Excluding "Outros Desqualificados | Wedding" and empty
  const filtered = deals2026.filter(d =>
    d.pipeline &&
    d.pipeline !== 'Outros Desqualificados | Wedding' &&
    d.pipeline !== 'empty'
  )
  console.log('\n=== Excluding Outros Desqualificados & empty ===')
  console.log('Leads:', filtered.length)

  // WW + Elopement combined
  const wwElopement = deals2026.filter(d =>
    d.pipeline &&
    d.pipeline !== 'Outros Desqualificados | Wedding' &&
    d.pipeline !== 'empty'
  )
  console.log('\n=== WW + Elopement (excl Desqualificados) - Full funnel ===')
  console.log('Leads:', wwElopement.length)
  console.log('MQL (motivos):', wwElopement.filter(d => d.mqlMotivos).length)
  console.log('MQL (stage != Novo Lead):', wwElopement.filter(d => d.stage && d.stage !== 'Novo Lead').length)
  console.log('Agendamento:', wwElopement.filter(d => d.agendamento).length)
  console.log('Reunião:', wwElopement.filter(d => d.reuniao).length)
  console.log('Reunião (!= Não teve):', wwElopement.filter(d => d.reuniao && d.reuniao !== 'Não teve reunião').length)
  console.log('Qualificado SQL (filled):', wwElopement.filter(d => d.qualSql).length)
  console.log('Qualificado SQL (= Sim):', wwElopement.filter(d => d.qualSql === 'Sim').length)
  console.log('Closer Agendada:', wwElopement.filter(d => d.closerAgendada).length)
  console.log('Closer Realizada:', wwElopement.filter(d => d.closerRealizada).length)
  console.log('Closer Realizada (!= Não teve):', wwElopement.filter(d => d.closerRealizada && d.closerRealizada !== 'Não teve reunião').length)
  console.log('Won:', wwElopement.filter(d => d.status === 'Won').length)

  // Just January
  console.log('\n=== January 2026 - Same filter ===')
  const jan = wwElopement.filter(d => d.created.startsWith('2026-01'))
  console.log('Leads:', jan.length)
  console.log('MQL (motivos):', jan.filter(d => d.mqlMotivos).length)
  console.log('MQL (stage != Novo Lead):', jan.filter(d => d.stage && d.stage !== 'Novo Lead').length)
  console.log('Agendamento:', jan.filter(d => d.agendamento).length)
  console.log('Reunião (!= Não teve):', jan.filter(d => d.reuniao && d.reuniao !== 'Não teve reunião').length)
  console.log('Qualificado SQL (= Sim):', jan.filter(d => d.qualSql === 'Sim').length)
  console.log('Closer Agendada:', jan.filter(d => d.closerAgendada).length)
  console.log('Closer Realizada (!= Não teve):', jan.filter(d => d.closerRealizada && d.closerRealizada !== 'Não teve reunião').length)
  console.log('Won:', jan.filter(d => d.status === 'Won').length)

  console.log('\n=== Expected ===')
  console.log('Leads: 349')
  console.log('MQL: 237')
  console.log('Agendamento: 81')
  console.log('Reuniões: 60')
  console.log('Qualificado: 46')
  console.log('Closer Agendada: 40')
  console.log('Closer realizada: 38')
  console.log('Vendas: 2')

  // Try just SDR Weddings January (since user mentioned 349 might be just SDR)
  console.log('\n=== SDR Weddings - January 2026 ===')
  const sdrJan = deals2026.filter(d => d.pipeline === 'SDR Weddings' && d.created.startsWith('2026-01'))
  console.log('Leads:', sdrJan.length)

  // Try SDR + Closer Weddings January
  console.log('\n=== SDR + Closer Weddings - January 2026 ===')
  const sdrCloserJan = deals2026.filter(d =>
    (d.pipeline === 'SDR Weddings' || d.pipeline === 'Closer Weddings') &&
    d.created.startsWith('2026-01')
  )
  console.log('Leads:', sdrCloserJan.length)

  // Maybe it's all of January + February?
  console.log('\n=== All WW (excl Desq) - Jan+Feb 2026 ===')
  const janFeb = wwElopement.filter(d => d.created.startsWith('2026-01') || d.created.startsWith('2026-02'))
  console.log('Leads:', janFeb.length)

  // Check unique months in 2026 data
  console.log('\n=== Months in 2026 data ===')
  const months: Record<string, number> = {}
  deals2026.forEach(d => {
    const month = d.created.substring(0, 7)
    months[month] = (months[month] || 0) + 1
  })
  Object.entries(months).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`))
}

check().catch(console.error)
