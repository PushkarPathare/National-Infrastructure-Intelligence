import { AuditLogEntry, ManagedUserRecord, NavModule, UserRole } from '../types/platform';

export interface RoleNavGroup {
  groupTitle: string;
  items: {
    id: NavModule;
    label: string;
    accessBadge?: '✏ Edit Access' | '👁 View Only' | '✓ Approved' | '⚠ Requires Review';
  }[];
}

export interface RolePermissionProfile {
  role: UserRole;
  icon: string;
  shortTitle: string;
  demoUserName: string;
  demoDesignation: string;
  scopeBadge: string;
  jurisdictionType: 'Own Requests' | 'District' | 'Department' | 'State' | 'National' | 'System';
  assignedDistrictId?: string;
  assignedDistrictName?: string;
  assignedStateName?: string;
  assignedDepartment?: string;
  assignedCategory?: string;
  accessLevelLabel: '👁 View & Submit Own' | '✏ District Operational' | '✏ Department Operational' | '✏ State Executive' | '✓ National Policy Access' | '⚙️ Full System Admin';
  aiInsightCallout: string;
  aiInsightSubtext: string;
  allowedModules: NavModule[];
  restrictedPreviewModules: {
    id: NavModule;
    label: string;
    requiredRole: UserRole;
  }[];
  navGroups: RoleNavGroup[];
  recommendationPermissions: {
    canViewRecommendations: boolean;
    canViewEvidence: boolean;
    canReview: boolean;
    canApprove: boolean;
    canAssign: boolean;
    canSimulateImpact: boolean;
    canTrackImpact: boolean;
  };
  privacyLevel: 'Citizen-Public' | 'Officer-Operational' | 'Policymaker-Aggregated' | 'Admin-Governance';
  description: string;
}

export const ROLE_ORDER: UserRole[] = [
  'Citizen',
  'District Officer',
  'Department Officer',
  'State Administrator',
  'National Policymaker',
  'System Administrator',
];

