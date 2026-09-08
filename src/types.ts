export type Role =
  | 'MP'
  | 'ADMIN'
  | 'DISTRICT_OFFICER'
  | 'IMPLEMENTING_AGENCY'
  | 'AUDITOR'
  | 'CITIZEN'
  | 'GUEST';

export type UserRole = Role;

export interface AnalyticsSummary {
  totalProjects: number;
  totalSanctionedCr: number;
  totalExpendedCr: number;
  avgCompletionRate: number;
  sectorBreakdown: Array<{
    sector: string;
    amountLakhs: number;
    count: number;
    percentage: number;
  }>;
  districtPerformance: Array<{
    district: string;
    state: string;
    worksCount: number;
    sanctionedAmountLakhs: number;
    utilizationPercentage: number;
  }>;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  state?: string;
  district?: string;
  constituency?: string;
  designation?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
  isDemo?: boolean;
}

export interface MPWikidataInfo {
  id?: string;
  label?: string;
  description?: string;
  wikipediaUrl?: string;
  wikidataUrl?: string;
  imageFileName?: string;
  photoUrl?: string;
  birthDate?: string;
  birthPlace?: string;
  education?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  positionHeld?: string[];
  lastEnriched?: string;
}

export interface MPCivicInfo {
  source: string;
  office?: string;
  phones?: string[];
  urls?: string[];
  emails?: string[];
  channels?: Array<{ type: string; id: string }>;
  photoUrl?: string;
  status: 'ACTIVE' | 'NOT_CONFIGURED' | 'FALLBACK_WIKIDATA';
  apiKeyConfigured?: boolean;
}

export interface MPProfile {
  id: string;
  source: string;
  sourceMemberId: string;
  name: string;
  normalizedName: string;
  party: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  constituency: string;
  constituencyCode?: string;
  state: string;
  stateCode?: string;
  district?: string;
  membershipStatus: 'Sitting' | 'Former';
  lokSabhaTerms?: string;
  officialProfileUrl: string;

  photoUrl?: string;
  officialPhotoUrl?: string;
  wikimediaUrl?: string;
  photoSource?: string;
  photoVerified?: boolean;
  photoConfidence?: number;

  wikidataId?: string;
  wikipediaUrl?: string;
  wikimediaMediaUrl?: string;

  syncedAt?: string;
  lastVerifiedAt?: string;
  dataStatus?: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE';

  worksCount?: number;
  sanctionedCr?: number;
  utilizedCr?: number;
  utilizationPercentage?: number;
  hasFinancialData?: boolean;
  isFinancialDemo?: boolean;

  email?: string;
  phone?: string;
  contactOffice?: string;
}

export interface MPRecord {
  id: string;
  name: string;
  displayName?: string;
  party: string;
  constituency: string;
  state: string;
  district?: string;
  city?: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  membershipStatus: 'Sitting' | 'Former';
  term: string;
  lokSabhaTerms?: string;
  photo?: string;
  photoUrl?: string;
  officialPhotoUrl?: string;
  wikimediaUrl?: string;
  officialProfileUrl: string;
  photoSource?: string;
  photoVerified?: boolean;
  source: string;
  lastUpdated: string;
  isLive: boolean;
  dataSourceStatus?: 'LIVE' | 'CACHED' | 'DEMO';
  isFinancialDemo?: boolean;
  contactEmail?: string;
  contactOffice?: string;
  email?: string;
  phone?: string;
  wikidataId?: string;
  wikidata?: MPWikidataInfo;
  civicInfo?: MPCivicInfo;

  // Convenience and compatibility fields for UI
  sanctionedAmountCr?: number;
  utilizedAmountCr?: number;
  totalWorks?: number;
  completedWorks?: number;
  inProgressWorks?: number;
  delayedWorks?: number;
  utilizationRate?: number;
  hasFinancialData?: boolean;

  stats?: {
    totalProjects: number;
    sanctionedAmountLakhs: number;
    utilizedAmountLakhs: number;
    completedProjects: number;
    inProgressProjects: number;
    delayedProjects: number;
    entitlementLakhs: number;
  };
  fundUtilization?: MPFundUtilization;
}

export interface MPFundUtilization {
  allocatedAmountLakhs: number;
  sanctionedAmountLakhs: number;
  utilizedAmountLakhs: number;
  recommendedWorksCount: number;
  completedWorksCount: number;
  ongoingWorksCount: number;
}

export type ProjectStatus =
  | 'Proposed'
  | 'Recommended'
  | 'Verified'
  | 'Sanctioned'
  | 'In Progress'
  | 'Near Completion'
  | 'Completed'
  | 'Delayed';

export type ProjectSector =
  | 'Drinking Water'
  | 'Road Construction'
  | 'Community Hall'
  | 'School Building'
  | 'Sanitation'
  | 'Health & Family Welfare'
  | 'Irrigation & Flood Control'
  | 'Non-Conventional Energy'
  | 'Sports & Youth Development'
  | 'Other Public Utilities';

export interface ProjectEvidence {
  id: string;
  stage: 'Before' | 'During' | 'Current / After';
  url: string;
  description: string;
  date: string;
  uploadedBy: string;
  gpsLocation?: { lat: number; lng: number };
}

export interface ProjectDocument {
  id: string;
  name: string;
  type:
    | 'Sanction Order'
    | 'Work Order'
    | 'Utilization Certificate'
    | 'Completion Certificate'
    | 'Inspection Report';
  status: 'Available' | 'Missing' | 'Needs Verification';
  url?: string;
  uploadDate?: string;
  fileSize?: string;
}

