import React, { useState } from 'react';
import {
  CaseStatus,
  CitizenRequestRecord,
  NavModule,
  SupportedLanguage,
  UserRole,
} from '../types/platform';
import { TRANSLATIONS } from '../data/translations';
import { RBAC_PROFILES } from '../data/rbacData';
import {
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  FileSearch,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface DepartmentActionsViewProps {
  uiLanguage: SupportedLanguage;
  requests: CitizenRequestRecord[];
  onUpdateRequest: (updated: CitizenRequestRecord) => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
}

const ALL_STATUSES: CaseStatus[] = [
  'New',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

const OFFICERS_ROSTER = [
  'Joint Secretary (Rural Health & NHM Cell)',
  'Mission Director (Tribal Health & Welfare)',
  'Chief Engineer (Water Resources & PHED)',
  'Superintending Engineer (Public Works & Roads)',
  'Director (Secondary Education Directorate)',
  'Chief Engineer (Energy Distribution)',
];

const ROUTING_RULES = [
  { category: 'Healthcare', department: 'Health Department' },
  { category: 'Roads', department: 'Public Works' },
  { category: 'Water', department: 'Water Resources' },
  { category: 'Education', department: 'Education Department' },
  { category: 'Electricity', department: 'Energy Department' },
];

export const DepartmentActionsView: React.FC<DepartmentActionsViewProps> = ({
  uiLanguage,
  requests,
  onUpdateRequest,
  onNavigate,
  activeRole = 'National Policymaker',
}) => {
  const t = TRANSLATIONS[uiLanguage].departmentActions;
  const roleProfile = RBAC_PROFILES[activeRole];
  const [selectedCaseId, setSelectedCaseId] = useState<string>(requests[0]?.id || 'REQ-MH-92831');
  const [deptFilter, setDeptFilter] = useState<string>(
    activeRole === 'Department Officer' ? 'Health' : 'All'
  );
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionToast, setActionToast] = useState<string | null>(null);

  const activeCase =
    requests.find((r) => r.id === selectedCaseId) || requests[0];

  const filteredCases = requests.filter((r) => {
    if (activeRole === 'District Officer' && !r.district.includes('Pune')) {
      return false;
    }
    if (activeRole === 'State Administrator' && r.state !== 'Maharashtra') {
      return false;
    }
    const matchDept =
      deptFilter === 'All' ||
      r.assignedDepartment.toLowerCase().includes(deptFilter.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchDept && matchStatus;
  });

  const handleStatusChange = (record: CitizenRequestRecord, newStatus: CaseStatus) => {
    const updatedTimeline = record.timeline.map((step) => {
      if (newStatus === 'Resolved') {
        return { ...step, completed: true, timestamp: step.completed ? step.timestamp : '27 Sep 2026, Verified' };
      }
      if (newStatus === 'In Progress' && step.step === 'Action Initiated') {
        return { ...step, completed: true, timestamp: '27 Sep 2026, Work Order Active' };
      }
      if (newStatus === 'Assigned' && step.step === 'Under Review') {
        return { ...step, completed: true, timestamp: '27 Sep 2026, Officer Assigned' };
      }
      return step;
    });

    const updated: CitizenRequestRecord = {
      ...record,
      status: newStatus,
      submittedAt: 'Updated just now',
      timeline: updatedTimeline,
    };
    onUpdateRequest(updated);
    setActionToast(`Case ${record.id} status updated to "${newStatus}".`);
  };

  const handleAssignOfficer = (record: CitizenRequestRecord, officerName: string) => {
    const updated: CitizenRequestRecord = {
      ...record,
      assignedOfficer: officerName,
      status: record.status === 'New' ? 'Assigned' : record.status,
      submittedAt: 'Officer assigned just now',
    };
    onUpdateRequest(updated);
    setActionToast(`Case ${record.id} assigned to ${officerName.split('(')[0].trim()}.`);
  };

  const handleEscalateCase = (record: CitizenRequestRecord) => {
    const boostedScore = Math.min(99, record.priorityScore + 5);
    const updated: CitizenRequestRecord = {
      ...record,
      urgency: 'Critical',
      priorityScore: boostedScore,
      submittedAt: 'Escalated just now',
    };
    onUpdateRequest(updated);
    setActionToast(
      `Case ${record.id} escalated to Critical urgency (Priority Score ${boostedScore}/100).`
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ROLE & DEPARTMENT SCOPE BANNER */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span>{roleProfile.icon}</span>
          <span className="font-bold text-teal-400">{roleProfile.scopeBadge}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-200">{roleProfile.aiInsightCallout}</span>
        </div>
        {activeRole === 'Department Officer' && (
          <span className="px-2.5 py-0.5 rounded bg-teal-950 border border-teal-700 text-teal-300 font-semibold">
            Department Filter: Healthcare · Requests: 1,284 · High-Priority Projects: 12 · Infrastructure Gaps: 8
          </span>
        )}
        {activeRole === 'District Officer' && (
          <span className="px-2.5 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300 font-semibold">
            Showing data for Pune District
          </span>
        )}
      </div>

      {/* Header & Routing Matrix Summary */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-blue-700">
            {t.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {t.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t.subtitle}
          </p>
        </div>

        {/* Category Routing Key */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {ROUTING_RULES.map((rule) => (
            <span
              key={rule.category}
              className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200"
            >
              <strong className="text-slate-900">{rule.category}</strong> → {rule.department}
            </span>
          ))}
        </div>
      </div>

      {actionToast && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{actionToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-slate-400 hover:text-white font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">Filter Cases:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-medium text-slate-800"
          >
            <option value="All">All Departments</option>
            <option value="Health">Health Department</option>
            <option value="Public Works">Public Works (Roads)</option>
            <option value="Water">Water Resources</option>
            <option value="Education">Education Department</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-medium text-slate-800"
          >
            <option value="All">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Showing {filteredCases.length} routed cluster cases
        </div>
      </div>

      {/* Departmental Case Status & Priority Distribution Graph */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Routed Case Queue: Lifecycle Status & Priority Score Graph
            </h2>
            <p className="text-xs text-slate-500">
              Real-time visual breakdown of active cluster cases across line departments
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {requests.length} Total Clustered Cases
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {ALL_STATUSES.map((st) => {
            const count = requests.filter((r) => r.status === st).length;
            const pct = Math.round((count / Math.max(1, requests.length)) * 100);
            const barColor =
              st === 'Resolved'
                ? 'bg-emerald-600'
                : st === 'In Progress'
                ? 'bg-teal-600'
                : st === 'Assigned'
                ? 'bg-blue-600'
                : st === 'Under Review'
                ? 'bg-amber-500'
                : 'bg-slate-500';
            return (
              <div
                key={st}
                onClick={() => setStatusFilter(statusFilter === st ? 'All' : st)}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-blue-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{st}</span>
                  <span className="font-mono font-bold text-slate-900">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.max(10, pct)}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500">{pct}% of active queue</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid: Case Table (7 cols) + Active Case Action Inspector & Timeline (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: High-Density Cases Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-3 px-4 font-semibold">Request ID</th>
                  <th className="py-3 px-3 font-semibold">Issue & Location</th>
                  <th className="py-3 px-3 font-semibold">Assigned Department</th>
                  <th className="py-3 px-3 font-semibold text-right">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredCases.map((c) => {
                  const isSelected = c.id === activeCase.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{c.extractedIssue}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.district}, {c.state} · {c.similarRequestsCount} reports
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{c.assignedDepartment}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {c.assignedOfficer}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                        <span
                          className={`font-bold ${
                            c.priorityScore >= 88 ? 'text-red-700' : 'text-amber-700'
                          }`}
                        >
                          {c.priorityScore}/100
                        </span>
                        <div className="text-[10px] text-slate-400">{c.urgency}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            c.status === 'Resolved'
                              ? 'text-emerald-700'
                              : c.status === 'In Progress'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {c.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.submittedAt}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Active Officer Action Console & Workflow Timeline */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-blue-700">{activeCase.id}</div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeCase.extractedIssue}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {activeCase.villageOrCity}, {activeCase.district} ({activeCase.state})
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Priority</div>
              <div className="text-xl font-bold font-mono tabular-nums text-red-700">
                {activeCase.priorityScore}/100
              </div>
            </div>
          </div>

          {/* Simulated Officer Actions */}
          <div className="space-y-4 text-xs">
            {/* Action 1: Update Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {t.updateStatusLabel}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(activeCase, st)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeCase.status === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Action 2: Assign Nodal Officer */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {t.assignOfficerLabel}
              </label>
              <select
                value={activeCase.assignedOfficer}
                onChange={(e) => handleAssignOfficer(activeCase, e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {OFFICERS_ROSTER.map((off) => (
                  <option key={off} value={off}>
                    {off}
                  </option>
                ))}
              </select>
            </div>

            {/* Action 3: Escalate & View Evidence */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleEscalateCase(activeCase)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.btnEscalate}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ai-insights')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>View Evidence ({activeCase.similarRequestsCount} reports)</span>
              </button>
            </div>
          </div>

          {/* Workflow Audit Timeline */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-900">
              Department Execution & Audit Timeline
            </div>
            <div className="space-y-3">
              {activeCase.timeline.map((t, idx) => (
                <div key={t.step} className="flex items-start gap-3 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                      t.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t.completed ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{t.step}</span>
                      <span className="font-mono text-[11px] text-slate-400">{t.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
