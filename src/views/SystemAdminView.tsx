import React, { useState } from 'react';
import {
  AuditLogEntry,
  ManagedUserRecord,
  NavModule,
  UserRole,
} from '../types/platform';
import { RBAC_PROFILES, ROLE_ORDER } from '../data/rbacData';
import { DATA_SOURCES_CATALOG } from '../data/nationalData';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Database,
  FileText,
  Settings,
  CheckCircle2,
  Lock,
  Ban,
} from 'lucide-react';

interface SystemAdminViewProps {
  activeSubTab: 'sys-users' | 'sys-roles' | 'sys-datasets' | 'sys-audit' | 'sys-config';
  onChangeSubTab: (tab: NavModule) => void;
  users: ManagedUserRecord[];
  onAddUser: (user: ManagedUserRecord) => void;
  onUpdateUser: (user: ManagedUserRecord) => void;
  auditLogs: AuditLogEntry[];
  onSwitchDemoRole: (role: UserRole) => void;
}

export const SystemAdminView: React.FC<SystemAdminViewProps> = ({
  activeSubTab,
  onChangeSubTab,
  users,
  onAddUser,
  onUpdateUser,
  auditLogs,
  onSwitchDemoRole,
}) => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('District Officer');
  const [newJurisdiction, setNewJurisdiction] = useState('Pune District');
  const [newDepartment, setNewDepartment] = useState('District Collectorate');
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // System config toggles
  const [strictJurisdictionFilter, setStrictJurisdictionFilter] = useState(true);
  const [citizenPiiRedaction, setCitizenPiiRedaction] = useState(true);
  const [auditAllReads, setAuditAllReads] = useState(true);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    const created: ManagedUserRecord = {
      id: `USR-${Math.floor(1008 + Math.random() * 899)}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      jurisdiction: newJurisdiction,
      department: newDepartment,
      status: 'Active',
      lastActive: 'Just created · 27 Sep 2026',
    };
    onAddUser(created);
    setNewName('');
    setNewEmail('');
    setAdminToast(
      `Created user ${created.name} (${created.id}) with role "${created.role}" and jurisdiction "${created.jurisdiction}".`
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & 5 Admin Module Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-blue-700">
            ⚙️ System Administrator Console · 🔒 System Administrator Only
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Platform Governance, RBAC & Security Administration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage users, assign roles/jurisdictions/departments, govern national datasets, and
            inspect immutable audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
          {(
            [
              { id: 'sys-users', label: 'User Management', icon: Users },
              { id: 'sys-roles', label: 'Role Management', icon: ShieldCheck },
              { id: 'sys-datasets', label: 'Dataset Management', icon: Database },
              { id: 'sys-audit', label: 'Audit Logs', icon: FileText },
              { id: 'sys-config', label: 'System Config', icon: Settings },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {adminToast && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{adminToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setAdminToast(null)}
            className="text-slate-400 hover:text-white font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 1: USER MANAGEMENT (CREATE USER, ASSIGN ROLE/JURISDICTION/DEPT) */}
      {/* =================================================================== */}
      {activeSubTab === 'sys-users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Create User & Assign Role/Jurisdiction Form */}
          <form
            onSubmit={handleCreateUser}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Create User & Assign Access</span>
              </div>
              <span className="font-mono text-[10px] text-blue-700 font-semibold">✏ Edit Access</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role Designation / Account Label</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., District Officer (Nashik)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g., collector.nashik@nic.gov.in"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Jurisdiction</label>
              <select
                value={newJurisdiction}
                onChange={(e) => setNewJurisdiction(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="Pune District">Pune District (District Scope)</option>
                <option value="Gadchiroli District">Gadchiroli District (District Scope)</option>
                <option value="Barmer District">Barmer District (District Scope)</option>
                <option value="Maharashtra State">Maharashtra State (State Scope)</option>
                <option value="Rajasthan State">Rajasthan State (State Scope)</option>
                <option value="India (All 36 States & UTs)">India (National Scope)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="Health Department">Health Department</option>
                <option value="Water Resources">Water Resources</option>
                <option value="Public Works (Roads)">Public Works (Roads)</option>
                <option value="Education Department">Education Department</option>
                <option value="District Collectorate">District Collectorate</option>
                <option value="State Planning & Finance">State Planning & Finance</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Create User & Provision RBAC Scope
            </button>
          </form>

          {/* Right: Active Directory Table with Live Role/Jurisdiction/Disable Controls */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Provisioned Platform Users ({users.length})
              </span>
              <span className="font-mono text-slate-500">
                Modify Role, Jurisdiction, Department, or Disable User inline
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-3 font-semibold">Assigned Role</th>
                    <th className="py-3 px-3 font-semibold">Jurisdiction & Department</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {users.map((u) => (
                    <tr key={u.id} className={u.status === 'Disabled' ? 'opacity-55 bg-slate-50' : ''}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {u.id} · {u.email}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const updated = { ...u, role: e.target.value as UserRole };
                            onUpdateUser(updated);
                            setAdminToast(`Updated ${u.name}'s role to ${updated.role}.`);
                          }}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                        >
                          {ROLE_ORDER.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{u.jurisdiction}</div>
                        <div className="text-[11px] text-slate-500">{u.department}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            u.status === 'Active' ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = u.status === 'Active' ? 'Disabled' : 'Active';
                            onUpdateUser({ ...u, status: nextStatus });
                            setAdminToast(
                              `${nextStatus === 'Disabled' ? 'Disabled' : 'Re-enabled'} user account ${u.name}.`
                            );
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer inline-flex items-center gap-1 ${
                            u.status === 'Active'
                              ? 'border-red-200 text-red-700 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>{u.status === 'Active' ? 'Disable User' : 'Enable User'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ROLE MANAGEMENT & PERMISSIONS MATRIX                         */}
      {/* =================================================================== */}
      {activeSubTab === 'sys-roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {ROLE_ORDER.map((r) => {
              const prof = RBAC_PROFILES[r];
              return (
                <div
                  key={r}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        {prof.icon} {prof.role}
                      </span>
                      <span className="font-mono text-[11px] text-blue-700 font-semibold">
                        {prof.accessLevelLabel}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium">{prof.scopeBadge}</div>
                    <p className="text-slate-600 leading-relaxed">{prof.description}</p>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">
                        Authorized Modules ({prof.allowedModules.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prof.allowedModules.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSwitchDemoRole(r)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Test Interface as {r}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: DATASET MANAGEMENT (🔒 SYSTEM ADMINISTRATOR ONLY)            */}
      {/* =================================================================== */}
      {activeSubTab === 'sys-datasets' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                National Dataset & Pipeline Connectors (🔒 System Administrator Only)
              </h2>
              <p className="text-slate-500">
                Control ingestion frequency, LGD schema normalization, and public dataset sync
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setAdminToast('Triggered full national dataset synchronization across 6 data domains.')
              }
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
            >
              Sync All Datasets Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DATA_SOURCES_CATALOG.flatMap((g) => g.sources).map((src) => (
              <div
                key={src.name}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-slate-900">{src.name}</div>
                  <div className="text-slate-500 mt-0.5">
                    {src.coverage} · Refresh: {src.frequency}
                  </div>
                </div>
                <span className="font-mono font-semibold text-emerald-700 shrink-0">
                  ● {src.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: AUDIT LOGS (SECTION 14: USER, ROLE, ACTION, MODULE, STATUS)  */}
      {/* =================================================================== */}
      {activeSubTab === 'sys-audit' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Platform Security & Governance Audit Logs
              </h2>
              <p className="text-xs text-slate-500">
                Immutable trail of role switches, jurisdiction-scoped queries, and restricted access
                blocks
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              ● Live Audit Stream ({auditLogs.length} Events)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-3 px-4 font-semibold">Audit ID</th>
                  <th className="py-3 px-3 font-semibold">User</th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Action & Jurisdiction</th>
                  <th className="py-3 px-3 font-semibold">Module</th>
                  <th className="py-3 px-3 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{log.user}</td>
                    <td className="py-3 px-3 text-slate-700">
                      {RBAC_PROFILES[log.role]?.icon} {log.role}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{log.action}</div>
                      <div className="text-[11px] text-slate-500">Scope: {log.jurisdiction}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{log.module}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold ${
                          log.status === 'Authorized'
                            ? 'text-emerald-700'
                            : log.status === 'Restricted'
                            ? 'text-red-600'
                            : 'text-blue-700'
                        }`}
                      >
                        {log.status === 'Restricted' ? '🔒 Restricted' : `✓ ${log.status}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SYSTEM CONFIGURATION                                         */}
      {/* =================================================================== */}
      {activeSubTab === 'sys-config' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Global RBAC & Privacy Security Configuration
            </h2>
            <p className="text-slate-500">
              Configure jurisdiction boundaries, citizen PII masking, and automated department
              routing
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Enforce Strict Jurisdiction Boundary Filtering',
                desc: 'Automatically scope District Officers to their assigned district and Department Officers to their assigned sector.',
                checked: strictJurisdictionFilter,
                toggle: () => setStrictJurisdictionFilter(!strictJurisdictionFilter),
              },
              {
                label: 'Citizen Personal Information (PII) Redaction',
                desc: 'Ensure Citizen role only sees their own submitted requests and anonymized community cluster counts.',
                checked: citizenPiiRedaction,
                toggle: () => setCitizenPiiRedaction(!citizenPiiRedaction),
              },
              {
                label: 'Real-Time Governance Audit Trail Logging',
                desc: 'Record every role switch, recommendation approval, and restricted module access attempt in Audit Logs.',
                checked: auditAllReads,
                toggle: () => setAuditAllReads(!auditAllReads),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{item.label}</div>
                  <div className="text-slate-600 mt-0.5">{item.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={item.toggle}
                  className={`px-3.5 py-1.5 rounded-lg font-mono font-bold cursor-pointer ${
                    item.checked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.checked ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
