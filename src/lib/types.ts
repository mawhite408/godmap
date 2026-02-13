export interface WorshipLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  denomination: string;
  denominationId: string;
  religion: string;
  address?: string;
}

export interface FetchState {
  loading: boolean;
  progress: number;
  total: number;
  currentDenomination: string;
  error: string | null;
}

export interface MapFilters {
  selectedDenominations: Set<string>;
  showHeatmap: boolean;
  showMarkers: boolean;
  searchQuery: string;
}

export interface DenominationStats {
  id: string;
  label: string;
  count: number;
  color: string;
  percentage: number;
}
