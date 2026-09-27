import React, { useState } from 'react';
import {
  DistrictHotspot,
  GapCategory,
  NavModule,
  StateIntelligence,
  SupportedLanguage,
} from '../types/platform';
import {
  DISTRICT_HOTSPOTS,
  STATES_INTELLIGENCE,
} from '../data/nationalData';
import { TRANSLATIONS } from '../data/translations';
import { IndiaIntelligenceMap, MapVisualLayer } from '../components/IndiaIntelligenceMap';
import {
  CalibratedHorizontalBarChart,
  SignatureQuadrantScatterChart,
} from '../components/charts/PlatformCharts';
import { ArrowRight } from 'lucide-react';
import { UserRole } from '../types/platform';
import { RBAC_PROFILES } from '../data/rbacData';
import { MapsGroundingPanel } from '../components/MapsGroundingPanel';

interface DemandHotspotsViewProps {
  uiLanguage: SupportedLanguage;
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
}

export const DemandHotspotsView: React.FC<DemandHotspotsViewProps> = ({
  uiLanguage,
  selectedDistrictId,
  onSelectDistrict,
  onNavigate,
  activeRole = 'National Policymaker',
}) => {
  const t = TRANSLATIONS[uiLanguage].demandHotspots;
  const roleProfile = RBAC_PROFILES[activeRole];
  const [viewMode, setViewMode] = useState<'demand' | 'gaps' | 'investment' | 'combined'>(
    'combined'
  );
  const [showAllRanked, setShowAllRanked] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<StateIntelligence>(STATES_INTELLIGENCE[0]);

  const activeDistrict =
    DISTRICT_HOTSPOTS.find((d) => d.id === selectedDistrictId) || DISTRICT_HOTSPOTS[0];

  const getQuadrantLabel = (d: DistrictHotspot) => {
    const highDemand = d.demandIndex >= 60;
    const highInv = d.investmentCr >= 55;
    if (highDemand && !highInv) return 'Q1 · High Demand + Low Investment → Potential Unmet Need';
    if (highDemand && highInv) return 'Q2 · High Demand + High Investment → Active Development';
    if (!highDemand && highInv) return 'Q4 · Low Demand + High Investment → Existing Investment';
    return 'Q3 · Low Demand + Low Investment → Lower Observed Demand';
  };

  // Dynamically sort districts according to active viewMode so ranked bar charts are strictly ordered
  const sortedHotspots = [...DISTRICT_HOTSPOTS].sort((a, b) => {
    if (viewMode === 'demand') return b.requestCount - a.requestCount;
    if (viewMode === 'gaps') return b.gapScore - a.gapScore;
    if (viewMode === 'investment') return b.investmentCr - a.investmentCr;
    return b.priorityScore - a.priorityScore;
  });

  const displayedRankedHotspots = showAllRanked ? sortedHotspots : sortedHotspots.slice(0, 8);

  const keySectors: GapCategory[] = ['Healthcare', 'Water', 'Roads', 'Education'];

  return (
    <div className="space-y-12 pb-16">
      {/* ROLE & JURISDICTION SCOPE BANNER */}
      <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-base">{roleProfile.icon}</span>
          <span className="font-bold text-slate-900 uppercase tracking-wider">{roleProfile.scopeBadge}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium">{roleProfile.aiInsightCallout}</span>
        </div>
        {activeRole === 'District Officer' && (
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 font-semibold">
            Showing data for Pune District
          </span>
        )}
      </div>

      {/* Header + 4-Mode View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">{t.badge}</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">{t.subtitle}</p>
        </div>

        {/* 4-Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-200/70 rounded-xl">
          {(
            [
              { id: 'demand', label: 'Demand View' },
              { id: 'gaps', label: 'Infrastructure Gap View' },
              { id: 'investment', label: 'Investment View' },
              { id: 'combined', label: 'Combined Intelligence View' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                viewMode === mode.id
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* EXECUTIVE HOTSPOT TELEMETRY & SPARKLINE SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Q1 Potential Unmet Need',
            value: '7 Districts',
            sub: 'High Demand (≥60) · Low Outlay (<₹55 Cr)',
            color: '#dc2626',
            spark: [35, 42, 49, 58, 67, 74, 83, 92],
          },
          {
            label: 'Peak Citizen Demand Cluster',
            value: 'Barmer (11,240)',
            sub: '+41% 30d surge · Priority 92/100',
            color: '#2563eb',
            spark: [40, 48, 55, 63, 72, 81, 90, 96],
          },
          {
            label: 'Mean Hotspot Gap Index',
            value: '74.5 / 100',
            sub: '4 Critical · 6 High · 3 Moderate/Low',
            color: '#d97706',
            spark: [82, 80, 79, 78, 77, 76, 75, 74],
          },
          {
            label: `Active Focus: ${activeDistrict.district.replace(' District', '')}`,
            value: `${activeDistrict.priorityScore} / 100`,
            sub: `Gap ${activeDistrict.gapScore}/100 · ₹${activeDistrict.investmentCr} Cr Outlay`,
            color: '#0d9488',
            spark: [45, 52, 60, 68, 74, 80, 85, activeDistrict.priorityScore],
          },
        ].map((kpi) => {
          const pts = kpi.spark
            .map((v, i) => `${(i / (kpi.spark.length - 1)) * 100},${32 - (v / 100) * 26}`)
            .join(' ');
          return (
            <div
              key={kpi.label}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
                  {kpi.value}
                </div>
                <svg width="76" height="30" viewBox="0 0 100 34" className="shrink-0 overflow-visible mt-1">
                  <polyline
                    fill="none"
                    stroke={kpi.color}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pts}
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900 truncate">{kpi.label}</div>
                <div className="text-xs text-slate-500 truncate">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 11: SIGNATURE VISUALIZATION — CITIZEN DEMAND VS PUBLIC INVESTMENT */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 pb-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">{t.scatterBadge}</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {t.scatterTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              X-axis: Existing Public Investment (₹ Cr) · Y-axis: Citizen Demand Index · Bubble Size:
              Population Affected · Number Inside Bubble:{' '}
              <strong className="text-slate-900">
                {viewMode === 'demand'
                  ? 'Requests (k)'
                  : viewMode === 'gaps'
                  ? 'Gap Score'
                  : viewMode === 'investment'
                  ? 'Outlay (₹ Cr)'
                  : 'Priority Score'}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
              <span className="font-medium text-slate-700">Critical Gap</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
              <span className="font-medium text-slate-700">High Gap</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span className="font-medium text-slate-700">Moderate Gap</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
              <span className="font-medium text-slate-700">Low Gap</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Multi-Mode Hotspot Graph Suite */}
          <div className="lg:col-span-8">
            <SignatureQuadrantScatterChart
              districts={DISTRICT_HOTSPOTS}
              selectedDistrictId={activeDistrict.id}
              onSelectDistrict={onSelectDistrict}
              activeViewMode={viewMode}
            />
          </div>

          {/* Right: Selected District Scatter Drilldown + Sectoral Mini-Graph */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Selected District ({activeDistrict.state})
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mt-0.5">{activeDistrict.district}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-blue-700">
                    {activeDistrict.priorityScore} / 100
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Priority Score</div>
                </div>
              </div>

              <div
                className={`text-xs font-semibold rounded-xl p-3 border ${
                  activeDistrict.demandIndex >= 60 && activeDistrict.investmentCr < 55
                    ? 'text-red-800 bg-red-50/70 border-red-200/80'
                    : activeDistrict.demandIndex >= 60
                    ? 'text-blue-800 bg-blue-50/70 border-blue-200/80'
                    : 'text-teal-800 bg-teal-50/70 border-teal-200/80'
                }`}
              >
                {getQuadrantLabel(activeDistrict)}
              </div>

              {/* Primary 3-Metric Comparative Bars */}
              <div className="space-y-3 text-xs bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                <div className="font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  Core Quadrant Coordinates
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Citizen Demand Index (Y-Axis)</span>
                    <span className="font-mono font-bold text-blue-700">
                      {activeDistrict.demandIndex} / 100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${activeDistrict.demandIndex}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Infrastructure Gap Score</span>
                    <span className="font-mono font-bold text-red-600">
                      {activeDistrict.gapScore} / 100 ({activeDistrict.infrastructureGapLevel})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all"
                      style={{ width: `${activeDistrict.gapScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Public Investment Outlay (X-Axis)</span>
                    <span className="font-mono font-bold text-teal-700">
                      ₹{activeDistrict.investmentCr} Cr ({activeDistrict.existingInvestmentLevel})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, activeDistrict.investmentCr)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sectoral Gap Mini-Graph for Selected District */}
              <div className="space-y-2.5 text-xs bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Sectoral Gap Breakdown</span>
                  <span className="font-mono text-[10px] text-slate-400">Demand vs. Avail.</span>
                </div>
                {keySectors.map((sec) => {
                  const stats = activeDistrict.categoryGaps[sec];
                  if (!stats) return null;
                  return (
                    <div key={sec} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{sec}</span>
                        <span className="font-mono tabular-nums text-slate-600">
                          Gap <strong className="text-red-600">{stats.gapScore}</strong> · Avail{' '}
                          <strong className="text-emerald-700">{stats.availability}%</strong>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${stats.gapScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeDistrict.specificProblem}
              </p>

              <div className="pt-1 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('infrastructure-gaps', activeDistrict.id)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Why Prioritized?
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('impact-simulator', activeDistrict.id)}
                  className="flex-1 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Simulate Impact
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RANKED HORIZONTAL BAR GRAPH OF HOTSPOT DISTRICTS (SORTED BY ACTIVE VIEW MODE) */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
              Ranked District Hotspot Bar Graph ({viewMode.toUpperCase()} MODE)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              Districts Ranked High-to-Low by{' '}
              {viewMode === 'demand'
                ? 'Citizen Request Volume'
                : viewMode === 'gaps'
                ? 'Infrastructure Gap Score (0–100)'
                : viewMode === 'investment'
                ? 'Existing Capital Outlay (₹ Cr)'
                : 'Composite Priority Score (0–100)'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllRanked(!showAllRanked)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 shadow-sm cursor-pointer transition-colors"
            >
              {showAllRanked ? 'Show Top 8 Only' : `Show All ${sortedHotspots.length} Districts`}
            </button>
          </div>
        </div>

        <CalibratedHorizontalBarChart
          selectedId={activeDistrict.id}
          onSelectItem={(id) => onSelectDistrict(id)}
          items={displayedRankedHotspots.map((d) => {
            const val =
              viewMode === 'demand'
                ? d.requestCount
                : viewMode === 'gaps'
                ? d.gapScore
                : viewMode === 'investment'
                ? d.investmentCr
                : d.priorityScore;
            const maxVal = viewMode === 'demand' ? 12000 : 100;
            const formatted =
              viewMode === 'demand'
                ? `${d.requestCount.toLocaleString()} requests`
                : viewMode === 'gaps'
                ? `Gap ${d.gapScore}/100`
                : viewMode === 'investment'
                ? `₹${d.investmentCr} Cr`
                : `Priority ${d.priorityScore}/100`;

            return {
              id: d.id,
              label: `${d.district} (${d.stateCode})`,
              badge: `${d.mainIssue} · +${d.trendPercent}% 30d`,
              value: val,
              maxValue: maxVal,
              formattedValue: formatted,
              secondaryLabel: `${d.populationFormatted} affected`,
              color:
                viewMode === 'investment'
                  ? '#0d9488'
                  : d.infrastructureGapLevel === 'Critical'
                  ? '#dc2626'
                  : d.infrastructureGapLevel === 'High'
                  ? '#d97706'
                  : d.infrastructureGapLevel === 'Moderate'
                  ? '#2563eb'
                  : '#0d9488',
            };
          })}
          benchmarkValue={viewMode === 'demand' ? 6500 : viewMode === 'investment' ? 55 : 75}
          benchmarkLabel={
            viewMode === 'demand'
              ? 'National Hotspot Mean (6,500 req)'
              : viewMode === 'investment'
              ? '₹55 Cr Quadrant Threshold'
              : 'Critical Action Threshold (75/100)'
          }
        />
      </section>

      {/* HOTSPOT RANKING CARDS GRID WITH VISUAL METRIC BARS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {t.rankedTitle} ({viewMode.toUpperCase()} VIEW)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Click any hotspot card to inspect its multi-sector gap profile or simulate project
              impact.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHotspots.map((hotspot, rankIdx) => {
            const isSelected = hotspot.id === activeDistrict.id;
            return (
              <div
                key={hotspot.id}
                onClick={() => onSelectDistrict(hotspot.id)}
                className={`rounded-2xl border p-6 sm:p-7 transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                  isSelected
                    ? 'bg-white border-blue-600 ring-2 ring-blue-600/15'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header Row with Editorial Score First */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">
                        #{rankIdx + 1} · {hotspot.state}
                      </div>
                      <h3 className="text-lg font-bold text-slate-950 mt-0.5">
                        {hotspot.district}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-blue-700">
                        {hotspot.priorityScore} / 100
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">Priority Score</div>
                    </div>
                  </div>

                  {/* Clean Unboxed Metadata Line */}
                  <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">{hotspot.mainIssue}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {hotspot.requestCount.toLocaleString()} requests
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-red-700 font-semibold">
                      +{hotspot.trendPercent}% trend
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hotspot.specificProblem}
                  </p>

                  {/* Visual Dual Progress Bars inside Card */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Infrastructure Gap</span>
                        <span className="font-mono font-bold text-red-700">
                          {hotspot.gapScore}/100 ({hotspot.infrastructureGapLevel})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${hotspot.gapScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">
                        Pop:{' '}
                        <strong className="text-slate-950 font-mono">
                          {hotspot.populationFormatted}
                        </strong>
                      </span>
                      <span className="text-slate-500">
                        Outlay:{' '}
                        <strong className="text-slate-950 font-mono">
                          ₹{hotspot.investmentCr} Cr
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('infrastructure-gaps', hotspot.id);
                    }}
                    className="font-semibold text-slate-700 hover:text-blue-700 cursor-pointer"
                  >
                    Explain Score ({hotspot.priorityScore}/100)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('impact-simulator', hotspot.id);
                    }}
                    className="font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Simulate Impact</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Hotspot Cartography Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-950">
          National Spatial Hotspot Cartography
        </h2>
        <IndiaIntelligenceMap
          selectedStateCode={selectedState.code}
          onSelectState={setSelectedState}
          selectedDistrictId={activeDistrict.id}
          onSelectDistrict={(d) => onSelectDistrict(d.id)}
          activeLayer={viewMode as MapVisualLayer}
          darkCanvas={false}
        />
      </section>

      {/* Google Maps Grounding Section (gemini-3.5-flash with googleMaps tool) */}
      <section className="space-y-3">
        <MapsGroundingPanel
          district={activeDistrict.district}
          state={activeDistrict.state}
          category={activeDistrict.mainIssue}
          defaultQuery={`Public ${activeDistrict.mainIssue} infrastructure, government facilities, and citizen service points in ${activeDistrict.district} District, ${activeDistrict.state}`}
        />
      </section>
    </div>
  );
};
