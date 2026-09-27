import React, { useState, useEffect } from 'react';
import {
  NavModule,
  PlatformNotification,
  SupportedLanguage,
  UserRole,
} from '../types/platform';
import {
  ANALYTICS_SERIES,
  DISTRICT_HOTSPOTS,
  INFRASTRUCTURE_CATEGORIES,
  INITIAL_NOTIFICATIONS,
  STATES_INTELLIGENCE,
} from '../data/nationalData';
import { RBAC_PROFILES, ROLE_ORDER } from '../data/rbacData';
import { TRANSLATIONS } from '../data/translations';
import {
  CalibratedHorizontalBarChart,
  InteractiveDonutChart,
  InteractiveTimeSeriesChart,
} from '../components/charts/PlatformCharts';
import { SlidersHorizontal, RotateCcw, Bell, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  uiLanguage: SupportedLanguage;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
  notifications?: PlatformNotification[];
  roleFilteredNotifications?: PlatformNotification[];
  onOpenAlert?: (notif: PlatformNotification) => void;
  onSimulateAlert?: () => void;
}

interface DeptAlertSeries {
  id: string;
  department: string;
  shortLabel: string;
  category: string;
  color: string;
  monthlyCounts: number[];
}

const ALERT_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const BASE_DEPT_ALERT_SERIES: DeptAlertSeries[] = [
  {
    id: 'health',
    department: 'Health Department',
    shortLabel: 'Health Dept',
    category: 'Healthcare',
    color: '#2563eb',
    monthlyCounts: [142, 156, 168, 175, 189, 204, 218, 234, 249, 268, 284, 312],
  },
  {
    id: 'water',
    department: 'Water Resources',
    shortLabel: 'Water Resources',
    category: 'Water',
    color: '#0d9488',
    monthlyCounts: [118, 124, 131, 140, 152, 169, 188, 210, 226, 215, 204, 219],
  },
  {
    id: 'pwd',
    department: 'Public Works (Roads)',
    shortLabel: 'Public Works',
    category: 'Roads',
    color: '#d97706',
    monthlyCounts: [96, 104, 112, 119, 126, 134, 145, 158, 176, 194, 208, 224],
  },
  {
    id: 'education',
    department: 'Education Department',
    shortLabel: 'Education Dept',
    category: 'Education',
    color: '#7c3aed',
    monthlyCounts: [64, 68, 72, 78, 84, 91, 96, 102, 114, 122, 129, 138],
  },
  {
    id: 'energy',
    department: 'Energy Department',
    shortLabel: 'Energy Dept',
    category: 'Electricity',
    color: '#dc2626',
    monthlyCounts: [52, 58, 61, 67, 73, 82, 95, 112, 124, 118, 114, 126],
  },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  uiLanguage,
  onNavigate,
  activeRole = 'National Policymaker',
  notifications = INITIAL_NOTIFICATIONS,
  roleFilteredNotifications,
  onOpenAlert,
  onSimulateAlert,
}) => {
  const t = TRANSLATIONS[uiLanguage].analytics;
  const roleProfile = RBAC_PROFILES[activeRole];

  const [dateRange, setDateRange] = useState<string>('FY 2026–27 (Oct–Sep)');
  const [stateFilter, setStateFilter] = useState<string>(
    activeRole === 'State Administrator' ? 'Maharashtra' : 'All'
  );
  const [districtFilter, setDistrictFilter] = useState<string>(
    activeRole === 'District Officer' ? 'Pune' : 'All'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    activeRole === 'Department Officer' ? 'Healthcare' : 'All'
  );
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const [categoryViewMode, setCategoryViewMode] = useState<'bar' | 'donut'>('bar');
  const [deptViewMode, setDeptViewMode] = useState<'graph' | 'table'>('graph');

  // Alert Trends interactive states (synced automatically when activeRole changes)
  const [alertTrendRoleScope, setAlertTrendRoleScope] = useState<UserRole>(activeRole);
  const [alertDeptFilter, setAlertDeptFilter] = useState<string>('All');
  const [alertChartMode, setAlertChartMode] = useState<'stacked' | 'lines' | 'table'>('stacked');
  const [selectedAlertMonthIdx, setSelectedAlertMonthIdx] = useState<number>(11); // Default to Sep (latest)

  useEffect(() => {
    setAlertTrendRoleScope(activeRole);
    if (activeRole === 'State Administrator') {
      setStateFilter('Maharashtra');
    } else {
      setStateFilter('All');
    }
    if (activeRole === 'District Officer') {
      setDistrictFilter('Pune');
    } else {
      setDistrictFilter('All');
    }
    if (activeRole === 'Department Officer') {
      setCategoryFilter('Healthcare');
      setAlertDeptFilter('Health Department');
    } else {
      setCategoryFilter('All');
      setAlertDeptFilter('All');
    }
  }, [activeRole]);

  // Dynamic multiplier so filters visibly update the charts
  const dateFactor =
    dateRange === 'Last 30 Days' ? 0.12 : dateRange === 'Last 6 Months' ? 0.54 : 1.0;
  const stateFactor = stateFilter === 'All' ? 1.0 : 0.18;
  const severityFactor =
    severityFilter === 'Critical'
      ? 0.24
      : severityFilter === 'High'
      ? 0.38
      : severityFilter === 'Moderate'
      ? 0.26
      : 1.0;
  const scale = dateFactor * stateFactor * severityFactor;

  const regionGaps = [
    { region: 'East Zone', states: 'BR, OD, JH, WB', gapScore: 81, requests: '3.4M', color: '#dc2626' },
    { region: 'Northeast Zone', states: 'AS, ML, MN, TR', gapScore: 79, requests: '1.1M', color: '#dc2626' },
    { region: 'North Zone', states: 'UP, RJ, JK, PB', gapScore: 76, requests: '3.8M', color: '#f59e0b' },
    { region: 'Central Zone', states: 'MP, CT', gapScore: 75, requests: '1.6M', color: '#f59e0b' },
    { region: 'West Zone', states: 'MH, GJ, GA', gapScore: 68, requests: '1.8M', color: '#2563eb' },
    { region: 'South Zone', states: 'TN, KA, TG, AP, KL', gapScore: 59, requests: '1.1M', color: '#0d9488' },
  ];

  const resolutionBreakdown = [
    {
      label: 'Resolved & Commissioned',
      value: Math.round(5142000 * scale),
      sharePct: 40,
      color: '#059669',
      sublabel: `${((5.14 * scale)).toFixed(2)}M`,
    },
    {
      label: 'In Progress / Work Order',
      value: Math.round(3340000 * scale),
      sharePct: 26,
      color: '#0d9488',
      sublabel: `${((3.34 * scale)).toFixed(2)}M`,
    },
    {
      label: 'Assigned to Department',
      value: Math.round(2440000 * scale),
      sharePct: 19,
      color: '#2563eb',
      sublabel: `${((2.44 * scale)).toFixed(2)}M`,
    },
    {
      label: 'Under AI & Collector Review',
      value: Math.round(1412910 * scale),
      sharePct: 11,
      color: '#f59e0b',
      sublabel: `${((1.41 * scale)).toFixed(2)}M`,
    },
    {
      label: 'New / Pending Verification',
      value: Math.round(508000 * scale),
      sharePct: 4,
      color: '#64748b',
      sublabel: `${((0.51 * scale)).toFixed(2)}M`,
    },
  ];

  const filteredCategories = ANALYTICS_SERIES.byCategory.filter(
    (c) => categoryFilter === 'All' || c.category === categoryFilter
  );

  const scaledTimeSeries = ANALYTICS_SERIES.overTime.map((pt) => ({
    month: pt.month,
    requests: Math.max(12000, Math.round(pt.requests * scale)),
    resolved: Math.max(8500, Math.round(pt.resolved * scale)),
  }));

  const handleResetFilters = () => {
    setDateRange('FY 2026–27 (Oct–Sep)');
    setStateFilter('All');
    setDistrictFilter('All');
    setCategoryFilter('All');
    setSeverityFilter('All');
  };

  // Compute role-filtered notifications for the selected Alert Trends role lens
  const filterNotificationsForRole = (targetRole: UserRole): PlatformNotification[] => {
    if (targetRole === activeRole && roleFilteredNotifications) {
      return roleFilteredNotifications;
    }
    return notifications.filter((n) => {
      if (n.allowedRoles && !n.allowedRoles.includes(targetRole)) {
        return false;
      }
      switch (targetRole) {
        case 'Citizen':
          return (
            n.allowedRoles?.includes('Citizen') ||
            n.targetModule === 'citizen-requests' ||
            n.targetModule === 'public-updates'
          );
        case 'District Officer':
          return Boolean(n.district && n.district.toLowerCase().includes('pune'));
        case 'Department Officer':
          return Boolean(
            n.category === 'Healthcare' ||
              (n.department && n.department.toLowerCase().includes('health'))
          );
        case 'State Administrator':
          return Boolean(
            n.state === 'Maharashtra' ||
              (n.district &&
                (n.district.toLowerCase().includes('pune') ||
                  n.district.toLowerCase().includes('gadchiroli') ||
                  n.district.toLowerCase().includes('nandurbar')))
          );
        case 'National Policymaker':
          return !n.allowedRoles || n.allowedRoles.includes('National Policymaker');
        case 'System Administrator':
          return Boolean(
            n.allowedRoles?.includes('System Administrator') || n.targetModule.startsWith('sys-')
          );
        default:
          return true;
      }
    });
  };

  const scopedLiveNotifications = filterNotificationsForRole(alertTrendRoleScope);
  const activeLensProfile = RBAC_PROFILES[alertTrendRoleScope];

  // Role-based scaling & departmental filtering for the 12-month Alert Trends series
  const getRoleDeptMultiplier = (role: UserRole, deptName: string): number => {
    switch (role) {
      case 'Citizen':
        // Citizen only sees their own locality/request alerts (minimal volume, mostly Health in Pune)
        return deptName === 'Health Department' ? 0.04 : 0.01;
      case 'District Officer':
        // Pune District Officer sees Pune District alerts across departments (strong Healthcare & Water focus)
        return deptName === 'Health Department'
          ? 0.22
          : deptName === 'Water Resources'
          ? 0.18
          : 0.14;
      case 'Department Officer':
        // Health Department Officer strictly receives Health Department alerts (100% Health, 0% unrelated departments)
        return deptName === 'Health Department' ? 0.68 : 0;
      case 'State Administrator':
        // Maharashtra State Administrator sees Maharashtra state-level alerts across all 5 line departments
        return 0.42;
      case 'System Administrator':
        // System Administrator sees governance/security/dataset routing alerts
        return 0.15;
      case 'National Policymaker':
      default:
        // National Policymaker sees 100% national & cross-state departmental alert volume
        return 1.0;
    }
  };

  const roleScopedDeptSeries = BASE_DEPT_ALERT_SERIES.map((series) => {
    const mult = getRoleDeptMultiplier(alertTrendRoleScope, series.department) * dateFactor * severityFactor;
    // Count how many live notifications in the current role scope belong to this department
    const liveDeptBoost = scopedLiveNotifications.filter(
      (n) =>
        (n.department && n.department.toLowerCase().includes(series.shortLabel.split(' ')[0].toLowerCase())) ||
        n.category === series.category
    ).length;

    const scaledCounts = series.monthlyCounts.map((baseVal, idx) => {
      if (mult === 0) return 0;
      const computed = Math.max(1, Math.round(baseVal * mult));
      // Add live session notification boost to the most recent month (Sep)
      return idx === 11 ? computed + liveDeptBoost : computed;
    });

    const totalAlerts = scaledCounts.reduce((acc, v) => acc + v, 0);
    const prevMonth = scaledCounts[10] || 1;
    const currMonth = scaledCounts[11] || 0;
    const growthPct = mult === 0 ? 0 : Math.round(((currMonth - prevMonth) / prevMonth) * 100);

    return {
      ...series,
      monthlyCounts: scaledCounts,
      totalAlerts,
      liveCount: liveDeptBoost,
      growthPct,
      isRestrictedForRole: mult === 0,
    };
  }).filter(
    (s) =>
      !s.isRestrictedForRole &&
      (alertDeptFilter === 'All' || s.department === alertDeptFilter)
  );

  const totalScopedAlertsOverTime = roleScopedDeptSeries.reduce(
    (sum, s) => sum + s.totalAlerts,
    0
  );

  const monthlyTotals = ALERT_MONTHS.map((m, mIdx) => {
    const byDept = roleScopedDeptSeries.map((s) => ({
      id: s.id,
      department: s.department,
      shortLabel: s.shortLabel,
      color: s.color,
      count: s.monthlyCounts[mIdx] || 0,
    }));
    const total = byDept.reduce((acc, d) => acc + d.count, 0);
    return { month: m, total, byDept };
  });

  const maxMonthlyAlertTotal = Math.max(...monthlyTotals.map((m) => m.total), 10);
  const selectedMonthDetail = monthlyTotals[selectedAlertMonthIdx] || monthlyTotals[11];

  return (
    <div className="space-y-8 pb-12">
      {/* ROLE & JURISDICTION ANALYTICS SCOPE BANNER */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-base">{roleProfile.icon}</span>
          <span className="font-bold text-blue-700">{roleProfile.scopeBadge}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600">{roleProfile.aiInsightCallout}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 font-mono font-semibold">
            {scopedLiveNotifications.length} Role-Filtered Live Alerts
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-200/70 text-blue-800 font-semibold">
            Active Role: {activeRole}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest font-semibold text-blue-700">{t.badge}</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-1.5">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Simulated National Dataset · {(12842910 * scale).toLocaleString(undefined, { maximumFractionDigits: 0 })} Records Indexed
        </div>
      </div>

      {/* 5 Interactive Filters */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Analytics Filters:</span>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            <option value="FY 2026–27 (Oct–Sep)">Date: FY 2026–27 (12 Months)</option>
            <option value="Last 6 Months">Date: Last 6 Months</option>
            <option value="Last 30 Days">Date: Last 30 Days</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            <option value="All">State: All 36 States & UTs</option>
            {STATES_INTELLIGENCE.map((s) => (
              <option key={s.code} value={s.name}>
                State: {s.name}
              </option>
            ))}
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            <option value="All">District: All 742 Districts</option>
            {DISTRICT_HOTSPOTS.map((d) => (
              <option key={d.id} value={d.district}>
                District: {d.district}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            <option value="All">Category: All Sectors</option>
            {INFRASTRUCTURE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800"
          >
            <option value="All">Severity: All Priority Bands</option>
            <option value="Critical">Severity: Critical (85–100)</option>
            <option value="High">Severity: High (70–84)</option>
            <option value="Moderate">Severity: Moderate (50–69)</option>
          </select>
        </div>

        {(dateRange !== 'FY 2026–27 (Oct–Sep)' ||
          stateFilter !== 'All' ||
          districtFilter !== 'All' ||
          categoryFilter !== 'All' ||
          severityFilter !== 'All') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* EXECUTIVE GRAPH KPI STRIP WITH INLINE SPARKLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Indexed Citizen Submissions',
            value: `${(12.84 * scale).toFixed(2)}M`,
            delta: '+18.4% YoY',
            color: '#2563eb',
            spark: [38, 44, 42, 51, 56, 62, 68, 74, 79, 85, 92, 98],
          },
          {
            title: 'National Resolution Efficiency',
            value: '78.4%',
            delta: '+6.2% vs Q2',
            color: '#0d9488',
            spark: [52, 55, 58, 60, 63, 66, 68, 71, 73, 75, 77, 78],
          },
          {
            title: 'Mean Multi-Sector Gap Index',
            value: '73.2 / 100',
            delta: '178 Critical Districts',
            color: '#dc2626',
            spark: [82, 81, 80, 79, 78, 77, 76, 76, 75, 74, 74, 73],
          },
          {
            title: 'Active Sanctioned Interventions',
            value: `${Math.round(1420 * scale).toLocaleString()}`,
            delta: '₹14,280 Cr Outlay',
            color: '#059669',
            spark: [22, 29, 35, 41, 48, 54, 63, 70, 76, 84, 91, 96],
          },
        ].map((card) => {
          const pts = card.spark
            .map((v, i) => `${(i / 11) * 120},${34 - (v / 100) * 28}`)
            .join(' ');
          return (
            <div
              key={card.title}
              className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">{card.title}</div>
                <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-950 mt-2">
                  {card.value}
                </div>
                <div
                  className="text-[11px] font-mono font-semibold mt-1.5"
                  style={{ color: card.color }}
                >
                  {card.delta}
                </div>
              </div>
              <svg width="110" height="38" viewBox="0 0 120 38" className="shrink-0 overflow-visible">
                <polyline
                  fill="none"
                  stroke={card.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pts}
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* ROW 1: (1) REQUESTS BY CATEGORY + (2) REQUESTS BY STATE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Requests by Category (Bar / Donut Switchable Graph) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Requests by Infrastructure Category
              </h2>
              <p className="text-xs text-slate-500">
                National distribution across primary sectors with Gap Score benchmark
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setCategoryViewMode('bar')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                  categoryViewMode === 'bar'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Calibrated Bars
              </button>
              <button
                type="button"
                onClick={() => setCategoryViewMode('donut')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                  categoryViewMode === 'donut'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Donut Share
              </button>
            </div>
          </div>

          {categoryViewMode === 'bar' ? (
            <CalibratedHorizontalBarChart
              items={filteredCategories.map((item) => ({
                id: item.category,
                label: item.category,
                badge: `Avg Gap ${item.gapAvg}/100`,
                value: Math.round(item.requests * scale),
                maxValue: Math.round(3500000 * scale),
                formattedValue: `${((item.requests * scale) / 1000000).toFixed(2)}M (${item.sharePct}%)`,
                color: item.color,
              }))}
              benchmarkValue={Math.round(1600000 * scale)}
              benchmarkLabel="Sector Mean"
            />
          ) : (
            <InteractiveDonutChart
              segments={filteredCategories.map((item) => ({
                label: item.category,
                value: Math.round(item.requests * scale),
                sharePct: item.sharePct,
                color: item.color,
                sublabel: `${((item.requests * scale) / 1000000).toFixed(2)}M`,
              }))}
              centerTitle="Total Indexed"
              centerValue={`${(12.84 * scale).toFixed(1)}M`}
            />
          )}
        </div>

        {/* 2. Requests by State (Top 8 Calibrated Horizontal Bar Graph) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Requests by State (Top 8)</h2>
              <p className="text-xs text-slate-500">
                Active monthly clustered submissions, top deficit sector, and priority areas
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">State Telemetry</span>
          </div>

          <CalibratedHorizontalBarChart
            items={[...STATES_INTELLIGENCE]
              .sort((a, b) => b.citizenRequests - a.citizenRequests)
              .slice(0, 8)
              .map((st) => ({
                id: st.code,
                label: st.name,
                badge: st.topDemand,
                value: Math.round(st.citizenRequests * scale),
                maxValue: Math.round(320000 * scale),
                formattedValue: `${Math.round(st.citizenRequests * scale).toLocaleString()}`,
                secondaryLabel: `${st.priorityAreas} priority areas`,
                color:
                  st.infrastructureGap === 'High'
                    ? '#dc2626'
                    : st.infrastructureGap === 'Medium'
                    ? '#2563eb'
                    : '#0d9488',
              }))}
            benchmarkValue={Math.round(165000 * scale)}
            benchmarkLabel="National State Mean"
          />
        </div>
      </div>

      {/* ROW 2: (3) REQUESTS OVER TIME + (4) PRIORITY DISTRIBUTION DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3. Requests Over Time (Interactive Spline Area / Grouped Bar / Clearance Rate Graph) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                3. Citizen Requests vs. Resolved Cases Over Time (12 Months)
              </h2>
              <p className="text-xs text-slate-500">
                Interactive monthly intake volume (Blue) compared against completed interventions
                (Teal)
              </p>
            </div>
          </div>

          <InteractiveTimeSeriesChart data={scaledTimeSeries} height={275} />
        </div>

        {/* 4. Priority Distribution across 742 Districts (Interactive Donut Graph) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">4. Priority Score Distribution</h2>
            <p className="text-xs text-slate-500">
              Classification of 742 analyzed districts by Priority Score band
            </p>
          </div>

          <InteractiveDonutChart
            size={195}
            centerTitle="Analyzed"
            centerValue="742 Dist."
            segments={ANALYTICS_SERIES.priorityDistribution.map((b) => ({
              label: b.band,
              value: b.districts,
              sharePct: b.percentage,
              color: b.color,
              sublabel: `${b.districts} dist`,
            }))}
          />
        </div>
      </div>

      {/* ROW 3: (5) INFRASTRUCTURE GAP BY REGION COLUMN GRAPH + (6) DEMAND VS INVESTMENT GRAPH + (7) TOP EMERGING HOTSPOTS SPARKLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5. Infrastructure Gap by Region (Calibrated Vertical Column SVG Chart) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">5. Infrastructure Gap by Region</h2>
            <p className="text-xs text-slate-500">
              Mean multi-sector gap index across 6 national zones (vs. 73/100 Mean)
            </p>
          </div>

          {/* Vertical SVG Column Graph with National Mean Line */}
          <svg viewBox="0 0 360 210" className="w-full h-auto select-none" role="img" aria-label="Regional Infrastructure Gap Chart">
            {[0, 25, 50, 75, 100].map((val) => {
              const y = 170 - (val / 100) * 140;
              return (
                <g key={val}>
                  <line
                    x1="32"
                    y1={y}
                    x2="348"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={val === 0 ? undefined : '3 3'}
                  />
                  <text
                    x="26"
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* National Mean Line at 73 */}
            <line
              x1="32"
              y1={170 - 0.73 * 140}
              x2="348"
              y2={170 - 0.73 * 140}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x="346"
              y={170 - 0.73 * 140 - 4}
              textAnchor="end"
              fill="#b45309"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              Mean 73/100
            </text>

            {regionGaps.map((rg, idx) => {
              const colW = 32;
              const x = 44 + idx * 51;
              const h = (rg.gapScore / 100) * 140;
              const y = 170 - h;
              return (
                <g key={rg.region}>
                  <rect x={x} y={y} width={colW} height={h} fill={rg.color} rx="4" />
                  <text
                    x={x + colW / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {rg.gapScore}
                  </text>
                  <text
                    x={x + colW / 2}
                    y="186"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {rg.region.replace(' Zone', '')}
                  </text>
                  <text
                    x={x + colW / 2}
                    y="198"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {rg.requests}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 6. Demand vs Investment Quadrant Visual Distribution Graph */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              6. Demand vs. Investment Alignment
            </h2>
            <p className="text-xs text-slate-500">
              Proportional quadrant distribution across all 742 districts
            </p>
          </div>

          {/* Stacked Marimekko / Proportional Bar + Visual Matrix */}
          <div className="space-y-3">
            <div className="w-full h-5 rounded-lg overflow-hidden flex border border-slate-200">
              <div
                className="bg-red-600 h-full"
                style={{ width: '20%' }}
                title="Potential Unmet Need: 148 Districts (20%)"
              />
              <div
                className="bg-blue-600 h-full"
                style={{ width: '25%' }}
                title="Active Development: 184 Districts (25%)"
              />
              <div
                className="bg-teal-600 h-full"
                style={{ width: '28.5%' }}
                title="Existing Investment: 212 Districts (28.5%)"
              />
              <div
                className="bg-slate-400 h-full"
                style={{ width: '26.5%' }}
                title="Lower Observed Demand: 198 Districts (26.5%)"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                {
                  title: 'Potential Unmet Need',
                  count: 148,
                  pct: '20.0%',
                  sub: 'High Demand · Low Inv.',
                  barColor: 'bg-red-600',
                  boxTone: 'bg-red-50/60 border-red-200 text-red-800',
                },
                {
                  title: 'Active Development',
                  count: 184,
                  pct: '24.8%',
                  sub: 'High Demand · High Inv.',
                  barColor: 'bg-blue-600',
                  boxTone: 'bg-blue-50/60 border-blue-200 text-blue-800',
                },
                {
                  title: 'Existing Investment',
                  count: 212,
                  pct: '28.6%',
                  sub: 'Low Demand · High Inv.',
                  barColor: 'bg-teal-600',
                  boxTone: 'bg-teal-50/60 border-teal-200 text-teal-800',
                },
                {
                  title: 'Lower Demand',
                  count: 198,
                  pct: '26.6%',
                  sub: 'Low Demand · Low Inv.',
                  barColor: 'bg-slate-500',
                  boxTone: 'bg-slate-50 border-slate-200 text-slate-800',
                },
              ].map((q) => (
                <div key={q.title} className={`p-3 rounded-lg border ${q.boxTone} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">{q.title}</span>
                    <span className="font-mono text-[10px] font-bold">{q.pct}</span>
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums">
                    {q.count} <span className="text-[10px] font-normal">districts</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                    <div className={`h-full ${q.barColor}`} style={{ width: q.pct }} />
                  </div>
                  <div className="text-[10px] text-slate-600">{q.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('demand-hotspots')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Open Interactive Quadrant Scatter Plot
          </button>
        </div>

        {/* 7. Top Emerging Hotspots with 6-Month Velocity Sparkline Curves */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              7. Top Emerging Hotspots (30d Velocity)
            </h2>
            <p className="text-xs text-slate-500">
              Fastest-growing citizen request clusters with 6-month trajectory
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {DISTRICT_HOTSPOTS.slice(0, 5).map((h, i) => {
              const sparkVals = [
                40 + i * 3,
                48 + i * 2,
                55 + i * 4,
                67 + i * 2,
                81 + i,
                96,
              ];
              const sparkPts = sparkVals
                .map((v, idx) => `${(idx / 5) * 70},${26 - (v / 100) * 22}`)
                .join(' ');
              return (
                <div
                  key={h.id}
                  onClick={() => onNavigate('demand-hotspots', h.id)}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">
                      {h.district}{' '}
                      <span className="text-slate-500 font-normal">· {h.mainIssue}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                      {h.requestCount.toLocaleString()} req · Priority {h.priorityScore}/100
                    </div>
                  </div>

                  {/* Mini Trajectory Sparkline */}
                  <svg width="72" height="28" viewBox="0 0 72 28" className="shrink-0">
                    <polyline
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                      points={sparkPts}
                    />
                  </svg>

                  <span className="font-mono font-bold text-red-700 tabular-nums shrink-0">
                    +{h.trendPercent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 10: ROLE-FILTERED ALERT TRENDS — DEPARTMENTAL NOTIFICATION ROUTING OVER TIME */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                <Bell className="w-3.5 h-3.5" />
                <span>Alert Trends · Role-Filtered Notification Telemetry</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-teal-300 font-mono text-[11px] font-semibold">
                {activeLensProfile.icon} Scope: {activeLensProfile.scopeBadge}
              </span>
              {alertTrendRoleScope === 'Department Officer' && (
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                  🔒 Non-Health Department Alerts Restricted
                </span>
              )}
              {alertTrendRoleScope === 'District Officer' && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                  📍 Scoped to Pune District Alert Stream
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              10. Alert Trends: Role-Filtered Departmental Notification Routing Over Time
            </h2>
            <p className="text-xs text-slate-600">
              Visualizes monthly notification frequency routed to specific line departments based on{' '}
              <strong className="text-slate-900">{alertTrendRoleScope}</strong> jurisdiction &
              departmental permissions.
            </p>
          </div>

          {/* Interactive Role Scope Lens, Department Filter & Chart Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-600 font-medium">Role Filter:</span>
              <select
                value={alertTrendRoleScope}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  setAlertTrendRoleScope(nextRole);
                  if (nextRole === 'Department Officer') {
                    setAlertDeptFilter('Health Department');
                  } else {
                    setAlertDeptFilter('All');
                  }
                }}
                aria-label="Filter Alert Trends by Role Scope"
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {r} {r === activeRole ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={alertDeptFilter}
              onChange={(e) => setAlertDeptFilter(e.target.value)}
              aria-label="Filter Alert Trends by Target Department"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="All">All Authorized Departments</option>
              {BASE_DEPT_ALERT_SERIES.map((d) => (
                <option
                  key={d.id}
                  value={d.department}
                  disabled={
                    alertTrendRoleScope === 'Department Officer' &&
                    d.department !== 'Health Department'
                  }
                >
                  {d.department}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              {(
                [
                  { id: 'stacked', label: 'Stacked Timeline' },
                  { id: 'lines', label: 'Dept Trend Lines' },
                  { id: 'table', label: 'Routing Matrix' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setAlertChartMode(mode.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${
                    alertChartMode === mode.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Alert Trends Grid: Left 8-Col Time-Series Graph + Right 4-Col Departmental Routing Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Interactive SVG Departmental Alert Frequency Chart */}
          <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-900">
                  Monthly Alerts Routed by Department (Oct 2025 – Sep 2026)
                </span>
                <span className="text-slate-500 ml-2 font-mono">
                  Total Scoped Volume: {totalScopedAlertsOverTime.toLocaleString()} alerts
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {roleScopedDeptSeries.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium text-slate-700">{s.shortLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {alertChartMode === 'stacked' && (
              <svg
                viewBox="0 0 680 250"
                className="w-full h-auto select-none overflow-visible"
                role="img"
                aria-label="Role-Filtered Departmental Alert Frequency Stacked Bar Chart"
              >
                {/* Horizontal Reference Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 205 - ratio * 170;
                  const val = Math.round(maxMonthlyAlertTotal * ratio);
                  return (
                    <g key={idx}>
                      <line
                        x1="44"
                        y1={y}
                        x2="664"
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray={ratio === 0 ? undefined : '3 3'}
                      />
                      <text
                        x="38"
                        y={y + 3}
                        textAnchor="end"
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* 12 Monthly Stacked Departmental Columns */}
                {monthlyTotals.map((mItem, mIdx) => {
                  const colWidth = 30;
                  const x = 58 + mIdx * 51;
                  const isSelected = selectedAlertMonthIdx === mIdx;
                  let currentBottomY = 205;

                  return (
                    <g
                      key={mItem.month}
                      onClick={() => setSelectedAlertMonthIdx(mIdx)}
                      onMouseEnter={() => setSelectedAlertMonthIdx(mIdx)}
                      className="cursor-pointer"
                    >
                      {/* Hover/Selection Column Highlight */}
                      {isSelected && (
                        <rect
                          x={x - 6}
                          y="24"
                          width={colWidth + 12}
                          height="186"
                          rx="6"
                          fill="#e2e8f0"
                          opacity="0.45"
                        />
                      )}

                      {mItem.byDept.map((dSeg) => {
                        const segHeight =
                          maxMonthlyAlertTotal > 0
                            ? (dSeg.count / maxMonthlyAlertTotal) * 170
                            : 0;
                        const segY = currentBottomY - segHeight;
                        currentBottomY = segY;
                        return (
                          <rect
                            key={dSeg.id}
                            x={x}
                            y={segY}
                            width={colWidth}
                            height={Math.max(0, segHeight)}
                            fill={dSeg.color}
                            rx="1.5"
                          />
                        );
                      })}

                      {/* Top Total Value Label */}
                      <text
                        x={x + colWidth / 2}
                        y={Math.max(18, currentBottomY - 6)}
                        textAnchor="middle"
                        fill={isSelected ? '#0f172a' : '#475569'}
                        fontSize="9.5"
                        fontWeight={isSelected ? '700' : '600'}
                        fontFamily="monospace"
                      >
                        {mItem.total}
                      </text>

                      {/* Month X-Axis Label */}
                      <text
                        x={x + colWidth / 2}
                        y="224"
                        textAnchor="middle"
                        fill={isSelected ? '#1d4ed8' : '#334155'}
                        fontSize="10.5"
                        fontWeight={isSelected ? '700' : '600'}
                      >
                        {mItem.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {alertChartMode === 'lines' && (
              <svg
                viewBox="0 0 680 250"
                className="w-full h-auto select-none overflow-visible"
                role="img"
                aria-label="Departmental Alert Frequency Multi-Line Trend Chart"
              >
                {(() => {
                  const maxSingleDept = Math.max(
                    ...roleScopedDeptSeries.flatMap((s) => s.monthlyCounts),
                    10
                  );
                  return (
                    <>
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 205 - ratio * 170;
                        const val = Math.round(maxSingleDept * ratio);
                        return (
                          <g key={idx}>
                            <line
                              x1="44"
                              y1={y}
                              x2="664"
                              y2={y}
                              stroke="#e2e8f0"
                              strokeDasharray={ratio === 0 ? undefined : '3 3'}
                            />
                            <text
                              x="38"
                              y={y + 3}
                              textAnchor="end"
                              fill="#64748b"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Vertical active month cursor */}
                      <line
                        x1={73 + selectedAlertMonthIdx * 51}
                        y1="28"
                        x2={73 + selectedAlertMonthIdx * 51}
                        y2="205"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />

                      {roleScopedDeptSeries.map((series) => {
                        const pts = series.monthlyCounts.map((cnt, mIdx) => {
                          const x = 73 + mIdx * 51;
                          const y = 205 - (cnt / maxSingleDept) * 170;
                          return { x, y, cnt, mIdx };
                        });
                        const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
                        return (
                          <g key={series.id}>
                            <polyline
                              fill="none"
                              stroke={series.color}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={polyPoints}
                            />
                            {pts.map((p) => (
                              <circle
                                key={p.mIdx}
                                cx={p.x}
                                cy={p.y}
                                r={selectedAlertMonthIdx === p.mIdx ? 5 : 3}
                                fill={series.color}
                                stroke="#ffffff"
                                strokeWidth="1.5"
                                className="cursor-pointer"
                                onClick={() => setSelectedAlertMonthIdx(p.mIdx)}
                                onMouseEnter={() => setSelectedAlertMonthIdx(p.mIdx)}
                              />
                            ))}
                          </g>
                        );
                      })}

                      {ALERT_MONTHS.map((m, mIdx) => {
                        const x = 73 + mIdx * 51;
                        const isSelected = selectedAlertMonthIdx === mIdx;
                        return (
                          <text
                            key={m}
                            x={x}
                            y="224"
                            textAnchor="middle"
                            fill={isSelected ? '#1d4ed8' : '#334155'}
                            fontSize="10.5"
                            fontWeight={isSelected ? '700' : '600'}
                            className="cursor-pointer"
                            onClick={() => setSelectedAlertMonthIdx(mIdx)}
                          >
                            {m}
                          </text>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}

            {alertChartMode === 'table' && (
              <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-2.5 px-3 font-semibold">Target Department</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Q1 (Oct–Dec)</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Q2 (Jan–Mar)</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Q3 (Apr–Jun)</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Q4 (Jul–Sep)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">12M Routed</th>
                      <th className="py-2.5 px-3 font-semibold text-right">30d Velocity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 font-mono tabular-nums">
                    {roleScopedDeptSeries.map((s) => {
                      const q1 = s.monthlyCounts.slice(0, 3).reduce((a, b) => a + b, 0);
                      const q2 = s.monthlyCounts.slice(3, 6).reduce((a, b) => a + b, 0);
                      const q3 = s.monthlyCounts.slice(6, 9).reduce((a, b) => a + b, 0);
                      const q4 = s.monthlyCounts.slice(9, 12).reduce((a, b) => a + b, 0);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-xs shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <span>{s.department}</span>
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-600">{q1}</td>
                          <td className="py-2.5 px-2 text-right text-slate-600">{q2}</td>
                          <td className="py-2.5 px-2 text-right text-slate-700">{q3}</td>
                          <td className="py-2.5 px-2 text-right font-semibold text-slate-900">
                            {q4}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                            {s.totalAlerts.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                            +{s.growthPct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Interactive Selected Month Breakdown Bar */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono font-bold">
                  {selectedMonthDetail.month} 2026
                </span>
                <span className="font-semibold">
                  {selectedMonthDetail.total} Role-Scoped Alerts Routed:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                {selectedMonthDetail.byDept.map((d) => (
                  <span key={d.id} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-slate-300">{d.shortLabel}:</span>
                    <strong className="text-white">{d.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Departmental Routing Breakdown & Live Role-Filtered Feed */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Alerts Routed by Department
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    12-month cumulative volume ({alertTrendRoleScope})
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {totalScopedAlertsOverTime.toLocaleString()} total
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {roleScopedDeptSeries.map((dept) => {
                  const sharePct =
                    totalScopedAlertsOverTime > 0
                      ? Math.round((dept.totalAlerts / totalScopedAlertsOverTime) * 100)
                      : 0;
                  return (
                    <div
                      key={dept.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200/90 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: dept.color }}
                          />
                          <span className="font-bold text-slate-900 truncate">
                            {dept.department}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          {dept.totalAlerts.toLocaleString()} ({sharePct}%)
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(4, sharePct)}%`,
                            backgroundColor: dept.color,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Live Queue: {dept.liveCount} active alert(s)</span>
                        <span className="text-emerald-700 font-semibold">
                          +{dept.growthPct}% MoM
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Role-Filtered Alerts Routed to Departments */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">
                  Live Role-Scoped Alert Stream ({scopedLiveNotifications.length})
                </span>
                <div className="flex items-center gap-2">
                  {onSimulateAlert && (
                    <button
                      type="button"
                      onClick={onSimulateAlert}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-teal-300" />
                      <span>+ Test Alert</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate('department-actions')}
                    className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Dept Queue</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {scopedLiveNotifications.slice(0, 6).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (onOpenAlert) {
                        onOpenAlert(notif);
                      } else {
                        onNavigate(notif.targetModule);
                      }
                    }}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                      notif.read
                        ? 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/80'
                        : 'bg-blue-50/40 hover:bg-blue-50/80 border-blue-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                        {notif.department || notif.scopeLabel || 'System Routing'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          {notif.timestamp}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900 leading-snug">
                      {notif.title}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {notif.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4: (8) DEPARTMENT WORKLOAD COMBO GRAPH + (9) RESOLUTION STATUS DONUT & FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 8. Department Workload & SLA Performance Graph */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                8. Department Workload & SLA Resolution Graph
              </h2>
              <p className="text-xs text-slate-500">
                Active clustered development cases (Blue) vs. SLA Resolution Rate % (Emerald)
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setDeptViewMode('graph')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                  deptViewMode === 'graph'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Combo Graph
              </button>
              <button
                type="button"
                onClick={() => setDeptViewMode('table')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer ${
                  deptViewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                SLA Table
              </button>
            </div>
          </div>

          {deptViewMode === 'graph' ? (
            <div className="space-y-3">
              {ANALYTICS_SERIES.departmentWorkload.map((dw) => {
                const maxCases = 450;
                const casePct = Math.min(100, Math.round((dw.activeCases / maxCases) * 100));
                return (
                  <div
                    key={dw.department}
                    className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{dw.department}</span>
                      <div className="flex items-center gap-4 font-mono tabular-nums">
                        <span className="text-blue-700 font-semibold">
                          {dw.activeCases} active clusters
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {dw.resolvedPct}% resolved
                        </span>
                        <span className="text-slate-500">SLA: {dw.avgDays}d</span>
                      </div>
                    </div>

                    {/* Dual Comparative Bar Track */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Active Case Load</span>
                          <span className="font-mono">{dw.activeCases}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${casePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Resolution Rate</span>
                          <span className="font-mono text-emerald-700">{dw.resolvedPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${dw.resolvedPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-semibold">Line Department</th>
                    <th className="py-2 px-3 font-semibold text-right">Active Clusters</th>
                    <th className="py-2 px-3 font-semibold text-right">Resolution Rate</th>
                    <th className="py-2 pl-3 font-semibold text-right">Mean Turnaround</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 font-mono tabular-nums">
                  {ANALYTICS_SERIES.departmentWorkload.map((dw) => (
                    <tr key={dw.department}>
                      <td className="py-2.5 pr-4 font-sans font-semibold text-slate-900">
                        {dw.department}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {dw.activeCases.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">
                        {dw.resolvedPct}%
                      </td>
                      <td className="py-2.5 pl-3 text-right text-slate-600">{dw.avgDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 9. National Resolution Status (Interactive Donut & Lifecycle Graph) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">9. National Resolution Lifecycle</h2>
            <p className="text-xs text-slate-500">
              End-to-end execution status across {(12.84 * scale).toFixed(2)}M citizen requests
            </p>
          </div>

          <InteractiveDonutChart
            size={200}
            centerTitle="Resolved"
            centerValue="40.0%"
            segments={resolutionBreakdown}
          />
        </div>
      </div>
    </div>
  );
};
