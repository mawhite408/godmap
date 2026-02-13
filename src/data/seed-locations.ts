import type { WorshipLocation } from "@/lib/types";

// Major US metro areas with approximate centers and religious distribution weights
// Format: [lat, lng, name, population_weight]
const METRO_CENTERS: [number, number, string, number][] = [
  [40.7128, -74.006, "New York", 10],
  [34.0522, -118.2437, "Los Angeles", 8],
  [41.8781, -87.6298, "Chicago", 6],
  [29.7604, -95.3698, "Houston", 5],
  [33.749, -84.388, "Atlanta", 4],
  [39.9526, -75.1652, "Philadelphia", 4],
  [33.4484, -112.074, "Phoenix", 3.5],
  [29.4241, -98.4936, "San Antonio", 3],
  [32.7767, -96.797, "Dallas", 4],
  [37.3382, -121.8863, "San Jose", 2.5],
  [30.2672, -97.7431, "Austin", 2.5],
  [39.7392, -104.9903, "Denver", 3],
  [47.6062, -122.3321, "Seattle", 3],
  [38.9072, -77.0369, "Washington DC", 4],
  [25.7617, -80.1918, "Miami", 4],
  [42.3601, -71.0589, "Boston", 3.5],
  [32.7157, -117.1611, "San Diego", 2.5],
  [35.2271, -80.8431, "Charlotte", 2.5],
  [36.1627, -86.7816, "Nashville", 2.5],
  [44.9778, -93.265, "Minneapolis", 2.5],
  [38.627, -90.1994, "St. Louis", 2],
  [39.0997, -94.5786, "Kansas City", 2],
  [36.1699, -115.1398, "Las Vegas", 2.5],
  [35.4676, -97.5164, "Oklahoma City", 2],
  [27.9506, -82.4572, "Tampa", 2.5],
  [28.5383, -81.3792, "Orlando", 2.5],
  [36.7783, -119.4179, "Fresno", 1.5],
  [35.7796, -78.6382, "Raleigh", 2],
  [41.2565, -95.9345, "Omaha", 1.5],
  [43.0389, -87.9065, "Milwaukee", 2],
  [42.3314, -83.0458, "Detroit", 3],
  [40.4406, -79.9959, "Pittsburgh", 2],
  [45.5051, -122.675, "Portland OR", 2],
  [37.5407, -77.436, "Richmond", 1.5],
  [35.1495, -90.049, "Memphis", 1.5],
  [30.4515, -91.1871, "Baton Rouge", 1.5],
  [29.9511, -90.0715, "New Orleans", 2],
  [26.1224, -80.1373, "Fort Lauderdale", 2],
  [40.7608, -111.891, "Salt Lake City", 2.5],
  [43.6591, -70.2568, "Portland ME", 1],
  [41.764, -72.6823, "Hartford", 1.5],
  [33.5207, -86.8025, "Birmingham", 1.5],
  [32.3668, -86.3, "Montgomery", 1],
  [34.7465, -92.2896, "Little Rock", 1],
  [38.2527, -85.7585, "Louisville", 1.5],
  [39.1031, -84.512, "Cincinnati", 1.5],
  [39.9612, -82.9988, "Columbus OH", 2],
  [41.4993, -81.6944, "Cleveland", 2],
  [26.6406, -81.8723, "Fort Myers", 1],
  [27.3364, -82.5307, "Sarasota", 1],
  [30.3322, -81.6557, "Jacksonville", 1.5],
  [34.0007, -81.0348, "Columbia SC", 1],
  [32.7765, -79.9311, "Charleston SC", 1],
  [34.8526, -82.394, "Greenville SC", 1],
  [36.0726, -79.792, "Greensboro NC", 1],
  [35.9606, -83.9207, "Knoxville", 1],
  [35.0456, -85.3097, "Chattanooga", 1],
  [37.2296, -80.4139, "Roanoke", 0.8],
  [36.8529, -75.978, "Virginia Beach", 1.5],
  [42.8864, -78.8784, "Buffalo", 1.5],
  [43.0481, -76.1474, "Syracuse", 1],
  [42.4534, -76.4735, "Ithaca", 0.5],
  [40.2732, -76.8867, "Harrisburg", 1],
  [40.0379, -76.3055, "Lancaster PA", 1],
  [39.9526, -75.1652, "Wilmington DE", 1],
  [38.3498, -81.6326, "Charleston WV", 0.8],
  [46.8772, -96.7898, "Fargo", 0.7],
  [44.0805, -103.231, "Rapid City", 0.5],
  [46.8084, -100.7837, "Bismarck", 0.5],
  [48.2325, -101.2963, "Minot", 0.4],
  [43.55, -96.7003, "Sioux Falls", 0.8],
  [42.0308, -93.6319, "Ames", 0.5],
  [41.6611, -91.5302, "Iowa City", 0.5],
  [42.5, -90.6646, "Dubuque", 0.5],
  [41.5868, -93.625, "Des Moines", 1],
  [40.8136, -96.7026, "Lincoln NE", 0.8],
  [47.9253, -97.0329, "Grand Forks", 0.4],
  [44.9537, -89.6301, "Wausau", 0.4],
  [44.5133, -88.0133, "Green Bay", 0.7],
  [43.0731, -89.4012, "Madison WI", 1],
  [46.7867, -92.1005, "Duluth", 0.5],
  [44.9399, -93.1, "St. Paul", 2],
  [47.0379, -122.9007, "Olympia", 0.5],
  [48.7596, -122.4788, "Bellingham", 0.4],
  [46.7324, -117.0002, "Moscow ID", 0.3],
  [43.6187, -116.2146, "Boise", 1],
  [42.8713, -112.4455, "Pocatello", 0.4],
  [46.8721, -113.994, "Missoula", 0.5],
  [45.7833, -108.5007, "Billings", 0.5],
  [47.5053, -111.3008, "Great Falls", 0.3],
  [41.1399, -104.8202, "Cheyenne", 0.4],
  [42.8666, -106.3131, "Casper", 0.3],
  [40.5853, -105.0844, "Fort Collins", 1],
  [38.8339, -104.8214, "Colorado Springs", 1.5],
  [37.2753, -107.8801, "Durango", 0.3],
  [35.0844, -106.6504, "Albuquerque", 1.5],
  [35.687, -105.9378, "Santa Fe", 0.8],
  [32.3199, -106.7637, "Las Cruces", 0.6],
  [31.7619, -106.485, "El Paso", 1.5],
  [32.2217, -110.9265, "Tucson", 1.5],
  [34.5199, -105.8701, "Mountainair NM", 0.2],
  [36.7468, -108.2188, "Farmington NM", 0.3],
  [37.7749, -122.4194, "San Francisco", 3.5],
  [37.8044, -122.2712, "Oakland", 2],
  [38.5816, -121.4944, "Sacramento", 2],
  [36.7378, -119.7871, "Fresno", 1.5],
  [34.4208, -119.6982, "Santa Barbara", 0.8],
  [33.9425, -118.2551, "Compton", 1],
  [33.8353, -118.3409, "Torrance", 0.8],
  [33.7701, -118.1937, "Long Beach", 1.5],
  [33.6846, -117.8265, "Irvine", 1],
  [33.1959, -117.3795, "Oceanside", 0.7],
  [36.9741, -122.0308, "Santa Cruz", 0.5],
  [36.6002, -121.8947, "Salinas", 0.6],
  [38.0194, -122.1341, "Vallejo", 0.5],
  [37.9577, -121.2908, "Stockton", 1],
  [37.6391, -120.9969, "Modesto", 0.8],
  [36.3302, -119.2921, "Visalia", 0.5],
  [35.3733, -119.0187, "Bakersfield", 1],
  [34.1808, -118.3089, "Hollywood", 1],
  [34.1478, -118.1445, "Pasadena", 0.8],
  [34.0195, -118.4912, "Santa Monica", 0.5],
  [33.9533, -117.3962, "Riverside", 1.5],
  [34.1083, -117.2898, "San Bernardino", 1],
  [21.3069, -157.8583, "Honolulu", 1.5],
  [61.2181, -149.9003, "Anchorage", 0.8],
  [64.8378, -147.7164, "Fairbanks", 0.3],
];

