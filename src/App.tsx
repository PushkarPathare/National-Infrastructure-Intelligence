/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AuditLogEntry,
  CitizenRequestRecord,
  DevelopmentRecommendation,
  ManagedUserRecord,
  NavModule,
  PlatformNotification,
  SupportedLanguage,
  UserRole,
} from './types/platform';
import {
  AI_RECOMMENDATIONS,
  DISTRICT_HOTSPOTS,
  INITIAL_CITIZEN_REQUESTS,
  INITIAL_NOTIFICATIONS,
  SUPPORTED_LANGUAGES,
} from './data/nationalData';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_MANAGED_USERS,
  MODULE_DISPLAY_NAMES,
  RBAC_PROFILES,
} from './data/rbacData';
import { TRANSLATIONS } from './data/translations';
import { HomeView } from './views/HomeView';
import { CitizenRequestsView, CitizenSubTab } from './views/CitizenRequestsView';
import { AIInsightsView } from './views/AIInsightsView';
import { DemandHotspotsView } from './views/DemandHotspotsView';
import { InfrastructureGapsView } from './views/InfrastructureGapsView';
import { RecommendationsView } from './views/RecommendationsView';
import { ImpactSimulatorView } from './views/ImpactSimulatorView';
import { DepartmentActionsView } from './views/DepartmentActionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { DataSourcesView } from './views/DataSourcesView';
import { RestrictedAccessView } from './views/RestrictedAccessView';
import { PublicUpdatesHelpView } from './views/PublicUpdatesHelpView';
import { SystemAdminView } from './views/SystemAdminView';
import { PolicyCopilotDrawer } from './components/PolicyCopilotDrawer';
import {
  DemoLoginModal,
  RoleSelectorDropdown,
} from './components/RoleSelectorDropdown';
import {
  Search,
  Bell,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Lock,
  CheckCheck,
  Sparkles,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react';

const QUICK_SEARCH_SUGGESTIONS = [
  'Pune healthcare',
  'Maharashtra water',
  'high priority districts',
  'roads with high citizen demand',
  'REQ-MH-92831',
];

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('home');
  const [citizenSubTab, setCitizenSubTab] = useState<CitizenSubTab>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist-pune');
  const [requests, setRequests] = useState<CitizenRequestRecord[]>(INITIAL_CITIZEN_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequestRecord>(
    INITIAL_CITIZEN_REQUESTS[0]
  );
  const [recommendations, setRecommendations] =
    useState<DevelopmentRecommendation[]>(AI_RECOMMENDATIONS);
  const [notifications, setNotifications] =
    useState<PlatformNotification[]>(INITIAL_NOTIFICATIONS);

  // Global UI states (Strictly 3 Languages: English, Marathi, Hindi)
  const [uiLanguage, setUiLanguage] = useState<SupportedLanguage>('English');

  // Role-Based Access Control (RBAC) States (6 Roles)
  const [activeRole, setActiveRole] = useState<UserRole>('National Policymaker');
  const [demoLoginModalOpen, setDemoLoginModalOpen] = useState<boolean>(false);
  const [managedUsers, setManagedUsers] = useState<ManagedUserRecord[]>(INITIAL_MANAGED_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [alertFilterTab, setAlertFilterTab] = useState<'role' | 'unread' | 'all'>('role');
  const [activeToast, setActiveToast] = useState<PlatformNotification | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const notificationContainerRef = useRef<HTMLDivElement | null>(null);
  const topHeaderBellRef = useRef<HTMLButtonElement | null>(null);

  const t = TRANSLATIONS[uiLanguage];
  const roleProfile = RBAC_PROFILES[activeRole];

  // Close Alerts dropdown on outside click or Escape key
  useEffect(() => {
    if (!notificationsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationContainerRef.current &&
        !notificationContainerRef.current.contains(target) &&
        (!topHeaderBellRef.current || !topHeaderBellRef.current.contains(target))
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  // Auto-dismiss floating toast notification after 6 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = window.setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [activeToast]);

  const pushNotifications = (newItems: PlatformNotification[], toastItem?: PlatformNotification) => {
    setNotifications((prev) => [...newItems, ...prev]);
    const candidate = toastItem || newItems[0];
    if (candidate) {
      setActiveToast(candidate);
    }
  };

  const resolveDistrictId = (districtName?: string): string | undefined => {
    if (!districtName) return undefined;
    const clean = districtName.replace(/\s*district\s*/i, '').trim().toLowerCase();
    const matched = DISTRICT_HOTSPOTS.find(
      (d) =>
        d.district.toLowerCase() === clean ||
        clean.includes(d.district.toLowerCase()) ||
        d.district.toLowerCase().includes(clean)
    );
    return matched?.id;
  };

  const handleAddAuditLog = (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
    overrideRole?: UserRole
  ) => {
    const usedRole = overrideRole || entry.role;
    const newEntry: AuditLogEntry = {
      ...entry,
      role: usedRole,
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: '27 Sep 2026 · Just now',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handleRoleChange = (newRole: UserRole) => {
    const newProfile = RBAC_PROFILES[newRole];
    setActiveRole(newRole);

    // Automatically scope district to Pune when District Officer or Citizen is selected
    if (newRole === 'District Officer' || newRole === 'Citizen') {
      setSelectedDistrictId('dist-pune');
    }

    handleAddAuditLog(
      {
        user: newProfile.demoUserName,
        role: newRole,
        action: `Switched active session role to ${newRole} (${newProfile.scopeBadge})`,
        module: MODULE_DISPLAY_NAMES[activeModule] || activeModule,
        jurisdiction: newProfile.scopeBadge,
        status: 'Authorized',
      },
      newRole
    );
  };

  const handleNavigate = (module: NavModule, districtId?: string) => {
    const isAllowed = roleProfile.allowedModules.includes(module);
    setActiveModule(module);
    if (districtId) {
      setSelectedDistrictId(districtId);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    handleAddAuditLog({
      user: roleProfile.demoUserName,
      role: activeRole,
      action: isAllowed
        ? `Opened ${MODULE_DISPLAY_NAMES[module]}`
        : `Attempted restricted access to ${MODULE_DISPLAY_NAMES[module]}`,
      module: MODULE_DISPLAY_NAMES[module],
      jurisdiction: roleProfile.scopeBadge,
      status: isAllowed ? 'Authorized' : 'Restricted',
    });

    if (!isAllowed) {
      const secNotif: PlatformNotification = {
        id: `notif-sec-${Date.now()}`,
        title: `RBAC Policy Alert: ${activeRole} blocked from ${MODULE_DISPLAY_NAMES[module]}`,
        description: `Unauthorized access attempt by ${roleProfile.demoUserName} (${roleProfile.scopeBadge}) was blocked and recorded in the security audit trail.`,
        timestamp: 'Just now',
        severity: 'warning',
        targetModule: 'sys-audit',
        scopeLabel: '⚙️ System Security & Audit Log',
        allowedRoles: ['System Administrator'],
        read: false,
      };
      pushNotifications([secNotif], secNotif);
    }
  };

  const handleAddRequest = (newReq: CitizenRequestRecord) => {
    setRequests((prev) => [newReq, ...prev]);
    setSelectedRequest(newReq);

    const normalizedDistrictLabel = newReq.district.toLowerCase().includes('district')
      ? newReq.district
      : `${newReq.district} District`;

    handleAddAuditLog({
      user: roleProfile.demoUserName,
      role: activeRole,
      action: `Submitted citizen request ${newReq.id} (${newReq.category} · ${newReq.urgency}) from ${newReq.villageOrCity}, ${newReq.district}`,
      module: MODULE_DISPLAY_NAMES['citizen-requests'] || 'Citizen Requests',
      jurisdiction: `${newReq.district}, ${newReq.state}`,
      status: 'Modified',
    });

    const citizenNotif: PlatformNotification = {
      id: `notif-cit-${Date.now()}`,
      title: `Your request ${newReq.id} categorized as ${newReq.category} Infrastructure`,
      description: `Submitted from ${newReq.villageOrCity}, ${newReq.district}. Grouped with ${newReq.similarRequestsCount} community reports and routed to ${newReq.assignedDepartment}.`,
      timestamp: 'Just now',
      severity: 'success',
      targetModule: 'citizen-requests',
      district: normalizedDistrictLabel,
      state: newReq.state,
      department: newReq.assignedDepartment,
      category: newReq.category,
      scopeLabel: `👤 My Request Update · ${newReq.district}`,
      allowedRoles: ['Citizen'],
      read: false,
    };

    const officerNotif: PlatformNotification = {
      id: `notif-off-${Date.now() + 1}`,
      title: `New ${newReq.category} request clustered (${newReq.id})`,
      description: `${newReq.district} (${newReq.state}): Linked with ${newReq.similarRequestsCount} similar requests; Priority Score ${newReq.priorityScore}/100.`,
      timestamp: 'Just now',
      severity: newReq.urgency === 'Critical' ? 'critical' : 'info',
      targetModule: 'ai-insights',
      district: normalizedDistrictLabel,
      state: newReq.state,
      department: newReq.assignedDepartment,
      category: newReq.category,
      scopeLabel: `📍 ${newReq.district} · ${newReq.category} Signal`,
      allowedRoles: [
        'District Officer',
        'Department Officer',
        'State Administrator',
        'National Policymaker',
      ],
      read: false,
    };

    pushNotifications(
      [citizenNotif, officerNotif],
      activeRole === 'Citizen' ? citizenNotif : officerNotif
    );
  };

  const handleOpenCitizenTab = (tab: CitizenSubTab) => {
    setCitizenSubTab(tab);
    handleNavigate('citizen-requests');
  };

  const handleUpdateRequest = (updated: CitizenRequestRecord) => {
    const previous = requests.find((r) => r.id === updated.id);
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedRequest.id === updated.id) {
      setSelectedRequest(updated);
    }

    const normalizedDistrictLabel = updated.district.toLowerCase().includes('district')
      ? updated.district
      : `${updated.district} District`;

    if (updated.supportedByUser && !previous?.supportedByUser) {
      const supportNotif: PlatformNotification = {
        id: `notif-sup-${Date.now()}`,
        title: `Community endorsement added to ${updated.id} (${updated.category})`,
        description: `Your +1 support increased the community cluster in ${updated.district} to ${updated.similarRequestsCount} reports.`,
        timestamp: 'Just now',
        severity: 'success',
        targetModule: 'citizen-requests',
        district: normalizedDistrictLabel,
        state: updated.state,
        department: updated.assignedDepartment,
        category: updated.category,
        scopeLabel: `👤 Community Support · ${updated.district}`,
        allowedRoles: ['Citizen', 'District Officer', 'State Administrator', 'National Policymaker'],
        read: false,
      };
      pushNotifications([supportNotif], supportNotif);
    } else if (previous && previous.status !== updated.status) {
      const statusNotif: PlatformNotification = {
        id: `notif-status-${Date.now()}`,
        title: `Case ${updated.id} status updated to "${updated.status}"`,
        description: `${updated.assignedDepartment} updated ${updated.category} case in ${updated.villageOrCity}, ${updated.district} (${updated.similarRequestsCount} clustered reports).`,
        timestamp: 'Just now',
        severity: updated.status === 'Resolved' ? 'success' : 'info',
        targetModule: activeRole === 'Citizen' ? 'citizen-requests' : 'department-actions',
        district: normalizedDistrictLabel,
        state: updated.state,
        department: updated.assignedDepartment,
        category: updated.category,
        scopeLabel: `🏛️ ${updated.assignedDepartment} · ${updated.status}`,
        allowedRoles: [
          'Citizen',
          'District Officer',
          'Department Officer',
          'State Administrator',
          'National Policymaker',
        ],
        read: false,
      };
      pushNotifications([statusNotif], statusNotif);
    }
  };

  const handleSendRecommendationToDept = (rec: DevelopmentRecommendation) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, status: 'Sent to Department' } : r))
    );

    const existingCase = requests.find(
      (r) =>
        r.district.toLowerCase().includes(rec.district.replace(/\s*district\s*/i, '').toLowerCase()) &&
        r.category === rec.category
    );
    if (existingCase) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === existingCase.id
            ? { ...r, status: 'Assigned', submittedAt: 'Routed from AI Recommendations' }
            : r
        )
      );
    }

    const recNotif: PlatformNotification = {
      id: `notif-rec-${Date.now()}`,
      title: `Recommendation Sanctioned: ${rec.recommendedProject}`,
      description: `Routed to ${rec.recommendedDepartment} (${rec.district}, ${rec.state}) · Outlay ₹${rec.estimatedCostCr} Cr for ${rec.estimatedBeneficiaries} beneficiaries.`,
      timestamp: 'Just now',
      severity: 'success',
      targetModule: 'department-actions',
      district: rec.district,
      state: rec.state,
      department: rec.recommendedDepartment,
      category: rec.category,
      scopeLabel: `✓ Routed to ${rec.recommendedDepartment}`,
      allowedRoles: [
        'District Officer',
        'Department Officer',
        'State Administrator',
        'National Policymaker',
      ],
      read: false,
    };
    pushNotifications([recNotif], recNotif);
  };

  const handleSimulateRecommendation = (rec: DevelopmentRecommendation) => {
    setSelectedDistrictId(rec.districtId);
    setActiveModule('impact-simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateLiveAlert = () => {
    const nowId = Date.now();
    let simulated: PlatformNotification;

    switch (activeRole) {
      case 'Citizen':
        simulated = {
          id: `notif-sim-${nowId}`,
          title: 'Field Verification Dispatched for REQ-MH-92831 (Ambegaon)',
          description:
            'District Health Officer assigned a mobile medical unit & civil engineer team for Ambegaon PHC expansion review.',
          timestamp: 'Just now',
          severity: 'success',
          targetModule: 'citizen-requests',
          district: 'Pune District',
          state: 'Maharashtra',
          department: 'Health Department',
          category: 'Healthcare',
          scopeLabel: '👤 My Request Live Update · Pune',
          allowedRoles: ['Citizen'],
          read: false,
        };
        break;
      case 'District Officer':
        simulated = {
          id: `notif-sim-${nowId}`,
          title: 'Pune District Surge: +46 rural water & health reports in Shirur',
          description:
            'Real-time NLP ingestion clustered 46 new Marathi & English citizen reports in Shirur block over the last 15 minutes.',
          timestamp: 'Just now',
          severity: 'critical',
          targetModule: 'demand-hotspots',
          district: 'Pune District',
          state: 'Maharashtra',
          department: 'Health Department',
          category: 'Healthcare',
          scopeLabel: '📍 Pune District · Live Collector Alert',
          allowedRoles: ['District Officer', 'State Administrator', 'National Policymaker'],
          read: false,
        };
        break;
      case 'Department Officer':
        simulated = {
          id: `notif-sim-${nowId}`,
          title: 'Health Department Priority Escalation: Rural CHC Deficit',
          description:
            'AI Gap Engine flagged 18.5 km mean emergency travel distance in Ambegaon & Junnar; immediate clinical review requested.',
          timestamp: 'Just now',
          severity: 'warning',
          targetModule: 'infrastructure-gaps',
          district: 'Pune District',
          state: 'Maharashtra',
          department: 'Health Department',
          category: 'Healthcare',
          scopeLabel: '🏛️ Health Department · Sector Alert',
          allowedRoles: ['Department Officer', 'State Administrator', 'National Policymaker'],
          read: false,
        };
        break;
      case 'State Administrator':
        simulated = {
          id: `notif-sim-${nowId}`,
          title: 'Maharashtra State Budget Reallocation Signal: Gadchiroli & Pune',
          description:
            'High citizen demand vs. low capital outlay detected across 3 Maharashtra tribal & rural health clusters.',
          timestamp: 'Just now',
          severity: 'critical',
          targetModule: 'recommendations',
          district: 'Gadchiroli District',
          state: 'Maharashtra',
          department: 'Health Department',
          category: 'Healthcare',
          scopeLabel: '🌐 Maharashtra State Executive Alert',
          allowedRoles: ['State Administrator', 'National Policymaker'],
          read: false,
        };
        break;
      case 'System Administrator':
        simulated = {
          id: `notif-sim-${nowId}`,
          title: 'Automated Pipeline Check: 742 District GIS Layers Verified',
          description:
            'Zero latency anomalies across data.gov.in LGD registry sync and multilingual Gemini embedding pipelines.',
          timestamp: 'Just now',
          severity: 'info',
          targetModule: 'sys-datasets',
          scopeLabel: '⚙️ System Telemetry & Governance',
          allowedRoles: ['System Administrator'],
          read: false,
        };
        break;
      case 'National Policymaker':
      default:
        simulated = {
          id: `notif-sim-${nowId}`,
          title: 'National Hotspot Alert: Barmer Water & Pune Healthcare Clusters',
          description:
            'Cross-state AI synthesis identified 92/100 priority convergence in Barmer (Water) and Pune (Healthcare).',
          timestamp: 'Just now',
          severity: 'critical',
          targetModule: 'demand-hotspots',
          district: 'Pune District',
          state: 'Maharashtra',
          department: 'Health Department',
          category: 'Healthcare',
          scopeLabel: '🇮🇳 National Policy Intelligence Alert',
          allowedRoles: ['National Policymaker'],
          read: false,
        };
        break;
    }

    pushNotifications([simulated], simulated);
  };

  const handleNotificationAction = (n: PlatformNotification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    setNotificationsOpen(false);
    setActiveToast(null);

    const matchedDistrictId = resolveDistrictId(n.district);
    if (matchedDistrictId) {
      setSelectedDistrictId(matchedDistrictId);
    }

    // If the notification references a specific citizen request ID, select it
    const reqMatch = n.title.match(/REQ-[A-Z]{2}-\d+/i) || n.description.match(/REQ-[A-Z]{2}-\d+/i);
    if (reqMatch) {
      const foundReq = requests.find(
        (r) => r.id.toUpperCase() === reqMatch[0].toUpperCase()
      );
      if (foundReq) {
        setSelectedRequest(foundReq);
      }
    }

    if (n.targetModule === 'citizen-requests') {
      setCitizenSubTab(activeRole === 'Citizen' ? 'my-requests' : 'all');
    }

    const safeTarget = roleProfile.allowedModules.includes(n.targetModule)
      ? n.targetModule
      : activeRole === 'Citizen'
      ? 'public-updates'
      : 'home';

    handleNavigate(safeTarget, matchedDistrictId);
  };

  // Role-Based & Jurisdiction/Department-Scoped Notification Filtering
  const roleFilteredNotifications = notifications.filter((n) => {
    // 1. Check explicit role permission list if specified
    if (n.allowedRoles && !n.allowedRoles.includes(activeRole)) {
      return false;
    }

    // 2. Enforce strictly scoped jurisdiction / department rules per role
    switch (activeRole) {
      case 'Citizen':
        // Citizens receive notifications about their own requests & public updates in their locality
        return (
          n.allowedRoles?.includes('Citizen') ||
          n.targetModule === 'citizen-requests' ||
          n.targetModule === 'public-updates'
        );

      case 'District Officer':
        // District Officers (Pune District) receive alerts relevant to Pune District
        return Boolean(
          (n.district && n.district.toLowerCase().includes('pune')) ||
            n.allowedRoles?.includes('District Officer')
        );

      case 'Department Officer':
        // Department Officers (Health Department) receive alerts relevant to Healthcare / Health Department
        return Boolean(
          n.category === 'Healthcare' ||
            (n.department && n.department.toLowerCase().includes('health')) ||
            n.allowedRoles?.includes('Department Officer')
        );

      case 'State Administrator':
        // State Administrators (Maharashtra) receive alerts within Maharashtra state jurisdiction
        return Boolean(
          n.state === 'Maharashtra' ||
            (n.district &&
              (n.district.toLowerCase().includes('pune') ||
                n.district.toLowerCase().includes('gadchiroli') ||
                n.district.toLowerCase().includes('nandurbar'))) ||
            n.allowedRoles?.includes('State Administrator')
        );

      case 'National Policymaker':
        // National Policymakers receive national, cross-state, and priority district intelligence alerts
        return (
          !n.allowedRoles ||
          n.allowedRoles.includes('National Policymaker')
        );

      case 'System Administrator':
        // System Administrators receive governance, RBAC security, and dataset pipeline alerts
        return Boolean(
          n.allowedRoles?.includes('System Administrator') ||
            n.targetModule.startsWith('sys-')
        );

      default:
        return true;
    }
  });

  const unreadCount = roleFilteredNotifications.filter((n) => !n.read).length;
  const totalUnreadCount = notifications.filter((n) => !n.read).length;
  const hiddenGlobalCount = Math.max(0, notifications.length - roleFilteredNotifications.length);

  const displayedNotifications =
    alertFilterTab === 'all'
      ? notifications
      : alertFilterTab === 'unread'
      ? roleFilteredNotifications.filter((n) => !n.read)
      : roleFilteredNotifications;

  // Intelligent Search Results Computation
  const computeSearchResults = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        districts: DISTRICT_HOTSPOTS.slice(0, 4),
        requests: requests.slice(0, 3),
        recommendations: recommendations.slice(0, 3),
      };
    }

    const matchedDistricts = DISTRICT_HOTSPOTS.filter((d) => {
      if (q.includes('high priority')) return d.priorityScore >= 85;
      if (q.includes('roads')) return d.mainIssue === 'Roads' || d.categoryGaps.Roads.gapScore >= 70;
      if (q.includes('water')) return d.mainIssue === 'Water' || d.categoryGaps.Water.gapScore >= 68;
      if (q.includes('healthcare') || q.includes('health'))
        return d.mainIssue === 'Healthcare' || d.categoryGaps.Healthcare.gapScore >= 75;
      return (
        d.district.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.mainIssue.toLowerCase().includes(q) ||
        d.specificProblem.toLowerCase().includes(q)
      );
    });

    const matchedRequests = requests.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.citizenText.toLowerCase().includes(q)
    );

    const matchedRecs = recommendations.filter(
      (rec) =>
        rec.recommendedProject.toLowerCase().includes(q) ||
        rec.district.toLowerCase().includes(q) ||
        rec.state.toLowerCase().includes(q) ||
        rec.category.toLowerCase().includes(q)
    );

    return {
      districts: matchedDistricts.length > 0 ? matchedDistricts : DISTRICT_HOTSPOTS.slice(0, 3),
      requests: matchedRequests,
      recommendations: matchedRecs,
    };
  };

  const searchResults = computeSearchResults();

  // Check if current module is permitted for the active role
  const isCurrentModuleAuthorized = roleProfile.allowedModules.includes(activeModule);

  // Sample restricted modules to display in sidebar with lock indicator so judges can test Restricted Screen
  const restrictedPreviewModules: { id: NavModule; label: string; lockNote: string }[] = [
    ...(roleProfile.allowedModules.includes('analytics')
      ? []
      : [
          {
            id: 'analytics' as NavModule,
            label: 'National Analytics',
            lockNote: '🔒 National Policymaker Only',
          },
        ]),
    ...(roleProfile.allowedModules.includes('impact-simulator')
      ? []
      : [
          {
            id: 'impact-simulator' as NavModule,
            label: 'Impact Simulator',
            lockNote: '🔒 National Policymaker Only',
          },
        ]),
    ...(roleProfile.allowedModules.includes('sys-datasets')
      ? []
      : [
          {
            id: 'sys-datasets' as NavModule,
            label: 'Dataset Management',
            lockNote: '🔒 System Administrator Only',
          },
        ]),
    ...(roleProfile.allowedModules.includes('sys-audit')
      ? []
      : [
          {
            id: 'sys-audit' as NavModule,
            label: 'Audit Logs',
            lockNote: '🔒 System Administrator Only',
          },
        ]),
  ].slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* TOP BAR CONTRACT: 3 ZONES (Brand Wordmark — Role-Aware Primary Links — Search, Copilot & Role Selector) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 sm:px-10 h-16 flex items-center justify-between gap-4 transition-all">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('home');
          }}
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 whitespace-nowrap"
        >
          {t.brandTitle}
        </a>

        {/* Zone 2: Clean Role-Aware Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
          {roleProfile.navGroups
            .flatMap((g) => g.items)
            .slice(0, 5)
            .map((item) => (
              <button
                key={`${item.id}-${item.label}`}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === item.id
                    ? 'bg-white text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {item.label}
              </button>
            ))}
        </nav>

        {/* Zone 3: Primary Actions (Search + Alerts + Policy Copilot + Top-Right Role Selector Dropdown) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/60 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">{t.searchButton}</span>
          </button>

          <button
            ref={topHeaderBellRef}
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="Toggle Alerts & Notifications Centre"
            className={`relative px-3 py-2 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              notificationsOpen
                ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                : 'bg-white hover:bg-slate-100/90 text-slate-700 border-slate-200/80 shadow-2xs'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${notificationsOpen ? 'text-teal-300' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">{t.alertsLabel}</span>
            {unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                  notificationsOpen
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-700 border border-red-200/80'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCopilotOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>{t.copilotButton} · Live Voice</span>
          </button>

          {/* Section 1: Top-Right Profile / Role Selector */}
          <RoleSelectorDropdown
            activeRole={activeRole}
            onSelectRole={handleRoleChange}
            onOpenDemoLoginModal={() => setDemoLoginModalOpen(true)}
          />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle All Modules Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* WORKSPACE CANVAS: LEFT COMMAND SIDEBAR + MAIN VIEWPORT */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Role-Aware Sidebar (Desktop Permanent, Mobile Slide-Over) */}
        <aside
          className={`${
            mobileMenuOpen
              ? 'fixed inset-y-0 left-0 z-40 w-76 bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-slate-200/80 p-6 overflow-y-auto'
              : 'hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 border-r border-slate-200/60 bg-white/50 backdrop-blur-md p-6 justify-between'
          }`}
        >
          <div className="space-y-7">
            {/* Active Role & Jurisdiction Scope Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-blue-700 font-semibold">
                  {roleProfile.scopeBadge}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-medium">
                  RBAC Active
                </span>
              </div>
              <div className="text-sm font-bold text-slate-950 flex items-center gap-2 pt-0.5">
                <span>{roleProfile.icon}</span>
                <span>{roleProfile.role}</span>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {roleProfile.accessLevelLabel}
              </div>
            </div>

            {/* Dynamic Role-Specific Navigation Groups */}
            {roleProfile.navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1.5">
                <div className="px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {group.groupTitle}
                </div>
                {group.items.map((item, idx) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-slate-950 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-950'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.accessBadge && (
                        <span
                          className={`text-[10px] font-mono shrink-0 ${
                            isActive ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {item.accessBadge.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Section 15: Visual Access Indicators for Restricted Modules */}
            {restrictedPreviewModules.length > 0 && (
              <div className="space-y-1.5 pt-4 border-t border-slate-200/60">
                <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Restricted by Role</span>
                </div>
                {restrictedPreviewModules.map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => handleNavigate(rm.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                      activeModule === rm.id
                        ? 'bg-red-50 text-red-900 border border-red-200 font-semibold'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{rm.label}</span>
                      <span className="text-[10px] font-mono text-amber-700">🔒 Restricted</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{rm.lockNote}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Platform Role & Trust Indicator */}
          <div className="pt-6 mt-8 border-t border-slate-200/60 space-y-3 text-xs">
            <button
              type="button"
              onClick={() => setDemoLoginModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-2xs font-semibold text-xs flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Switch Demo Role</span>
              <span className="text-[10px] font-mono text-blue-700 font-semibold">6 Roles</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Hackathon Demo • Simulated Role Access</span>
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">{t.dpgSub}</div>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Sub-Header Utility Bar: Active Module, Prominent Scope Indicator, 3-Language Switcher & Notifications */}
          {/* CRITICAL: relative z-20 ensures dropdowns inside this bar always stack above <main> content */}
          <div className="relative z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 sm:px-10 lg:px-14 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 text-slate-500">
              <span className="font-semibold text-slate-950 text-sm tracking-tight">
                {MODULE_DISPLAY_NAMES[activeModule] || t.navModules[activeModule]}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              {/* Section 9: Prominent Jurisdiction Scope Badge */}
              <span className="px-3 py-1 rounded-full bg-blue-50/90 text-blue-800 border border-blue-200/70 font-medium text-[11px]">
                {roleProfile.scopeBadge}
              </span>
              <span className="hidden md:inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">
                Hackathon Demo • Simulated Role Access
              </span>
            </div>

            {/* Right Controls: 3-Language Switcher (English, Marathi, Hindi) & Notifications */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Interactive 3-Language Segmented Switcher */}
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <div
                  className="inline-flex items-center rounded-full bg-slate-200/70 p-0.5 border border-slate-300/50"
                  role="group"
                  aria-label="Select Interface Language (English, Marathi, Hindi)"
                >
                  {SUPPORTED_LANGUAGES.map((l) => {
                    const isSelected = uiLanguage === l.name;
                    return (
                      <button
                        key={l.name}
                        type="button"
                        onClick={() => setUiLanguage(l.name)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {l.name === 'English'
                          ? 'English'
                          : l.name === 'Marathi'
                          ? 'मराठी (Marathi)'
                          : 'हिन्दी (Hindi)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span aria-hidden="true" className="text-slate-200">
                |
              </span>

              {/* Notification Centre Dropdown (Role & Jurisdiction Filtered) */}
              <div className="relative" ref={notificationContainerRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    notificationsOpen
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : unreadCount > 0
                      ? 'bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      : 'text-slate-700 hover:text-slate-950 border-transparent hover:bg-slate-200/50'
                  }`}
                >
                  <Bell
                    className={`w-3.5 h-3.5 ${
                      notificationsOpen
                        ? 'text-teal-300'
                        : unreadCount > 0
                        ? 'text-blue-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{t.alertsLabel}</span>
                  {unreadCount > 0 ? (
                    <span
                      className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                        notificationsOpen ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-slate-400">
                      ({roleFilteredNotifications.length})
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-[340px] sm:w-[430px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-5 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950 text-sm tracking-tight">
                            {t.notificationsHeader}
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/70 font-mono text-[10px] font-bold">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-blue-700 font-semibold mt-0.5">
                          {roleProfile.scopeBadge}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const targetSet = new Set(displayedNotifications.map((n) => n.id));
                            setNotifications((prev) =>
                              prev.map((n) => (targetSet.has(n.id) ? { ...n, read: true } : n))
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{t.markAllRead}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotificationsOpen(false)}
                          aria-label="Close Alerts Panel"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Filter Tabs + Live Alert Simulator Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setAlertFilterTab('role')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            alertFilterTab === 'role'
                              ? 'bg-white text-slate-950 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Role Scope ({roleFilteredNotifications.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlertFilterTab('unread')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            alertFilterTab === 'unread'
                              ? 'bg-white text-slate-950 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Unread ({unreadCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlertFilterTab('all')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            alertFilterTab === 'all'
                              ? 'bg-white text-slate-950 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All ({notifications.length})
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSimulateLiveAlert}
                          title="Generate a live role-scoped alert to test real-time routing"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-teal-300" />
                          <span>+ Test Alert</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotifications(INITIAL_NOTIFICATIONS)}
                          title="Restore default alerts"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* RBAC Filtering Summary Banner */}
                    <div className="px-3.5 py-2 rounded-xl bg-slate-950 text-white text-[11px] flex items-center justify-between gap-2">
                      <span className="font-medium text-teal-300 truncate">
                        {roleProfile.icon}{' '}
                        {alertFilterTab === 'all'
                          ? `Showing All Platform Alerts (${totalUnreadCount} unread)`
                          : `Filtered for ${activeRole}`}
                      </span>
                      <span className="font-mono text-[10px] text-slate-300 shrink-0">
                        {roleFilteredNotifications.length} relevant · {hiddenGlobalCount} restricted
                      </span>
                    </div>

                    {/* Alert Items List */}
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {displayedNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5">
                          <div>
                            {alertFilterTab === 'unread'
                              ? `All alerts for ${roleProfile.scopeBadge} have been read.`
                              : `No active alerts for ${roleProfile.scopeBadge}.`}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            {alertFilterTab === 'unread' && roleFilteredNotifications.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAlertFilterTab('role')}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100 cursor-pointer"
                              >
                                Show Read Alerts ({roleFilteredNotifications.length})
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleSimulateLiveAlert}
                              className="px-3 py-1.5 rounded-lg bg-slate-950 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                            >
                              + Trigger Live Alert
                            </button>
                          </div>
                        </div>
                      ) : (
                        displayedNotifications.map((n) => {
                          const severityBadge =
                            n.severity === 'critical'
                              ? 'bg-red-50 text-red-700 border-red-200/80'
                              : n.severity === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                              : n.severity === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-blue-50 text-blue-700 border-blue-200/80';

                          const targetModuleName =
                            MODULE_DISPLAY_NAMES[n.targetModule] || n.targetModule;

                          return (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationAction(n)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                                n.read
                                  ? 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/70'
                                  : 'bg-blue-50/35 border-blue-200/90 hover:border-blue-300 hover:bg-blue-50/60 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                  <span
                                    className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${severityBadge}`}
                                  >
                                    {n.severity}
                                  </span>
                                  {n.scopeLabel && (
                                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 truncate max-w-[200px]">
                                      {n.scopeLabel}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {!n.read && (
                                    <span
                                      className="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                                      title="Unread Alert"
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifications((prev) =>
                                        prev.map((item) =>
                                          item.id === n.id ? { ...item, read: !item.read } : item
                                        )
                                      );
                                    }}
                                    className="text-[10px] font-mono text-slate-400 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-white transition-colors cursor-pointer"
                                    title={n.read ? 'Mark as unread' : 'Mark as read'}
                                  >
                                    {n.read ? 'Unread' : 'Read'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifications((prev) =>
                                        prev.filter((item) => item.id !== n.id)
                                      );
                                    }}
                                    className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                                    title="Dismiss alert"
                                    aria-label="Dismiss alert"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-950 leading-snug group-hover:text-blue-700 transition-colors">
                                  {n.title}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {n.timestamp}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {n.description}
                              </p>

                              <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                                <span className="font-mono text-[10px] text-slate-500">
                                  {n.district ? `${n.district}` : n.state ? n.state : 'Platform Signal'}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform">
                                  <span>Open {targetModuleName}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active View Container with RBAC Enforcement */}
          <main className="relative z-0 flex-1 px-6 sm:px-10 lg:px-14 pt-10 pb-16">
            {!isCurrentModuleAuthorized ? (
              /* SECTION 8: PROFESSIONAL RESTRICTED ACCESS SCREEN */
              <RestrictedAccessView
                currentRole={activeRole}
                attemptedModule={activeModule}
                moduleDisplayName={MODULE_DISPLAY_NAMES[activeModule] || activeModule}
                requiredRole={
                  activeModule.startsWith('sys-')
                    ? 'System Administrator'
                    : activeModule === 'impact-simulator' || activeModule === 'data-sources'
                    ? 'National Policymaker'
                    : activeModule === 'analytics'
                    ? 'State Administrator'
                    : activeModule === 'ai-insights'
                    ? 'Department Officer'
                    : 'District Officer'
                }
                onReturnToDashboard={() => handleNavigate('home')}
                onSwitchRole={(newRole) => handleRoleChange(newRole)}
              />
            ) : activeRole === 'System Administrator' &&
              (activeModule === 'home' ||
                activeModule === 'sys-users' ||
                activeModule === 'sys-roles' ||
                activeModule === 'sys-datasets' ||
                activeModule === 'sys-audit' ||
                activeModule === 'sys-config') ? (
              /* SECTION 7 & 14: SYSTEM ADMINISTRATOR & AUDIT LOGS WORKSPACE */
              <SystemAdminView
                activeSubTab={
                  activeModule === 'home'
                    ? 'sys-users'
                    : (activeModule as
                        | 'sys-users'
                        | 'sys-roles'
                        | 'sys-datasets'
                        | 'sys-audit'
                        | 'sys-config')
                }
                onChangeSubTab={handleNavigate}
                users={managedUsers}
                auditLogs={auditLogs}
                onAddUser={(newUser) => {
                  setManagedUsers((prev) => [newUser, ...prev]);
                  const sysNotif: PlatformNotification = {
                    id: `notif-iam-add-${Date.now()}`,
                    title: `IAM User Provisioned: ${newUser.name} (${newUser.role})`,
                    description: `Assigned jurisdiction "${newUser.jurisdiction}" (${newUser.department}). RBAC permissions active immediately.`,
                    timestamp: 'Just now',
                    severity: 'success',
                    targetModule: 'sys-users',
                    scopeLabel: '⚙️ IAM User Provisioning',
                    allowedRoles: ['System Administrator'],
                    read: false,
                  };
                  pushNotifications([sysNotif], sysNotif);
                }}
                onUpdateUser={(updatedUser) => {
                  setManagedUsers((prev) =>
                    prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
                  );
                  const sysUpdateNotif: PlatformNotification = {
                    id: `notif-iam-upd-${Date.now()}`,
                    title: `IAM Policy Updated: ${updatedUser.name}`,
                    description: `Account status: ${updatedUser.status} · Role: ${updatedUser.role} (${updatedUser.jurisdiction}).`,
                    timestamp: 'Just now',
                    severity: 'info',
                    targetModule: 'sys-users',
                    scopeLabel: '⚙️ IAM Policy Update',
                    allowedRoles: ['System Administrator'],
                    read: false,
                  };
                  pushNotifications([sysUpdateNotif], sysUpdateNotif);
                }}
                onSwitchDemoRole={handleRoleChange}
              />
            ) : (
              <>
                {activeModule === 'home' && (
                  <HomeView
                    uiLanguage={uiLanguage}
                    activeRole={activeRole}
                    requests={requests}
                    onNavigate={handleNavigate}
                    onOpenCitizenTab={handleOpenCitizenTab}
                    onOpenCopilot={() => setCopilotOpen(true)}
                    onSwitchRole={handleRoleChange}
                  />
                )}

                {activeModule === 'citizen-requests' && (
                  <CitizenRequestsView
                    uiLanguage={uiLanguage}
                    onLanguageChange={setUiLanguage}
                    requests={requests}
                    onAddRequest={handleAddRequest}
                    onUpdateRequest={handleUpdateRequest}
                    onSelectRequestForAnalysis={(req) => setSelectedRequest(req)}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                    initialCitizenTab={citizenSubTab}
                  />
                )}

                {(activeModule === 'public-updates' || activeModule === 'citizen-help') && (
                  <PublicUpdatesHelpView
                    mode={activeModule}
                    onNavigate={handleNavigate}
                    onOpenCitizenTab={handleOpenCitizenTab}
                    requests={requests}
                    onSupportRequest={(req) => {
                      if (!req.supportedByUser) {
                        handleUpdateRequest({
                          ...req,
                          similarRequestsCount: req.similarRequestsCount + 1,
                          supportedByUser: true,
                        });
                      }
                    }}
                  />
                )}

                {activeModule === 'ai-insights' && (
                  <AIInsightsView
                    uiLanguage={uiLanguage}
                    requests={requests}
                    selectedRequest={selectedRequest}
                    onSelectRequest={setSelectedRequest}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                  />
                )}

                {activeModule === 'demand-hotspots' && (
                  <DemandHotspotsView
                    uiLanguage={uiLanguage}
                    selectedDistrictId={selectedDistrictId}
                    onSelectDistrict={setSelectedDistrictId}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                  />
                )}

                {activeModule === 'infrastructure-gaps' && (
                  <InfrastructureGapsView
                    uiLanguage={uiLanguage}
                    selectedDistrictId={selectedDistrictId}
                    onSelectDistrict={setSelectedDistrictId}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                  />
                )}

                {activeModule === 'recommendations' && (
                  <RecommendationsView
                    uiLanguage={uiLanguage}
                    recommendations={recommendations}
                    onSendToDepartment={handleSendRecommendationToDept}
                    onSimulateRecommendation={handleSimulateRecommendation}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                  />
                )}

                {activeModule === 'impact-simulator' && (
                  <ImpactSimulatorView
                    uiLanguage={uiLanguage}
                    selectedDistrictId={selectedDistrictId}
                    onSelectDistrict={setSelectedDistrictId}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeModule === 'department-actions' && (
                  <DepartmentActionsView
                    uiLanguage={uiLanguage}
                    requests={requests}
                    onUpdateRequest={handleUpdateRequest}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                  />
                )}

                {activeModule === 'analytics' && (
                  <AnalyticsView
                    uiLanguage={uiLanguage}
                    onNavigate={handleNavigate}
                    activeRole={activeRole}
                    notifications={notifications}
                    roleFilteredNotifications={roleFilteredNotifications}
                    onOpenAlert={handleNotificationAction}
                    onSimulateAlert={handleSimulateLiveAlert}
                  />
                )}

                {activeModule === 'data-sources' && (
                  <DataSourcesView
                    uiLanguage={uiLanguage}
                    activeRole={activeRole}
                    onSwitchRole={handleRoleChange}
                  />
                )}
              </>
            )}
          </main>

          {/* Quiet Institutional Footer */}
          <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur-md px-6 sm:px-10 lg:px-14 py-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-950 tracking-tight">{t.brandTitle}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{t.brandSubtitle}</span>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => setDemoLoginModalOpen(true)}
                className="text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                Hackathon Demo • Simulated Role Access ({activeRole})
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('data-sources')}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                {t.footerDataSources}
              </button>
              <span className="text-slate-400">{t.footerPrototypeNote}</span>
            </div>
          </footer>
        </div>
      </div>

      {/* SECTION 16: DEMO ROLE SWITCHING MODAL */}
      <DemoLoginModal
        isOpen={demoLoginModalOpen}
        activeRole={activeRole}
        onSelectRole={(role) => {
          handleRoleChange(role);
          setActiveModule('home');
        }}
        onClose={() => setDemoLoginModalOpen(false)}
      />

      {/* GLOBAL INTELLIGENT SEARCH MODAL */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3.5">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 text-base text-slate-950 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggested Search Queries */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">{t.searchTryLabel}</span>
              {QUICK_SEARCH_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSearchQuery(s)}
                  className="px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:border-slate-900 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search Results */}
            <div className="p-5 max-h-96 overflow-y-auto space-y-6 text-xs">
              {/* Matched Districts */}
              <div className="space-y-2.5">
                <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                  Matched District Hotspots ({searchResults.districts.length})
                </div>
                <div className="space-y-2">
                  {searchResults.districts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSearchModalOpen(false);
                        handleNavigate(
                          activeRole === 'Citizen' ? 'public-updates' : 'demand-hotspots',
                          d.id
                        );
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-900 hover:bg-slate-50/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-950 text-sm">
                          {d.district}, {d.state} · {d.mainIssue}
                        </div>
                        <div className="text-slate-500 mt-0.5">{d.specificProblem}</div>
                      </div>
                      <span className="font-mono font-bold text-blue-700 shrink-0 ml-3">
                        Score {d.priorityScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Recommendations */}
              {searchResults.recommendations.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                    AI Project Recommendations ({searchResults.recommendations.length})
                  </div>
                  {searchResults.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => {
                        setSearchModalOpen(false);
                        handleNavigate('recommendations', rec.districtId);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-900 hover:bg-slate-50/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-950 text-sm">{rec.recommendedProject}</div>
                        <div className="text-slate-500 mt-0.5">
                          {rec.district} · {rec.estimatedBeneficiaries} beneficiaries
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-teal-700 shrink-0 ml-3">
                        ₹{rec.estimatedCostCr} Cr
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Citizen Requests */}
              {searchResults.requests.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                    Citizen Requests ({searchResults.requests.length})
                  </div>
                  {searchResults.requests.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRequest(r);
                        setSearchModalOpen(false);
                        if (activeRole === 'Citizen') {
                          handleOpenCitizenTab('all');
                        } else {
                          handleNavigate('ai-insights');
                        }
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-900 hover:bg-slate-50/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-blue-700">
                          {r.id} · {r.district} ({r.category})
                        </div>
                        <div className="text-slate-600 mt-0.5 truncate max-w-md">
                          “{r.citizenText}”
                        </div>
                      </div>
                      <span className="font-semibold text-slate-700 shrink-0 ml-3">
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIVE ALERT TOAST NOTIFICATION BANNER */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5 transition-all">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              activeToast.severity === 'critical'
                ? 'bg-red-50 border-red-200 text-red-600'
                : activeToast.severity === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : activeToast.severity === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}
          >
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700">
                {activeToast.scopeLabel || 'Live Platform Alert'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{activeToast.timestamp}</span>
            </div>
            <div className="font-bold text-slate-950 text-sm mt-0.5 leading-snug">
              {activeToast.title}
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed line-clamp-2">
              {activeToast.description}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleNotificationAction(activeToast)}
                className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                <span>
                  Open {MODULE_DISPLAY_NAMES[activeToast.targetModule] || activeToast.targetModule}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveToast(null);
                  setNotificationsOpen(true);
                }}
                className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
              >
                View All Alerts ({unreadCount})
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            aria-label="Dismiss live alert toast"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI POLICY COPILOT DRAWER */}
      <PolicyCopilotDrawer
        uiLanguage={uiLanguage}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onNavigate={handleNavigate}
        activeRole={activeRole}
      />
    </div>
  );
}
