const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ── 1. Load county lat/lng lookup ──
const latlngCsv = fs.readFileSync(path.join(__dirname, '..', 'data', 'us_county_latlng.csv'), 'utf-8');
const latlngMap = new Map(); // fips -> { lat, lng }
for (const line of latlngCsv.split('\n').slice(1)) {
  const parts = line.trim().split(',');
  if (parts.length < 4) continue;
  const fips = parts[0].padStart(5, '0');
  const lng = parseFloat(parts[2]);
  const lat = parseFloat(parts[3]);
  if (!isNaN(lat) && !isNaN(lng)) {
    latlngMap.set(fips, { lat, lng });
  }
}
console.log(`Loaded ${latlngMap.size} county centroids`);

// ── 2. Group name -> denomination ID mapping ──
const GROUP_MAP = {
  "Catholic Church": "catholic",
  "Eastern Catholic Churches": "catholic",
  "Southern Baptist Convention": "baptist",
  "American Baptist Churches in the USA": "baptist",
  "American Baptist Association": "baptist",
  "Baptist General Conference": "baptist",
  "Baptist Missionary Association of America": "baptist",
  "Conservative Baptist Association of America": "baptist",
  "Free Will Baptist, National Association of": "baptist",
  "General Association of General Baptists": "baptist",
  "General Association of Regular Baptist Churches": "baptist",
  "National Baptist Convention of America, Inc.": "baptist",
  "National Baptist Convention, USA, Inc.": "baptist",
  "National Missionary Baptist Convention of America": "baptist",
  "National Primitive Baptist Convention, Inc.": "baptist",
  "North American Baptist Conference": "baptist",
  "Progressive National Baptist Convention, Inc.": "baptist",
  "Cooperative Baptist Fellowship": "baptist",
  "Full Gospel Baptist Church Fellowship": "baptist",
  "Alliance of Baptists": "baptist",
  "Association of Reformed Baptist Churches of America": "baptist",
  "Enterprise Baptists Association": "baptist",
  "Fundamental Baptist Fellowship Association": "baptist",
  "Independent Baptist Fellowship International": "baptist",
  "Interstate & Foreign Landmark Missionary Baptists Association": "baptist",
  "Landmark Baptist, Independent Associations and Churches": "baptist",
  "Liberty Baptist Fellowship": "baptist",
  "Old Regular Baptists": "baptist",
  "Primitive Baptists Associations": "baptist",
  "Primitive Baptist, Absolute Predestinarian": "baptist",
  "Reformed Baptist Churches": "baptist",
  "Regular Baptists": "baptist",
  "Separate Baptists in Christ": "baptist",
  "Seventh Day Baptist General Conference": "baptist",
  "Sovereign Grace Baptists": "baptist",
  "Two-Seed-in-the-Spirit Predestinarian Baptists": "baptist",
  "United Methodist Church": "methodist",
  "African Methodist Episcopal Church": "methodist",
  "African Methodist Episcopal Zion Church": "methodist",
  "Christian Methodist Episcopal Church": "methodist",
  "Free Methodist Church of North America": "methodist",
  "Primitive Methodist Church in the USA": "methodist",
  "Southern Methodist Church": "methodist",
  "Congregational Methodist Church": "methodist",
  "Evangelical Methodist Church": "methodist",
  "Global Methodist Church": "methodist",
  "Evangelical Lutheran Church in America": "lutheran",
  "Lutheran Church-Missouri Synod": "lutheran",
  "Wisconsin Evangelical Lutheran Synod": "lutheran",
  "Church of the Lutheran Brethren of America": "lutheran",
  "Church of the Lutheran Confession": "lutheran",
  "Evangelical Lutheran Synod": "lutheran",
  "Association of Free Lutheran Congregations": "lutheran",
  "American Association of Lutheran Churches": "lutheran",
  "Lutheran Congregations in Mission for Christ": "lutheran",
  "North American Lutheran Church": "lutheran",
  "Latvian Evangelical Lutheran Church in America": "lutheran",
  "Presbyterian Church (U.S.A.)": "presbyterian",
  "Presbyterian Church in America": "presbyterian",
  "Cumberland Presbyterian Church": "presbyterian",
  "Cumberland Presbyterian Church in America": "presbyterian",
  "Evangelical Presbyterian Church": "presbyterian",
  "Orthodox Presbyterian Church": "presbyterian",
  "Reformed Presbyterian Church of North America": "presbyterian",
  "Associate Reformed Presbyterian Church": "presbyterian",
  "American Presbyterian Church": "presbyterian",
  "Bible Presbyterian Church": "presbyterian",
  "Korean Presbyterian Church Abroad": "presbyterian",
  "Korean Presbyterian Church in America": "presbyterian",
  "Vanguard Presbytery": "presbyterian",
  "Westminster Evangelical Presbyterian Church": "presbyterian",
  "Episcopal Church": "episcopal",
  "Anglican Church in North America": "episcopal",
  "Reformed Episcopal Church": "episcopal",
  "American Anglican Church": "episcopal",
  "Anglican Catholic Church": "episcopal",
  "Anglican Church in America": "episcopal",
  "Anglican Province of America": "episcopal",
  "Anglican Province of Christ the King": "episcopal",
  "Assemblies of God": "pentecostal",
  "Church of God (Cleveland, Tennessee)": "pentecostal",
  "Church of God in Christ": "pentecostal",
  "Church of God of Prophecy": "pentecostal",
  "International Church of the Foursquare Gospel": "pentecostal",
  "International Pentecostal Holiness Church": "pentecostal",
  "Pentecostal Church of God": "pentecostal",
  "Pentecostal Assemblies of the World, Inc.": "pentecostal",
  "United Pentecostal Church International": "pentecostal",
  "Assemblies of the Lord Jesus Christ": "pentecostal",
  "Church of God of the Apostolic Faith, Inc.": "pentecostal",
  "Church of Our Lord Jesus Christ of the Apostolic Faith": "pentecostal",
  "Congregational Holiness Church": "pentecostal",
  "Elim Fellowship": "pentecostal",
  "Open Bible Churches": "pentecostal",
  "Pentecostal Free Will Baptist Church, Inc.": "pentecostal",
  "(Original) Church of God": "pentecostal",
  "Church of God (Seventh Day)": "pentecostal",
  "Church of God, a Worldwide Association": "pentecostal",
  "Church of God General Conference": "pentecostal",
  "Apostolic Faith Mission of Portland, OR": "pentecostal",
  "International Fellowship of Christian Assemblies": "pentecostal",
  "Church of Jesus Christ of Latter-day Saints, The": "mormon",
  "Community of Christ": "mormon",
  "Greek Orthodox Archdiocese of America": "orthodox",
  "Orthodox Church in America": "orthodox",
  "Antiochian Orthodox Christian Archdiocese of North America, The": "orthodox",
  "Serbian Orthodox Church in North and South America": "orthodox",
  "Russian Orthodox Church Outside of Russia": "orthodox",
  "Romanian Orthodox Archdiocese in Americas": "orthodox",
  "Ukrainian Orthodox Church of the USA": "orthodox",
  "Bulgarian Eastern Orthodox Diocese of the USA, Canada and Australia": "orthodox",
  "Coptic Orthodox Church": "orthodox",
  "Ethiopian Orthodox Tewahedo Church": "orthodox",
  "Eritrean Orthodox Tewahedo Church": "orthodox",
  "American Carpatho-Russian Orthodox Diocese": "orthodox",
  "Albanian Orthodox Diocese of America": "orthodox",
  "Belarusan Autocephalous Orthodox Church": "orthodox",
  "Armenian Apostolic Church of America (Catholicosate of Cilicia)": "orthodox",
  "Armenian Church of North America (Catholicosate of Etchmiadzin)": "orthodox",
  "Malankara Archdiocese of the Syrian Orthodox Church in North America": "orthodox",
  "Malankara Orthodox Syrian Church, American Diocese of the": "orthodox",
  "Mar Thoma Syrian Church of Malabar": "orthodox",
  "Nondenominational Churches": "nondenominational",
  "Independent Non-Charismatic Churches": "nondenominational",
  "Independent Charismatic Churches": "nondenominational",
  "Calvary Chapel Fellowship Churches": "nondenominational",
  "Vineyard USA": "nondenominational",
  "Venture Church Network": "nondenominational",
  "Converge": "nondenominational",
  "Sovereign Grace Churches": "nondenominational",
  "Every Nation Churches": "nondenominational",
  "Jewish Estimate - Conservative": "jewish",
  "Jewish Estimate - Orthodox": "jewish",
  "Jewish Estimate - Reconstructionist": "jewish",
  "Jewish Estimate - Reform": "jewish",
  "Muslim Estimate": "muslim",
  "Muslim Estimate - Sunni": "muslim",
  "Muslim Estimate - Shia": "muslim",
  "Buddhist - Mahayana": "buddhist",
  "Buddhist - Theravada": "buddhist",
  "Vajarayana Buddhist": "buddhist",
  "Hindu - Indian-American Hindu Temple Associations": "hindu",
  "Hindu - Post-Renaissance": "hindu",
  "Hindu - Renaissance": "hindu",
  "Hindu - Traditional Temples": "hindu",
  "Vedanta Society": "hindu",
  "Sikh": "sikh",
  "American Sikh Council": "sikh",
};

