const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Columns we're using (from deals-fields-used.md)
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
  'Data e horário do agendamento da 1ª reunião',
  'Como foi feita a 1ª reunião?',
  'Qualificado para SQL',
  'Data e horário do agendamento com a Closer:',
  'WW | Como foi feita Reunião Closer',
  '[WW] [Closer] Data-Hora Ganho',
];

async function main() {
  const csvDir = path.join(__dirname, '..', 'csv');
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv')).sort();

  console.log(`Found ${files.length} CSV files`);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Deals Combined');

  let headers = [];
  let allRows = [];
  let usedColumnIndices = [];

  // Read all CSVs
  for (const file of files) {
    const filePath = path.join(csvDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Parse CSV properly (handling quoted fields)
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

    // Get headers from first file
    if (headers.length === 0) {
      headers = parseCSVLine(lines[0].replace(/^\uFEFF/, '')); // Remove BOM

      // Find indices of used columns
      headers.forEach((h, i) => {
        const cleanHeader = h.replace(/"/g, '').trim();
        if (USED_COLUMNS.some(uc => cleanHeader.includes(uc) || uc.includes(cleanHeader))) {
          usedColumnIndices.push(i);
        }
      });

      console.log(`Headers: ${headers.length} columns`);
      console.log(`Used columns found: ${usedColumnIndices.length}`);
    }

    // Add data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        allRows.push(parseCSVLine(lines[i]));
      }
    }

    console.log(`${file}: added ${lines.length - 1} rows`);
  }

  console.log(`\nTotal rows: ${allRows.length}`);

  // Add headers to worksheet
  const headerRow = worksheet.addRow(headers.map(h => h.replace(/"/g, '')));

  // Style header row
  headerRow.eachCell((cell, colNumber) => {
    const isUsed = USED_COLUMNS.some(uc => {
      const header = headers[colNumber - 1].replace(/"/g, '').trim();
      return header === uc || header.includes(uc) || uc.includes(header);
    });

    if (isUsed) {
      // Red background for used columns
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF6B6B' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    } else {
      // Gray background for unused
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add data rows
  allRows.forEach(row => {
    worksheet.addRow(row);
  });

  // Auto-fit columns (max 50 chars)
  worksheet.columns.forEach(column => {
    column.width = Math.min(30, Math.max(10, column.header?.length || 10));
  });

  // Save
  const outputPath = path.join(__dirname, '..', 'deals-combined.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`\nSaved to: ${outputPath}`);
  console.log('\nUsed columns (highlighted in red):');
  USED_COLUMNS.forEach(c => console.log(`  - ${c}`));
}

main().catch(console.error);
