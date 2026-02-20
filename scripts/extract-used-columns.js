const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Columns we're using (from FIELD_MAPPING.md)
// WW Funnel: Lead -> MQL -> Agendamento -> Reuniao -> Qualificado -> Closer Agendada -> Closer Realizada -> Venda
const USED_COLUMNS = [
  'Deal ID',
  'Title',
  'Pipeline',
  'Stage',
  'Status',
  'Created',
  'Updated',
  'Nome do Noivo(a)2',
  'Número de convidados:',
  'Orçamento:',
  'Destino',
  'Motivo de perda',
  // MQL (field 83)
  'Motivos de qualificação SDR',
  // Agendamento (field 6)
  'Data e horário do agendamento da 1ª reunião',
  // Reuniao (field 17)
  'Como foi feita a 1ª reunião?',
  // Qualificado - WW date field (col 93)
  'Automático - WW - Data Qualificação SDR',
  // Qualificado - keeping for WT compatibility
  'Qualificado para SQL',
  // Closer Agendada (field 18)
  'Data e horário do agendamento com a Closer:',
  // Closer Realizada (field 299)
  'WW | Como foi feita Reunião Closer',
  // Venda (field 87)
  '[WW] [Closer] Data-Hora Ganho',
];

async function main() {
  const csvDir = path.join(__dirname, '..', 'csv');
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv')).sort();

  console.log(`Found ${files.length} CSV files`);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Deals - Used Fields Only');

  let headers = [];
  let allRows = [];
  let usedColumnIndices = [];

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  for (const file of files) {
    const filePath = path.join(csvDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (headers.length === 0) {
      const rawHeaders = parseCSVLine(lines[0].replace(/^\uFEFF/, ''));

      // Find indices of used columns (exact match only)
      rawHeaders.forEach((h, i) => {
        const cleanHeader = h.replace(/"/g, '').trim();
        if (USED_COLUMNS.includes(cleanHeader)) {
          usedColumnIndices.push({ index: i, name: cleanHeader });
        }
      });

      // Sort by USED_COLUMNS order
      usedColumnIndices.sort((a, b) =>
        USED_COLUMNS.indexOf(a.name) - USED_COLUMNS.indexOf(b.name)
      );

      // Dedupe - keep first occurrence only
      const seen = new Set();
      usedColumnIndices = usedColumnIndices.filter(c => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      });

      headers = usedColumnIndices.map(c => c.name);
      console.log(`Found ${usedColumnIndices.length} used columns`);
    }

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const fullRow = parseCSVLine(lines[i]);
        const filteredRow = usedColumnIndices.map(c => fullRow[c.index] || '');
        allRows.push(filteredRow);
      }
    }

    console.log(`${file}: processed`);
  }

  console.log(`\nTotal rows: ${allRows.length}`);

  // Add headers
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6B6B' }
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add data
  allRows.forEach(row => worksheet.addRow(row));

  // Auto-fit columns
  worksheet.columns.forEach((column, i) => {
    column.width = Math.min(40, Math.max(12, headers[i]?.length + 2 || 12));
  });

  const outputPath = path.join(__dirname, '..', 'deals-used-only.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`\nSaved to: ${outputPath}`);
  console.log(`Columns: ${headers.length}`);
  headers.forEach(h => console.log(`  - ${h}`));
}

main().catch(console.error);
