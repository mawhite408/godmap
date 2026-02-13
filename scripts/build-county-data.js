const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Map 373 ARDA group names -> our denomination IDs
// Groups not listed here fall into "other_christian" or "other"
const GROUP_MAP = {
  // CATHOLIC
  "Catholic Church": "catholic",
  "Eastern Catholic Churches": "catholic",

  // BAPTIST
  "Southern Baptist Convention": "baptist",
  "American Baptist Churches in the USA": "baptist",
  "American Baptist Association": "baptist",
  "Baptist General Conference": "baptist",
  "Baptist Missionary Association of America": "baptist",
  "Conservative Baptist Association of America": "baptist",
  "Free Will Baptist, National Association of": "baptist",
  "General Association of General Baptists": "baptist",
  "General Association of Regular Baptist Churches": "baptist",
  "Independent Baptist Fellowship International": "baptist",
  "Interstate & Foreign Landmark Missionary Baptists Association": "baptist",
  "Landmark Baptist, Independent Associations and Churches": "baptist",
  "National Baptist Convention of America, Inc.": "baptist",
  "National Baptist Convention, USA, Inc.": "baptist",
  "National Missionary Baptist Convention of America": "baptist",
  "National Primitive Baptist Convention, Inc.": "baptist",
  "North American Baptist Conference": "baptist",
  "Old Regular Baptists": "baptist",
  "Primitive Baptists Associations": "baptist",
  "Primitive Baptist, Absolute Predestinarian": "baptist",
  "Progressive National Baptist Convention, Inc.": "baptist",
  "Reformed Baptist Churches": "baptist",
  "Regular Baptists": "baptist",
  "Separate Baptists in Christ": "baptist",
  "Seventh Day Baptist General Conference": "baptist",
  "Sovereign Grace Baptists": "baptist",
  "Two-Seed-in-the-Spirit Predestinarian Baptists": "baptist",
  "Alliance of Baptists": "baptist",
  "Association of Reformed Baptist Churches of America": "baptist",
  "Cooperative Baptist Fellowship": "baptist",
  "Enterprise Baptists Association": "baptist",
  "Full Gospel Baptist Church Fellowship": "baptist",
  "Fundamental Baptist Fellowship Association": "baptist",
  "Liberty Baptist Fellowship": "baptist",

  // METHODIST
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

  // LUTHERAN
  "Evangelical Lutheran Church in America": "lutheran",
  "Lutheran Church-Missouri Synod": "lutheran",
  "Wisconsin Evangelical Lutheran Synod": "lutheran",
  "Church of the Lutheran Brethren of America": "lutheran",
  "Church of the Lutheran Confession": "lutheran",
  "Evangelical Lutheran Synod": "lutheran",
  "Free Lutheran Congregations, The Association of": "lutheran",
  "Association of Free Lutheran Congregations": "lutheran",
  "American Association of Lutheran Churches": "lutheran",
  "Lutheran Congregations in Mission for Christ": "lutheran",
  "North American Lutheran Church": "lutheran",
  "Latvian Evangelical Lutheran Church in America": "lutheran",

  // PRESBYTERIAN
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

  // EPISCOPAL / ANGLICAN
  "Episcopal Church": "episcopal",
  "Anglican Church in North America": "episcopal",
  "Reformed Episcopal Church": "episcopal",
  "American Anglican Church": "episcopal",
  "Anglican Catholic Church": "episcopal",
  "Anglican Church in America": "episcopal",
  "Anglican Province of America": "episcopal",
  "Anglican Province of Christ the King": "episcopal",

  // PENTECOSTAL
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
  "Full Gospel Baptist Church Fellowship": "pentecostal",
  "International Fellowship of Christian Assemblies": "pentecostal",
  "Open Bible Churches": "pentecostal",
  "Pentecostal Free Will Baptist Church, Inc.": "pentecostal",
  "(Original) Church of God": "pentecostal",
  "Church of God (Seventh Day)": "pentecostal",
  "Church of God, a Worldwide Association": "pentecostal",
  "Church of God General Conference": "pentecostal",
  "Apostolic Faith Mission of Portland, OR": "pentecostal",

  // LATTER-DAY SAINTS (MORMON)
  "Church of Jesus Christ of Latter-day Saints, The": "mormon",
  "Community of Christ": "mormon",

  // ORTHODOX
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

  // NON-DENOMINATIONAL
  "Nondenominational Churches": "nondenominational",
  "Independent Non-Charismatic Churches": "nondenominational",
  "Independent Charismatic Churches": "nondenominational",
  "Calvary Chapel Fellowship Churches": "nondenominational",
  "Vineyard USA": "nondenominational",
  "Venture Church Network": "nondenominational",
  "Willow Creek Association": "nondenominational",
  "Converge": "nondenominational",
  "Sovereign Grace Churches": "nondenominational",
  "Every Nation Churches": "nondenominational",

  // JEWISH
  "Jewish Estimate - Conservative": "jewish",
  "Jewish Estimate - Orthodox": "jewish",
  "Jewish Estimate - Reconstructionist": "jewish",
  "Jewish Estimate - Reform": "jewish",

  // MUSLIM
  "Muslim Estimate": "muslim",
  "Muslim Estimate - Sunni": "muslim",
  "Muslim Estimate - Shia": "muslim",

  // BUDDHIST
  "Buddhist - Mahayana": "buddhist",
  "Buddhist - Theravada": "buddhist",
  "Vajarayana Buddhist": "buddhist",

  // HINDU
  "Hindu - Indian-American Hindu Temple Associations": "hindu",
  "Hindu - Post-Renaissance": "hindu",
  "Hindu - Renaissance": "hindu",
  "Hindu - Traditional Temples": "hindu",
  "Vedanta Society": "hindu",

  // SIKH
  "Sikh": "sikh",
  "American Sikh Council": "sikh",
};

