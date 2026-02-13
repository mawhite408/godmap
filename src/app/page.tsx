"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { DENOMINATIONS } from "@/lib/denominations";
import { getCountyReligionData, generateCensusPopulationPoints, type CountyReligionData, type CensusPopulationPoint } from "@/data/county-religion-data";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1e293b]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface DenomStat {
  id: string;
  label: string;
  adherents: number;
  color: string;
  percentage: number;
}

export default function Home() {
  const [selectedDenominations, setSelectedDenominations] = useState<Set<string>>(new Set());
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showChoropleth, setShowChoropleth] = useState(false);
  const [countyData, setCountyData] = useState<CountyReligionData[]>([]);
  const [censusPoints, setCensusPoints] = useState<CensusPopulationPoint[]>([]);

  useEffect(() => {
    setCountyData(getCountyReligionData());
    setCensusPoints(generateCensusPopulationPoints());
  }, []);

  const handleToggleDenomination = useCallback((id: string) => {
    setSelectedDenominations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedDenominations(new Set());
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedDenominations(new Set(["__none__"]));
  }, []);

  // Compute stats from real census county data
  const stats: DenomStat[] = useMemo(() => {
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const county of countyData) {
      for (const [denomId, count] of Object.entries(county.denominations)) {
        totals.set(denomId, (totals.get(denomId) || 0) + count);
        grandTotal += count;
      }
    }
    return DENOMINATIONS.map((d) => ({
      id: d.id,
      label: d.label,
      adherents: totals.get(d.id) || 0,
      color: d.color,
      percentage: grandTotal > 0 ? ((totals.get(d.id) || 0) / grandTotal) * 100 : 0,
    }))
      .filter((s) => s.adherents > 0)
      .sort((a, b) => b.adherents - a.adherents);
  }, [countyData]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        selectedDenominations={selectedDenominations}
        onToggleDenomination={handleToggleDenomination}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        showMarkers={showMarkers}
        onToggleMarkers={() => setShowMarkers((p) => !p)}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap((p) => !p)}
        showChoropleth={showChoropleth}
        onToggleChoropleth={() => setShowChoropleth((p) => !p)}
        stats={stats}
        censusPoints={censusPoints}
      />
      <div className="flex-1 relative">
        <MapView
          selectedDenominations={selectedDenominations}
          showMarkers={showMarkers}
          showHeatmap={showHeatmap}
          showChoropleth={showChoropleth}
          countyData={countyData}
          censusPoints={censusPoints}
        />
        {/* Legend overlay */}
        {stats.length > 0 && (
          <div className="absolute top-4 right-4 bg-[#0f172a]/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 max-w-[200px] z-[1000]">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">Legend</h3>
            <div className="space-y-1">
              {stats.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[10px] text-slate-400 truncate">{s.label}</span>
                </div>
              ))}
              {stats.length > 8 && (
                <p className="text-[10px] text-slate-600">+{stats.length - 8} more</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