// Denomination distribution weights by region
// [denominationId, baseWeight, regionMultipliers: {south, northeast, midwest, west, utah}]
interface DenomWeight {
  id: string;
  base: number;
  south: number;
  northeast: number;
  midwest: number;
  west: number;
  utah: number;
}

const DENOM_WEIGHTS: DenomWeight[] = [
  { id: "catholic", base: 20, south: 0.7, northeast: 1.8, midwest: 1.3, west: 1.2, utah: 0.3 },
  { id: "baptist", base: 18, south: 2.2, northeast: 0.4, midwest: 0.6, west: 0.4, utah: 0.2 },
  { id: "methodist", base: 10, south: 1.3, northeast: 0.8, midwest: 1.2, west: 0.6, utah: 0.3 },
  { id: "lutheran", base: 7, south: 0.3, northeast: 0.6, midwest: 2.5, west: 0.5, utah: 0.2 },
  { id: "presbyterian", base: 4, south: 1.0, northeast: 1.2, midwest: 0.8, west: 0.7, utah: 0.3 },
  { id: "episcopal", base: 3, south: 0.8, northeast: 1.8, midwest: 0.6, west: 0.7, utah: 0.2 },
  { id: "pentecostal", base: 8, south: 1.8, northeast: 0.5, midwest: 0.7, west: 0.8, utah: 0.2 },
  { id: "mormon", base: 2, south: 0.3, northeast: 0.2, midwest: 0.3, west: 1.5, utah: 15.0 },
  { id: "orthodox", base: 1.5, south: 0.4, northeast: 2.0, midwest: 1.0, west: 0.6, utah: 0.1 },
  { id: "nondenominational", base: 8, south: 1.2, northeast: 0.7, midwest: 0.9, west: 1.3, utah: 0.4 },
  { id: "jewish", base: 3, south: 0.5, northeast: 2.5, midwest: 0.5, west: 1.0, utah: 0.1 },
  { id: "muslim", base: 2, south: 0.6, northeast: 1.5, midwest: 1.2, west: 1.0, utah: 0.1 },
  { id: "buddhist", base: 1.5, south: 0.3, northeast: 1.0, midwest: 0.4, west: 2.5, utah: 0.2 },
  { id: "hindu", base: 1, south: 0.5, northeast: 1.5, midwest: 0.8, west: 1.5, utah: 0.1 },
  { id: "sikh", base: 0.5, south: 0.3, northeast: 1.0, midwest: 0.5, west: 3.0, utah: 0.1 },
  { id: "other_christian", base: 6, south: 1.0, northeast: 0.8, midwest: 1.0, west: 0.9, utah: 0.5 },
];

