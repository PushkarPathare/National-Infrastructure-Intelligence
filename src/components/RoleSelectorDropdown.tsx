import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types/platform';
import { RBAC_PROFILES, ROLE_ORDER } from '../data/rbacData';
import { ChevronDown, ShieldCheck, X, Check } from 'lucide-react';

interface RoleSelectorDropdownProps {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenDemoLoginModal: () => void;
}

export const RoleSelectorDropdown: React.FC<RoleSelectorDropdownProps> = ({
  activeRole,
  onSelectRole,
  onOpenDemoLoginModal,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeProfile = RBAC_PROFILES[activeRole];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shadow-xs"
        aria-label="Switch Demo Role"
      >
        <span>{activeProfile.icon}</span>
        <span>{activeRole}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-84 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.16)] z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="p-5 bg-slate-950 text-white border-b border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-teal-400">
                Switch Demo Role
              </span>
              <span className="text-[10px] font-mono text-slate-400">RBAC Active</span>
            </div>
            <div className="font-bold text-base text-white tracking-tight">
              {activeProfile.icon} {activeProfile.role}
            </div>
            <div className="text-[11px] text-slate-300">{activeProfile.scopeBadge}</div>
          </div>

          {/* 6 Roles List */}
          <div className="p-2.5 space-y-1 max-h-96 overflow-y-auto">
            {ROLE_ORDER.map((r) => {
              const prof = RBAC_PROFILES[r];
              const isSelected = r === activeRole;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    onSelectRole(r);
                    setOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-base leading-none mt-0.5">{prof.icon}</span>
                    <div className="min-w-0">
                      <div
                        className={`font-semibold flex items-center gap-1.5 ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <span>{prof.role}</span>
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {prof.scopeBadge}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer: Open Full Demo Login Switcher */}
          <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">
              Hackathon Demo • Simulated Role Access
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenDemoLoginModal();
              }}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Demo Login Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface DemoLoginModalProps {
  isOpen: boolean;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onClose: () => void;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({
  isOpen,
  activeRole,
  onSelectRole,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-4xl w-full shadow-[0_24px_70px_rgba(15,23,42,0.25)] overflow-hidden">
        <div className="p-7 sm:p-9 bg-slate-950 text-white flex items-start justify-between gap-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Hackathon Demo • Simulated Role Access</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Demo Login — Select Role & Jurisdiction Scope
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Switch between 6 operational roles to experience how navigation, jurisdiction filters,
              data privacy, AI insights, and allowed actions adapt in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Demo Login Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 sm:p-9 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[68vh] overflow-y-auto text-xs bg-[#f5f5f7]">
          {ROLE_ORDER.map((r) => {
            const prof = RBAC_PROFILES[r];
            const isCurrent = r === activeRole;
            return (
              <div
                key={r}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  isCurrent
                    ? 'bg-white border-blue-600 shadow-[0_8px_30px_rgba(37,99,235,0.10)] ring-1 ring-blue-600/20'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-[0_2px_12px_rgba(15,23,42,0.03)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-slate-900 tracking-tight">
                      {prof.icon} {prof.role}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-blue-700">
                      {prof.accessLevelLabel}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-700">{prof.demoDesignation}</div>
                  <div className="text-[11px] font-mono text-slate-500">{prof.scopeBadge}</div>
                  <p className="text-slate-600 leading-relaxed pt-1">{prof.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectRole(r);
                    onClose();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? `✓ Active: ${prof.role}` : `Continue as ${prof.role}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-7 sm:px-9 py-4 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Note: Simulated role-based authentication for hackathon evaluation.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
