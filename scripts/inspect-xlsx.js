const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'data', '2020_USRC_Group_Detail.xlsx'));

console.log('Sheet names:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  console.log(`\n=== Sheet: "${name}" ===`);
  console.log(`Rows: ${range.e.r + 1}, Cols: ${range.e.c + 1}`);
  
  // Print first 3 rows to see headers and sample data
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  for (let i = 0; i < Math.min(3, data.length); i++) {
    console.log(`Row ${i}:`, JSON.stringify(data[i]).substring(0, 500));
  }
}
