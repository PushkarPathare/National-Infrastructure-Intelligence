import React, { useState, useEffect } from 'react';
import {
  DevelopmentRecommendation,
  InfrastructureCategory,
  NavModule,
  SupportedLanguage,
  UserRole,
} from '../types/platform';
import { INFRASTRUCTURE_CATEGORIES, STATES_INTELLIGENCE } from '../data/nationalData';
import { TRANSLATIONS } from '../data/translations';
import { RBAC_PROFILES } from '../data/rbacData';
import {
  CheckCircle2,
  SlidersHorizontal,
  Send,
  FileSearch,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface RecommendationsViewProps {
  uiLanguage: SupportedLanguage;
  recommendations: DevelopmentRecommendation[];
  onSendToDepartment: (rec: DevelopmentRecommendation) => void;
  onSimulateRecommendation: (rec: DevelopmentRecommendation) => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  uiLanguage,
  recommendations,
  onSendToDepartment,
  onSimulateRecommendation,
  onNavigate,
  activeRole = 'National Policymaker',
}) => {
  const t = TRANSLATIONS[uiLanguage].recommendations;
  const roleProfile = RBAC_PROFILES[activeRole];

  const [stateFilter, setStateFilter] = useState<string>(
    activeRole === 'State Administrator' || activeRole === 'District Officer'
      ? 'Maharashtra'
      : 'All'
  );
  const [categoryFilter, setCategoryFilter] = useState<InfrastructureCategory | 'All'>(
    activeRole === 'Department Officer' ? 'Healthcare' : 'All'
  );
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>('rec-pune-health');
  const [reviewedIds, setReviewedIds] = useState<Record<string, boolean>>({});
  const [approvedIds, setApprovedIds] = useState<Record<string, boolean>>({});
  const [actionToast, setActionToast] = useState<string | null>(null);

  useEffect(() => {
    if (activeRole === 'State Administrator' || activeRole === 'District Officer') {
      setStateFilter('Maharashtra');
    } else {
      setStateFilter('All');
    }

    if (activeRole === 'Department Officer') {
      setCategoryFilter('Healthcare');
    } else {
      setCategoryFilter('All');
    }
  }, [activeRole]);

  const filteredRecs = recommendations.filter((rec) => {
    // Enforce District Officer jurisdiction to Pune District first (or Maharashtra if viewing state context)
    if (activeRole === 'District Officer' && rec.district !== 'Pune') {
      return false;
    }
    const matchState = stateFilter === 'All' || rec.state === stateFilter;
    const matchCat = categoryFilter === 'All' || rec.category === categoryFilter;
    return matchState && matchCat;
  });

  const totalCostCr = filteredRecs.reduce((acc, r) => acc + r.estimatedCostCr, 0);
  const totalBeneficiaries = filteredRecs.reduce((acc, r) => acc + r.estimatedBeneficiariesNum, 0);

  const perms = roleProfile.recommendationPermissions;
  const allowedActions: (
    | 'View Evidence'
    | 'Review'
    | 'Approve'
    | 'Assign'
    | 'Simulate Impact'
    | 'Track Impact'
  )[] = [
    ...(perms.canViewEvidence ? (['View Evidence'] as const) : []),
    ...(perms.canReview ? (['Review'] as const) : []),
    ...(perms.canApprove ? (['Approve'] as const) : []),
    ...(perms.canAssign ? (['Assign'] as const) : []),
    ...(perms.canSimulateImpact ? (['Simulate Impact'] as const) : []),
    ...(perms.canTrackImpact ? (['Track Impact'] as const) : []),
  ];

  const canPerformAction = (
    action: 'View Evidence' | 'Review' | 'Approve' | 'Assign' | 'Simulate Impact' | 'Track Impact'
  ) => allowedActions.includes(action);

  const triggerActionFeedback = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* ROLE-AWARE PERMISSIONS & JURISDICTION SCOPE BANNER */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <span className="text-2xl">{roleProfile.icon}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {roleProfile.scopeBadge}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold">
                Role: {activeRole}
              </span>
              {activeRole === 'District Officer' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 font-semibold">
                  👁 District-Level Recommendations (Pune District)
                </span>
              )}
              {activeRole === 'Department Officer' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 font-semibold">
                  ✏ Healthcare Department Review & Approval
                </span>
              )}
              {activeRole === 'State Administrator' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-semibold">
                  ✏ Maharashtra State Priority Review
                </span>
              )}
              {activeRole === 'National Policymaker' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-semibold">
                  ✓ Full National & Cross-State Policy Authority
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Allowed Recommendation Actions for <strong className="text-slate-900">{activeRole}</strong>:{' '}
              {allowedActions.map((act) => (
                <span
                  key={act}
                  className="inline-block ml-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-medium"
                >
                  {act}
                </span>
              ))}
            </p>
          </div>
        </div>

        {actionToast && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionToast}</span>
          </div>
        )}
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">{t.badge}</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            {activeRole === 'District Officer'
              ? 'Pune District Development Recommendations'
              : activeRole === 'Department Officer'
              ? 'Healthcare Department AI Recommendations'
              : activeRole === 'State Administrator'
              ? 'Maharashtra State Priority Recommendations'
              : t.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {activeRole !== 'District Officer' && (
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              aria-label="Filter Recommendations by State"
              className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-slate-800 font-semibold shadow-sm"
            >
              <option value="All">All States ({recommendations.length})</option>
              {STATES_INTELLIGENCE.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InfrastructureCategory | 'All')}
            aria-label="Filter Recommendations by Sector"
            className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-slate-800 font-semibold shadow-sm"
          >
            <option value="All">All Sectors</option>
            {INFRASTRUCTURE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Portfolio Summary Bar — Editorial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-1.5">
          <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-950">
            {filteredRecs.length} Priority Interventions
          </div>
          <div className="text-sm font-semibold text-slate-900">
            Recommended Projects in Active Scope
          </div>
          <div className="text-xs text-slate-500">
            Filtered by {roleProfile.scopeBadge}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-1.5">
          <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-blue-700">
            ₹{totalCostCr} Crore
          </div>
          <div className="text-sm font-semibold text-slate-900">Estimated Total Capital Outlay</div>
          <div className="text-xs text-slate-500">
            Aligned with central & state infrastructure grants
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-1.5">
          <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-teal-700">
            {(totalBeneficiaries / 1000).toFixed(0)},000+ Citizens
          </div>
          <div className="text-sm font-semibold text-slate-900">Projected Catchment Beneficiaries</div>
          <div className="text-xs text-slate-500">
            Direct village & taluka population coverage
          </div>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-8">
        {filteredRecs.map((rec) => {
          const isEvidenceOpen = expandedEvidenceId === rec.id;
          const isSent = rec.status === 'Sent to Department';
          const isApproved = approvedIds[rec.id] || rec.status === 'Approved';
          const isReviewed = reviewedIds[rec.id];

          return (
            <div
              key={rec.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-7 sm:p-9 shadow-sm space-y-6 hover:border-slate-300 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold">
                      {rec.category}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {rec.district} District, {rec.state}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">{rec.recommendedDepartment}</span>
                    {/* Subtle Access / Status Indicators (Section 15) */}
                    {isApproved ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold">
                        ✓ Approved
                      </span>
                    ) : isReviewed ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold">
                        ✓ Reviewed by {activeRole}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold">
                        ⚠ Requires Review
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">{rec.recommendedProject}</h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Problem Addressed: <strong className="text-slate-900">{rec.problemAddressed}</strong>
                  </p>
                </div>

                {/* Right Priority Score & Status */}
                <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-blue-700">
                      Priority Score: {rec.priorityScore}/100
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isSent || isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'bg-amber-50 text-amber-800 border border-amber-200/80'
                    }`}
                  >
                    {isApproved ? 'Approved for Implementation' : rec.status}
                  </span>
                </div>
              </div>

              {/* 5 Structured Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-base font-bold font-mono tabular-nums text-slate-950">
                    {rec.citizenDemandCount.toLocaleString()} requests
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Citizen Demand</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-base font-bold text-red-700">
                    {rec.infrastructureGap}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Infrastructure Gap</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-base font-bold text-slate-950">
                    {rec.existingInvestment}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Existing Investment</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-base font-bold font-mono tabular-nums text-teal-700">
                    {rec.estimatedBeneficiaries}
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Est. Beneficiaries</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="text-base font-bold font-mono tabular-nums text-blue-700">
                    ₹{rec.estimatedCostCr} Crore
                  </div>
                  <div className="text-slate-500 font-medium mt-1">Estimated Cost</div>
                </div>
              </div>

              {/* AI Reasoning Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs space-y-2">
                <div className="font-bold text-slate-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>AI Policy Synthesis & Justification</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rec.aiReasoning}</p>
              </div>

              {/* Expandable Evidence Drawer */}
              {isEvidenceOpen && (
                <div className="p-5 rounded-2xl bg-white text-slate-900 text-xs space-y-3 border border-slate-200/80 shadow-sm">
                  <div className="font-bold text-blue-700">
                    Verified Supporting Evidence & Ground Signals ({rec.district})
                  </div>
                  <ul className="space-y-2">
                    {rec.evidencePoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-mono font-bold">•</span>
                        <span className="text-slate-700">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ROLE-AWARE ACTION BUTTONS (Section 13: Only display actions allowed for the current role) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* 1. View Evidence */}
                  {canPerformAction('View Evidence') && (
                    <button
                      type="button"
                      onClick={() => setExpandedEvidenceId(isEvidenceOpen ? null : rec.id)}
                      className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSearch className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.btnViewEvidence}</span>
                      {isEvidenceOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* 2. Review */}
                  {canPerformAction('Review') && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewedIds((prev) => ({ ...prev, [rec.id]: true }));
                        triggerActionFeedback(
                          `Marked "${rec.recommendedProject}" as Reviewed by ${activeRole}.`
                        );
                      }}
                      className={`px-3 py-2 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer ${
                        isReviewed
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isReviewed ? 'Reviewed' : 'Review'}</span>
                    </button>
                  )}

                  {/* 3. Approve */}
                  {canPerformAction('Approve') && (
                    <button
                      type="button"
                      onClick={() => {
                        setApprovedIds((prev) => ({ ...prev, [rec.id]: true }));
                        triggerActionFeedback(
                          `Approved "${rec.recommendedProject}" under ${activeRole} authority.`
                        );
                      }}
                      className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
                        isApproved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproved ? '✓ Approved' : 'Approve'}</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* 4. Simulate Impact (National Policymaker Only) */}
                  {canPerformAction('Simulate Impact') ? (
                    <button
                      type="button"
                      onClick={() => onSimulateRecommendation(rec)}
                      className="px-3.5 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{t.btnSimulateImpact}</span>
                    </button>
                  ) : (
                    <span
                      title="Impact Simulator requires National Policymaker role"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 font-medium flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Simulate Impact (Policymaker Only)</span>
                    </span>
                  )}

                  {/* 5. Assign / Send to Department */}
                  {canPerformAction('Assign') && (
                    <button
                      type="button"
                      disabled={isSent}
                      onClick={() => {
                        onSendToDepartment(rec);
                        triggerActionFeedback(
                          `Assigned "${rec.recommendedProject}" to ${rec.recommendedDepartment}.`
                        );
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Assigned to Department</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Assign to Department</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* 6. Track Impact */}
                  {canPerformAction('Track Impact') && (
                    <button
                      type="button"
                      onClick={() => onNavigate('department-actions', rec.districtId)}
                      className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      <span>Track Impact</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