function classifyGroup(groupName) {
  if (!groupName) return 'other';
  const mapped = GROUP_MAP[groupName];
  if (mapped) return mapped;
  const lower = groupName.toLowerCase();
  if (lower.includes('baptist')) return 'baptist';
  if (lower.includes('methodist') || lower.includes('wesleyan')) return 'methodist';
  if (lower.includes('lutheran')) return 'lutheran';
  if (lower.includes('presbyterian') || lower.includes('reformed')) return 'presbyterian';
  if (lower.includes('episcopal') || lower.includes('anglican')) return 'episcopal';
  if (lower.includes('pentecostal') || lower.includes('holiness') || lower.includes('apostolic')) return 'pentecostal';
  if (lower.includes('orthodox')) return 'orthodox';
  if (lower.includes('latter-day') || lower.includes('mormon')) return 'mormon';
  if (lower.includes('jewish') || lower.includes('synagogue')) return 'jewish';
  if (lower.includes('muslim') || lower.includes('islam')) return 'muslim';
  if (lower.includes('buddhist') || lower.includes('buddhism')) return 'buddhist';
  if (lower.includes('hindu')) return 'hindu';
  if (lower.includes('sikh')) return 'sikh';
  if (lower.includes('church') || lower.includes('christian') || lower.includes('mennonite') ||
      lower.includes('amish') || lower.includes('brethren') || lower.includes('quaker') ||
      lower.includes('friends') || lower.includes('nazarene') || lower.includes('adventist') ||
      lower.includes('salvation army')) return 'other_christian';
  return 'other';
}

