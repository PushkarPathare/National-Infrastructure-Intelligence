import React, { useState } from 'react';
import {
  CitizenRequestRecord,
  CollectiveCluster,
  DistrictHotspot,
  InfrastructureCategory,
  NavModule,
  StateIntelligence,
  SupportedLanguage,
} from '../types/platform';
import {
  ANALYTICS_SERIES,
  COLLECTIVE_CLUSTERS,
  DISTRICT_HOTSPOTS,
  INFRASTRUCTURE_CATEGORIES,
  NATIONAL_KPIS,
  STATES_INTELLIGENCE,
} from '../data/nationalData';
import { TRANSLATIONS } from '../data/translations';
import { IndiaIntelligenceMap, MapVisualLayer } from '../components/IndiaIntelligenceMap';
import { InteractiveDonutChart } from '../components/charts/PlatformCharts';
import {
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { UserRole } from '../types/platform';
import { RBAC_PROFILES } from '../data/rbacData';

interface AIInsightsViewProps {
  uiLanguage: SupportedLanguage;
  requests: CitizenRequestRecord[];
  selectedRequest: CitizenRequestRecord;
  onSelectRequest: (req: CitizenRequestRecord) => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  uiLanguage,
  requests,
  selectedRequest,
  onSelectRequest,
  onNavigate,
  activeRole = 'National Policymaker',
}) => {
  const t = TRANSLATIONS[uiLanguage].aiInsights;
  const roleProfile = RBAC_PROFILES[activeRole];
  const [selectedState, setSelectedState] = useState<StateIntelligence>(STATES_INTELLIGENCE[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictHotspot>(DISTRICT_HOTSPOTS[0]);
  const [mapLayer, setMapLayer] = useState<MapVisualLayer>('combined');

  // Map Filter States
  const [categoryFilter, setCategoryFilter] = useState<InfrastructureCategory | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('Last 6 Months');
  const [investmentFilter, setInvestmentFilter] = useState<string>('All');

  // Collective Cluster Selection
  const [activeCluster, setActiveCluster] = useState<CollectiveCluster>(COLLECTIVE_CLUSTERS[0]);

  // Compute SVG coordinates for the 6-Month Cluster Velocity Area+Bar Chart
  const maxClusterVol = Math.max(...activeCluster.monthlyVolume.map((m) => m.count), 100);
  const clusterPts = activeCluster.monthlyVolume.map((m, idx) => {
    const x = 44 + (idx / Math.max(1, activeCluster.monthlyVolume.length - 1)) * 280;
    const y = 148 - (m.count / maxClusterVol) * 114;
    return { x, y, ...m };
  });
  const clusterLine = clusterPts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const clusterArea = `${clusterLine} L ${clusterPts[clusterPts.length - 1].x.toFixed(1)} 148 L ${clusterPts[0].x.toFixed(1)} 148 Z`;

  return (
    <div className="space-y-12 pb-16">
      {/* ROLE-AWARE AI INSIGHT BANNER */}
      <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-base">{roleProfile.icon}</span>
          <span className="font-bold text-slate-900 uppercase tracking-wider">{roleProfile.scopeBadge}</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-blue-700">{roleProfile.aiInsightCallout}</span>
          <span className="text-slate-600">{roleProfile.aiInsightSubtext}</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 font-mono font-medium">
          Role: {activeRole}
        </span>
      </div>

      {/* SECTION 9: NATIONAL DEVELOPMENT INTELLIGENCE HEADER & TOP KPIs */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">{t.badge}</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('recommendations')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.btnViewRecommendations}
            </button>
          </div>
        </div>

        {/* 6 KPI Cards with Large Number First + Inline Sparklines */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {[
            {
              label: 'Total Requests',
              value: NATIONAL_KPIS.totalRequests.toLocaleString(),
              sub: 'Across 36 States & UTs',
              tone: 'text-slate-950',
              stroke: '#2563eb',
              pts: '0,22 16,19 32,16 48,13 64,8 80,3',
            },
            {
              label: 'High-Priority Areas',
              value: NATIONAL_KPIS.highPriorityAreas.toString(),
              sub: 'Priority Score ≥ 80/100',
              tone: 'text-red-700',
              stroke: '#dc2626',
              pts: '0,20 16,18 32,14 48,15 64,9 80,4',
            },
            {
              label: 'Infrastructure Gaps',
              value: NATIONAL_KPIS.activeHotspots.toLocaleString(),
              sub: 'Active multi-sector deficits',
              tone: 'text-amber-700',
              stroke: '#d97706',
              pts: '0,21 16,17 32,18 48,12 64,8 80,5',
            },
            {
              label: 'Recommended Projects',
              value: NATIONAL_KPIS.recommendedProjectsCount.toString(),
              sub: 'Ready for dept routing',
              tone: 'text-blue-700',
              stroke: '#0284c7',
              pts: '0,19 16,16 32,14 48,10 64,7 80,4',
            },
            {
              label: 'Citizens Potentially Impacted',
              value: NATIONAL_KPIS.citizensImpacted,
              sub: 'Catchment beneficiaries',
              tone: 'text-teal-700',
              stroke: '#0d9488',
              pts: '0,22 16,18 32,15 48,11 64,6 80,2',
            },
            {
              label: 'Requests This Month',
              value: NATIONAL_KPIS.requestsThisMonth.toLocaleString(),
              sub: `+${NATIONAL_KPIS.monthlyGrowthPct}% vs prior month`,
              tone: 'text-slate-950',
              stroke: '#059669',
              pts: '0,22 16,20 32,16 48,12 64,7 80,2',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${kpi.tone}`}>
                  {kpi.value}
                </div>
                <svg width="42" height="16" viewBox="0 0 80 24" className="shrink-0 mt-1">
                  <polyline
                    fill="none"
                    stroke={kpi.stroke}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    points={kpi.pts}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900">{kpi.label}</div>
                <div className="text-[11px] text-slate-500">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Map Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Map Intelligence Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as InfrastructureCategory | 'All')
            }
            aria-label="Filter by Category"
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="All">Category: All Sectors</option>
            {INFRASTRUCTURE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedState.code}
            onChange={(e) => {
              const st = STATES_INTELLIGENCE.find((s) => s.code === e.target.value);
              if (st) setSelectedState(st);
            }}
            aria-label="Filter by State"
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            {STATES_INTELLIGENCE.map((s) => (
              <option key={s.code} value={s.code}>
                State: {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict.id}
            onChange={(e) => {
              const d = DISTRICT_HOTSPOTS.find((dist) => dist.id === e.target.value);
              if (d) setSelectedDistrict(d);
            }}
            aria-label="Filter by District"
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            {DISTRICT_HOTSPOTS.map((d) => (
              <option key={d.id} value={d.id}>
                District: {d.district}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter by Severity"
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="All">Severity: All Levels</option>
            <option value="Critical">Severity: Critical (88–100)</option>
            <option value="High">Severity: High (75–87)</option>
            <option value="Moderate">Severity: Moderate</option>
          </select>

          <select
            value={investmentFilter}
            onChange={(e) => setInvestmentFilter(e.target.value)}
            aria-label="Filter by Investment Level"
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="All">Investment: All Tiers</option>
            <option value="Low">Investment: Low Outlay</option>
            <option value="Medium">Investment: Medium Outlay</option>
            <option value="High">Investment: High Outlay</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by Date Range"
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="Last 30 Days">Window: Last 30 Days</option>
            <option value="Last 6 Months">Window: Last 6 Months</option>
            <option value="FY 2026-27">Window: FY 2026–27</option>
          </select>
        </div>

        {/* Interactive National Map */}
        <IndiaIntelligenceMap
          selectedStateCode={selectedState.code}
          onSelectState={setSelectedState}
          selectedDistrictId={selectedDistrict.id}
          onSelectDistrict={setSelectedDistrict}
          activeCategoryFilter={categoryFilter}
          activeLayer={mapLayer}
          onLayerChange={setMapLayer}
          darkCanvas={false}
        />
      </section>

      {/* SECTION 7: DETAILED AI REQUEST ANALYSIS WITH MULTI-FACTOR SCORE BAR GRAPH */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-6">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">{t.deepInspectionBadge}</div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t.deepInspectionTitle}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Select Request to Inspect:</span>
            {requests.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRequest(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedRequest.id === r.id
                    ? 'bg-slate-950 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Structured AI Analysis Attributes + Priority Factor Graph */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-bold text-blue-700">{selectedRequest.id}</span>
                <span>
                  Language: <strong className="text-slate-950">{selectedRequest.detectedLanguage}</strong> · Submitted {selectedRequest.submittedAt}
                </span>
              </div>
              <p className="text-base font-semibold text-slate-950 leading-relaxed">
                “{selectedRequest.citizenText}”
              </p>
              {selectedRequest.detectedLanguage !== 'English' && (
                <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                  Normalized Meaning: “{selectedRequest.translatedMeaning}”
                </p>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="font-bold text-sm text-slate-950">{selectedRequest.category}</div>
                <div className="text-slate-500 font-medium mt-1">Category & Subcategory</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{selectedRequest.subcategory}</div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="font-bold text-sm text-slate-950">{selectedRequest.district}</div>
                <div className="text-slate-500 font-medium mt-1">Location</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {selectedRequest.villageOrCity}, {selectedRequest.state}
                </div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="font-bold text-sm text-red-700">{selectedRequest.urgency} Urgency</div>
                <div className="text-slate-500 font-medium mt-1">Urgency & Sentiment</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{selectedRequest.sentiment}</div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="text-xl font-bold font-mono tabular-nums text-slate-950">
                  {selectedRequest.affectedPopulation.toLocaleString()}
                </div>
                <div className="text-slate-500 font-medium mt-1">Potential Affected Population</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Local habitation catchment</div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="font-bold text-sm text-blue-700">{selectedRequest.status}</div>
                <div className="text-slate-500 font-medium mt-1">Current Workflow Status</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {selectedRequest.assignedDepartment}
                </div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="text-xl font-bold font-mono tabular-nums text-slate-950">
                  {selectedRequest.priorityScore} / 100
                </div>
                <div className="text-slate-500 font-medium mt-1">Explainable Priority Score</div>
                <div className="text-[11px] text-slate-400 mt-0.5">High Priority Band</div>
              </div>
            </div>

            {/* Request Priority Sub-Score Decomposition Graph */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-950">
                  AI Priority Score Decomposition Graph ({selectedRequest.priorityScore}/100)
                </span>
                <span className="font-mono text-slate-500">5 Weighted Signals</span>
              </div>

              <div className="grid grid-cols-5 gap-3 pt-1">
                {[
                  { label: 'Cluster Volume', score: 28, max: 30, color: 'bg-blue-600' },
                  { label: 'Pop. Impact', score: 22, max: 25, color: 'bg-teal-600' },
                  { label: 'Asset Deficit', score: 18, max: 20, color: 'bg-red-600' },
                  { label: 'Urgency', score: 13, max: 15, color: 'bg-amber-500' },
                  { label: '6m Velocity', score: 7, max: 10, color: 'bg-indigo-600' },
                ].map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-600 truncate">{f.label}</span>
                      <span className="font-mono font-bold text-slate-950">+{f.score}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.color}`}
                        style={{ width: `${(f.score / f.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Summary + Clustered Similar Requests Box */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
            <div className="space-y-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">AI-Generated Policy Summary</div>
                <p className="text-sm text-slate-900 font-medium mt-2.5 leading-relaxed bg-white border border-slate-200/80 shadow-sm p-4 rounded-xl">
                  “{selectedRequest.aiSummary}”
                </p>
              </div>

              {/* Similar Requests Cluster Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-900">
                  Similar Requests & Spatial Cluster Evidence
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                    <div className="text-xl font-bold font-mono tabular-nums text-slate-950">
                      {selectedRequest.similarRequestsCount}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Similar requests</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                    <div className="text-xl font-bold font-mono tabular-nums text-teal-700">
                      {selectedRequest.nearbyVillagesCount}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Nearby villages</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                    <div className="text-xl font-bold font-mono tabular-nums text-amber-600">
                      {selectedRequest.recentSixMonthsPct}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Within last 6 mos</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recommended Intervention:{' '}
                  <strong className="text-slate-950">{selectedRequest.suggestedAction}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('department-actions')}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Open Officer Workflow
              </button>
              <button
                type="button"
                onClick={() => onNavigate('impact-simulator', 'dist-pune')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Simulate Project Impact</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: COLLECTIVE VOICE / DUPLICATE INTELLIGENCE ("COLLECTIVE DEMAND DETECTION") */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 pb-6">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-teal-700">{t.collectiveBadge}</div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t.collectiveTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{t.collectiveDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {COLLECTIVE_CLUSTERS.map((clu) => (
              <button
                key={clu.id}
                type="button"
                onClick={() => setActiveCluster(clu)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCluster.id === clu.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {clu.category} ({clu.citizenReports.toLocaleString()})
              </button>
            ))}
          </div>
        </div>

        {/* Visual Funnel: 5,284 Citizen Requests -> AI Clustering -> 1 Major Gap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2">
            <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
              {activeCluster.citizenReports.toLocaleString()} citizen requests
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">01. Fragmented Citizen Inputs</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Submitted across Hindi, Marathi, and English text channels
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2">
            <div className="text-lg font-bold text-blue-700">
              Geospatial + Multilingual Embedding Fusion
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">02. Semantic AI Clustering</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Deduplicates overlapping village reports within 20 km catchment
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2">
            <div className="text-lg font-bold text-slate-950">
              1 Major {activeCluster.category} Infrastructure Gap
            </div>
            <div>
              <div className="text-xs font-bold text-teal-700">
                03. Consolidated Macro-Development Issue
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{activeCluster.underlyingIssue}</div>
            </div>
          </div>
        </div>

        {/* Cluster Telemetry + 3 Upgraded Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cluster Key Metrics & Sample Multilingual Voices */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="text-xs font-semibold text-slate-500">Underlying Issue Summary</div>
              <div className="text-base font-bold text-slate-950">
                “{activeCluster.underlyingIssue}”
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-950">
                    {activeCluster.citizenReports.toLocaleString()}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Citizen Reports</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-950">
                    {activeCluster.affectedVillages}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Affected Villages</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-xl font-bold font-mono tabular-nums text-teal-700">
                    {activeCluster.estimatedPopulation.toLocaleString()}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Estimated Population</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-sm font-bold font-mono tabular-nums text-red-700">
                    {activeCluster.trendSixMonths}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">6-Month Trend</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-900">
                Sample Clustered Multilingual Submissions
              </div>
              {activeCluster.samplePhrases.map((p, idx) => (
                <div key={idx} className="text-xs p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <span className="font-semibold text-blue-700">{p.lang}: </span>
                  <span className="text-slate-700">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3 Upgraded Cluster Graphs */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Graph 1: Precision SVG Area + Column Combo Chart */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-950">
                  1. Cluster Requests Over Time (6 Months)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Monthly submission velocity ({activeCluster.trendSixMonths})
                </div>
              </div>

              <div className="mt-3">
                <svg
                  viewBox="0 0 350 178"
                  className="w-full h-auto select-none"
                  role="img"
                  aria-label="6-Month Cluster Velocity Chart"
                >
                  <defs>
                    <linearGradient id="cluVelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {[0, 0.5, 1].map((tVal, idx) => {
                    const y = 148 - tVal * 114;
                    const labelVal = Math.round(maxClusterVol * tVal);
                    return (
                      <g key={idx}>
                        <line
                          x1="32"
                          y1={y}
                          x2="338"
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray={idx === 0 ? undefined : '3 3'}
                        />
                        <text
                          x="27"
                          y={y + 3}
                          textAnchor="end"
                          fill="#64748b"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {labelVal}
                        </text>
                      </g>
                    );
                  })}

                  <path d={clusterArea} fill="url(#cluVelGrad)" />
                  <path
                    d={clusterLine}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {clusterPts.map((pt) => (
                    <g key={pt.month}>
                      <rect
                        x={pt.x - 10}
                        y={pt.y}
                        width="20"
                        height={148 - pt.y}
                        fill="#3b82f6"
                        opacity="0.22"
                        rx="2"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.8"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 7}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {pt.count}
                      </text>
                      <text
                        x={pt.x}
                        y="165"
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {pt.month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Graph 2: Geographic Concentration by Block (Calibrated Stacked & Grid Bar Chart) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-950">
                  2. Geographic Concentration by Block
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Proportional distribution across {activeCluster.affectedVillages} villages
                </div>
              </div>

              {/* Stacked Proportional Strip */}
              <div className="w-full h-3.5 rounded-md overflow-hidden flex my-2">
                <div className="bg-teal-700 h-full" style={{ width: '39%' }} />
                <div className="bg-teal-500 h-full" style={{ width: '29%' }} />
                <div className="bg-blue-600 h-full" style={{ width: '19%' }} />
                <div className="bg-blue-400 h-full" style={{ width: '13%' }} />
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { block: 'Block A (Rural North Catchment)', villages: 16, share: 39, color: '#0f766e' },
                  { block: 'Block B (Tribal / Upland Belt)', villages: 12, share: 29, color: '#14b8a6' },
                  { block: 'Block C (Highway Fringe)', villages: 8, share: 19, color: '#2563eb' },
                  { block: 'Block D (Peripheral Panchayats)', villages: 5, share: 13, color: '#60a5fa' },
                ].map((b) => (
                  <div key={b.block} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 truncate">{b.block}</span>
                      <span className="font-mono tabular-nums text-slate-700 font-semibold">
                        {b.villages}v · {b.share}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.share * 2.2}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph 3: National Category Distribution Interactive Donut Graph */}
            <div className="sm:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-bold text-slate-950">
                    3. Category Distribution of Clustered Demand (Interactive Donut Graph)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Hover any sector slice to inspect request volume and mean gap score
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500">12.8M Indexed</span>
              </div>

              <InteractiveDonutChart
                size={180}
                centerTitle="Sectors"
                centerValue="12.8M"
                segments={ANALYTICS_SERIES.byCategory.slice(0, 5).map((cat) => ({
                  label: cat.category,
                  value: cat.requests,
                  sharePct: cat.sharePct,
                  color: cat.color,
                  sublabel: `Gap ${cat.gapAvg}/100`,
                }))}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