export const RBAC_PROFILES: Record<UserRole, RolePermissionProfile> = {
  Citizen: {
    role: 'Citizen',
    icon: '👤',
    shortTitle: 'Citizen',
    demoUserName: 'Citizen',
    demoDesignation: 'Resident · Ambegaon Rural Cluster, Pune',
    scopeBadge: '📍 Scope: Own Requests (Pune District)',
    jurisdictionType: 'Own Requests',
    assignedDistrictId: 'dist-pune',
    assignedDistrictName: 'Pune District',
    assignedStateName: 'Maharashtra',
    accessLevelLabel: '👁 View & Submit Own',
    aiInsightCallout: 'Your request has been categorized as Healthcare Infrastructure.',
    aiInsightSubtext:
      'Your submission (REQ-MH-92831) is grouped with 387 community reports in Ambegaon block and is currently Under Review by the Health Department.',
    allowedModules: ['home', 'citizen-requests', 'public-updates', 'citizen-help'],
    restrictedPreviewModules: [
      { id: 'analytics', label: 'National Analytics', requiredRole: 'National Policymaker' },
      { id: 'recommendations', label: 'AI Policy Recommendations', requiredRole: 'District Officer' },
      { id: 'department-actions', label: 'Department Officer Console', requiredRole: 'Department Officer' },
      { id: 'sys-datasets', label: 'Dataset Management', requiredRole: 'System Administrator' },
    ],
    navGroups: [
      {
        groupTitle: 'HOME',
        items: [{ id: 'home', label: 'My Dashboard', accessBadge: '👁 View Only' }],
      },
      {
        groupTitle: 'MY REQUESTS',
        items: [
          { id: 'citizen-requests', label: 'Submit & Track Requests', accessBadge: '✏ Edit Access' },
        ],
      },
      {
        groupTitle: 'INFORMATION',
        items: [
          { id: 'public-updates', label: 'Infrastructure Issues & Public Updates', accessBadge: '👁 View Only' },
          { id: 'citizen-help', label: 'Help & Citizen Charter', accessBadge: '👁 View Only' },
        ],
      },
    ],
    recommendationPermissions: {
      canViewRecommendations: false,
      canViewEvidence: false,
      canReview: false,
      canApprove: false,
      canAssign: false,
      canSimulateImpact: false,
      canTrackImpact: false,
    },
    privacyLevel: 'Citizen-Public',
    description:
      'Access limited to submitting development requests, tracking personal request status, and viewing public infrastructure updates.',
  },

  'District Officer': {
    role: 'District Officer',
    icon: '🏢',
    shortTitle: 'District Officer',
    demoUserName: 'District Officer',
    demoDesignation: 'District Collector & Magistrate · Pune District',
    scopeBadge: '📍 Scope: Pune District',
    jurisdictionType: 'District',
    assignedDistrictId: 'dist-pune',
    assignedDistrictName: 'Pune District',
    assignedStateName: 'Maharashtra',
    accessLevelLabel: '✏ District Operational',
    aiInsightCallout: 'Healthcare requests have increased by 18% in the selected district.',
    aiInsightSubtext:
      'Showing data for Pune District: 8,432 clustered citizen requests across 42 rural villages indicate an urgent 24x7 Community Healthcare Centre deficit.',
    allowedModules: [
      'home',
      'citizen-requests',
      'ai-insights',
      'demand-hotspots',
      'infrastructure-gaps',
      'recommendations',
      'department-actions',
    ],
    restrictedPreviewModules: [
      { id: 'analytics', label: 'National Analytics', requiredRole: 'National Policymaker' },
      { id: 'impact-simulator', label: 'National Budget Simulator', requiredRole: 'State Administrator' },
      { id: 'sys-users', label: 'User & Role Management', requiredRole: 'System Administrator' },
    ],
    navGroups: [
      {
        groupTitle: 'DISTRICT JURISDICTION (PUNE)',
        items: [
          { id: 'home', label: 'District Dashboard', accessBadge: '👁 View Only' },
          { id: 'citizen-requests', label: 'District Requests', accessBadge: '✏ Edit Access' },
          { id: 'demand-hotspots', label: 'District Demand Hotspots', accessBadge: '👁 View Only' },
          { id: 'infrastructure-gaps', label: 'Infrastructure Gaps', accessBadge: '⚠ Requires Review' },
        ],
      },
      {
        groupTitle: 'PROJECTS & PRIORITY',
        items: [
          { id: 'department-actions', label: 'Assigned Projects', accessBadge: '✏ Edit Access' },
          { id: 'recommendations', label: 'District Priority Analysis', accessBadge: '👁 View Only' },
          { id: 'ai-insights', label: 'District AI Insights', accessBadge: '👁 View Only' },
        ],
      },
    ],
    recommendationPermissions: {
      canViewRecommendations: true,
      canViewEvidence: true,
      canReview: true,
      canApprove: false,
      canAssign: true,
      canSimulateImpact: false,
      canTrackImpact: true,
    },
    privacyLevel: 'Officer-Operational',
    description:
      'Jurisdiction restricted to Pune District. Validates local citizen needs, inspects district gaps, and coordinates district-level works.',
  },

  'Department Officer': {
    role: 'Department Officer',
    icon: '🏛️',
    shortTitle: 'Department Officer',
    demoUserName: 'Department Officer',
    demoDesignation: 'Joint Secretary · Health Department (Public Health & NHM)',
    scopeBadge: '🏛️ Scope: Health Department (Healthcare)',
    jurisdictionType: 'Department',
    assignedDistrictId: 'dist-pune',
    assignedDistrictName: 'Pune District',
    assignedStateName: 'Maharashtra',
    assignedDepartment: 'Health Department',
    assignedCategory: 'Healthcare',
    accessLevelLabel: '✏ Department Operational',
    aiInsightCallout: '12 healthcare infrastructure gaps require department review.',
    aiInsightSubtext:
      'Department Filter: Healthcare · 1,284 Active Clustered Requests · 12 High-Priority Projects · 8 Critical Infrastructure Gaps queued for Health Department action.',
    allowedModules: [
      'home',
      'citizen-requests',
      'ai-insights',
      'demand-hotspots',
      'infrastructure-gaps',
      'recommendations',
      'department-actions',
      'impact-simulator',
    ],
    restrictedPreviewModules: [
      { id: 'analytics', label: 'National Multi-Sector Analytics', requiredRole: 'National Policymaker' },
      { id: 'sys-datasets', label: 'Dataset Management', requiredRole: 'System Administrator' },
    ],
    navGroups: [
      {
        groupTitle: 'HEALTH DEPARTMENT CONSOLE',
        items: [
          { id: 'home', label: 'Department Dashboard', accessBadge: '👁 View Only' },
          { id: 'citizen-requests', label: 'Relevant Citizen Requests', accessBadge: '👁 View Only' },
          { id: 'infrastructure-gaps', label: 'Infrastructure Gaps (Healthcare)', accessBadge: '⚠ Requires Review' },
          { id: 'recommendations', label: 'AI Recommendations & Project Review', accessBadge: '✏ Edit Access' },
        ],
      },
      {
        groupTitle: 'EXECUTION & IMPACT',
        items: [
          { id: 'department-actions', label: 'Department Actions', accessBadge: '✏ Edit Access' },
          { id: 'impact-simulator', label: 'Impact Tracking', accessBadge: '✓ Approved' },
          { id: 'ai-insights', label: 'Sector AI Insights', accessBadge: '👁 View Only' },
        ],
      },
    ],
    recommendationPermissions: {
      canViewRecommendations: true,
      canViewEvidence: true,
      canReview: true,
      canApprove: true,
      canAssign: true,
      canSimulateImpact: true,
      canTrackImpact: true,
    },
    privacyLevel: 'Officer-Operational',
    description:
      'Scoped to Health Department (Healthcare sector). Reviews sector-specific infrastructure deficits, approves clinical recommendations, and updates case statuses.',
  },

  'State Administrator': {
    role: 'State Administrator',
    icon: '🌐',
    shortTitle: 'State Administrator',
    demoUserName: 'State Administrator',
    demoDesignation: 'Principal Secretary · Planning & Infrastructure, Maharashtra',
    scopeBadge: '🏛️ Scope: Maharashtra',
    jurisdictionType: 'State',
    assignedDistrictId: 'dist-pune',
    assignedDistrictName: 'Pune District',
    assignedStateName: 'Maharashtra',
    accessLevelLabel: '✏ State Executive',
    aiInsightCallout: 'Three districts show high healthcare demand relative to current infrastructure.',
    aiInsightSubtext:
      'State Scope: Maharashtra · 248,430 Citizen Requests · 28 Priority Areas · Comparing Gadchiroli, Pune, Nashik, and Nagpur district capital allocations.',
    allowedModules: [
      'home',
      'citizen-requests',
      'ai-insights',
      'demand-hotspots',
      'infrastructure-gaps',
      'recommendations',
      'impact-simulator',
      'department-actions',
      'analytics',
    ],
    restrictedPreviewModules: [
      { id: 'sys-users', label: 'System User Management', requiredRole: 'System Administrator' },
      { id: 'sys-config', label: 'System Configuration', requiredRole: 'System Administrator' },
    ],
    navGroups: [
      {
        groupTitle: 'MAHARASHTRA STATE COMMAND',
        items: [
          { id: 'home', label: 'State Dashboard', accessBadge: '👁 View Only' },
          { id: 'citizen-requests', label: 'Citizen Requests (State)', accessBadge: '👁 View Only' },
          { id: 'demand-hotspots', label: 'Demand Hotspots & Investment Alignment', accessBadge: '👁 View Only' },
          { id: 'infrastructure-gaps', label: 'Infrastructure Gaps', accessBadge: '⚠ Requires Review' },
        ],
      },
      {
        groupTitle: 'STATE POLICY & ANALYTICS',
        items: [
          { id: 'recommendations', label: 'Recommendations & Capital Sanction', accessBadge: '✓ Approved' },
          { id: 'analytics', label: 'Impact Analytics (Maharashtra)', accessBadge: '👁 View Only' },
          { id: 'department-actions', label: 'Department Actions', accessBadge: '✏ Edit Access' },
          { id: 'impact-simulator', label: 'State Impact Simulator', accessBadge: '✏ Edit Access' },
        ],
      },
    ],
    recommendationPermissions: {
      canViewRecommendations: true,
      canViewEvidence: true,
      canReview: true,
      canApprove: true,
      canAssign: true,
      canSimulateImpact: true,
      canTrackImpact: true,
    },
    privacyLevel: 'Policymaker-Aggregated',
    description:
      'State-wide authority across Maharashtra. Compares districts within the state, aligns state budget outlays, and sanctions high-priority recommendations.',
  },

  'National Policymaker': {
    role: 'National Policymaker',
    icon: '🇮🇳',
    shortTitle: 'National Policymaker',
    demoUserName: 'National Policymaker',
    demoDesignation: 'Member · National Infrastructure Planning Commission (India)',
    scopeBadge: '🇮🇳 Scope: India (36 States & UTs · 742 Districts)',
    jurisdictionType: 'National',
    assignedDistrictId: 'dist-pune',
    accessLevelLabel: '✓ National Policy Access',
    aiInsightCallout: 'Several regions show significant demand-infrastructure alignment gaps.',
    aiInsightSubtext:
      'National Intelligence Scope: 12.84M+ Citizen Requests across 36 States & UTs · 1,284 Active Hotspots · 216 High-Priority Areas · 48.6M Citizens Impacted.',
    allowedModules: [
      'home',
      'citizen-requests',
      'ai-insights',
      'demand-hotspots',
      'infrastructure-gaps',
      'recommendations',
      'impact-simulator',
      'department-actions',
      'analytics',
      'data-sources',
    ],
    restrictedPreviewModules: [
      { id: 'sys-users', label: 'User & Role Management', requiredRole: 'System Administrator' },
      { id: 'sys-config', label: 'System Configuration', requiredRole: 'System Administrator' },
    ],
    navGroups: [
      {
        groupTitle: 'NATIONAL COMMAND',
        items: [
          { id: 'home', label: 'National Dashboard', accessBadge: '✓ Approved' },
          { id: 'citizen-requests', label: 'Citizen Requests', accessBadge: '👁 View Only' },
          { id: 'ai-insights', label: 'AI Insights', accessBadge: '👁 View Only' },
          { id: 'demand-hotspots', label: 'Demand Hotspots & Investment Alignment', accessBadge: '👁 View Only' },
        ],
      },
      {
        groupTitle: 'POLICY & SIMULATION',
        items: [
          { id: 'infrastructure-gaps', label: 'Infrastructure Gaps', accessBadge: '⚠ Requires Review' },
          { id: 'recommendations', label: 'Recommendations', accessBadge: '✓ Approved' },
          { id: 'impact-simulator', label: 'Impact Simulator', accessBadge: '✏ Edit Access' },
        ],
      },
      {
        groupTitle: 'GOVERNANCE & DATA',
        items: [
          { id: 'department-actions', label: 'Department Actions', accessBadge: '✏ Edit Access' },
          { id: 'analytics', label: 'National Analytics', accessBadge: '✓ Approved' },
          { id: 'data-sources', label: 'Data Sources & RBAC', accessBadge: '👁 View Only' },
        ],
      },
    ],
    recommendationPermissions: {
      canViewRecommendations: true,
      canViewEvidence: true,
      canReview: true,
      canApprove: true,
      canAssign: true,
      canSimulateImpact: true,
      canTrackImpact: true,
    },
    privacyLevel: 'Policymaker-Aggregated',
    description:
      'Highest analytical access across India → State → District → Hotspot → Development Need → Recommended Project.',
  },

  'System Administrator': {
    role: 'System Administrator',
    icon: '⚙️',
    shortTitle: 'System Administrator',
    demoUserName: 'System Administrator',
    demoDesignation: 'Chief Platform Architect · National Digital Public Infrastructure',
    scopeBadge: '⚙️ Scope: System & Security Administration',
    jurisdictionType: 'System',
    assignedDistrictId: 'dist-pune',
    accessLevelLabel: '⚙️ Full System Admin',
    aiInsightCallout: 'All 6 RBAC roles, jurisdiction filters, and 18 national data connectors are operational.',
    aiInsightSubtext:
      'System Governance: Zero unauthorized cross-jurisdiction queries in last 24h · Audit Logging Active · LGD & PFMS Data Connectors Synced.',
    allowedModules: [
      'home',
      'sys-users',
      'sys-roles',
      'sys-datasets',
      'data-sources',
      'sys-audit',
      'sys-config',
      'analytics',
      'citizen-requests',
      'ai-insights',
      'demand-hotspots',
      'infrastructure-gaps',
      'recommendations',
      'impact-simulator',
      'department-actions',
    ],
    restrictedPreviewModules: [],
    navGroups: [
      {
        groupTitle: 'SYSTEM ADMINISTRATION',
        items: [
          { id: 'home', label: 'System Dashboard', accessBadge: '✏ Edit Access' },
          { id: 'sys-users', label: 'User Management', accessBadge: '✏ Edit Access' },
          { id: 'sys-roles', label: 'Role Management', accessBadge: '✏ Edit Access' },
          { id: 'sys-datasets', label: 'Dataset Management', accessBadge: '✏ Edit Access' },
          { id: 'data-sources', label: 'API / Data Sources', accessBadge: '✏ Edit Access' },
          { id: 'sys-audit', label: 'Audit Logs', accessBadge: '👁 View Only' },
          { id: 'sys-config', label: 'System Configuration', accessBadge: '✏ Edit Access' },
        ],
      },
      {
        groupTitle: 'PLATFORM MODULES (SUPERVISORY)',
        items: [
          { id: 'analytics', label: 'National Analytics', accessBadge: '👁 View Only' },
          { id: 'demand-hotspots', label: 'Demand Hotspots', accessBadge: '👁 View Only' },
          { id: 'recommendations', label: 'Recommendations', accessBadge: '👁 View Only' },
        ],
      },
    ],
    recommendationPermissions: {
      canViewRecommendations: true,
      canViewEvidence: true,
      canReview: false,
      canApprove: false,
      canAssign: false,
      canSimulateImpact: true,
      canTrackImpact: true,
    },
    privacyLevel: 'Admin-Governance',
    description:
      'Technical and administrative governance: manage users, assign roles/jurisdictions/departments, configure datasets, and inspect security audit logs.',
  },
};

