import "leaflet";

declare module "leaflet" {
  interface MarkerClusterGroupOptions {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon | Icon;
  }

  interface MarkerCluster {
    getChildCount(): number;
    getAllChildMarkers(): Marker[];
  }

  interface MarkerClusterGroup extends FeatureGroup {
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    clearLayers(): this;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;

  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      minOpacity?: number;
      gradient?: Record<number, string>;
    }
  ): Layer;
}

declare module "leaflet.heat" {
  export default function(): void;
}

declare module "leaflet.markercluster" {
  export default function(): void;
}
