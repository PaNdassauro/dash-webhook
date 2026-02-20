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
    // Column 13: Motivos de qualificação SDR (MQL)
    motivosQualificacao: string | null
    // Column 14: Data e horário do agendamento da 1ª reunião (Agendamento)
    dataReuniao1: string | null
    // Column 15: Como foi feita a 1ª reunião? (Reuniao)
    comoReuniao1: string | null
    // Column 16: Qualificado para SQL (for WT)
    qualificadoSql: string | null
    // Column 17: Data e horário do agendamento com a Closer: (Closer Agendada)
    dataCloser: string | null
    // Column 18: WW | Como foi feita Reunião Closer (Closer Realizada - field 299)
    reuniaoCloser: string | null
    // Column 19: [WW] [Closer] Data-Hora Ganho (Venda)
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
        motivosQualificacao: row.getCell(13).value ? String(row.getCell(13).value) : null,
        dataReuniao1: row.getCell(14).value ? String(row.getCell(14).value) : null,
        comoReuniao1: row.getCell(15).value ? String(row.getCell(15).value) : null,
        qualificadoSql: row.getCell(16).value ? String(row.getCell(16).value) : null,
        dataCloser: row.getCell(17).value ? String(row.getCell(17).value) : null,
        reuniaoCloser: row.getCell(18).value ? String(row.getCell(18).value) : null,
        dataFechamento: row.getCell(19).value ? String(row.getCell(19).value) : null,
      })
    }
  })

  // Try different filters to match expected: 349 Leads
  const pipelines = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings', 'WW - Internacional']

  console.log('=== SDR + Closer + Planejamento + Internacional (excl Elopement & Desqualificados) ===')
  const filtered = deals2026.filter(d => pipelines.includes(d.pipeline))
  console.log('Leads:', filtered.length)
  console.log('MQL (motivosQualificacao filled):', filtered.filter(d => d.motivosQualificacao).length)
  console.log('Agendamento:', filtered.filter(d => d.dataReuniao1).length)
  console.log('Reuniões (comoReuniao1 filled):', filtered.filter(d => d.comoReuniao1).length)
  console.log('Reuniões (comoReuniao1 != "Não teve reunião"):', filtered.filter(d => d.comoReuniao1 && d.comoReuniao1 !== 'Não teve reunião').length)
  console.log('Qualificado (filled):', filtered.filter(d => d.qualificadoSql).length)
  console.log('Qualificado (= Sim):', filtered.filter(d => d.qualificadoSql === 'Sim').length)
  console.log('Closer Agendada:', filtered.filter(d => d.dataCloser).length)
  console.log('Closer realizada:', filtered.filter(d => d.reuniaoCloser).length)
  console.log('Vendas:', filtered.filter(d => d.status === 'Won').length)

  // January only
  console.log('\n=== January 2026 - Same filter ===')
  const jan = filtered.filter(d => d.created.startsWith('2026-01'))
  console.log('Leads:', jan.length)
  console.log('MQL (motivosQualificacao filled):', jan.filter(d => d.motivosQualificacao).length)
  console.log('Agendamento:', jan.filter(d => d.dataReuniao1).length)
  console.log('Reuniões (comoReuniao1 filled):', jan.filter(d => d.comoReuniao1).length)
  console.log('Reuniões (comoReuniao1 != "Não teve reunião"):', jan.filter(d => d.comoReuniao1 && d.comoReuniao1 !== 'Não teve reunião').length)
  console.log('Qualificado (= Sim):', jan.filter(d => d.qualificadoSql === 'Sim').length)
  console.log('Closer Agendada:', jan.filter(d => d.dataCloser).length)
  console.log('Closer realizada:', jan.filter(d => d.reuniaoCloser).length)
  console.log('Vendas:', jan.filter(d => d.status === 'Won').length)

  // SDR Weddings only - January
  console.log('\n=== SDR Weddings - January 2026 ===')
  const sdrJan = deals2026.filter(d => d.pipeline === 'SDR Weddings' && d.created.startsWith('2026-01'))
  console.log('Leads:', sdrJan.length)
  console.log('MQL (motivosQualificacao filled):', sdrJan.filter(d => d.motivosQualificacao).length)
  console.log('Agendamento:', sdrJan.filter(d => d.dataReuniao1).length)
  console.log('Reuniões:', sdrJan.filter(d => d.comoReuniao1 && d.comoReuniao1 !== 'Não teve reunião').length)
  console.log('Qualificado (= Sim):', sdrJan.filter(d => d.qualificadoSql === 'Sim').length)
  console.log('Closer Agendada:', sdrJan.filter(d => d.dataCloser).length)
  console.log('Closer realizada:', sdrJan.filter(d => d.reuniaoCloser).length)
  console.log('Vendas:', sdrJan.filter(d => d.status === 'Won').length)

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