const DENOM_LABELS: Record<string, string> = {
  catholic: "Roman Catholic",
  baptist: "Baptist",
  methodist: "Methodist",
  lutheran: "Lutheran",
  presbyterian: "Presbyterian",
  episcopal: "Episcopal/Anglican",
  pentecostal: "Pentecostal",
  mormon: "Latter-day Saints",
  orthodox: "Orthodox Christian",
  nondenominational: "Non-denominational",
  jewish: "Jewish",
  muslim: "Muslim/Islamic",
  buddhist: "Buddhist",
  hindu: "Hindu",
  sikh: "Sikh",
  other_christian: "Other Christian",
};

const RELIGION_MAP: Record<string, string> = {
  catholic: "Christian",
  baptist: "Christian",
  methodist: "Christian",
  lutheran: "Christian",
  presbyterian: "Christian",
  episcopal: "Christian",
  pentecostal: "Christian",
  mormon: "Christian",
  orthodox: "Christian",
  nondenominational: "Christian",
  other_christian: "Christian",
  jewish: "Jewish",
  muslim: "Islamic",
  buddhist: "Buddhist",
  hindu: "Hindu",
  sikh: "Sikh",
};

const CHURCH_NAME_PREFIXES: Record<string, string[]> = {
  catholic: ["St. Mary's", "St. Joseph's", "St. Patrick's", "Holy Family", "Sacred Heart", "Our Lady of Guadalupe", "St. John's", "Immaculate Conception", "St. Thomas", "Holy Cross", "St. Michael's", "St. Anne's", "St. Francis", "Our Lady of Peace", "St. Peter's"],
  baptist: ["First Baptist", "Grace Baptist", "Calvary Baptist", "New Hope Baptist", "Mt. Zion Baptist", "Bethel Baptist", "Faith Baptist", "Emmanuel Baptist", "Greater Mt. Sinai Baptist", "Friendship Baptist", "Antioch Baptist", "Shiloh Baptist", "Pleasant Grove Baptist", "New Life Baptist", "Macedonia Baptist"],
  methodist: ["First United Methodist", "Wesley United Methodist", "Grace United Methodist", "Trinity United Methodist", "Asbury United Methodist", "Christ United Methodist", "St. Paul United Methodist", "Aldersgate United Methodist", "Central United Methodist", "Hope United Methodist"],
  lutheran: ["Grace Lutheran", "Trinity Lutheran", "St. John's Lutheran", "Zion Lutheran", "Bethlehem Lutheran", "Christ Lutheran", "Faith Lutheran", "Peace Lutheran", "Redeemer Lutheran", "Immanuel Lutheran"],
  presbyterian: ["First Presbyterian", "Westminster Presbyterian", "Grace Presbyterian", "Covenant Presbyterian", "Faith Presbyterian", "Trinity Presbyterian", "Central Presbyterian", "Knox Presbyterian"],
  episcopal: ["St. Paul's Episcopal", "Christ Episcopal", "Trinity Episcopal", "St. Mark's Episcopal", "Grace Episcopal", "St. James Episcopal", "All Saints Episcopal", "St. Luke's Episcopal"],
  pentecostal: ["First Assembly of God", "Calvary Chapel", "New Life Church", "Victory Church", "Faith Temple", "Living Word", "Abundant Life", "Full Gospel Church", "Word of Life", "Cornerstone Church"],
  mormon: ["The Church of Jesus Christ of Latter-day Saints", "LDS Chapel", "LDS Meetinghouse", "LDS Stake Center", "LDS Ward"],
  orthodox: ["Greek Orthodox Church", "St. Nicholas Orthodox", "Holy Trinity Orthodox", "Assumption Orthodox", "St. George Orthodox", "Annunciation Orthodox", "Russian Orthodox Cathedral"],
  nondenominational: ["Community Church", "The Rock Church", "Life Church", "Crossroads Church", "Elevation Church", "Harvest Church", "New Spring Church", "Gateway Church", "Transformation Church", "Mosaic Church"],
  jewish: ["Temple Beth El", "Congregation Beth Israel", "Temple Sinai", "Chabad House", "Beth Shalom", "Temple Emanu-El", "Congregation B'nai Israel", "Temple Israel", "Ohev Shalom", "Beth Torah"],
  muslim: ["Islamic Center", "Masjid Al-Noor", "Muslim Community Center", "Masjid Al-Rahman", "Islamic Society", "Dar Al-Hijrah", "Masjid Muhammad", "Al-Farooq Masjid", "Baitul Mukarram", "Islamic Foundation"],
  buddhist: ["Buddhist Temple", "Zen Center", "Dharma Center", "Wat Thai Temple", "Fo Guang Shan", "Hsi Lai Temple", "Shambhala Center", "Kadampa Meditation Center", "SGI Buddhist Center", "Tzu Chi Foundation"],
  hindu: ["Hindu Temple", "BAPS Shri Swaminarayan Mandir", "Sri Venkateswara Temple", "Radha Krishna Temple", "Ganesh Temple", "Shiva Vishnu Temple", "ISKCON Temple", "Durga Temple"],
  sikh: ["Gurdwara Sahib", "Sikh Gurdwara", "Gurdwara Singh Sabha", "Sikh Center", "Gurdwara Nanak Darbar", "Khalsa Diwan Society"],
  other_christian: ["Community Bible Church", "Church of Christ", "Seventh-day Adventist", "Salvation Army", "Church of the Nazarene", "Disciples of Christ", "Quaker Meeting House", "Mennonite Church", "Unitarian Universalist", "African Methodist Episcopal"],
};

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getRegion(lat: number, lng: number): string {
  if (lat > 36 && lng > -82 && lat < 44) return "northeast";
  if (lat <= 36 && lng > -105) return "south";
  if (lat > 36 && lng > -105 && lng <= -82) return "midwest";
  if (lng <= -105) {
    if (lat > 37 && lat < 42 && lng > -114 && lng < -109) return "utah";
    return "west";
  }
  return "south";
}

