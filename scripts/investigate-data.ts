import ExcelJS from 'exceljs'

async function investigate() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile('deals-used-only.xlsx')
  const ws = workbook.getWorksheet(1)!

  // Get headers
  const headers: string[] = []
  ws.getRow(1).eachCell((cell, colNum) => {
    headers[colNum] = String(cell.value || '')
  })
  console.log('=== HEADERS ===')
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`))

  // Sample first 5 data rows
  console.log('\n=== SAMPLE DATA (first 5 rows) ===')
  for (let rowNum = 2; rowNum <= 6; rowNum++) {
    const row = ws.getRow(rowNum)
    console.log(`\nRow ${rowNum}:`)
    row.eachCell((cell, colNum) => {
      if (cell.value) {
        console.log(`  ${headers[colNum]}: ${String(cell.value).substring(0, 50)}`)
      }
    })
  }

  // Check MQL column values
  console.log('\n=== MQL (Motivos de qualificação SDR) VALUES ===')
  const mqlValues: Record<string, number> = {}
  let mqlFilled = 0
  let mqlEmpty = 0
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const val = row.getCell(13).value
    if (val && String(val).trim() !== '') {
      mqlFilled++
      const v = String(val).substring(0, 30)
      mqlValues[v] = (mqlValues[v] || 0) + 1
    } else {
      mqlEmpty++
    }
  })
  console.log(`Filled: ${mqlFilled}, Empty: ${mqlEmpty}`)
  console.log('Sample values:')
  Object.entries(mqlValues).slice(0, 10).forEach(([k, v]) => console.log(`  "${k}": ${v}`))

  // Check pipelines
  console.log('\n=== PIPELINES ===')
  const pipelines: Record<string, number> = {}
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const val = String(row.getCell(3).value || 'empty')
    pipelines[val] = (pipelines[val] || 0) + 1
  })
  Object.entries(pipelines).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Check status values
  console.log('\n=== STATUS ===')
  const statuses: Record<string, number> = {}
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const val = String(row.getCell(5).value || 'empty')
    statuses[val] = (statuses[val] || 0) + 1
  })
  Object.entries(statuses).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Check Won deals
  console.log('\n=== WON DEALS ===')
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const status = String(row.getCell(5).value || '')
    if (status.toLowerCase() === 'won') {
      console.log(`Row ${rowNum}: ID=${row.getCell(1).value}, Pipeline=${row.getCell(3).value}`)
    }
  })

  // Check reuniao_closer (field 299) values
  console.log('\n=== REUNIAO CLOSER (col 18 - WW | Como foi feita Reunião Closer) VALUES ===')
  const closerValues: Record<string, number> = {}
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const val = row.getCell(18).value
    if (val && String(val).trim() !== '') {
      const v = String(val).substring(0, 30)
      closerValues[v] = (closerValues[v] || 0) + 1
    }
  })
  console.log(`Total with value: ${Object.values(closerValues).reduce((a, b) => a + b, 0)}`)
  Object.entries(closerValues).slice(0, 10).forEach(([k, v]) => console.log(`  "${k}": ${v}`))
}

investigate().catch(console.error)
