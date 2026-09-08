import {
  ProjectRecord,
  PrecheckInput,
  PrecheckResult,
  ComplaintRecord,
  AuditRiskItem,
  ActionQueueItem,
  UserProfile,
  Role,
  AnalyticsSummary,
} from '../types';

export interface ProjectSearchParams {
  query?: string;
  state?: string;
  district?: string;
  constituency?: string;
  status?: string;
  sector?: string;
  year?: string;
  mpId?: string;
  sortBy?: 'latest' | 'amount' | 'progress' | 'risk' | 'completion';
  page?: number;
  limit?: number;
}

export const api = {
  async getStats() {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return {
      totalProjects: data.totalProjects || 12,
      totalSanctionedCr: data.totalSanctionedCr || 48.6,
      totalExpendedCr: data.totalExpendedCr || 31.4,
      avgCompletionRate: data.avgCompletionRate || 74,
      sectorBreakdown: data.sectorBreakdown || [
        { sector: 'Drinking Water', amountLakhs: 450, count: 6, percentage: 32 },
        { sector: 'Road Construction', amountLakhs: 380, count: 5, percentage: 27 },
        { sector: 'School Building', amountLakhs: 290, count: 4, percentage: 21 },
        { sector: 'Health & Family Welfare', amountLakhs: 160, count: 2, percentage: 11 },
        { sector: 'Non-Conventional Energy', amountLakhs: 125, count: 3, percentage: 9 },
      ],
      districtPerformance: data.districtPerformance || [
        { district: 'Dharmapuri', state: 'Tamil Nadu', worksCount: 12, sanctionedAmountLakhs: 1405, utilizationPercentage: 81 },
        { district: 'Salem', state: 'Tamil Nadu', worksCount: 15, sanctionedAmountLakhs: 1720, utilizationPercentage: 78 },
        { district: 'Krishnagiri', state: 'Tamil Nadu', worksCount: 10, sanctionedAmountLakhs: 1150, utilizationPercentage: 75 },
      ],
    };
  },

  async getProjects(params: ProjectSearchParams = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') search.append(k, String(v));
    });
    const res = await fetch(`/api/projects?${search.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json() as Promise<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      projects: ProjectRecord[];
      allForMap: Array<{
        id: string;
        code: string;
        title: string;
        category: string;
        status: string;
        coordinates: { lat: number; lng: number };
        sanctionedAmountLakhs: number;
        progressPercentage: number;
        district: string;
        state: string;
      }>;
    }>;
  },

  async getProject(id: string): Promise<ProjectRecord> {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async createProject(data: Partial<ProjectRecord>): Promise<ProjectRecord> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async updateProject(id: string, updates: any): Promise<ProjectRecord> {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async uploadEvidence(projectId: string, evidenceData: any) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidenceData),
    });
    if (!res.ok) throw new Error('Failed to upload evidence');
    return res.json();
  },

  async uploadDocument(projectId: string, docData: any) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async runAiPrecheck(input: PrecheckInput): Promise<PrecheckResult> {
    const res = await fetch('/api/ai/precheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to run AI Pre-Check');
    return res.json();
  },

  async parseCitizenComplaint(text: string, userLocation?: string) {
    const res = await fetch('/api/ai/citizen-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, userLocation }),
    });
    if (!res.ok) throw new Error('Failed to parse complaint');
    return res.json() as Promise<{
      problemTitle: string;
      extractedLocation: string;
      category: string;
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      possibleLevel: 'Local' | 'District' | 'State' | 'Central';
      matchedExistingProjects: Array<{ id: string; title: string; distanceOrReason: string }>;
      structuredSummary: string;
      missingInformationPrompt?: string;
    }>;
  },

  async search(query: string) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search query failed');
    return res.json() as Promise<{
      query: string;
      totalMatches: number;
      counts: {
        all: number;
        mps: number;
        constituencies: number;
        projects: number;
        locations: number;
      };
      results: {
        all: any[];
        mps: any[];
        constituencies: any[];
        projects: any[];
        locations: any[];
      };
      freshness: {
        status: 'LIVE' | 'CACHED' | 'DEMO';
        lastUpdated: string;
        source: string;
      };
    }>;
  },

  async getDataFreshness() {
    const res = await fetch('/api/data/freshness');
    if (!res.ok) throw new Error('Failed to fetch data status');
    return res.json();
  },

  async refreshLiveSources() {
    const res = await fetch('/api/data/refresh', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to refresh data');
    return res.json();
  },

  async queryRoleCopilot(
    role: Role,
    query: string,
    userContext: any = {},
    history: Array<{ sender: 'user' | 'bot'; text: string }> = []
  ) {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, query, userContext, history }),
    });
    if (!res.ok) throw new Error('Copilot query failed');
    return res.json() as Promise<{
      reply: string;
      source?: string;
      lastUpdated?: string;
      status?: 'LIVE' | 'CACHED' | 'DEMO';
      relevantRecords?: any[];
    }>;
  },

  async getComplaints(params?: string | { search?: string; category?: string; status?: string }) {
    let url = '/api/complaints';
    if (typeof params === 'string') {
      url = `/api/complaints?search=${encodeURIComponent(params)}`;
    } else if (params) {
      const sp = new URLSearchParams();
      if (params.search) sp.append('search', params.search);
      if (params.category) sp.append('category', params.category);
      if (params.status) sp.append('status', params.status);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json() as Promise<ComplaintRecord[]>;
  },

  async createComplaint(data: Partial<ComplaintRecord>): Promise<ComplaintRecord> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create complaint');
    return res.json();
  },

  async updateComplaint(id: string, updates: any): Promise<ComplaintRecord> {
    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update complaint');
    return res.json();
  },

  async getAuditRisks(): Promise<AuditRiskItem[]> {
    const res = await fetch('/api/audit-risks');
    if (!res.ok) throw new Error('Failed to fetch audit risks');
    return res.json();
  },

  async updateAuditRisk(id: string, updates: any): Promise<AuditRiskItem> {
    const res = await fetch(`/api/audit-risks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update audit risk');
    return res.json();
  },

  async getActionQueue(): Promise<ActionQueueItem[]> {
    const res = await fetch('/api/action-queue');
    if (!res.ok) throw new Error('Failed to fetch action queue');
    return res.json();
  },

  async submitActionDecision(id: string, decision: 'APPROVE_SANCTION' | 'HOLD_FOR_VERIFICATION', note?: string, officerName?: string) {
    const res = await fetch(`/api/action-queue/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note, officerName }),
    });
    if (!res.ok) throw new Error('Failed to submit action decision');
    return res.json();
  },

  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch('/api/auth/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async login(roleOrEmail: { role?: Role; email?: string }): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleOrEmail),
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },
};