// ── 3. Parse the Excel ──
const wb = XLSX.readFile(path.join(__dirname, '..', 'data', '2020_USRC_Group_Detail.xlsx'));
const ws = wb.Sheets['2020 Group by County'];
const rows = XLSX.utils.sheet_to_json(ws);

// Also get summary data for county populations
const wsSummary = wb.Sheets['2020 Group by Nation']; // We don't have county pop here
// We'll estimate population from adherents / adherence rate

// Aggregate by county
const counties = new Map();

for (const row of rows) {
  const fips = String(row['FIPS'] || '').padStart(5, '0');
  if (fips === '00000' || fips === 'Total' || !row['State Name']) continue;
  
  const stateName = row['State Name'];
  const countyName = String(row['County Name'] || '')
    .replace(/ County$/, '').replace(/ Parish$/, '').replace(/ Borough$/, '')
    .replace(/ Census Area$/, '').replace(/ Municipality$/, '').replace(/ city$/, ' City');
  const groupName = row['Group Name'] || '';
  const adherents = typeof row['Adherents'] === 'number' ? row['Adherents'] : 0;
  const congregations = typeof row['Congregations'] === 'number' ? row['Congregations'] : 0;
  const pctOfPop = typeof row['Adherents as % of Total Population'] === 'number' ? row['Adherents as % of Total Population'] : 0;

  if (!counties.has(fips)) {
    counties.set(fips, {
      fips,
      name: countyName,
      state: stateName,
      denoms: {},
      totalAdherents: 0,
      totalCongregations: 0,
      estimatedPop: 0,
    });
  }

  const county = counties.get(fips);
  const denomId = classifyGroup(groupName);

  if (!county.denoms[denomId]) {
    county.denoms[denomId] = 0;
  }
  county.denoms[denomId] += adherents;
  county.totalAdherents += adherents;
  county.totalCongregations += congregations;

  // Estimate population from adherents and % of pop
  if (adherents > 0 && pctOfPop > 0) {
    const estPop = Math.round(adherents / pctOfPop);
    if (estPop > county.estimatedPop) {
      county.estimatedPop = estPop;
    }
  }
}

