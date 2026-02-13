import { NextRequest, NextResponse } from "next/server";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function buildOverpassQuery(religion?: string, denomination?: string): string {
  const bbox = "24.396308,-125.0,49.384358,-66.93457";

  let filter = `["amenity"="place_of_worship"]`;
  if (religion) {
    filter += `["religion"="${religion}"]`;
  }
  if (denomination) {
    filter += `["denomination"~"${denomination}",i]`;
  }

  return `
    [out:json][timeout:120];
    (
      node${filter}(${bbox});
      way${filter}(${bbox});
      relation${filter}(${bbox});
    );
    out center;
  `;
}

function classifyDenomination(tags: Record<string, string>): { denominationId: string; religion: string } {
  const religion = (tags.religion || "").toLowerCase();
  const denom = (tags.denomination || "").toLowerCase();

  if (religion === "jewish") return { denominationId: "jewish", religion: "Jewish" };
  if (religion === "muslim") return { denominationId: "muslim", religion: "Islamic" };
  if (religion === "buddhist") return { denominationId: "buddhist", religion: "Buddhist" };
  if (religion === "hindu") return { denominationId: "hindu", religion: "Hindu" };
  if (religion === "sikh") return { denominationId: "sikh", religion: "Sikh" };

  if (religion === "christian") {
    if (denom.includes("catholic") || denom.includes("roman_catholic")) return { denominationId: "catholic", religion: "Christian" };
    if (denom.includes("baptist") || denom.includes("southern_baptist")) return { denominationId: "baptist", religion: "Christian" };
    if (denom.includes("methodist") || denom.includes("united_methodist")) return { denominationId: "methodist", religion: "Christian" };
    if (denom.includes("lutheran")) return { denominationId: "lutheran", religion: "Christian" };
    if (denom.includes("presbyterian")) return { denominationId: "presbyterian", religion: "Christian" };
    if (denom.includes("episcopal") || denom.includes("anglican")) return { denominationId: "episcopal", religion: "Christian" };
    if (denom.includes("pentecostal") || denom.includes("assemblies_of_god") || denom.includes("assembly_of_god")) return { denominationId: "pentecostal", religion: "Christian" };
    if (denom.includes("mormon") || denom.includes("latter_day") || denom.includes("lds")) return { denominationId: "mormon", religion: "Christian" };
    if (denom.includes("orthodox")) return { denominationId: "orthodox", religion: "Christian" };
    if (denom.includes("nondenominational") || denom.includes("non_denominational") || denom.includes("non-denominational") || denom.includes("interdenominational")) return { denominationId: "nondenominational", religion: "Christian" };
    if (denom) return { denominationId: "other_christian", religion: "Christian" };
    return { denominationId: "other_christian", religion: "Christian" };
  }

  return { denominationId: "other", religion: tags.religion || "Unknown" };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const religion = searchParams.get("religion") || undefined;
  const denomination = searchParams.get("denomination") || undefined;
  const stateFilter = searchParams.get("state") || undefined;

  try {
    const query = buildOverpassQuery(religion, denomination);

    const response = await fetch(OVERPASS_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const locations = data.elements
      .map((el: OverpassElement) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) return null;

        const tags = el.tags || {};
        const { denominationId, religion: rel } = classifyDenomination(tags);

        return {
          id: `${el.type}-${el.id}`,
          lat,
          lng: lon,
          name: tags.name || tags["name:en"] || "Unnamed Place of Worship",
          denomination: tags.denomination || "unspecified",
          denominationId,
          religion: rel,
          address: [tags["addr:street"], tags["addr:city"], tags["addr:state"]].filter(Boolean).join(", "),
        };
      })
      .filter(Boolean);

    // Optional state filter (rough bounding boxes)
    let filtered = locations;
    if (stateFilter) {
      // For simplicity, we return all and let client filter
      filtered = locations;
    }

    return NextResponse.json({
      count: filtered.length,
      locations: filtered,
    });
  } catch (error) {
    console.error("Overpass API fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch worship locations" },
      { status: 500 }
    );
  }
}
