export interface Denomination {
  id: string;
  label: string;
  color: string;
  overpassTags: Record<string, string>[];
  category: string;
}

export const DENOMINATIONS: Denomination[] = [
  {
    id: "catholic",
    label: "Roman Catholic",
    color: "#ef4444",
    overpassTags: [{ religion: "christian", denomination: "catholic" }, { religion: "christian", denomination: "roman_catholic" }],
    category: "Christian",
  },
  {
    id: "baptist",
    label: "Baptist",
    color: "#f97316",
    overpassTags: [{ religion: "christian", denomination: "baptist" }, { religion: "christian", denomination: "southern_baptist" }],
    category: "Christian",
  },
  {
    id: "methodist",
    label: "Methodist",
    color: "#eab308",
    overpassTags: [{ religion: "christian", denomination: "methodist" }, { religion: "christian", denomination: "united_methodist" }],
    category: "Christian",
  },
  {
    id: "lutheran",
    label: "Lutheran",
    color: "#84cc16",
    overpassTags: [{ religion: "christian", denomination: "lutheran" }],
    category: "Christian",
  },
  {
    id: "presbyterian",
    label: "Presbyterian",
    color: "#22c55e",
    overpassTags: [{ religion: "christian", denomination: "presbyterian" }],
    category: "Christian",
  },
  {
    id: "episcopal",
    label: "Episcopal/Anglican",
    color: "#14b8a6",
    overpassTags: [{ religion: "christian", denomination: "episcopal" }, { religion: "christian", denomination: "anglican" }],
    category: "Christian",
  },
  {
    id: "pentecostal",
    label: "Pentecostal",
    color: "#06b6d4",
    overpassTags: [{ religion: "christian", denomination: "pentecostal" }, { religion: "christian", denomination: "assemblies_of_god" }],
    category: "Christian",
  },
  {
    id: "mormon",
    label: "Latter-day Saints (Mormon)",
    color: "#3b82f6",
    overpassTags: [{ religion: "christian", denomination: "mormon" }, { religion: "christian", denomination: "latter_day_saints" }],
    category: "Christian",
  },
  {
    id: "orthodox",
    label: "Orthodox Christian",
    color: "#6366f1",
    overpassTags: [{ religion: "christian", denomination: "orthodox" }, { religion: "christian", denomination: "greek_orthodox" }, { religion: "christian", denomination: "russian_orthodox" }],
    category: "Christian",
  },
  {
    id: "nondenominational",
    label: "Non-denominational Christian",
    color: "#8b5cf6",
    overpassTags: [{ religion: "christian", denomination: "nondenominational" }, { religion: "christian", denomination: "non_denominational" }],
    category: "Christian",
  },
  {
    id: "jewish",
    label: "Jewish",
    color: "#a855f7",
    overpassTags: [{ religion: "jewish" }],
    category: "Jewish",
  },
  {
    id: "muslim",
    label: "Muslim/Islamic",
    color: "#d946ef",
    overpassTags: [{ religion: "muslim" }],
    category: "Islamic",
  },
  {
    id: "buddhist",
    label: "Buddhist",
    color: "#ec4899",
    overpassTags: [{ religion: "buddhist" }],
    category: "Buddhist",
  },
  {
    id: "hindu",
    label: "Hindu",
    color: "#f43f5e",
    overpassTags: [{ religion: "hindu" }],
    category: "Hindu",
  },
  {
    id: "sikh",
    label: "Sikh",
    color: "#fb923c",
    overpassTags: [{ religion: "sikh" }],
    category: "Sikh",
  },
  {
    id: "other_christian",
    label: "Other Christian",
    color: "#94a3b8",
    overpassTags: [{ religion: "christian" }],
    category: "Christian",
  },
  {
    id: "other",
    label: "Other / Unspecified",
    color: "#64748b",
    overpassTags: [{ amenity: "place_of_worship" }],
    category: "Other",
  },
];

export const DENOMINATION_MAP = new Map(DENOMINATIONS.map((d) => [d.id, d]));

export const CATEGORIES = [...new Set(DENOMINATIONS.map((d) => d.category))];

export function getDenominationColor(id: string): string {
  return DENOMINATION_MAP.get(id)?.color ?? "#64748b";
}
