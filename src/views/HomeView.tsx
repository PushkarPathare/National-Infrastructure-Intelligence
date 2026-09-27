import React, { useState } from 'react';
import {
  CitizenRequestRecord,
  DistrictHotspot,
  NavModule,
  StateIntelligence,
  SupportedLanguage,
  UserRole,
} from '../types/platform';
import {
  ANALYTICS_SERIES,
  DISTRICT_HOTSPOTS,
  INITIAL_CITIZEN_REQUESTS,
  NATIONAL_KPIS,
  STATES_INTELLIGENCE,
  TECHNOLOGY_STACK_PILLARS,
} from '../data/nationalData';
import { RBAC_PROFILES, ROLE_ORDER } from '../data/rbacData';
import { TRANSLATIONS } from '../data/translations';
import { IndiaIntelligenceMap, MapVisualLayer } from '../components/IndiaIntelligenceMap';
import {
  InteractiveDonutChart,
  InteractiveTimeSeriesChart,
} from '../components/charts/PlatformCharts';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react';

import { CitizenSubTab } from './CitizenRequestsView';

interface HomeViewProps {
  uiLanguage: SupportedLanguage;
  activeRole?: UserRole;
  requests?: CitizenRequestRecord[];
  onNavigate: (module: NavModule, districtId?: string) => void;
  onOpenCitizenTab?: (tab: CitizenSubTab) => void;
  onOpenCopilot: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  uiLanguage,
  activeRole = 'National Policymaker',
  requests = INITIAL_CITIZEN_REQUESTS,
  onNavigate,
  onOpenCitizenTab,
  onOpenCopilot,
  onSwitchRole,
}) => {
  const [selectedState, setSelectedState] = useState<StateIntelligence>(STATES_INTELLIGENCE[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictHotspot>(DISTRICT_HOTSPOTS[0]);
  const [mapLayer, setMapLayer] = useState<MapVisualLayer>('combined');

  // State Administrator Filters (District, Department, Category, Language, Time Period)
  const [stateDistFilter, setStateDistFilter] = useState<string>('All Maharashtra Districts');
  const [stateDeptFilter, setStateDeptFilter] = useState<string>('All Departments');
  const [stateCatFilter, setStateCatFilter] = useState<string>('All Categories');
  const [stateLangFilter, setStateLangFilter] = useState<string>('All (EN / MR / HI)');
  const [stateTimeFilter, setStateTimeFilter] = useState<string>('FY 2026–27');

  const t = TRANSLATIONS[uiLanguage].home;
  const roleProfile = RBAC_PROFILES[activeRole];

  const funnelVolumes = [
    { volume: '12.84M', pct: 100, color: '#2563eb' },
    { volume: '9.40M', pct: 82, color: '#0284c7' },
    { volume: '1,842 Clusters', pct: 66, color: '#0d9488' },
    { volume: '742 Districts', pct: 52, color: '#059669' },
    { volume: '186 Sanctions', pct: 38, color: '#d97706' },
    { volume: '48.6M Citizens', pct: 92, color: '#10b981' },
  ];

  // ============================================================================
  // CITIZEN ROLE DASHBOARD (STRICTLY CITIZEN-FACING ACCESS)
  // ============================================================================
  if (activeRole === 'Citizen') {
    const citizenOwnRequests = requests.filter(
      (r) => r.isOwnRequest || r.submittedAt === 'Just now'
    );
    const pendingCount = citizenOwnRequests.filter(
      (r) => r.status === 'New' || r.status === 'Assigned'
    ).length;
    const underReviewCount = citizenOwnRequests.filter(
      (r) => r.status === 'Under Review' || r.status === 'In Progress'
    ).length;
    const resolvedCount = citizenOwnRequests.filter((r) => r.status === 'Resolved').length;

    const goToCitizenTab = (tab: CitizenSubTab) => {
      if (onOpenCitizenTab) {
        onOpenCitizenTab(tab);
      } else {
        onNavigate('citizen-requests');
      }
    };

    return (
      <div className="space-y-14 pb-16">
        {/* Citizen Welcome & Role Scope Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800/90 p-8 sm:p-12 shadow-xl space-y-10">
          {/* Subtle atmospheric coordinate grid & radial glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.25), transparent 50%)',
            }}
          />

          <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white font-semibold tracking-tight">
                👤 Citizen Portal
              </span>
              <span className="font-mono text-teal-400 font-medium">{roleProfile.scopeBadge}</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-300 hidden sm:inline">
                👁 View & Submit Own Requests · Support Community Clusters
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Hackathon Demo • Simulated Role Access
            </span>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Welcome, {roleProfile.demoUserName} — My Citizen Dashboard
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Submit infrastructure development needs in English, Marathi, or Hindi, endorse
                community requests in your district, and track your submitted requests in real time.
              </p>
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => goToCitizenTab('submit')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>+ Submit New Development Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToCitizenTab('community')}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold rounded-2xl transition-all cursor-pointer"
                >
                  Explore & Support Community Requests ({requests.length})
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('public-updates')}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold rounded-2xl transition-all cursor-pointer"
                >
                  View Public Infrastructure Updates
                </button>
              </div>
            </div>

            {/* Citizen Role-Aware AI Insight Box */}
            <div className="lg:col-span-5 p-7 rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-teal-400 font-semibold">
                <span className="uppercase tracking-wider text-[11px]">AI Citizen Request Update</span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                  {citizenOwnRequests[0]?.id || 'REQ-MH-92831'}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white leading-snug">
                “{roleProfile.aiInsightCallout}”
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{roleProfile.aiInsightSubtext}</p>
            </div>
          </div>

          {/* 4 Required Citizen Dashboard KPIs — Large Number First */}
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-5 pt-8 border-t border-slate-800/80">
            {[
              {
                label: 'My Submitted Requests',
                value: citizenOwnRequests.length.toString(),
                sub: 'Ambegaon Rural Cluster, Pune',
                tone: 'text-slate-950',
                tab: 'my-requests' as CitizenSubTab,
              },
              {
                label: 'Pending Requests',
                value: pendingCount.toString(),
                sub: 'Queued for field verification',
                tone: 'text-amber-600',
                tab: 'my-requests' as CitizenSubTab,
              },
              {
                label: 'Requests Under Review',
                value: underReviewCount.toString(),
                sub: 'Assigned to Department Queue',
                tone: 'text-blue-600',
                tab: 'status' as CitizenSubTab,
              },
              {
                label: 'Resolved Requests',
                value: resolvedCount.toString(),
                sub: 'Completed civic works',
                tone: 'text-emerald-600',
                tab: 'status' as CitizenSubTab,
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                onClick={() => goToCitizenTab(kpi.tab)}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-2"
              >
                <div className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight ${kpi.tone}`}>
                  {kpi.value}
                </div>
                <div className="text-sm font-semibold text-slate-900 pt-1">{kpi.label}</div>
                <div className="text-xs text-slate-500">{kpi.sub} →</div>
              </div>
            ))}
          </div>
        </section>

        {/* Citizen's Own Requests & Community Updates Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: My Submitted Requests & Status (Citizen Privacy Scoped) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  My Requests & Live Status Tracker ({citizenOwnRequests.length})
                </h2>
                <p className="text-sm text-slate-500">
                  Showing your personal submitted requests and public status milestones
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToCitizenTab('status')}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Open 6-Stage Tracker →
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {citizenOwnRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => goToCitizenTab('status')}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 text-xs">{req.id}</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Status: {req.status}</span>
                    </span>
                  </div>
                  <div className="font-bold text-slate-950 text-base">
                    {req.category} — {req.villageOrCity}, {req.district}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">“{req.citizenText}”</p>
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      Community Cluster: <strong className="text-slate-800">{req.similarRequestsCount} reports</strong> ·{' '}
                      {req.assignedDepartment}
                    </span>
                    <span>Submitted: {req.submittedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Public Updates & Community Requests Quick Access */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-bold text-lg tracking-tight text-slate-950">
                  Active Community Requests & Bulletins (Pune)
                </span>
                <button
                  type="button"
                  onClick={() => goToCitizenTab('community')}
                  className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  View All Community Requests →
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
                  <div className="font-bold text-slate-950 text-sm">
                    Ambegaon Block Healthcare Review Initiated
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    387 community requests for a 24x7 Community Healthcare Centre are currently
                    under review by the District Collectorate and Health Department.
                  </p>
                  <button
                    type="button"
                    onClick={() => goToCitizenTab('community')}
                    className="text-blue-700 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1 pt-1"
                  >
                    <span>Support or View Community Cluster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5">
                  <div className="font-bold text-slate-950 text-sm">
                    Rural Drinking Water Pipeline Maintenance
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Summer water storage augmentation works scheduled across 14 rural panchayats.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('public-updates')}
                    className="text-blue-700 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1 pt-1"
                  >
                    <span>View Public Bulletin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Citizen Access Boundary & Quick Demo Switch Card */}
            <div className="bg-white text-slate-900 border border-slate-200/80 rounded-3xl p-8 space-y-4 text-xs shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <Lock className="w-4 h-4" />
                <span>Citizen Access & Data Privacy Boundary</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                As a <strong>Citizen</strong>, national analytics, state-wide budget allocation,
                other citizens&apos; personal details, and administrative dataset controls are
                restricted.
              </p>
              {onSwitchRole && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Hackathon Demo: Switch role to inspect officer or policymaker consoles:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['District Officer', 'Department Officer', 'State Administrator', 'National Policymaker'] as UserRole[]).map(
                      (r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => onSwitchRole(r)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-800 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Switch to {r}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* =================================================================== */}
      {/* ROLE-AWARE EXECUTIVE COMMAND BANNER & JURISDICTION KPI PANEL        */}
      {/* =================================================================== */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="px-3.5 py-1 rounded-full bg-slate-950 text-white font-semibold">
                {roleProfile.icon} {roleProfile.role} Dashboard
              </span>
              <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/70 font-semibold">
                {roleProfile.scopeBadge}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-mono font-semibold">
                {roleProfile.accessLevelLabel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 pt-1">
              {activeRole === 'District Officer' &&
                'District Collectorate Command · Showing Data for Pune District'}
              {activeRole === 'Department Officer' &&
                'Health Department Operational Console · Healthcare Infrastructure Scope'}
              {activeRole === 'State Administrator' &&
                'Maharashtra State Planning & Infrastructure Alignment Console'}
              {activeRole === 'National Policymaker' &&
                'National Infrastructure Intelligence & Multi-State Policy Command'}
              {activeRole === 'System Administrator' &&
                'System Administration, RBAC Governance & National Dataset Telemetry'}
            </h2>
          </div>

          {/* Role-Aware AI Insight Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-xl text-xs space-y-1.5">
            <div className="font-mono font-bold text-blue-700 text-[11px] uppercase tracking-wider">
              Role-Aware AI Intelligence ({activeRole})
            </div>
            <div className="font-bold text-slate-950 text-sm leading-snug">“{roleProfile.aiInsightCallout}”</div>
            <div className="text-slate-500 text-xs leading-relaxed">{roleProfile.aiInsightSubtext}</div>
          </div>
        </div>

        {/* 1. DISTRICT OFFICER SPECIFIC DASHBOARD METRICS (PUNE DISTRICT) — Large Number First */}
        {activeRole === 'District Officer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-xs">
            {[
              {
                title: 'District Requests (Pune)',
                val: '8,432',
                sub: '+32% in last 30 days',
                mod: 'citizen-requests' as NavModule,
              },
              {
                title: 'District Demand Hotspots',
                val: '42 Villages',
                sub: 'Ambegaon & Junnar clusters',
                mod: 'demand-hotspots' as NavModule,
              },
              {
                title: 'Infrastructure Gaps',
                val: '84 / 100 (High)',
                sub: 'Healthcare & Rural Water',
                mod: 'infrastructure-gaps' as NavModule,
              },
              {
                title: 'Assigned Projects',
                val: '4 Active Works',
                sub: '₹44 Cr current district outlay',
                mod: 'department-actions' as NavModule,
              },
              {
                title: 'District Priority Score',
                val: '88 / 100',
                sub: 'Top priority in West Zone',
                mod: 'recommendations' as NavModule,
              },
            ].map((item) => (
              <div
                key={item.title}
                onClick={() => onNavigate(item.mod, 'dist-pune')}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
              >
                <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
                  {item.val}
                </div>
                <div className="text-slate-800 font-semibold text-xs pt-0.5">{item.title}</div>
                <div className="text-xs text-slate-500 font-medium">{item.sub} →</div>
              </div>
            ))}
          </div>
        )}

        {/* 2. DEPARTMENT OFFICER SPECIFIC DASHBOARD METRICS (HEALTH DEPARTMENT) — Large Number First */}
        {activeRole === 'Department Officer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {[
              {
                title: 'Department Filter: Healthcare',
                val: '1,284 Requests',
                sub: 'Active clustered clinical demands',
                mod: 'citizen-requests' as NavModule,
              },
              {
                title: 'High-Priority Projects',
                val: '12 Projects',
                sub: 'CHC & Diagnostic sanctions pending',
                mod: 'recommendations' as NavModule,
              },
              {
                title: 'Healthcare Infrastructure Gaps',
                val: '8 Critical Gaps',
                sub: 'Gadchiroli, Pune & Sitapur',
                mod: 'infrastructure-gaps' as NavModule,
              },
              {
                title: 'Department Actions Queue',
                val: '82% SLA Met',
                sub: '16.4 days mean turnaround',
                mod: 'department-actions' as NavModule,
              },
            ].map((item) => (
              <div
                key={item.title}
                onClick={() => onNavigate(item.mod)}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
              >
                <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
                  {item.val}
                </div>
                <div className="text-slate-800 font-semibold text-xs pt-0.5">{item.title}</div>
                <div className="text-xs text-slate-500 font-medium">{item.sub} →</div>
              </div>
            ))}
          </div>
        )}

        {/* 3. STATE ADMINISTRATOR SPECIFIC DASHBOARD (MAHARASHTRA + 5 FILTERS + DISTRICT COMPARISON) */}
        {activeRole === 'State Administrator' && (
          <div className="space-y-6 text-xs">
            {/* 5 Required State Filters: District, Department, Category, Language, Time Period */}
            <div className="flex flex-wrap items-center gap-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="font-bold text-slate-900">🏛️ Maharashtra State Filters:</span>
              <select
                value={stateDistFilter}
                onChange={(e) => setStateDistFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 shadow-2xs"
              >
                <option>All Maharashtra Districts (36)</option>
                <option>Pune District</option>
                <option>Gadchiroli District</option>
                <option>Nashik District</option>
                <option>Nagpur District</option>
              </select>
              <select
                value={stateDeptFilter}
                onChange={(e) => setStateDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 shadow-2xs"
              >
                <option>All Departments</option>
                <option>Health Department</option>
                <option>Water Resources</option>
                <option>Public Works (Roads)</option>
              </select>
              <select
                value={stateCatFilter}
                onChange={(e) => setStateCatFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 shadow-2xs"
              >
                <option>All Categories</option>
                <option>Healthcare</option>
                <option>Water</option>
                <option>Roads</option>
              </select>
              <select
                value={stateLangFilter}
                onChange={(e) => setStateLangFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 shadow-2xs"
              >
                <option>Language: All (English / Marathi / Hindi)</option>
                <option>Marathi (मराठी)</option>
                <option>English</option>
                <option>Hindi (हिन्दी)</option>
              </select>
              <select
                value={stateTimeFilter}
                onChange={(e) => setStateTimeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 shadow-2xs"
              >
                <option>Time Period: FY 2026–27</option>
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            {/* State KPIs + Intra-State District Comparison — Large Number First */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
              {[
                { label: 'Total Requests (MH)', val: '248,430', sub: '+24% monthly growth' },
                { label: 'Demand Hotspots', val: '28 Clusters', sub: 'Gadchiroli & Pune top' },
                { label: 'Infrastructure Gaps', val: 'High (78/100)', sub: 'Rural Health & Water' },
                { label: 'Priority Projects', val: '42 Sanctions', sub: '₹680 Cr State Outlay' },
                { label: 'Population Impact', val: '2.4M Citizens', sub: 'Across 36 MH districts' },
              ].map((k) => (
                <div key={k.label} className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
                    {k.val}
                  </div>
                  <div className="text-slate-800 font-semibold text-xs">{k.label}</div>
                  <div className="text-xs text-slate-500">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. NATIONAL POLICYMAKER HIERARCHICAL DRILL-DOWN CHAIN */}
        {activeRole === 'National Policymaker' && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 font-medium">
              <span className="font-bold text-slate-950">National Drill-Down Path:</span>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-900 font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
              >
                🇮🇳 India (12.8M+ req)
              </button>
              <span className="text-slate-400">→</span>
              <button
                type="button"
                onClick={() => onNavigate('demand-hotspots')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-900 font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
              >
                State: {selectedState.name}
              </button>
              <span className="text-slate-400">→</span>
              <button
                type="button"
                onClick={() => onNavigate('demand-hotspots', selectedDistrict.id)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-900 font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
              >
                District: {selectedDistrict.district}
              </button>
              <span className="text-slate-400">→</span>
              <button
                type="button"
                onClick={() => onNavigate('infrastructure-gaps', selectedDistrict.id)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-900 font-semibold text-red-700 shadow-2xs transition-all cursor-pointer"
              >
                Need: {selectedDistrict.mainIssue} Gap ({selectedDistrict.gapScore}/100)
              </button>
              <span className="text-slate-400">→</span>
              <button
                type="button"
                onClick={() => onNavigate('recommendations')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold transition-all cursor-pointer"
              >
                Recommended Project →
              </button>
            </div>
          </div>
        )}

        {/* 5. SYSTEM ADMINISTRATOR QUICK GOVERNANCE SHORTCUTS */}
        {activeRole === 'System Administrator' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
            {(
              [
                { id: 'sys-users', title: 'User Management', sub: 'Create & Assign Scope' },
                { id: 'sys-roles', title: 'Role Management', sub: '6 RBAC Profiles' },
                { id: 'sys-datasets', title: 'Dataset Management', sub: '18 Active Connectors' },
                { id: 'sys-audit', title: 'Security Audit Logs', sub: 'Live Access Trail' },
                { id: 'sys-config', title: 'System Configuration', sub: 'Privacy & Guardrails' },
              ] as const
            ).map((adm) => (
              <button
                key={adm.id}
                type="button"
                onClick={() => onNavigate(adm.id)}
                className="p-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm text-slate-950 text-left transition-all cursor-pointer space-y-1.5"
              >
                <div className="font-bold text-sm">{adm.title}</div>
                <div className="text-[11px] text-blue-700 font-mono">{adm.sub} →</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* EDITORIAL HERO SECTION WITH SUBTLE INDIA GIS NETWORK BACKDROP       */}
      {/* =================================================================== */}
      <section className="relative rounded-3xl bg-slate-950 text-white border border-slate-800/90 shadow-xl overflow-hidden">
        {/* Subtle GIS Coordinate Network & Connected Regions Visual Treatment */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, rgba(37, 99, 235, 0.35), transparent 52%), radial-gradient(circle at 82% 65%, rgba(13, 148, 136, 0.22), transparent 48%)',
          }}
        />
        <svg
          className="pointer-events-none absolute right-0 top-0 h-full w-2/3 opacity-[0.07]"
          viewBox="0 0 800 600"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="420" cy="180" r="140" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="420" cy="180" r="260" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="2 8" />
          <circle cx="580" cy="360" r="180" stroke="#60a5fa" strokeWidth="1" />
          <line x1="280" y1="120" x2="420" y2="180" stroke="#93c5fd" strokeWidth="1" />
          <line x1="420" y1="180" x2="580" y2="360" stroke="#93c5fd" strokeWidth="1" />
          <line x1="580" y1="360" x2="340" y2="440" stroke="#93c5fd" strokeWidth="1" />
          <line x1="420" y1="180" x2="340" y2="440" stroke="#5eead4" strokeWidth="1" />
          <circle cx="280" cy="120" r="5" fill="#60a5fa" />
          <circle cx="420" cy="180" r="7" fill="#2dd4bf" />
          <circle cx="580" cy="360" r="6" fill="#60a5fa" />
          <circle cx="340" cy="440" r="5" fill="#f59e0b" />
        </svg>

        <div className="relative p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-blue-300 font-medium">
              <span>{t.heroBadge1}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>{t.heroBadge2}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="font-mono text-teal-300">{t.heroBadge3}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.06]">
              {t.heroTitle}
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('citizen-requests')}
                className="px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer"
              >
                <span>{t.btnSubmitRequest}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ai-insights')}
                className="px-7 py-4 bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 text-sm font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer"
              >
                {t.btnExploreInsights}
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="text-teal-300 font-medium">{t.cap3Languages}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{t.capExplainable}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{t.capDatasets}</span>
            </div>
          </div>

          {/* Right Column: Live Command Preview Card with Mini Priority Bar Graph */}
          <div className="lg:col-span-5 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-7 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">{t.liveTraceLabel}</div>
                <div className="text-base font-bold text-white mt-1">
                  {t.liveClusterTitle}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-xs font-mono font-semibold text-amber-300">
                Priority 88 / 100
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5">
                <div className="text-slate-400 font-medium">{t.citizenInputLabel}</div>
                <p className="text-slate-100 italic text-sm leading-relaxed">{t.citizenInputQuote}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-blue-400">
                    {t.similarRequestsValue}
                  </div>
                  <div className="text-slate-300 font-medium">{t.aiClusterMatchLabel}</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '86%' }} />
                  </div>
                  <div className="text-[11px] text-slate-400">{t.acrossVillagesValue}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-red-400">
                    84 / 100 (High)
                  </div>
                  <div className="text-slate-300 font-medium">{t.infraGapLabel}</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '84%' }} />
                  </div>
                  <div className="text-[11px] text-slate-400">{t.avgKmHospital}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-700/50 flex items-center justify-between gap-4">
                <div>
                  <div className="text-blue-200 font-bold text-sm">{t.aiRecTitle}</div>
                  <div className="text-slate-300 text-xs mt-0.5">{t.aiRecSub}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('impact-simulator', 'dist-pune')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer"
                >
                  {t.btnSimulate}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE NATIONAL STATISTICS BAR WITH MICRO SPARKLINES — Large Number First */}
        <div className="relative border-t border-white/10 bg-slate-900/70 backdrop-blur-md px-8 sm:px-12 lg:px-16 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              {
                val: NATIONAL_KPIS.totalRequestsFormatted,
                label: t.kpis.totalRequests,
                tone: 'text-white',
                stroke: '#3b82f6',
                pts: '0,20 18,17 36,15 54,11 72,7 90,3',
              },
              {
                val: NATIONAL_KPIS.statesAndUTs.toString(),
                label: t.kpis.statesUTs,
                tone: 'text-white',
                stroke: '#60a5fa',
                pts: '0,12 18,12 36,12 54,12 72,12 90,12',
              },
              {
                val: NATIONAL_KPIS.districtsFormatted,
                label: t.kpis.districtsAnalyzed,
                tone: 'text-white',
                stroke: '#38bdf8',
                pts: '0,16 18,14 36,12 54,10 72,8 90,6',
              },
              {
                val: NATIONAL_KPIS.activeHotspots.toLocaleString(),
                label: t.kpis.activeHotspots,
                tone: 'text-amber-400',
                stroke: '#f59e0b',
                pts: '0,19 18,16 36,17 54,12 72,9 90,4',
              },
              {
                val: NATIONAL_KPIS.highPriorityAreas.toString(),
                label: t.kpis.highPriorityAreas,
                tone: 'text-red-400',
                stroke: '#f87171',
                pts: '0,18 18,15 36,13 54,14 72,8 90,5',
              },
              {
                val: NATIONAL_KPIS.citizensImpacted,
                label: t.kpis.citizensImpacted,
                tone: 'text-teal-400',
                stroke: '#2dd4bf',
                pts: '0,20 18,18 36,14 54,10 72,6 90,2',
              },
            ].map((kpi) => (
              <div key={kpi.label} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <div className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight ${kpi.tone}`}>
                    {kpi.val}
                  </div>
                  <svg width="56" height="22" viewBox="0 0 90 22" className="shrink-0 hidden sm:block opacity-80">
                    <polyline
                      fill="none"
                      stroke={kpi.stroke}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      points={kpi.pts}
                    />
                  </svg>
                </div>
                <div className="text-xs font-medium text-slate-300">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE INDIA MAP PREVIEW SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">{t.mapSectionBadge}</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              {t.mapSectionTitle}
            </h2>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">{t.mapSectionDesc}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('demand-hotspots')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-900 transition-all whitespace-nowrap cursor-pointer"
            >
              {t.btnOpenHotspotMatrix}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('infrastructure-gaps')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-950 rounded-2xl hover:bg-slate-800 transition-all whitespace-nowrap cursor-pointer"
            >
              {t.btnExploreGapEngine}
            </button>
          </div>
        </div>

        <IndiaIntelligenceMap
          selectedStateCode={selectedState.code}
          onSelectState={setSelectedState}
          selectedDistrictId={selectedDistrict.id}
          onSelectDistrict={setSelectedDistrict}
          activeLayer={mapLayer}
          onLayerChange={setMapLayer}
          darkCanvas={true}
        />
      </section>

      {/* EXECUTIVE NATIONAL DATA GRAPHS SECTION */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              National Telemetry & Quantitative Graphs
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              12-Month Demand Trajectory & Sectoral Distribution
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('analytics')}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer"
          >
            Open Full 9-Chart Analytics Suite
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 12-Month Interactive Spline Area & Bar Chart */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                National Citizen Requests vs. Resolved Interventions (FY 2026–27)
              </h3>
              <p className="text-sm text-slate-500">
                Hover over any month to inspect intake volume, completed works, and clearance rate
              </p>
            </div>

            <InteractiveTimeSeriesChart data={ANALYTICS_SERIES.overTime} height={280} />
          </div>

          {/* Right: Sectoral Share Interactive Donut Chart */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                Citizen Demand Share by Infrastructure Sector
              </h3>
              <p className="text-sm text-slate-500">
                Proportional breakdown across 12.84M indexed citizen requests
              </p>
            </div>

            <InteractiveDonutChart
              size={215}
              centerTitle="Total Demand"
              centerValue="12.84M"
              segments={ANALYTICS_SERIES.byCategory.slice(0, 6).map((cat) => ({
                label: cat.category,
                value: cat.requests,
                sharePct: cat.sharePct,
                color: cat.color,
                sublabel: `${(cat.requests / 1000000).toFixed(2)}M`,
              }))}
            />
          </div>
        </div>
      </section>

      {/* HOW THE PLATFORM WORKS — 5 STEPS */}
      <section className="space-y-8">
        <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-teal-700">{t.howItWorksBadge}</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              {t.howItWorksTitle}
            </h2>
          </div>
          <p className="text-sm text-slate-500">{t.howItWorksSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {t.howItWorksSteps.map((item, idx) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-xs flex flex-col justify-between hover:border-slate-900 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-700 px-2.5 py-1 rounded-full bg-blue-50">{item.step}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Stage {idx + 1}/5
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-950 leading-snug">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(idx + 1) * 20}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Automated Pipeline Stage
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LANDING PAGE STORY: MILLIONS OF CITIZENS -> MEASURED IMPACT (WITH FUNNEL BARS) */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">{t.storyBadge}</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">{t.storyTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onOpenCopilot}
            className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer"
          >
            {t.btnAskCopilot}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.storyPipeline.map((node, idx) => {
            const fv = funnelVolumes[idx] || funnelVolumes[0];
            return (
              <div
                key={node.index}
                className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      Stage {node.index}
                    </span>
                    <span className="text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
                      {fv.volume}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-950">{node.stage}</div>
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">{node.detail}</div>
                </div>

                {/* Quantitative Volume Bar */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Pipeline Throughput</span>
                    <span className="font-semibold text-slate-900">{fv.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${fv.pct}%`, backgroundColor: fv.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE AI, CLOUD & PUBLIC DATA TECHNOLOGY STACK */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">{t.techStackBadge}</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {t.techStackTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">{t.techStackDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('data-sources')}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer"
          >
            {t.btnViewDataSources}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECHNOLOGY_STACK_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.id}
              className={`p-7 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 ${
                idx === TECHNOLOGY_STACK_PILLARS.length - 1 ? 'md:col-span-2 lg:col-span-3' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {pillar.category}
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                    {pillar.status}
                  </span>
                </div>
                <div className="text-base font-bold text-slate-950 leading-snug">
                  {pillar.technologies}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{pillar.roleInPlatform}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY, TRUST & DIGITAL PUBLIC GOOD GOVERNANCE */}
      <section className="bg-white text-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.trustBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">{t.trustTitle}</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{t.trustDesc}</p>
            <div className="pt-2 text-xs text-slate-500 font-mono">{t.trustNote}</div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {t.trustCards.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2"
              >
                <div className="text-sm font-bold text-slate-950">{item.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
