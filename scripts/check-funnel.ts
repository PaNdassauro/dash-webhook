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
    dataReuniao1: string | null
    comoReuniao1: string | null
    qualificadoSql: string | null
    dataCloser: string | null
    reuniaoCloser: string | null
    dataFechamento: string | null
  }

  const deals2026: Deal[] = []

  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const created = String(row.getCell(6).value || '')
    const parsedDate = parseDate(created)

    if (parsedDate && parsedDate.startsWith('2026')) {
      deals2026.push({
        id: Number(row.getCell(1).value),
        pipeline: String(row.getCell(3).value || ''),
        stage: String(row.getCell(4).value || ''),
        status: String(row.getCell(5).value || ''),
        created: parsedDate,
        dataReuniao1: row.getCell(13).value ? String(row.getCell(13).value) : null,
        comoReuniao1: row.getCell(14).value ? String(row.getCell(14).value) : null,
        qualificadoSql: row.getCell(15).value ? String(row.getCell(15).value) : null,
        dataCloser: row.getCell(16).value ? String(row.getCell(16).value) : null,
        reuniaoCloser: row.getCell(17).value ? String(row.getCell(17).value) : null,
        dataFechamento: row.getCell(18).value ? String(row.getCell(18).value) : null,
      })
    }
  })

  // Filter: NOT Elopement (WW General view)
  const wwDeals = deals2026.filter(d => d.pipeline !== 'Elopment Wedding')

  console.log('=== WW General (non-Elopement) ===')
  console.log('Leads:', wwDeals.length)
  console.log('MQL (stage filled & != Novo Lead):', wwDeals.filter(d => d.stage && d.stage !== 'Novo Lead').length)
  console.log('Agendamento (dataReuniao1 filled):', wwDeals.filter(d => d.dataReuniao1).length)
  console.log('Reuniões (comoReuniao1 filled):', wwDeals.filter(d => d.comoReuniao1).length)
  console.log('Qualificado (qualificadoSql filled):', wwDeals.filter(d => d.qualificadoSql).length)
  console.log('Closer Agendada (dataCloser filled):', wwDeals.filter(d => d.dataCloser).length)
  console.log('Closer realizada (reuniaoCloser filled):', wwDeals.filter(d => d.reuniaoCloser).length)
  console.log('Vendas (status=Won):', wwDeals.filter(d => d.status === 'Won').length)

  console.log('\n=== Expected ===')
  console.log('Leads: 349')
  console.log('MQL: 237')
  console.log('Agendamento: 81')
  console.log('Reuniões: 60')
  console.log('Qualificado: 46')
  console.log('Closer Agendada: 40')
  console.log('Closer realizada: 38')
  console.log('Vendas: 2')

  // Check qualificadoSql values
  const qualValues: Record<string, number> = {}
  wwDeals.forEach(d => {
    const v = d.qualificadoSql || 'empty'
    qualValues[v] = (qualValues[v] || 0) + 1
  })
  console.log('\nQualificado para SQL values:')
  Object.entries(qualValues).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // Check comoReuniao1 values
  const comoValues: Record<string, number> = {}
  wwDeals.forEach(d => {
    const v = d.comoReuniao1 || 'empty'
    comoValues[v] = (comoValues[v] || 0) + 1
  })
  console.log('\nComo foi feita a 1ª reunião values:')
  Object.entries(comoValues).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // January only - WW General
  const jan = wwDeals.filter(d => d.created.startsWith('2026-01'))
  console.log('\n=== January 2026 - WW General only ===')
  console.log('Leads:', jan.length)
  console.log('Agendamento:', jan.filter(d => d.dataReuniao1).length)
  console.log('Reuniões:', jan.filter(d => d.comoReuniao1).length)
  console.log('Qualificado:', jan.filter(d => d.qualificadoSql).length)
  console.log('Closer Agendada:', jan.filter(d => d.dataCloser).length)
  console.log('Closer realizada:', jan.filter(d => d.reuniaoCloser).length)
  console.log('Vendas:', jan.filter(d => d.status === 'Won').length)
}

check()
