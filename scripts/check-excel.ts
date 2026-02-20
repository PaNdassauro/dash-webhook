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

  const deals2026: Array<{
    id: number
    pipeline: string
    stage: string
    status: string
    created: string
  }> = []

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
      })
    }
  })

  console.log('Total 2026 deals:', deals2026.length)

  // By pipeline
  const byPipeline: Record<string, number> = {}
  deals2026.forEach(d => {
    byPipeline[d.pipeline] = (byPipeline[d.pipeline] || 0) + 1
  })
  console.log('\nBy pipeline:')
  Object.entries(byPipeline).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // By status
  const byStatus: Record<string, number> = {}
  deals2026.forEach(d => {
    byStatus[d.status || 'empty'] = (byStatus[d.status || 'empty'] || 0) + 1
  })
  console.log('\nBy status:')
  Object.entries(byStatus).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  // Show Won deals
  const won = deals2026.filter(d => d.status === 'Won')
  console.log('\nWon deals:', won.length)
  won.forEach(d => console.log('  ', d))

  // SDR Weddings only (since expected Leads = 349, close to 345)
  const sdrOnly = deals2026.filter(d => d.pipeline === 'SDR Weddings')
  console.log('\n=== SDR Weddings only ===')
  console.log('Leads:', sdrOnly.length)

  // January 2026 only
  const jan2026 = deals2026.filter(d => d.created.startsWith('2026-01'))
  console.log('\n=== January 2026 only ===')
  console.log('Leads:', jan2026.length)

  const jan2026ByPipeline: Record<string, number> = {}
  jan2026.forEach(d => {
    jan2026ByPipeline[d.pipeline] = (jan2026ByPipeline[d.pipeline] || 0) + 1
  })
  console.log('By pipeline:')
  Object.entries(jan2026ByPipeline).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k + ': ' + v))

  const jan2026ByStatus: Record<string, number> = {}
  jan2026.forEach(d => {
    jan2026ByStatus[d.status || 'empty'] = (jan2026ByStatus[d.status || 'empty'] || 0) + 1
  })
  console.log('By status:')
  Object.entries(jan2026ByStatus).forEach(([k, v]) => console.log('  ' + k + ': ' + v))
}

check()