export interface ProjectTimelineEvent {
  status: ProjectStatus;
  date: string;
  note?: string;
  updatedBy?: string;
}

export interface ProjectRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  category: ProjectSector;
  mpId: string;
  mpName: string;
  state: string;
  district: string;
  constituency: string;
  block?: string;
  village?: string;
  pincode?: string;
  department: string;
  implementingAgency: string;
  coordinates: { lat: number; lng: number };
  financial: {
    recommendedAmountLakhs: number;
    sanctionedAmountLakhs: number;
    releasedAmountLakhs: number;
    expenditureLakhs: number;
    balanceLakhs: number;
  };
  status: ProjectStatus;
  progressPercentage: number;
  timeline: ProjectTimelineEvent[];
  evidence: ProjectEvidence[];
  documents: ProjectDocument[];
  transparencyScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  year: string;
  lastUpdated: string;
  source: 'SIH DEMO DATA' | 'LIVE DATA';
  convergenceScheme?: string;
}

export type PrecheckRecommendation =
  | 'PROCEED'
  | 'HOLD FOR VERIFICATION'
  | 'CONSIDER CONVERGENCE'
  | 'POSSIBLE DUPLICATE / OVERLAP';

export interface PrecheckInput {
  projectName: string;
  description: string;
  location: string;
  state: string;
  district: string;
  constituency: string;
  category: ProjectSector;
  estimatedCostLakhs: number;
  proposedBy: string;
  department: string;
}

export interface PrecheckResult {
  recommendation: PrecheckRecommendation;
  overallConfidence: number;
  summary: string;
  duplicateCheck: {
    score: number;
    semanticSimilarity: number;
    locationSimilarity: number;
    categorySimilarity: number;
    overallSimilarity: number;
    hasFlag: boolean;
    matchedProjects: Array<{
      id: string;
      title: string;
      similarity: number;
      reason: string;
      status: string;
      sanctionedAmountLakhs: number;
    }>;
  };
  existingFundingCheck: {
    hasOverlap: boolean;
    existingFundingFound: boolean;
    notes: string;
    identifiedSources: string[];
  };
  problemScopeCheck: {
    scopeLevel: 'Local' | 'District' | 'State' | 'Central';
    notes: string;
    isAppropriateForMPLADS: boolean;
  };
  convergenceCheck: {
    eligibleSchemes: string[];
    convergenceScore: number;
    savingsPotentialLakhs: number;
    suggestions: string;
  };
  documentCheck: {
    completenessScore: number;
    missingDocuments: string[];
    status: 'Complete' | 'Partially Missing' | 'Critical Missing';
    analysis: string;
  };
  riskAnalysis: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: string[];
    warningNote?: string;
  };
  disclaimer: string;
}

export interface ComplaintRecord {
  id: string;
  trackingId: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  problemTitle: string;
  description: string;
  category: ProjectSector;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: {
    state: string;
    district: string;
    constituency?: string;
    village?: string;
    pincode?: string;
    lat?: number;
    lng?: number;
  };
  possibleLevel: 'Local' | 'District' | 'State' | 'Central';
  matchedProjectIds?: string[];
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'Action Taken' | 'Resolved';
  assignedOfficer?: string;
  assignedAgency?: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    note: string;
    officer?: string;
  }>;
}

export interface AuditRiskItem {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  location: string;
  riskScore: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
  reason: string;
  evidenceSummary: string;
  source: string;
  timestamp: string;
  suggestedAction: string;
  status: 'Open' | 'Reviewed' | 'Dismissed' | 'Action Initiated';
}

export interface ActionQueueItem {
  id: string;
  type: 'NEW_RECOMMENDATION' | 'PENDING_VERIFICATION' | 'PENDING_SANCTION' | 'DELAYED_WORK' | 'DOCUMENT_FLAG';
  projectId: string;
  title: string;
  mpName: string;
  constituency: string;
  amountLakhs: number;
  submittedDate: string;
  priority: 'High' | 'Medium' | 'Normal';
  aiPrecheckStatus?: PrecheckRecommendation;
  flagReason?: string;
}

export interface MPLADSSearchIntent {
  query: string;
  intent: 'project_search' | 'mp_search' | 'location_search' | 'risk_search' | 'financial_search' | 'general_search';
  entityType?: 'project' | 'mp' | 'state' | 'district' | 'city' | 'constituency' | 'implementing_agency' | 'grievance' | 'report' | 'financial_data' | 'alert' | 'risk_case' | 'all';
  state?: string;
  district?: string;
  city?: string;
  constituency?: string;
  mpId?: string;
  mpName?: string;
  house?: 'Lok Sabha' | 'Rajya Sabha' | 'All';
  party?: string;
  projectStatus?: 'Delayed' | 'Completed' | 'In Progress' | 'Sanctioned' | 'Proposed' | 'All';
  workType?: string;
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL';
  financialYear?: string;
  utilizationRange?: { min?: number; max?: number };
  progressRange?: { min?: number; max?: number };
  dateRange?: { start?: string; end?: string };
  sortBy?: 'latest' | 'amount' | 'progress' | 'risk' | 'utilization';
  understoodQuery?: string;
  detectedFilters?: Record<string, string>;
  explanation?: string;
}

export interface DashboardGlobalFilters {
  stateId?: string;
  state: string;
  districtId?: string;
  district: string;
  constituencyId?: string;
  constituency: string;
  house: 'All' | 'Lok Sabha' | 'Rajya Sabha';
  mpId: string;
  projectStatus: string;
  workType: string;
  riskLevel: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  financialYear: string;
  dateRange?: { start?: string; end?: string };
  searchQuery: string;
  visualization?: string;
}

