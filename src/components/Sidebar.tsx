"use client";

import { useState } from "react";
import {
  Church,
  Filter,
  Flame,
  MapPin,
  ChevronDown,
  ChevronRight,
  Search,
  BarChart3,
  Eye,
  EyeOff,
  Map as MapIcon,
  Database,
} from "lucide-react";
import { DENOMINATIONS, CATEGORIES } from "@/lib/denominations";
import type { CensusPopulationPoint } from "@/data/county-religion-data";

interface DenomStat {
  id: string;
  label: string;
  adherents: number;
  color: string;
  percentage: number;
}

interface SidebarProps {
  selectedDenominations: Set<string>;
  onToggleDenomination: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showChoropleth: boolean;
  onToggleChoropleth: () => void;
  stats: DenomStat[];
  censusPoints: CensusPopulationPoint[];
}

export default function Sidebar({
  selectedDenominations,
  onToggleDenomination,
  onSelectAll,
  onDeselectAll,
  showMarkers,
  onToggleMarkers,
  showHeatmap,
  onToggleHeatmap,
  showChoropleth,
  onToggleChoropleth,
  stats,
  censusPoints,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(true);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filteredDenominations = DENOMINATIONS.filter((d) =>
    d.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    denominations: filteredDenominations.filter((d) => d.category === cat),
  })).filter((g) => g.denominations.length > 0);

  const totalAdherents = stats.reduce((s, d) => s + d.adherents, 0);
  const visiblePoints = censusPoints.filter(
    (p) => selectedDenominations.size === 0 || selectedDenominations.has(p.denominationId)
  ).length;

  // Build a quick lookup of adherent counts by denomination
  const denomAdherents: Record<string, number> = {};
  for (const s of stats) denomAdherents[s.id] = s.adherents;

  return (
    <div className="w-[360px] h-full bg-[#0f172a] border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Church className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-bold text-white">US Religion Map</h1>
        </div>
        <p className="text-xs text-slate-400">
          Religious population by county &bull; 2020 U.S. Religion Census
        </p>
      </div>

      {/* View Controls */}
      <div className="p-4 border-b border-slate-700/50 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <Filter className="w-3.5 h-3.5" />
          View Controls
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onToggleMarkers}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              showMarkers
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Dots
          </button>
          <button
            onClick={onToggleHeatmap}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              showHeatmap
                ? "bg-orange-600/20 text-orange-400 border border-orange-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heat
          </button>
          <button
            onClick={onToggleChoropleth}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              showChoropleth
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Counties
          </button>
        </div>
        {showHeatmap && (
          <p className="text-[10px] text-orange-400/70 mt-1">
            Tip: Filter to one denomination for a color-matched heatmap
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <Database className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500">
            Source: 2020 U.S. Religion Census (ASARB)
          </span>
        </div>
      </div>

      {/* Statistics */}
      {stats.length > 0 && (
        <div className="p-4 border-b border-slate-700/50">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider w-full"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Statistics
            {showStats ? (
              <ChevronDown className="w-3.5 h-3.5 ml-auto" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            )}
          </button>
          {showStats && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total adherents</span>
                <span className="text-white font-medium">
                  {totalAdherents.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Visible points</span>
                <span className="text-white font-medium">
                  {visiblePoints.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {stats.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs text-slate-300 flex-1 truncate">
                      {s.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {s.adherents.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-600 w-10 text-right">
                      {s.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Denomination Filters */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Church className="w-3.5 h-3.5" />
              Denominations
            </div>
            <div className="flex gap-1">
              <button
                onClick={onSelectAll}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                All
              </button>
              <button
                onClick={onDeselectAll}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                None
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search denominations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll px-4 pb-4">
          {groupedByCategory.map((group) => (
            <div key={group.category} className="mb-2">
              <button
                onClick={() => toggleCategory(group.category)}
                className="flex items-center gap-1.5 w-full py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {expandedCategories.has(group.category) ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                {group.category}
                <span className="text-slate-600 font-normal ml-1">
                  ({group.denominations.length})
                </span>
              </button>
              {expandedCategories.has(group.category) && (
                <div className="ml-2 space-y-0.5">
                  {group.denominations.map((denom) => {
                    const isSelected =
                      selectedDenominations.size === 0 ||
                      selectedDenominations.has(denom.id);
                    const adherents = denomAdherents[denom.id] || 0;

                    return (
                      <button
                        key={denom.id}
                        onClick={() => onToggleDenomination(denom.id)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-all ${
                          isSelected
                            ? "bg-slate-800/80 text-white"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 transition-opacity"
                          style={{
                            backgroundColor: denom.color,
                            opacity: isSelected ? 1 : 0.3,
                          }}
                        />
                        <span className="flex-1 text-left truncate">
                          {denom.label}
                        </span>
                        {isSelected ? (
                          <Eye className="w-3 h-3 text-slate-500" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-600" />
                        )}
                        {adherents > 0 && (
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            {adherents >= 1000000
                              ? `${(adherents / 1000000).toFixed(1)}M`
                              : adherents >= 1000
                              ? `${(adherents / 1000).toFixed(0)}K`
                              : adherents.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 text-center">
        <p className="text-[10px] text-slate-600">
          2020 U.S. Religion Census &bull; 3,136 counties &bull; 161M adherents
        </p>
      </div>
    </div>
  );
}