// ── 4. Build final data entries ──
const entries = [];
let matchedCoords = 0;
let missingCoords = 0;

for (const county of counties.values()) {
  const coords = latlngMap.get(county.fips);
  if (!coords) {
    missingCoords++;
    continue;
  }
  matchedCoords++;

  if (county.totalAdherents === 0) continue;

  // Find dominant denomination
  let dominant = 'other';
  let maxAdherents = 0;
  for (const [denomId, count] of Object.entries(county.denoms)) {
    if (count > maxAdherents) {
      maxAdherents = count;
      dominant = denomId;
    }
  }

  // Estimate adherence rate
  const pop = county.estimatedPop > 0 ? county.estimatedPop : Math.round(county.totalAdherents / 0.5);
  const adherenceRate = Math.min(99, Math.round((county.totalAdherents / pop) * 100));

  entries.push({
    fips: county.fips,
    name: county.name,
    state: county.state,
    lat: Math.round(coords.lat * 100) / 100,
    lng: Math.round(coords.lng * 100) / 100,
    population: pop,
    totalAdherents: county.totalAdherents,
    adherenceRate,
    denominations: county.denoms,
    dominantDenomination: dominant,
  });
}

console.log(`Matched coords: ${matchedCoords}, Missing: ${missingCoords}`);
console.log(`Final entries with data: ${entries.length}`);

// Sort by total adherents descending
entries.sort((a, b) => b.totalAdherents - a.totalAdherents);

// ── 5. Generate TypeScript file ──
// We'll embed the data as a typed array literal
let ts = `// REAL county-level religious adherence data from the 2020 U.S. Religion Census
// Source: Association of Statisticians of American Religious Bodies (ASARB)
// "2020 U.S. Religion Census: Religious Congregations & Adherents Study"
// Downloaded from: https://www.usreligioncensus.org/node/1639
// Processed ${new Date().toISOString().split('T')[0]}
// ${entries.length} counties with ${entries.reduce((s, e) => s + e.totalAdherents, 0).toLocaleString()} total adherents

export interface CountyReligionData {
  fips: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  totalAdherents: number;
  adherenceRate: number;
  denominations: Record<string, number>;
  dominantDenomination: string;
}

export interface CensusPopulationPoint {
  lat: number;
  lng: number;
  denominationId: string;
  count: number;
  county: string;
  state: string;
}

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateCensusPopulationPoints(): CensusPopulationPoint[] {
  const rng = seededRandom(999);
  const points: CensusPopulationPoint[] = [];
  const PEOPLE_PER_POINT = 5000;

  const counties = getCountyReligionData();
  for (const county of counties) {
    for (const [denomId, adherentCount] of Object.entries(county.denominations)) {
      if (adherentCount < PEOPLE_PER_POINT / 2) continue;
      const numPoints = Math.max(1, Math.round(adherentCount / PEOPLE_PER_POINT));
      for (let i = 0; i < numPoints; i++) {
        const spread = 0.3;
        const lat = county.lat + (rng() - 0.5) * spread * 2;
        const lng = county.lng + (rng() - 0.5) * spread * 2;
        points.push({
          lat,
          lng,
          denominationId: denomId,
          count: PEOPLE_PER_POINT,
          county: county.name,
          state: county.state,
        });
      }
    }
  }
  return points;
}

`;

// Embed the data as a compact array
ts += `const COUNTY_DATA: CountyReligionData[] = [\n`;

for (const entry of entries) {
  // Only include denominations with > 0 adherents
  const denomsFiltered = {};
  for (const [k, v] of Object.entries(entry.denominations)) {
    if (v > 0) denomsFiltered[k] = v;
  }
  entry.denominations = denomsFiltered;
  
  ts += `  ${JSON.stringify(entry)},\n`;
}

ts += `];\n\n`;

ts += `export function getCountyReligionData(): CountyReligionData[] {
  return COUNTY_DATA;
}
`;

const outPath = path.join(__dirname, '..', 'src', 'data', 'county-religion-data.ts');
fs.writeFileSync(outPath, ts);
console.log(`\nWrote ${outPath}`);
console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
