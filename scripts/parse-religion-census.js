const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'data', '2020_USRC_Group_Detail.xlsx'));
const ws = wb.Sheets['2020 Group by County'];
const rows = XLSX.utils.sheet_to_json(ws);

// First, let's see all unique group names to build our mapping
const groupNames = new Set();
for (const row of rows) {
  groupNames.add(row['Group Name']);
}
console.log(`Total unique groups: ${groupNames.size}`);
console.log('Sample groups:');
const sorted = [...groupNames].sort();
for (const g of sorted.slice(0, 50)) {
  console.log(`  "${g}"`);
}
console.log('...');
for (const g of sorted.slice(-20)) {
  console.log(`  "${g}"`);
}

// Print some sample rows
console.log('\nSample rows:');
for (let i = 0; i < 5; i++) {
  console.log(JSON.stringify(rows[i]));
}

// Count total rows per FIPS
const fipsCounts = {};
for (const row of rows) {
  const fips = row['FIPS'];
  fipsCounts[fips] = (fipsCounts[fips] || 0) + 1;
}
console.log(`\nTotal unique counties (FIPS): ${Object.keys(fipsCounts).length}`);
