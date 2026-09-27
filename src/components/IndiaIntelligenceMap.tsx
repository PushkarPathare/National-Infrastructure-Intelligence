import React, { useState } from 'react';
import indiaMapData from '@svg-maps/india';
import { DistrictHotspot, InfrastructureCategory, StateIntelligence } from '../types/platform';
import { DISTRICT_HOTSPOTS, STATES_INTELLIGENCE } from '../data/nationalData';
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

export type MapVisualLayer = 'combined' | 'demand' | 'gaps' | 'investment' | 'projects';

type RegionPreset = 'all' | 'north' | 'west' | 'central-east' | 'south' | 'northeast';

const REGION_VIEWBOXES: Record<RegionPreset, { label: string; viewBox: string }> = {
  all: { label: 'All India', viewBox: '-15 -10 642 716' },
  north: { label: 'North', viewBox: '70 -5 300 310' },
  west: { label: 'West', viewBox: '-10 170 290 350' },
  'central-east': { label: 'Central & East', viewBox: '120 220 350 260' },
  south: { label: 'South', viewBox: '100 400 280 285' },
  northeast: { label: 'Northeast', viewBox: '395 175 225 210' },
};

interface SvgMapLocation {
  id: string;
  name: string;
  path: string;
}

const INDIA_LOCATIONS: SvgMapLocation[] = (
  indiaMapData as { label: string; viewBox: string; locations: SvgMapLocation[] }
).locations;

const LOCATION_ID_TO_STATE_CODE: Record<string, string> = {
  mh: 'MH',
  up: 'UP',
  br: 'BR',
  rj: 'RJ',
  mp: 'MP',
  tn: 'TN',
  ka: 'KA',
  wb: 'WB',
  gj: 'GJ',
  or: 'OD',
  tg: 'TG',
  ap: 'AP',
  as: 'AS',
  jh: 'JH',
  ct: 'CT',
  pb: 'PB',
  kl: 'KL',
  jk: 'JK',
  hp: 'HP',
  ut: 'UT',
  hr: 'HR',
  dl: 'HR',
  ch: 'PB',
  ga: 'GA',
  sk: 'SK',
  ar: 'AR',
  ml: 'ML',
  mn: 'NE',
  mz: 'NE',
  nl: 'NE',
  tr: 'NE',
  dn: 'GJ',
  dd: 'GJ',
  py: 'TN',
  ld: 'KL',
  an: 'TN',
};

function resolveStateIntelligence(locId: string, locName?: string): StateIntelligence {
  const mappedCode = LOCATION_ID_TO_STATE_CODE[locId.toLowerCase()] || locId.toUpperCase();
  const found =
    STATES_INTELLIGENCE.find((s) => s.code === mappedCode) || STATES_INTELLIGENCE[0];
  if (locName && found.code !== locId.toUpperCase() && locId.toLowerCase() !== 'or') {
    return {
      ...found,
      name: locName,
    };
  }
  return found;
}

interface IndiaIntelligenceMapProps {
  selectedStateCode?: string;
  onSelectState?: (state: StateIntelligence) => void;
  selectedDistrictId?: string;
  onSelectDistrict?: (district: DistrictHotspot) => void;
  activeCategoryFilter?: InfrastructureCategory | 'All';
  activeLayer?: MapVisualLayer;
  onLayerChange?: (layer: MapVisualLayer) => void;
  compact?: boolean;
  darkCanvas?: boolean;
}