export const INITIAL_MANAGED_USERS: ManagedUserRecord[] = [
  {
    id: 'USR-1001',
    name: 'National Policymaker',
    email: 'policy.national@nic.gov.in',
    role: 'National Policymaker',
    jurisdiction: 'India (All 36 States & UTs)',
    department: 'NITI & National Infrastructure Cell',
    status: 'Active',
    lastActive: '27 Sep 2026, 11:40 IST',
  },
  {
    id: 'USR-1002',
    name: 'State Administrator (Maharashtra)',
    email: 'sec.planning@maharashtra.gov.in',
    role: 'State Administrator',
    jurisdiction: 'Maharashtra State',
    department: 'State Planning & Finance Department',
    status: 'Active',
    lastActive: '27 Sep 2026, 11:32 IST',
  },
  {
    id: 'USR-1003',
    name: 'Department Officer (Health)',
    email: 'js.ruralhealth@nhm.gov.in',
    role: 'Department Officer',
    jurisdiction: 'Maharashtra / National Health Mission',
    department: 'Health Department',
    status: 'Active',
    lastActive: '27 Sep 2026, 11:25 IST',
  },
  {
    id: 'USR-1004',
    name: 'District Officer (Pune)',
    email: 'collector.pune@maharashtra.gov.in',
    role: 'District Officer',
    jurisdiction: 'Pune District',
    department: 'District Collectorate Pune',
    status: 'Active',
    lastActive: '27 Sep 2026, 11:18 IST',
  },
  {
    id: 'USR-1005',
    name: 'Department Officer (Water Resources)',
    email: 'ce.water@rajasthan.gov.in',
    role: 'Department Officer',
    jurisdiction: 'Barmer District / Rajasthan',
    department: 'Water Resources',
    status: 'Active',
    lastActive: '27 Sep 2026, 10:54 IST',
  },
  {
    id: 'USR-1006',
    name: 'Citizen (Pune District)',
    email: 'citizen.pune@citizen.in',
    role: 'Citizen',
    jurisdiction: 'Ambegaon Rural Cluster, Pune District',
    department: 'Public Citizen Portal',
    status: 'Active',
    lastActive: '27 Sep 2026, 10:42 IST',
  },
  {
    id: 'USR-1007',
    name: 'System Administrator',
    email: 'sysadmin.dpi@nic.in',
    role: 'System Administrator',
    jurisdiction: 'National Cloud & RBAC Security',
    department: 'Digital Public Infrastructure Ops',
    status: 'Active',
    lastActive: '27 Sep 2026, 11:42 IST',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-90841',
    user: 'District Officer',
    role: 'District Officer',
    action: 'Viewed Pune Infrastructure Gap & Priority Breakdown (88/100)',
    module: 'Infrastructure Gaps',
    jurisdiction: 'Pune District',
    timestamp: '27 Sep 2026 · 11:38 IST',
    status: 'Authorized',
  },
  {
    id: 'AUD-90840',
    user: 'Department Officer',
    role: 'Department Officer',
    action: 'Reviewed Healthcare Recommendation REC-MH-01 (30-Bed CHC Ambegaon)',
    module: 'Recommendations',
    jurisdiction: 'Health Department',
    timestamp: '27 Sep 2026 · 11:31 IST',
    status: 'Authorized',
  },
  {
    id: 'AUD-90839',
    user: 'Citizen',
    role: 'Citizen',
    action: 'Attempted to open National Analytics Suite',
    module: 'National Analytics',
    jurisdiction: 'Own Requests (Pune)',
    timestamp: '27 Sep 2026 · 11:24 IST',
    status: 'Restricted',
  },
  {
    id: 'AUD-90838',
    user: 'State Administrator',
    role: 'State Administrator',
    action: 'Compared Gadchiroli vs. Pune Capital Outlay Alignment',
    module: 'Demand Hotspots',
    jurisdiction: 'Maharashtra State',
    timestamp: '27 Sep 2026 · 11:15 IST',
    status: 'Authorized',
  },
  {
    id: 'AUD-90837',
    user: 'National Policymaker',
    role: 'National Policymaker',
    action: 'Simulated ₹20 Cr Healthcare Sanction across 3 Priority Districts',
    module: 'Impact Simulator',
    jurisdiction: 'India (National)',
    timestamp: '27 Sep 2026 · 11:04 IST',
    status: 'Modified',
  },
  {
    id: 'AUD-90836',
    user: 'System Administrator',
    role: 'System Administrator',
    action: 'Synced Rural Health Statistics (RHS) & PFMS Dataset Connectors',
    module: 'Dataset Management',
    jurisdiction: 'System Administration',
    timestamp: '27 Sep 2026 · 10:50 IST',
    status: 'Modified',
  },
  {
    id: 'AUD-90835',
    user: 'District Officer',
    role: 'District Officer',
    action: 'Attempted to access System Configuration & Global Dataset Management',
    module: 'System Configuration',
    jurisdiction: 'Pune District',
    timestamp: '27 Sep 2026 · 10:35 IST',
    status: 'Restricted',
  },
];

