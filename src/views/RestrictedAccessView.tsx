import React from 'react';
import { NavModule, UserRole } from '../types/platform';
import { RBAC_PROFILES } from '../data/rbacData';
import { Lock, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface RestrictedAccessViewProps {
  currentRole: UserRole;
  attemptedModule: NavModule;
  moduleDisplayName: string;
  requiredRole: UserRole;
  onReturnToDashboard: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  currentRole,
  moduleDisplayName,
  requiredRole,
  onReturnToDashboard,
  onSwitchRole,
}) => {
  const currentProfile = RBAC_PROFILES[currentRole];
  const requiredProfile = RBAC_PROFILES[requiredRole];

  return (
    <div className="py-16 sm:py-24 max-w-3xl mx-auto px-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-[0_12px_40px_rgba(15,23,42,0.05)] space-y-10 text-center">
        {/* Large Editorial Lock Icon Header */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-950 text-white flex items-center justify-center shadow-lg">
          <Lock className="w-9 h-9 text-red-400" />
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <div className="text-xs font-mono font-semibold tracking-wider text-red-600">
            🔒 ACCESS RESTRICTED · ROLE & JURISDICTION POLICY ENFORCED
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            This module is not available for your current role.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed pt-1">
            Access to <strong className="text-slate-900 font-semibold">{moduleDisplayName}</strong> is restricted
            under the platform&apos;s Role-Based Access Control (RBAC) and jurisdictional data
            privacy policy. This access attempt has been recorded in the security audit log.
          </p>
        </div>

        {/* Role Comparison Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left bg-[#f5f5f7] border border-slate-200/70 rounded-2xl p-6 text-xs">
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 space-y-2">
            <div className="text-slate-400 font-semibold text-[11px]">
              Current Role & Scope
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <span>{currentProfile.icon}</span>
              <span>{currentRole}</span>
            </div>
            <div className="text-slate-600 font-medium">{currentProfile.scopeBadge}</div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Role Designation: {currentProfile.demoDesignation}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-red-200/90 space-y-2">
            <div className="text-red-700 font-semibold text-[11px]">
              Required Access Level
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <span>{requiredProfile.icon}</span>
              <span>{requiredRole}</span>
            </div>
            <div className="text-red-800 font-medium">{requiredProfile.scopeBadge}</div>
            <div className="text-[11px] text-red-700 pt-2 border-t border-red-100">
              Permission: {requiredProfile.accessLevelLabel}
            </div>
          </div>
        </div>

        {/* Permitted Modules Explanation */}
        <div className="text-left p-6 rounded-2xl bg-[#f5f5f7] border border-slate-200/70 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Why is this restricted for {currentRole}?</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{currentProfile.description}</p>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard ({currentProfile.shortTitle})</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchRole(requiredRole)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Switch Demo Role to {requiredRole}</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 pt-4 border-t border-slate-100">
          Hackathon Demo • Simulated Role Access & Jurisdiction Enforcement
        </div>
      </div>
    </div>
  );
};