export const IndiaIntelligenceMap: React.FC<IndiaIntelligenceMapProps> = ({
  selectedStateCode = 'MH',
  onSelectState,
  selectedDistrictId = 'dist-pune',
  onSelectDistrict,
  activeCategoryFilter = 'All',
  activeLayer: externalLayer,
  onLayerChange,
  compact = false,
  darkCanvas = true,
}) => {
  const [internalLayer, setInternalLayer] = useState<MapVisualLayer>('combined');
  const [hoveredState, setHoveredState] = useState<StateIntelligence | null>(null);
  const [hoveredLocId, setHoveredLocId] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictHotspot | null>(null);
  const [regionPreset, setRegionPreset] = useState<RegionPreset>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showStateCodes, setShowStateCodes] = useState<boolean>(true);
  const [showHotspotLabels, setShowHotspotLabels] = useState<boolean>(true);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);

  const activeLayer = externalLayer || internalLayer;
  const handleLayerChange = (layer: MapVisualLayer) => {
    setInternalLayer(layer);
    onLayerChange?.(layer);
  };

  const filteredDistricts = DISTRICT_HOTSPOTS.filter(
    (d) => activeCategoryFilter === 'All' || d.mainIssue === activeCategoryFilter
  );

  // Compute dynamic viewBox based on region preset and zoom level
  const getComputedViewBox = () => {
    const base = REGION_VIEWBOXES[regionPreset].viewBox.split(' ').map(Number);
    const [bx, by, bw, bh] = base;
    if (zoomLevel === 1) return `${bx} ${by} ${bw} ${bh}`;
    const nw = bw / zoomLevel;
    const nh = bh / zoomLevel;
    const nx = bx + (bw - nw) / 2;
    const ny = by + (bh - nh) / 2;
    return `${Math.round(nx)} ${Math.round(ny)} ${Math.round(nw)} ${Math.round(nh)}`;
  };

  const getStateFill = (state: StateIntelligence, isSelected: boolean, isHovered: boolean) => {
    if (darkCanvas) {
      if (isSelected) return 'rgba(37, 99, 235, 0.62)';
      if (isHovered) return 'rgba(20, 184, 166, 0.52)';

      if (activeLayer === 'gaps') {
        if (state.infrastructureGap === 'High') return 'rgba(220, 38, 38, 0.36)';
        if (state.infrastructureGap === 'Medium') return 'rgba(217, 119, 6, 0.30)';
        return 'rgba(13, 148, 136, 0.30)';
      }

      if (activeLayer === 'investment') {
        if (state.existingInvestment === 'Low') return 'rgba(217, 119, 6, 0.36)';
        if (state.existingInvestment === 'Medium') return 'rgba(37, 99, 235, 0.32)';
        return 'rgba(13, 148, 136, 0.36)';
      }

      if (activeLayer === 'demand') {
        if (state.citizenRequests >= 220000) return 'rgba(29, 78, 216, 0.56)';
        if (state.citizenRequests >= 160000) return 'rgba(37, 99, 235, 0.42)';
        if (state.citizenRequests >= 100000) return 'rgba(30, 64, 175, 0.30)';
        return 'rgba(30, 41, 59, 0.85)';
      }

      // Combined or Projects layer
      if (state.citizenRequests >= 200000) return 'rgba(30, 64, 175, 0.46)';
      if (state.citizenRequests >= 140000) return 'rgba(30, 58, 138, 0.36)';
      return 'rgba(15, 23, 42, 0.92)';
    } else {
      if (isSelected) return '#93c5fd';
      if (isHovered) return '#99f6e4';

      if (activeLayer === 'gaps') {
        if (state.infrastructureGap === 'High') return '#fecaca';
        if (state.infrastructureGap === 'Medium') return '#fde68a';
        return '#99f6e4';
      }

      if (activeLayer === 'investment') {
        if (state.existingInvestment === 'Low') return '#fed7aa';
        if (state.existingInvestment === 'Medium') return '#bfdbfe';
        return '#99f6e4';
      }

      if (state.citizenRequests >= 200000) return '#bfdbfe';
      if (state.citizenRequests >= 140000) return '#dbeafe';
      return '#f1f5f9';
    }
  };

  const getDistrictColor = (district: DistrictHotspot) => {
    if (activeLayer === 'investment') {
      if (district.existingInvestmentLevel === 'Low') return '#f59e0b';
      if (district.existingInvestmentLevel === 'Medium') return '#3b82f6';
      return '#14b8a6';
    }
    if (activeLayer === 'projects') {
      return '#14b8a6';
    }
    if (district.priorityScore >= 88 || district.infrastructureGapLevel === 'Critical') {
      return '#ef4444'; // Critical red
    }
    if (district.priorityScore >= 75 || district.infrastructureGapLevel === 'High') {
      return '#f59e0b'; // High amber
    }
    return '#14b8a6'; // Moderate/Normal teal
  };

  const activeState =
    hoveredState ||
    STATES_INTELLIGENCE.find((s) => s.code === selectedStateCode) ||
    STATES_INTELLIGENCE[0];

  const activeDistrict =
    hoveredDistrict ||
    DISTRICT_HOTSPOTS.find((d) => d.id === selectedDistrictId) ||
    DISTRICT_HOTSPOTS[0];

  return (
    <div
      className={`relative rounded-3xl border overflow-hidden transition-all shadow-lg ${
        darkCanvas
          ? 'bg-slate-950 border-slate-800/90 text-slate-100'
          : 'bg-white border-slate-200/80 text-slate-900'
      }`}
    >
      {/* Top Primary Layer Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-4 border-b ${
          darkCanvas ? 'border-slate-800/80 bg-slate-900/70 backdrop-blur-md' : 'border-slate-200/70 bg-slate-50/70'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight flex items-center gap-2.5">
              <span>National Geospatial Intelligence Grid · India</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  darkCanvas
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                36 States & UTs
              </span>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block mt-0.5">
              High-Resolution Vector Cartography · Real-Time District Hotspot Telemetry
            </div>
          </div>
        </div>

        {/* Layer Switcher Tabs */}
        <div
          className={`flex flex-wrap items-center gap-1 p-1 rounded-full ${
            darkCanvas ? 'bg-slate-950 border border-slate-800' : 'bg-slate-200/70'
          }`}
        >
          {(
            [
              { id: 'combined', label: 'Combined Intelligence' },
              { id: 'demand', label: 'Demand Density' },
              { id: 'gaps', label: 'Infrastructure Gaps' },
              { id: 'investment', label: 'Investment Level' },
              { id: 'projects', label: 'Recommended Projects' },
            ] as { id: MapVisualLayer; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleLayerChange(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeLayer === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : darkCanvas
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary GIS Control Strip: Region Presets, State Selector & Overlay Toggles */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 py-3 border-b text-xs ${
          darkCanvas
            ? 'border-slate-800/70 bg-slate-950/90 text-slate-400'
            : 'border-slate-200/70 bg-white text-slate-600'
        }`}
      >
        {/* Region Quick-Focus */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-1">Region:</span>
          {(Object.keys(REGION_VIEWBOXES) as RegionPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setRegionPreset(key);
                setZoomLevel(1);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                regionPreset === key
                  ? darkCanvas
                    ? 'bg-blue-950 text-blue-300 border border-blue-700/70'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                  : darkCanvas
                  ? 'hover:bg-slate-900 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {REGION_VIEWBOXES[key].label}
            </button>
          ))}
        </div>

        {/* Right Controls: State Dropdown + Overlay Toggles + Zoom */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedStateCode}
            onChange={(e) => {
              const st = STATES_INTELLIGENCE.find((s) => s.code === e.target.value);
              if (st) onSelectState?.(st);
            }}
            aria-label="Jump to State or Region"
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-none cursor-pointer ${
              darkCanvas
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {STATES_INTELLIGENCE.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowStateCodes(!showStateCodes)}
              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                showStateCodes
                  ? darkCanvas
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'border-transparent opacity-50'
              }`}
              title="Toggle State Code Labels"
            >
              Codes
            </button>
            <button
              type="button"
              onClick={() => setShowHotspotLabels(!showHotspotLabels)}
              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                showHotspotLabels
                  ? darkCanvas
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'border-transparent opacity-50'
              }`}
              title="Toggle Hotspot Callout Badges"
            >
              Badges
            </button>
            <button
              type="button"
              onClick={() => setShowCorridors(!showCorridors)}
              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                showCorridors
                  ? darkCanvas
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'border-transparent opacity-50'
              }`}
              title="Toggle Intelligence Corridors"
            >
              Corridors
            </button>
          </div>

          {/* Zoom Buttons */}
          <div
            className={`flex items-center rounded-xl border ${
              darkCanvas ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.2, +(z + 0.25).toFixed(2)))}
              className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer border-l border-r border-slate-800/40"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setRegionPreset('all');
                setZoomLevel(1);
              }}
              className="p-1.5 hover:text-blue-400 transition-colors cursor-pointer"
              title="Reset Map View"
              aria-label="Reset Map View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main High-Resolution SVG Cartographic Canvas + Telemetry Sidebar */}
      <div className={`relative grid grid-cols-1 ${compact ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}`}>
        <div
          className={`lg:col-span-8 relative flex items-center justify-center p-4 sm:p-8 min-h-[540px] sm:min-h-[640px] ${
            darkCanvas
              ? 'bg-[radial-gradient(ellipse_at_center,_rgba(15,23,42,0.95)_0%,_rgba(2,6,23,1)_100%)]'
              : 'bg-slate-50/70'
          }`}
        >
          {/* Top-Left Live Hover / Active HUD Overlay */}
          <div
            className={`absolute top-6 left-6 z-10 px-4 py-3.5 rounded-2xl border backdrop-blur-md pointer-events-none max-w-xs transition-all ${
              darkCanvas
                ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              <span>
                {hoveredDistrict
                  ? `HOTSPOT · ${hoveredDistrict.stateCode}`
                  : hoveredState
                  ? `STATE · ${hoveredState.region.toUpperCase()} ZONE`
                  : `ACTIVE · ${activeState.region.toUpperCase()} ZONE`}
              </span>
              <span>•</span>
              <span>
                {hoveredDistrict
                  ? `SCORE ${hoveredDistrict.priorityScore}/100`
                  : `${activeState.citizenRequests.toLocaleString()} REQS`}
              </span>
            </div>
            <div className="text-sm font-bold mt-1 truncate">
              {hoveredDistrict ? `${hoveredDistrict.district}, ${hoveredDistrict.state}` : activeState.name}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">
              {hoveredDistrict
                ? `${hoveredDistrict.mainIssue} · ${hoveredDistrict.populationFormatted} affected`
                : `Top Demand: ${activeState.topDemand} · Gap: ${activeState.infrastructureGap}`}
            </div>
          </div>

          {/* High-Resolution India Vector Map (@svg-maps/india) */}
          <svg
            viewBox={getComputedViewBox()}
            className="w-full h-full max-h-[630px] select-none transition-all duration-300"
            role="img"
            aria-label="Interactive India Infrastructure Intelligence Map"
          >
            <defs>
              <pattern id="gis-minor-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path
                  d="M 36 0 L 0 0 0 36"
                  fill="none"
                  stroke={darkCanvas ? 'rgba(148, 163, 184, 0.045)' : 'rgba(15, 23, 42, 0.035)'}
                  strokeWidth="0.75"
                />
              </pattern>
              <filter id="india-coastal-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="4.5"
                  floodColor={darkCanvas ? '#1d4ed8' : '#64748b'}
                  floodOpacity={darkCanvas ? '0.32' : '0.16'}
                />
              </filter>
              <radialGradient id="hotspot-glow-red" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.68" />
                <stop offset="55%" stopColor="#ef4444" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hotspot-glow-amber" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.58" />
                <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hotspot-glow-teal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.58" />
                <stop offset="55%" stopColor="#14b8a6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Grid */}
            <rect x="-30" y="-20" width="680" height="740" fill="url(#gis-minor-grid)" />

            {/* Cartographic Latitude / Longitude Graticule Lines */}
            {[
              { y: 120, label: '32°N' },
              { y: 310, label: '24°N' },
              { y: 495, label: '16°N' },
              { y: 668, label: '8°N' },
            ].map((lat) => (
              <g key={lat.label} className="pointer-events-none">
                <line
                  x1="-10"
                  y1={lat.y}
                  x2="615"
                  y2={lat.y}
                  stroke={darkCanvas ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)'}
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x="610"
                  y={lat.y - 4}
                  textAnchor="end"
                  fill={darkCanvas ? 'rgba(148, 163, 184, 0.34)' : 'rgba(100, 116, 139, 0.45)'}
                  fontSize="8"
                  className="font-mono"
                >
                  {lat.label}
                </text>
              </g>
            ))}

            {/* Tropic of Cancer (23.5°N) Reference Line */}
            <g className="pointer-events-none">
              <line
                x1="-5"
                y1="322"
                x2="605"
                y2="322"
                stroke={darkCanvas ? 'rgba(56, 189, 248, 0.16)' : 'rgba(37, 99, 235, 0.14)'}
                strokeWidth="0.9"
                strokeDasharray="6 3"
              />
              <text
                x="4"
                y="317"
                fill={darkCanvas ? 'rgba(56, 189, 248, 0.42)' : 'rgba(37, 99, 235, 0.45)'}
                fontSize="7.5"
                className="font-mono"
              >
                23.5°N TROPIC OF CANCER
              </text>
            </g>

            {[
              { x: 52, label: '70°E' },
              { x: 215, label: '78°E' },
              { x: 378, label: '86°E' },
              { x: 540, label: '94°E' },
            ].map((lon) => (
              <g key={lon.label} className="pointer-events-none">
                <line
                  x1={lon.x}
                  y1="-5"
                  x2={lon.x}
                  y2="695"
                  stroke={darkCanvas ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)'}
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={lon.x + 3}
                  y="690"
                  fill={darkCanvas ? 'rgba(148, 163, 184, 0.34)' : 'rgba(100, 116, 139, 0.45)'}
                  fontSize="8"
                  className="font-mono"
                >
                  {lon.label}
                </text>
              </g>
            ))}

            {/* Maritime Waterbody Labels */}
            <g
              fill={darkCanvas ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.35)'}
              className="pointer-events-none font-mono select-none"
            >
              <text x="48" y="495" fontSize="9" letterSpacing="2.5" textAnchor="middle">
                ARABIAN
              </text>
              <text x="48" y="508" fontSize="9" letterSpacing="2.5" textAnchor="middle">
                SEA
              </text>

              <text x="395" y="495" fontSize="9" letterSpacing="2.5" textAnchor="middle">
                BAY OF
              </text>
              <text x="395" y="508" fontSize="9" letterSpacing="2.5" textAnchor="middle">
                BENGAL
              </text>

              <text x="215" y="688" fontSize="8.5" letterSpacing="3.5" textAnchor="middle">
                INDIAN OCEAN
              </text>
            </g>

            {/* All 36 High-Resolution State & UT Polygons from @svg-maps/india */}
            <g filter="url(#india-coastal-glow)">
              {INDIA_LOCATIONS.map((loc) => {
                const stateIntel = resolveStateIntelligence(loc.id, loc.name);
                const isSelected =
                  stateIntel.code === selectedStateCode &&
                  (loc.id.toUpperCase() === selectedStateCode ||
                    (selectedStateCode === 'OD' && loc.id === 'or') ||
                    (selectedStateCode === 'NE' && ['mn', 'mz', 'nl', 'tr'].includes(loc.id)));
                const isHovered = hoveredLocId === loc.id;

                return (
                  <path
                    key={loc.id}
                    d={loc.path}
                    fill={getStateFill(stateIntel, isSelected, isHovered)}
                    stroke={
                      isSelected
                        ? '#60a5fa'
                        : isHovered
                        ? '#2dd4bf'
                        : darkCanvas
                        ? 'rgba(148, 163, 184, 0.45)'
                        : '#94a3b8'
                    }
                    strokeWidth={isSelected ? '1.8' : isHovered ? '1.4' : '0.85'}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    onClick={() => onSelectState?.(stateIntel)}
                    onMouseEnter={() => {
                      setHoveredLocId(loc.id);
                      setHoveredState(stateIntel);
                    }}
                    onMouseLeave={() => {
                      setHoveredLocId(null);
                      setHoveredState(null);
                    }}
                    className="cursor-pointer transition-colors"
                  />
                );
              })}
            </g>

            {/* State Code Labels */}
            {showStateCodes &&
              STATES_INTELLIGENCE.filter((st) => st.code !== 'GA' && st.code !== 'SK').map((st) => {
                const isSelected = st.code === selectedStateCode;
                const isHovered = hoveredState?.code === st.code;
                return (
                  <text
                    key={`code-${st.code}`}
                    x={st.coordinates.x}
                    y={st.coordinates.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={
                      isSelected
                        ? '#ffffff'
                        : isHovered
                        ? '#5eead4'
                        : darkCanvas
                        ? 'rgba(226, 232, 240, 0.78)'
                        : '#334155'
                    }
                    fontSize={st.code === 'ML' || st.code === 'HP' || st.code === 'PB' ? '7.5' : '9'}
                    fontWeight={isSelected ? '700' : '600'}
                    className="pointer-events-none font-mono"
                  >
                    {st.code}
                  </text>
                );
              })}

            {/* Inter-Hotspot National Intelligence Corridors */}
            {showCorridors &&
              filteredDistricts.slice(0, 8).map((d, idx) => {
                const next = filteredDistricts[(idx + 1) % Math.min(8, filteredDistricts.length)];
                if (!next) return null;
                const midX = (d.coordinates.x + next.coordinates.x) / 2;
                const midY = (d.coordinates.y + next.coordinates.y) / 2 - 14;
                return (
                  <path
                    key={`corridor-${d.id}-${next.id}`}
                    d={`M ${d.coordinates.x},${d.coordinates.y} Q ${midX},${midY} ${next.coordinates.x},${next.coordinates.y}`}
                    fill="none"
                    stroke={darkCanvas ? 'rgba(56, 189, 248, 0.25)' : 'rgba(37, 99, 235, 0.22)'}
                    strokeWidth="1.1"
                    strokeDasharray="3 3"
                    className="pointer-events-none"
                  />
                );
              })}

            {/* District Hotspot Beacons */}
            {filteredDistricts.map((dist) => {
              const isSelected = dist.id === selectedDistrictId;
              const isHovered = hoveredDistrict?.id === dist.id;
              const pinColor = getDistrictColor(dist);
              const radius = isSelected ? 7.5 : Math.max(4.8, Math.min(7, dist.priorityScore / 13));
              const glowId =
                pinColor === '#ef4444'
                  ? 'url(#hotspot-glow-red)'
                  : pinColor === '#f59e0b'
                  ? 'url(#hotspot-glow-amber)'
                  : 'url(#hotspot-glow-teal)';

              const labelOnLeft = dist.coordinates.x > 340;
              const badgeWidth = dist.district.replace(' District', '').length * 5.6 + 40;
              const badgeX = labelOnLeft ? -badgeWidth - 10 : 10;

              return (
                <g
                  key={dist.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDistrict?.(dist);
                    const parentState = STATES_INTELLIGENCE.find((s) => s.code === dist.stateCode);
                    if (parentState) onSelectState?.(parentState);
                  }}
                  onMouseEnter={() => setHoveredDistrict(dist)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className="cursor-pointer"
                >
                  {/* Radial Demand Halo */}
                  <circle
                    cx={dist.coordinates.x}
                    cy={dist.coordinates.y}
                    r={isSelected ? 24 : 16}
                    fill={glowId}
                  />

                  {/* Catchment Ring when Selected or on Projects Layer */}
                  {(isSelected || isHovered || activeLayer === 'projects') && (
                    <circle
                      cx={dist.coordinates.x}
                      cy={dist.coordinates.y}
                      r={isSelected ? 13 : 10}
                      fill="none"
                      stroke={pinColor}
                      strokeWidth="1.3"
                      strokeDasharray="2.5 2"
                    />
                  )}

                  {/* Core Beacon Dot */}
                  <circle
                    cx={dist.coordinates.x}
                    cy={dist.coordinates.y}
                    r={radius}
                    fill={pinColor}
                    stroke={darkCanvas ? '#020617' : '#ffffff'}
                    strokeWidth="1.8"
                  />

                  {/* Inner Specular Highlight */}
                  <circle
                    cx={dist.coordinates.x - 1.2}
                    cy={dist.coordinates.y - 1.2}
                    r={1.4}
                    fill="#ffffff"
                    fillOpacity="0.85"
                    className="pointer-events-none"
                  />

                  {/* Callout Badge */}
                  {showHotspotLabels &&
                    (isSelected || isHovered || dist.priorityScore >= 88) && (
                      <g
                        transform={`translate(${dist.coordinates.x + badgeX}, ${
                          dist.coordinates.y - 9
                        })`}
                        className="pointer-events-none"
                      >
                        <rect
                          x="0"
                          y="0"
                          width={badgeWidth}
                          height="18"
                          rx="4"
                          fill={
                            darkCanvas ? 'rgba(2, 6, 23, 0.92)' : 'rgba(255, 255, 255, 0.96)'
                          }
                          stroke={pinColor}
                          strokeWidth="1"
                        />
                        <text
                          x="6"
                          y="12"
                          fill={darkCanvas ? '#f8fafc' : '#0f172a'}
                          fontSize="9.5"
                          fontWeight="600"
                        >
                          {dist.district.replace(' District', '')} · {dist.priorityScore}
                        </text>
                      </g>
                    )}
                </g>
              );
            })}

            {/* Compass Rose (Top Right of SVG) */}
            <g transform="translate(545, 22)" className="pointer-events-none">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill={darkCanvas ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)'}
                stroke={darkCanvas ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1'}
                strokeWidth="1"
              />
              <polygon points="20,7 23,20 20,17 17,20" fill="#3b82f6" />
              <polygon
                points="20,33 23,20 20,23 17,20"
                fill={darkCanvas ? '#64748b' : '#94a3b8'}
              />
              <text
                x="20"
                y="5"
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill={darkCanvas ? '#93c5fd' : '#1e40af'}
                className="font-mono"
              >
                N
              </text>
            </g>
          </svg>

          {/* Bottom-Left Layer Legend */}
          <div
            className={`absolute bottom-4 left-4 p-3 rounded-xl border text-xs space-y-1.5 backdrop-blur-xs ${
              darkCanvas
                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                : 'bg-white/95 border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <div className="font-semibold text-[11px] text-slate-400 flex items-center justify-between gap-4">
              <span>Hotspot Priority & Gap Severity</span>
              <span className="font-mono text-[10px]">0—500 km</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>Critical Gap (Score 88–100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>High Priority (Score 75–87)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
              <span>Moderate / Active Investment</span>
            </div>
          </div>
        </div>

        {/* Right Side Intelligence Telemetry Panel */}
        <div
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-6 sm:p-8 flex flex-col justify-between transition-all ${
            darkCanvas ? 'border-slate-800/80 bg-slate-900/50 backdrop-blur-md' : 'border-slate-200/80 bg-white'
          }`}
        >
          <div className="space-y-7">
            {/* State Summary Block */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="uppercase tracking-wider text-[11px] font-semibold">Selected State Telemetry</span>
                  <span className="font-mono text-blue-400 font-semibold">
                    {activeState.code} · {activeState.region} Zone
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{activeState.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div
                  className={`p-4 rounded-2xl border space-y-1 ${
                    darkCanvas ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight">
                    {activeState.citizenRequests.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Citizen Requests</div>
                </div>
                <div
                  className={`p-4 rounded-2xl border space-y-1 ${
                    darkCanvas ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="text-lg sm:text-xl font-bold text-blue-400 truncate tracking-tight">
                    {activeState.topDemand}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Top Demand</div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-400">Infrastructure Gap</span>
                  <span
                    className={`font-semibold ${
                      activeState.infrastructureGap === 'High'
                        ? 'text-red-400'
                        : activeState.infrastructureGap === 'Medium'
                        ? 'text-amber-400'
                        : 'text-teal-400'
                    }`}
                  >
                    {activeState.infrastructureGap}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-400">Existing Investment</span>
                  <span className="font-semibold">{activeState.existingInvestment}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-400">Priority Areas</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {activeState.priorityAreas} Clusters
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Estimated Affected Population</span>
                  <span className="font-mono tabular-nums font-semibold text-teal-400">
                    {activeState.affectedPopulation}
                  </span>
                </div>
              </div>
            </div>

            {/* Focused District Hotspot Drilldown */}
            <div
              className={`p-5 rounded-2xl border space-y-2.5 transition-all ${
                darkCanvas
                  ? 'bg-slate-950/90 border-slate-800'
                  : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase tracking-wider text-[11px] font-semibold">Focused District Hotspot</span>
                <span className="font-mono font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/20">
                  Score {activeDistrict.priorityScore} / 100
                </span>
              </div>
              <div className="text-lg font-bold tracking-tight">
                {activeDistrict.district}, {activeDistrict.state}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {activeDistrict.specificProblem}
              </p>
              <div className="pt-2 flex items-center flex-wrap gap-2.5 text-xs text-slate-300 font-mono tabular-nums">
                <span>{activeDistrict.requestCount.toLocaleString()} requests</span>
                <span aria-hidden="true">·</span>
                <span>{activeDistrict.populationFormatted} affected</span>
                <span aria-hidden="true">·</span>
                <span className="text-red-400 font-semibold">+{activeDistrict.trendPercent}% 30d</span>
              </div>
            </div>

            {/* Quick District Hotspot Switcher */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Inspect Priority District Beacons
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredDistricts.slice(0, 6).map((d) => {
                  const isSel = d.id === activeDistrict.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        onSelectDistrict?.(d);
                        const st = STATES_INTELLIGENCE.find((s) => s.code === d.stateCode);
                        if (st) onSelectState?.(st);
                      }}
                      className={`px-3 py-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSel
                          ? 'bg-blue-600/25 border-blue-500 text-white font-semibold shadow-2xs'
                          : darkCanvas
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-900'
                      }`}
                    >
                      <span className="truncate">{d.district.replace(' District', '')}</span>
                      <span className="font-mono text-[11px] text-amber-400 ml-1 shrink-0">
                        {d.priorityScore}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Click any state or hotspot beacon</span>
            <span className="font-mono text-teal-400">Survey-Grade Vector Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
};
