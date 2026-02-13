// REAL county-level religious adherence data from the 2020 U.S. Religion Census
// Source: Association of Statisticians of American Religious Bodies (ASARB)
// "2020 U.S. Religion Census: Religious Congregations & Adherents Study"
// Downloaded from: https://www.usreligioncensus.org/node/1639
// 3136 counties with 161M total adherents

import countyDataJson from "./county-data.json";

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

const COUNTY_DATA = countyDataJson as CountyReligionData[];

export function getCountyReligionData(): CountyReligionData[] {
  return COUNTY_DATA;
}

export function generateCensusPopulationPoints(): CensusPopulationPoint[] {
  const rng = seededRandom(999);
  const points: CensusPopulationPoint[] = [];
  const PEOPLE_PER_POINT = 500;

  const counties = getCountyReligionData();
  for (const county of counties) {
    // Scale spread by population — larger counties get wider scatter
    const popScale = Math.min(1.0, Math.max(0.15, Math.log10(county.population + 1) / 7));
    const baseSpread = 0.25 * popScale + 0.05;

    for (const [denomId, adherentCount] of Object.entries(county.denominations)) {
      if (adherentCount < PEOPLE_PER_POINT / 2) continue;
      const numPoints = Math.max(1, Math.round(adherentCount / PEOPLE_PER_POINT));
      for (let i = 0; i < numPoints; i++) {
        // Box-Muller transform for gaussian distribution (circular, no squares)
        const u1 = Math.max(0.001, rng());
        const u2 = rng();
        const r = baseSpread * Math.sqrt(-2 * Math.log(u1));
        const theta = 2 * Math.PI * u2;
        const cosLat = Math.cos(county.lat * Math.PI / 180) || 1;
        const lat = county.lat + r * Math.cos(theta);
        const lng = county.lng + r * Math.sin(theta) / cosLat;
        if (!isFinite(lat) || !isFinite(lng)) continue;
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