export const MODULE_DISPLAY_NAMES: Record<NavModule, string> = {
  home: 'Role Dashboard',
  'citizen-requests': 'Citizen Requests',
  'ai-insights': 'AI Insights',
  'demand-hotspots': 'Demand Hotspots',
  'infrastructure-gaps': 'Infrastructure Gaps',
  recommendations: 'Recommendations',
  'impact-simulator': 'Impact Simulator',
  'department-actions': 'Department Actions',
  analytics: 'National & State Analytics',
  'data-sources': 'Data Sources & Architecture',
  'public-updates': 'Public Updates',
  'citizen-help': 'Citizen Help & FAQ',
  'sys-users': 'User Management',
  'sys-roles': 'Role Management',
  'sys-datasets': 'Dataset Management',
  'sys-audit': 'Audit Logs',
  'sys-config': 'System Configuration',
};

export const MODULE_REQUIRED_ROLES_LABEL: Record<NavModule, string> = {
  home: 'All Authorized Roles',
  'citizen-requests': 'Citizen / Officer / Administrator / Policymaker',
  'ai-insights': 'Department Officer / State Administrator / National Policymaker',
  'demand-hotspots': 'District Officer / State Administrator / National Policymaker',
  'infrastructure-gaps': 'District / Department Officer / State Admin / National Policymaker',
  recommendations: 'District / Department Officer / State Admin / National Policymaker',
  'impact-simulator': 'National Policymaker',
  'department-actions': 'District / Department Officer / State Admin / National Policymaker',
  analytics: 'State Administrator / National Policymaker',
  'data-sources': 'National Policymaker / System Administrator',
  'public-updates': 'Citizen',
  'citizen-help': 'Citizen',
  'sys-users': 'System Administrator',
  'sys-roles': 'System Administrator',
  'sys-datasets': 'System Administrator',
  'sys-audit': 'System Administrator',
  'sys-config': 'System Administrator',
};

