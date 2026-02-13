"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CountyReligionData, CensusPopulationPoint } from "@/data/county-religion-data";
import { getDenominationColor, DENOMINATION_MAP } from "@/lib/denominations";

interface MapViewProps {
  selectedDenominations: Set<string>;
  showMarkers: boolean;
  showHeatmap: boolean;
  showChoropleth: boolean;
  countyData: CountyReligionData[];
  censusPoints: CensusPopulationPoint[];
  onMapReady?: () => void;
}

function getDominantColor(dominantDenom: string): string {
  const d = DENOMINATION_MAP.get(dominantDenom);
  return d?.color ?? "#64748b";
}

// Build monochrome gradient: dark -> color -> white
function buildMonoGradient(baseColor: string): Record<number, string> {
  const n = parseInt(baseColor.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return {
    0.0: `rgb(${Math.round(r * 0.15)},${Math.round(g * 0.15)},${Math.round(b * 0.15)})`,
    0.4: `rgb(${Math.round(r * 0.6)},${Math.round(g * 0.6)},${Math.round(b * 0.6)})`,
    0.7: baseColor,
    1.0: "#ffffff",
  };
}

export default function MapView({
  selectedDenominations,
  showMarkers,
  showHeatmap,
  showChoropleth,
  countyData,
  censusPoints,
  onMapReady,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayersRef = useRef<L.Layer[]>([]);
  const choroplethLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [39.8283, -98.5795],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);
    onMapReady?.();

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update layers
  const updateLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }
    for (const hl of heatLayersRef.current) {
      map.removeLayer(hl);
    }
    heatLayersRef.current = [];
    if (choroplethLayerRef.current) {
      map.removeLayer(choroplethLayerRef.current);
      choroplethLayerRef.current = null;
    }

    // Filter census points by selected denominations
    const filteredCensus = censusPoints.filter(
      (p) => selectedDenominations.size === 0 || selectedDenominations.has(p.denominationId)
    );

    // County choropleth layer (rendered first, below markers)
    if (showChoropleth && countyData.length > 0) {
      const countyGroup = L.layerGroup();

      countyData.forEach((county) => {
        let relevantAdherents = county.totalAdherents;
        let dominantDenom = county.dominantDenomination;
        let circleColor = getDominantColor(dominantDenom);

        if (selectedDenominations.size > 0 && !selectedDenominations.has("__none__")) {
          let selectedTotal = 0;
          let maxDenom = "";
          let maxCount = 0;
          for (const [denom, count] of Object.entries(county.denominations)) {
            if (selectedDenominations.has(denom)) {
              selectedTotal += count;
              if (count > maxCount) {
                maxCount = count;
                maxDenom = denom;
              }
            }
          }
          relevantAdherents = selectedTotal;
          if (maxDenom) {
            dominantDenom = maxDenom;
            circleColor = getDominantColor(maxDenom);
          }
        }

        if (relevantAdherents === 0) return;

        const radius = Math.max(8000, Math.min(60000, Math.log10(relevantAdherents + 1) * 12000));

        const circle = L.circle([county.lat, county.lng], {
          radius,
          fillColor: circleColor,
          fillOpacity: 0.25,
          color: circleColor,
          weight: 1,
          opacity: 0.4,
        });

        const denomBreakdown = Object.entries(county.denominations)
          .filter(([, count]) => count > 0)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([denom, count]) => {
            const label = DENOMINATION_MAP.get(denom)?.label ?? denom;
            const color = getDominantColor(denom);
            const pct = county.totalAdherents > 0 ? ((count / county.totalAdherents) * 100).toFixed(1) : "0";
            return `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
              <span style="flex:1;">${label}</span>
              <span style="color:#64748b;">${count.toLocaleString()} (${pct}%)</span>
            </div>`;
          })
          .join("");

        circle.bindPopup(`
          <div style="min-width: 220px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #e2e8f0;">${county.name} County</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${county.state} &bull; Pop: ${county.population.toLocaleString()} &bull; ${county.adherenceRate}% adherence</div>
            <div style="font-size: 11px; border-top: 1px solid #334155; padding-top: 6px;">
              ${denomBreakdown}
            </div>
          </div>
        `);

        countyGroup.addLayer(circle);
      });

      countyGroup.addTo(map);
      choroplethLayerRef.current = countyGroup;
    }

    // Census population dot markers
    if (showMarkers) {
      const markersGroup = L.layerGroup();
      filteredCensus.forEach((p) => {
        const color = getDenominationColor(p.denominationId);
        const dot = L.circleMarker([p.lat, p.lng], {
          radius: 3,
          fillColor: color,
          fillOpacity: 0.7,
          color: color,
          weight: 0.3,
          opacity: 0.5,
        });
        const label = DENOMINATION_MAP.get(p.denominationId)?.label ?? p.denominationId;
        dot.bindPopup(`
          <div style="min-width: 160px;">
            <div style="font-weight: 600; font-size: 13px; color: ${color};">${label}</div>
            <div style="font-size: 11px; color: #94a3b8;">
              <div>~${p.count.toLocaleString()} adherents</div>
              <div>${p.county} County, ${p.state}</div>
            </div>
          </div>
        `);
        markersGroup.addLayer(dot);
      });
      markersGroup.addTo(map);
      markersLayerRef.current = markersGroup;
    }

    // Heatmap: one layer per denomination so colors overlap for comparison
    if (showHeatmap && filteredCensus.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("leaflet.heat");

      // Group points by denomination
      const byDenom = new Map<string, CensusPopulationPoint[]>();
      for (const p of filteredCensus) {
        let arr = byDenom.get(p.denominationId);
        if (!arr) { arr = []; byDenom.set(p.denominationId, arr); }
        arr.push(p);
      }

      // Per-denomination cell density for normalization
      const CELL = 0.5;

      for (const [denomId, points] of byDenom.entries()) {
        const baseColor = getDenominationColor(denomId);
        const gradient = buildMonoGradient(baseColor);

        // Compute cell density for this denomination
        const cellCounts = new Map<string, number>();
        for (const p of points) {
          const cellKey = `${Math.round(p.lat / CELL)},${Math.round(p.lng / CELL)}`;
          cellCounts.set(cellKey, (cellCounts.get(cellKey) || 0) + 1);
        }
        let maxCell = 1;
        for (const c of cellCounts.values()) {
          if (c > maxCell) maxCell = c;
        }

        const heatData = points.map((p) => {
          const cellKey = `${Math.round(p.lat / CELL)},${Math.round(p.lng / CELL)}`;
          const localCount = cellCounts.get(cellKey) || 1;
          const intensity = Math.max(0.1, localCount / maxCell);
          return [p.lat, p.lng, intensity] as [number, number, number];
        });

        const layer = L.heatLayer(heatData, { radius: 30, blur: 25, maxZoom: 10, max: 1, minOpacity: 0.12, gradient });
        layer.addTo(map);
        heatLayersRef.current.push(layer);
      }
    }

  }, [selectedDenominations, showMarkers, showHeatmap, showChoropleth, countyData, censusPoints, mapReady]);

  useEffect(() => {
    updateLayers();
  }, [updateLayers]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}