// We also need county lat/lng. We'll use a separate source for that.
// For now, let's aggregate the data by county and denomination.

const wb = XLSX.readFile(path.join(__dirname, '..', 'data', '2020_USRC_Group_Detail.xlsx'));
const ws = wb.Sheets['2020 Group by County'];
const rows = XLSX.utils.sheet_to_json(ws);

// Aggregate by county
const counties = new Map(); // fips -> { name, state, denoms: { denomId -> { adherents, congregations } } }

for (const row of rows) {
  const fips = String(row['FIPS']).padStart(5, '0');
  const stateName = row['State Name'];
  const countyName = String(row['County Name']).replace(/ County$/, '').replace(/ Parish$/, '').replace(/ Borough$/, '').replace(/ Census Area$/, '').replace(/ Municipality$/, '');
  const groupName = row['Group Name'] || '';
  const adherents = typeof row['Adherents'] === 'number' ? row['Adherents'] : 0;
  const congregations = typeof row['Congregations'] === 'number' ? row['Congregations'] : 0;

  if (!counties.has(fips)) {
    counties.set(fips, {
      fips,
      name: countyName,
      state: stateName,
      denoms: {},
      totalAdherents: 0,
      totalCongregations: 0,
    });
  }

  const county = counties.get(fips);

  // Map group to our denomination ID
  let denomId = GROUP_MAP[groupName];
  if (!denomId) {
    // Try to classify unmapped groups
    const lower = groupName.toLowerCase();
    if (lower.includes('baptist')) denomId = 'baptist';
    else if (lower.includes('methodist') || lower.includes('wesleyan')) denomId = 'methodist';
    else if (lower.includes('lutheran')) denomId = 'lutheran';
    else if (lower.includes('presbyterian') || lower.includes('reformed')) denomId = 'presbyterian';
    else if (lower.includes('episcopal') || lower.includes('anglican')) denomId = 'episcopal';
    else if (lower.includes('pentecostal') || lower.includes('holiness') || lower.includes('apostolic')) denomId = 'pentecostal';
    else if (lower.includes('orthodox')) denomId = 'orthodox';
    else if (lower.includes('latter-day') || lower.includes('mormon')) denomId = 'mormon';
    else if (lower.includes('jewish') || lower.includes('synagogue')) denomId = 'jewish';
    else if (lower.includes('muslim') || lower.includes('islam')) denomId = 'muslim';
    else if (lower.includes('buddhist') || lower.includes('buddhism')) denomId = 'buddhist';
    else if (lower.includes('hindu')) denomId = 'hindu';
    else if (lower.includes('sikh')) denomId = 'sikh';
    else if (lower.includes('church') || lower.includes('christian') || lower.includes('mennonite') || lower.includes('amish') || lower.includes('brethren') || lower.includes('quaker') || lower.includes('friends') || lower.includes('nazarene') || lower.includes('adventist') || lower.includes('salvation army')) denomId = 'other_christian';
    else denomId = 'other';
  }

  if (!county.denoms[denomId]) {
    county.denoms[denomId] = { adherents: 0, congregations: 0 };
  }
  county.denoms[denomId].adherents += adherents;
  county.denoms[denomId].congregations += congregations;
  county.totalAdherents += adherents;
  county.totalCongregations += congregations;
}

console.log(`Processed ${counties.size} counties`);

// Now we need county lat/lng coordinates. We'll use a FIPS -> centroid lookup.
// Let's download a simple county centroids file or hardcode the top ~200 counties.
// For now, output the aggregated data as JSON so we can inspect it.

// Sort by total adherents descending, take top 300 counties
const sorted = [...counties.values()]
  .filter(c => c.totalAdherents > 0)
  .sort((a, b) => b.totalAdherents - a.totalAdherents);

console.log(`\nTop 10 counties by adherents:`);
for (const c of sorted.slice(0, 10)) {
  const topDenoms = Object.entries(c.denoms)
    .sort((a, b) => b[1].adherents - a[1].adherents)
    .slice(0, 5)
    .map(([d, v]) => `${d}:${v.adherents}`)
    .join(', ');
  console.log(`  ${c.name}, ${c.state} (FIPS ${c.fips}): ${c.totalAdherents.toLocaleString()} adherents - ${topDenoms}`);
}

// Write full aggregated data to JSON for the next step
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'county-religion-aggregated.json'),
  JSON.stringify(sorted, null, 2)
);
console.log(`\nWrote ${sorted.length} counties to county-religion-aggregated.json`);