export const RBAC_HIERARCHY_EXPLANATION: {
  level: string;
  role: UserRole;
  icon: string;
  accessScope: string;
  description: string;
}[] = [
  {
    level: '01',
    role: 'Citizen',
    icon: '👤',
    accessScope: 'Own Requests',
    description:
      'Submit requests in English, Marathi, or Hindi; view own request status and public updates.',
  },
  {
    level: '02',
    role: 'District Officer',
    icon: '🏢',
    accessScope: 'District Data',
    description:
      'Operational requests, hotspots, infrastructure gaps, and assigned projects for Pune District.',
  },
  {
    level: '03',
    role: 'Department Officer',
    icon: '🏛️',
    accessScope: 'Department Data',
    description:
      'Sectoral requests, healthcare infrastructure gaps, AI recommendations, and project review.',
  },
  {
    level: '04',
    role: 'State Administrator',
    icon: '🌐',
    accessScope: 'State Data',
    description:
      'State-wide analytics, intra-state district comparison, and investment alignment for Maharashtra.',
  },
  {
    level: '05',
    role: 'National Policymaker',
    icon: '🇮🇳',
    accessScope: 'National Insights',
    description:
      'Highest analytical access: India → State → District → Hotspot → Need → Recommended Project.',
  },
  {
    level: '06',
    role: 'System Administrator',
    icon: '⚙️',
    accessScope: 'System Configuration',
    description:
      'User & role management, dataset connectors, security audit logs, and platform configuration.',
  },
];

