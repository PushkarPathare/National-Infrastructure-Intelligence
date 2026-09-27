import React, { useState } from 'react';
import {
  DistrictHotspot,
  GapCategory,
  NavModule,
  SupportedLanguage,
} from '../types/platform';
import {
  DISTRICT_HOTSPOTS,
  GAP_CATEGORIES,
} from '../data/nationalData';
import { TRANSLATIONS } from '../data/translations';
import {
  MultiDistrictRadarChart,
  PriorityWaterfallChart,
} from '../components/charts/PlatformCharts';
import { Calculator } from 'lucide-react';
import { UserRole } from '../types/platform';
import { RBAC_PROFILES } from '../data/rbacData';
import { MapsGroundingPanel } from '../components/MapsGroundingPanel';

interface InfrastructureGapsViewProps {
  uiLanguage: SupportedLanguage;
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
}

export const InfrastructureGapsView: React.FC<InfrastructureGapsViewProps> = ({
  uiLanguage,
  selectedDistrictId,
  onSelectDistrict,
  onNavigate,
  activeRole = 'National Policymaker',
}) => {
  const t = TRANSLATIONS[uiLanguage].infrastructureGaps;
  const roleProfile = RBAC_PROFILES[activeRole];
  const [selectedSector, setSelectedSector] = useState<GapCategory>('Healthcare');
  const [comparisonDistrictId, setComparisonDistrictId] = useState<string>('dist-gadchiroli');

  const activeDistrict: DistrictHotspot =
    DISTRICT_HOTSPOTS.find((d) => d.id === selectedDistrictId) || DISTRICT_HOTSPOTS[0];
  const compareDistrict: DistrictHotspot =
    DISTRICT_HOTSPOTS.find((d) => d.id === comparisonDistrictId) || DISTRICT_HOTSPOTS[1];

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
        {activeRole === 'Department Officer' && (
          <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 font-semibold">
            Department Filter: Healthcare · Infrastructure Gaps: 8
          </span>
        )}
      </div>

      {/* Header & District Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">{t.badge}</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Primary District:</label>
            <select
              value={activeDistrict.id}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none"
            >
              {DISTRICT_HOTSPOTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.district} ({d.state}) — Gap {d.gapScore}/100
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('impact-simulator', activeDistrict.id)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.btnSimulateClosure}
          </button>
        </div>
      </div>

      {/* TOP SUMMARY: GAP SCORE HERO + FORMULA EXPLANATION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Composite District Gap Index</span>
              <span className="font-mono text-blue-700">{activeDistrict.state}</span>
            </div>
            <div className="pt-1 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
                Gap Score: {activeDistrict.gapScore} / 100
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{activeDistrict.district}</h2>
            {/* Visual Gauge Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${activeDistrict.gapScore}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              Primary Deficit Sector:{' '}
              <strong className="text-slate-950">{activeDistrict.mainIssue}</strong> —{' '}
              {activeDistrict.specificProblem}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-lg font-bold font-mono tabular-nums text-slate-950">
                {activeDistrict.requestCount.toLocaleString()}
              </div>
              <div className="text-slate-500 font-medium mt-1">Citizen Demand</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-lg font-bold font-mono tabular-nums text-teal-700">
                {activeDistrict.availabilityScore} / 100
              </div>
              <div className="text-slate-500 font-medium mt-1">Availability</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-lg font-bold font-mono tabular-nums text-red-600">
                {(activeDistrict.underservedPopulation / 1000).toFixed(0)}K
              </div>
              <div className="text-slate-500 font-medium mt-1">Underserved Pop</div>
            </div>
          </div>
        </div>

        {/* Transparent Gap Formula Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-9 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-700">
              <Calculator className="w-4 h-4" />
              <span>Transparent Infrastructure Gap Formula</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              How the Infrastructure Gap Score ({activeDistrict.gapScore} / 100) is Calculated
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Rather than relying on opaque black-box predictions, the National Infrastructure
              Intelligence engine computes sectoral gaps by combining normalized citizen demand
              volume with physical asset deficits, catchment population density, and radial travel
              distance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white text-slate-900 font-mono text-xs space-y-2.5 border border-slate-200/80 shadow-sm">
            <div className="text-blue-700 font-semibold">
              Gap Score = 0.40 × (Normalized Citizen Demand) + 0.35 × (100 − Facility Availability) +
              0.25 × (Access Distance Burden)
            </div>
            <div className="text-slate-600 text-[11px] pt-2 border-t border-slate-100">
              {activeDistrict.district} Calculation: 0.40×({activeDistrict.demandIndex}) + 0.35×(100 −{' '}
              {activeDistrict.availabilityScore}) + 0.25×(Distance Index for{' '}
              {activeDistrict.avgAccessDistanceKm} km) ={' '}
              <strong className="text-amber-600">{activeDistrict.gapScore} / 100</strong>
            </div>
          </div>

          {/* 8 Category Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {GAP_CATEGORIES.map((cat) => {
              const catData = activeDistrict.categoryGaps[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedSector(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedSector === cat
                      ? 'bg-slate-950 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({catData.gapScore})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 13: EXPLAINABLE PRIORITY SCORING WITH WATERFALL GRAPH */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 pb-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
              Explainable AI Governance & Auditable Weighting
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {t.whyPrioritizedTitle} ({activeDistrict.district})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete additive waterfall graph and breakdown of the Priority Score (
              {activeDistrict.priorityScore} / 100)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectDistrict('dist-gadchiroli')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                activeDistrict.id === 'dist-gadchiroli'
                  ? 'bg-slate-950 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Gadchiroli (90/100)
            </button>
            <button
              type="button"
              onClick={() => onSelectDistrict('dist-pune')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                activeDistrict.id === 'dist-pune'
                  ? 'bg-slate-950 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pune District (88/100)
            </button>
          </div>
        </div>

        {/* Full-Width Additive Waterfall Graph */}
        <PriorityWaterfallChart
          breakdown={activeDistrict.scoreBreakdown}
          totalScore={activeDistrict.priorityScore}
          districtName={activeDistrict.district}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Visual Additive Waterfall Table */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-3">
              <span>Explainable Priority Factor</span>
              <span>Score Contribution</span>
            </div>

            {[
              {
                label: 'Citizen Demand',
                desc: `${activeDistrict.requestCount.toLocaleString()} clustered requests in district`,
                points: activeDistrict.scoreBreakdown.citizenDemand,
                max: 30,
                positive: true,
              },
              {
                label: 'Population Impact',
                desc: `${activeDistrict.populationFormatted} directly affected residents`,
                points: activeDistrict.scoreBreakdown.populationImpact,
                max: 25,
                positive: true,
              },
              {
                label: 'Infrastructure Gap',
                desc: `Composite deficit score of ${activeDistrict.gapScore}/100`,
                points: activeDistrict.scoreBreakdown.infrastructureGap,
                max: 20,
                positive: true,
              },
              {
                label: 'Urgency',
                desc: `Life-safety & primary access severity weight`,
                points: activeDistrict.scoreBreakdown.urgency,
                max: 15,
                positive: true,
              },
              {
                label: 'Trend',
                desc: `+${activeDistrict.trendPercent}% request acceleration (30d)`,
                points: activeDistrict.scoreBreakdown.trend,
                max: 10,
                positive: true,
              },
              {
                label: 'Existing Investment',
                desc: `${activeDistrict.existingInvestmentLevel} active capital outlay deduction (₹${activeDistrict.investmentCr} Cr)`,
                points: activeDistrict.scoreBreakdown.existingInvestment,
                max: 15,
                positive: false,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-950">{row.label}</div>
                  <div className="text-xs text-slate-500 truncate">{row.desc}</div>
                </div>

                <div className="w-36 hidden sm:block">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.positive ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (Math.abs(row.points) / row.max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div
                  className={`text-sm font-mono font-bold tabular-nums w-14 text-right ${
                    row.positive ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {row.points > 0 ? `+${row.points}` : row.points}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-base font-bold text-slate-950">Final Priority Score</span>
              <span className="text-3xl font-bold font-mono tabular-nums tracking-tight text-blue-700">
                {activeDistrict.priorityScore} / 100
              </span>
            </div>
          </div>

          {/* Right: Verified Policy Checklist Reasons */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
                  Auditable Verification Checklist
                </div>
                <h3 className="text-xl font-bold text-slate-950 mt-1">
                  Key Drivers for {activeDistrict.district}
                </h3>
              </div>

              <ul className="space-y-3 text-sm">
                {activeDistrict.priorityReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold font-mono shrink-0">✓</span>
                    <span className="text-slate-700 leading-snug">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs space-y-2">
              <div className="font-semibold text-slate-900">
                Reference Canonical Formula Example:
              </div>
              <div className="font-mono text-slate-600 leading-relaxed">
                Citizen Demand (+30) + Population Impact (+25) + Infrastructure Gap (+20) + Urgency
                (+15) + Trend (+10) − Existing Investment (−10) ={' '}
                <strong className="text-slate-950">90 / 100</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISUALIZATIONS: UPGRADED RADAR CHART + DUAL-TRACK SECTOR BAR GRAPH */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upgraded Radar Chart: 8-Sector Gap vs Availability / Comparison District */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-8 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Multi-Sector Spider Analysis</div>
            <h3 className="text-xl font-bold tracking-tight text-slate-950">
              8-Sector Gap vs Availability Radar
            </h3>
            <p className="text-xs text-slate-500">
              Click any sector spoke to inspect or toggle cross-district radar overlay
            </p>
          </div>

          <MultiDistrictRadarChart
            primaryDistrict={activeDistrict}
            compareDistrict={compareDistrict}
            categories={GAP_CATEGORIES}
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
          />
        </div>

        {/* Right: Dual-Track Sector Bar Graph & District-vs-District Comparison */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                8-Sector Gap vs. Availability Dual-Bar Graph ({activeDistrict.district})
              </h3>
              <p className="text-xs text-slate-500">
                Comparing Sector Deficit Score (Red/Amber) against Existing Facility Availability %
                (Teal)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {GAP_CATEGORIES.map((cat) => {
              const item = activeDistrict.categoryGaps[cat];
              const isSelected = selectedSector === cat;
              return (
                <div
                  key={cat}
                  onClick={() => setSelectedSector(cat)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 text-xs ${
                    isSelected
                      ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/10'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-950 w-40 truncate">{cat}</span>
                    <div className="flex items-center gap-4 font-mono tabular-nums text-slate-600">
                      <span>Demand: {item.demand}</span>
                      <span className="text-teal-700 font-semibold">
                        Avail: {item.availability}%
                      </span>
                      <span className="text-red-700 font-bold">Gap: {item.gapScore}/100</span>
                      <span className="text-red-700 font-semibold w-12 text-right">
                        {item.trend}
                      </span>
                    </div>
                  </div>

                  {/* Dual Horizontal Bar Track: Top = Gap Score, Bottom = Availability */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.gapScore >= 80
                            ? 'bg-red-600'
                            : item.gapScore >= 65
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.gapScore}%` }}
                      />
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${item.availability}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* District Comparison Card */}
          <div className="pt-5 border-t border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Cross-District Benchmark Comparison
              </span>
              <select
                value={comparisonDistrictId}
                onChange={(e) => setComparisonDistrictId(e.target.value)}
                aria-label="Select Comparison District"
                className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm"
              >
                {DISTRICT_HOTSPOTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Compare with: {d.district}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="font-bold text-slate-950">{activeDistrict.district}</div>
                <div className="flex items-center justify-between font-mono tabular-nums">
                  <span className="text-slate-500">Gap Score:</span>
                  <span className="font-bold text-red-700">{activeDistrict.gapScore}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${activeDistrict.gapScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono tabular-nums pt-0.5">
                  <span className="text-slate-500">Priority Score:</span>
                  <span className="font-bold text-blue-700">
                    {activeDistrict.priorityScore}/100
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="font-bold text-slate-950">{compareDistrict.district}</div>
                <div className="flex items-center justify-between font-mono tabular-nums">
                  <span className="text-slate-500">Gap Score:</span>
                  <span className="font-bold text-red-700">{compareDistrict.gapScore}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${compareDistrict.gapScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono tabular-nums pt-0.5">
                  <span className="text-slate-500">Priority Score:</span>
                  <span className="font-bold text-blue-700">
                    {compareDistrict.priorityScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NATIONAL DISTRICT × SECTOR HEATMAP MATRIX WITH INLINE VISUAL BARS */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-10 shadow-sm space-y-5 overflow-x-auto">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-slate-950">
            Multi-District Infrastructure Gap Heatmap Matrix (0–100)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Click any district row to inspect its detailed waterfall and radar scoring breakdown
            above.
          </p>
        </div>

        <table className="w-full text-left border-collapse text-xs min-w-[780px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-4 font-semibold">District & State</th>
              {GAP_CATEGORIES.map((c) => (
                <th key={c} className="py-3 px-2 font-semibold text-right">
                  {c.replace(' Connectivity', '')}
                </th>
              ))}
              <th className="py-3 pl-3 font-semibold text-right">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {DISTRICT_HOTSPOTS.slice(0, 8).map((dist) => (
              <tr
                key={dist.id}
                onClick={() => onSelectDistrict(dist.id)}
                className={`cursor-pointer transition-colors ${
                  dist.id === activeDistrict.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <td className="py-3.5 pr-4 font-sans font-semibold text-slate-950">
                  {dist.district}{' '}
                  <span className="text-slate-400 font-normal">· {dist.stateCode}</span>
                </td>
                {GAP_CATEGORIES.map((cat) => {
                  const score = dist.categoryGaps[cat].gapScore;
                  const cellTone =
                    score >= 82
                      ? 'text-red-700 font-bold bg-red-50/50'
                      : score >= 68
                      ? 'text-amber-700 font-semibold bg-amber-50/40'
                      : 'text-slate-700';
                  const barTone =
                    score >= 82 ? 'bg-red-600' : score >= 68 ? 'bg-amber-500' : 'bg-teal-600';
                  return (
                    <td key={cat} className={`py-3.5 px-2 text-right ${cellTone}`}>
                      <div>{score}</div>
                      <div className="w-12 ml-auto h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div className={`h-full ${barTone}`} style={{ width: `${score}%` }} />
                      </div>
                    </td>
                  );
                })}
                <td className="py-3.5 pl-3 text-right font-bold text-blue-700">
                  {dist.priorityScore}/100
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Google Maps Grounding Verification (gemini-3.5-flash with googleMaps tool) */}
      <section className="space-y-3">
        <MapsGroundingPanel
          district={activeDistrict.district}
          state={activeDistrict.state}
          category={selectedSector}
          defaultQuery={`Existing ${selectedSector} infrastructure facilities and nearest public access points in ${activeDistrict.district} District, ${activeDistrict.state}`}
        />
      </section>
    </div>
  );
};
