export type NavModule =
  | 'home'
  | 'citizen-requests'
  | 'ai-insights'
  | 'demand-hotspots'
  | 'infrastructure-gaps'
  | 'recommendations'
  | 'impact-simulator'
  | 'department-actions'
  | 'analytics'
  | 'data-sources'
  | 'public-updates'
  | 'citizen-help'
  | 'sys-users'
  | 'sys-roles'
  | 'sys-datasets'
  | 'sys-audit'
  | 'sys-config';

export type UserRole =
  | 'Citizen'
  | 'District Officer'
  | 'Department Officer'
  | 'State Administrator'
  | 'National Policymaker'
  | 'System Administrator';

export interface ManagedUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jurisdiction: string;
  department: string;
  status: 'Active' | 'Disabled';
  lastActive: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  module: string;
  jurisdiction: string;
  timestamp: string;
  status: 'Authorized' | 'Restricted' | 'Modified';
}

export type SupportedLanguage = 'English' | 'Marathi' | 'Hindi';

export type InfrastructureCategory =
  | 'Healthcare'
  | 'Education'
  | 'Roads'
  | 'Water'
  | 'Sanitation'
  | 'Electricity'
  | 'Public Transport'
  | 'Internet Connectivity'
  | 'Housing'
  | 'Agriculture'
  | 'Waste Management'
  | 'Other';

export type GapCategory =
  | 'Healthcare'
  | 'Education'
  | 'Water'
  | 'Roads'
  | 'Electricity'
  | 'Sanitation'
  | 'Digital Connectivity'
  | 'Transport';

export type CaseStatus = 'New' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';

export interface ScoreBreakdown {
  citizenDemand: number; // e.g., +30
  populationImpact: number; // e.g., +25
  infrastructureGap: number; // e.g., +20
  urgency: number; // e.g., +15
  trend: number; // e.g., +10
  existingInvestment: number; // e.g., -10 or -12
}

export interface DistrictHotspot {
  id: string;
  district: string;
  state: string;
  stateCode: string;
  mainIssue: InfrastructureCategory;
  specificProblem: string;
  requestCount: number;
  populationAffected: number;
  populationFormatted: string;
  infrastructureGapLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  gapScore: number; // 0-100
  availabilityScore: number; // 0-100
  existingInvestmentLevel: 'Low' | 'Medium' | 'High';
  investmentCr: number; // X-axis in scatter plot (₹ Cr allocated)
  demandIndex: number; // Y-axis in scatter plot (0-100 normalized demand)
  priorityScore: number; // 0-100
  trendPercent: number; // e.g. +32
  scoreBreakdown: ScoreBreakdown;
  priorityReasons: string[];
  categoryGaps: Record<GapCategory, {
    demand: number;
    availability: number;
    gapScore: number;
    investmentCr: number;
    trend: string;
  }>;
  coordinates: { x: number; y: number }; // SVG viewBox 0..600 x 0..660
  underservedPopulation: number;
  avgAccessDistanceKm: number;
}

export interface StateIntelligence {
  code: string;
  name: string;
  region: 'North' | 'West' | 'South' | 'East' | 'Central' | 'Northeast';
  citizenRequests: number;
  topDemand: InfrastructureCategory;
  infrastructureGap: 'High' | 'Medium' | 'Low';
  existingInvestment: 'Low' | 'Medium' | 'High';
  priorityAreas: number;
  affectedPopulation: string;
  affectedPopulationNum: number;
  monthlyGrowth: number;
  coordinates: { x: number; y: number };
  svgPath: string;
}

export interface GeminiStructuredAnalysis {
  language: string;
  originalText: string;
  normalizedIssue: string;
  category: string;
  subcategory: string;
  location: string;
  urgency: string;
  summary: string;
  infrastructureType: string;
  confidence: string;
  reasoning: string;
}

export interface CitizenRequestRecord {
  id: string;
  citizenText: string;
  detectedLanguage: SupportedLanguage;
  translatedMeaning: string;
  extractedIssue: string;
  category: InfrastructureCategory;
  subcategory: string;
  infrastructureType?: string;
  confidence?: string;
  aiReasoning?: string;
  analyzedByGemini?: boolean;
  geminiAnalysis?: GeminiStructuredAnalysis;
  state: string;
  district: string;
  villageOrCity: string;
  landmark?: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  sentiment: string;
  affectedPopulation: number;
  similarRequestsCount: number;
  nearbyVillagesCount: number;
  recentSixMonthsPct: number;
  existingInfrastructureNearby: string;
  priorityScore: number;
  assignedDepartment: string;
  assignedOfficer: string;
  status: CaseStatus;
  submittedAt: string;
  isOwnRequest?: boolean;
  supportedByUser?: boolean;
  aiSummary: string;
  suggestedAction: string;
  timeline: {
    step: string;
    timestamp: string;
    completed: boolean;
    detail: string;
  }[];
}

export interface CollectiveCluster {
  id: string;
  underlyingIssue: string;
  category: InfrastructureCategory;
  state: string;
  district: string;
  citizenReports: number;
  affectedVillages: number;
  estimatedPopulation: number;
  trendSixMonths: string;
  priorityScore: number;
  samplePhrases: { lang: string; text: string }[];
  monthlyVolume: { month: string; count: number }[];
}

export interface DevelopmentRecommendation {
  id: string;
  recommendedProject: string;
  districtId: string;
  district: string;
  state: string;
  category: InfrastructureCategory;
  priorityScore: number;
  problemAddressed: string;
  citizenDemandCount: number;
  populationImpact: string;
  infrastructureGap: 'Critical' | 'High' | 'Moderate';
  existingInvestment: 'Low' | 'Medium' | 'High';
  estimatedBeneficiaries: string;
  estimatedBeneficiariesNum: number;
  estimatedCostCr: number;
  recommendedDepartment: string;
  aiReasoning: string;
  evidencePoints: string[];
  status: 'Pending Review' | 'Sent to Department' | 'In Simulation' | 'Approved';
  defaultProjectCount: number;
}

export interface PlatformNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  targetModule: NavModule;
  district?: string;
  state?: string;
  department?: string;
  category?: InfrastructureCategory;
  scopeLabel?: string;
  allowedRoles?: UserRole[];
  read: boolean;
}