export function generateSeedLocations(): WorshipLocation[] {
  const rng = seededRandom(42);
  const locations: WorshipLocation[] = [];
  let idCounter = 0;

  for (const [metroLat, metroLng, metroName, popWeight] of METRO_CENTERS) {
    const region = getRegion(metroLat, metroLng);

    for (const dw of DENOM_WEIGHTS) {
      const regionMult = dw[region as keyof DenomWeight] as number || dw.base;
      const count = Math.round(dw.base * popWeight * regionMult * 0.15);

      for (let i = 0; i < count; i++) {
        const spread = 0.15 + popWeight * 0.03;
        const lat = metroLat + (rng() - 0.5) * spread * 2;
        const lng = metroLng + (rng() - 0.5) * spread * 2;

        // Ensure within continental US bounds
        if (lat < 24.4 || lat > 49.4 || lng < -125 || lng > -66.9) continue;

        const names = CHURCH_NAME_PREFIXES[dw.id] || ["Place of Worship"];
        const name = names[Math.floor(rng() * names.length)];

        locations.push({
          id: `seed-${idCounter++}`,
          lat: Math.round(lat * 10000) / 10000,
          lng: Math.round(lng * 10000) / 10000,
          name: `${name}`,
          denomination: dw.id,
          denominationId: dw.id,
          religion: RELIGION_MAP[dw.id] || "Other",
          address: metroName,
        });
      }
    }
  }

  // Add rural/small-town churches scattered across states
  const RURAL_GRIDS: [number, number, number, number, string][] = [
    // [latMin, latMax, lngMin, lngMax, region]
    [25, 31, -100, -80, "south"],     // Deep South / Gulf
    [31, 37, -105, -80, "south"],     // Upper South
    [37, 42, -80, -72, "northeast"],  // Mid-Atlantic
    [42, 47, -80, -67, "northeast"],  // New England
    [37, 42, -90, -80, "midwest"],    // Ohio Valley
    [42, 49, -97, -82, "midwest"],    // Upper Midwest
    [37, 42, -105, -90, "midwest"],   // Plains
    [42, 49, -105, -97, "midwest"],   // Northern Plains
    [37, 42, -120, -105, "west"],     // Mountain West
    [42, 49, -125, -105, "west"],     // Pacific NW
    [32, 37, -125, -105, "west"],     // Southwest
    [37, 42, -125, -120, "west"],     // California
    [32, 37, -120, -115, "west"],     // SoCal
  ];

  for (const [latMin, latMax, lngMin, lngMax, region] of RURAL_GRIDS) {
    const area = (latMax - latMin) * (lngMax - lngMin);
    const ruralCount = Math.round(area * 1.5);

    for (let i = 0; i < ruralCount; i++) {
      const lat = latMin + rng() * (latMax - latMin);
      const lng = lngMin + rng() * (lngMax - lngMin);

      // Pick denomination based on regional weights
      const weights = DENOM_WEIGHTS.map((dw) => {
        const mult = dw[region as keyof DenomWeight] as number || 1;
        return dw.base * mult;
      });
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = rng() * totalWeight;
      let denomIdx = 0;
      for (let j = 0; j < weights.length; j++) {
        r -= weights[j];
        if (r <= 0) {
          denomIdx = j;
          break;
        }
      }

      const dw = DENOM_WEIGHTS[denomIdx];
      const names = CHURCH_NAME_PREFIXES[dw.id] || ["Place of Worship"];
      const name = names[Math.floor(rng() * names.length)];

      locations.push({
        id: `seed-${idCounter++}`,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        name,
        denomination: dw.id,
        denominationId: dw.id,
        religion: RELIGION_MAP[dw.id] || "Other",
      });
    }
  }

  return locations;
}
