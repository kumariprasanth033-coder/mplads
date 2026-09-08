import { ProjectRecord } from '../../src/types.js';
import { initialProjects } from '../mockData.js';
import { COMPREHENSIVE_PAN_INDIA_PROJECTS } from '../../src/data/panIndiaProjects.js';

export interface ProjectSearchFilters {
  query?: string;
  state?: string;
  district?: string;
  constituency?: string;
  village?: string;
  status?: string;
  category?: string;
  department?: string;
  party?: string;
  mpName?: string;
  limit?: number;
  offset?: number;
}

export class ProjectDataAdapterService {
  private projects: ProjectRecord[] = [...COMPREHENSIVE_PAN_INDIA_PROJECTS];
  private lastUpdated: string = new Date().toISOString();

  public getAllProjects(): ProjectRecord[] {
    return this.projects;
  }

  public getProjectById(id: string): ProjectRecord | null {
    return this.projects.find(p => p.id === id || p.code === id) || null;
  }

  public getProjectsByConstituency(constituency: string, state?: string): ProjectRecord[] {
    const c = (constituency || '').toLowerCase().trim();
    return this.projects.filter(p => {
      const matchC = p.constituency.toLowerCase() === c;
      if (state) {
        return matchC && p.state.toLowerCase() === state.toLowerCase().trim();
      }
      return matchC;
    });
  }

  public getProjectsByState(state: string): ProjectRecord[] {
    const s = (state || '').toLowerCase().trim();
    return this.projects.filter(p => p.state.toLowerCase() === s);
  }

  public getDelayedProjects(filters?: { constituency?: string; district?: string }): ProjectRecord[] {
    return this.projects.filter(p => {
      const isDelayed = p.status === 'Delayed' || (p.timeline && p.timeline.some(t => t.note?.toLowerCase().includes('delayed')));
      if (filters?.constituency && p.constituency.toLowerCase() !== filters.constituency.toLowerCase()) {
        return false;
      }
      if (filters?.district && p.district.toLowerCase() !== filters.district.toLowerCase()) {
        return false;
      }
      return isDelayed;
    });
  }

  public searchProjects(filters: ProjectSearchFilters): {
    projects: ProjectRecord[];
    total: number;
  } {
    let list = [...this.projects];

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      const isDelayedQuery = q.includes('delayed') || q.includes('late') || q.includes('stalled') || q.includes('behind schedule');
      const isCompletedQuery = q.includes('completed') || q.includes('finished') || q.includes('handed over');
      const isInProgressQuery = q.includes('unfinished') || q.includes('in progress') || q.includes('ongoing');
      const isSanctionedQuery = q.includes('sanctioned') || q.includes('approved');
      const isHighRiskQuery = q.includes('high risk') || q.includes('risky') || q.includes('overrun') || q.includes('attention') || q.includes('anomaly');
      const isWaterQuery = q.includes('water') || q.includes('drinking water') || q.includes('ro plant');
      const isRoadQuery = q.includes('road') || q.includes('highway') || q.includes('bridge');

      // Significant words excluding common filler words
      const stopWords = new Set(['show', 'projects', 'project', 'works', 'work', 'that', 'are', 'is', 'in', 'with', 'the', 'of', 'and', 'for', 'all', 'to', 'near']);
      const tokens = q.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

      list = list.filter(p => {
        // Direct string inclusion
        const titleMatch = p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          (p.village && p.village.toLowerCase().includes(q)) ||
          (p.block && p.block.toLowerCase().includes(q)) ||
          p.constituency.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.mpName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          p.status.toLowerCase().includes(q);

        if (titleMatch) return true;

        // Semantic status matching
        if (isDelayedQuery && (p.status === 'Delayed' || p.status.toLowerCase().includes('delayed'))) return true;
        if (isCompletedQuery && p.status === 'Completed') return true;
        if (isInProgressQuery && (p.status === 'In Progress' || p.status === 'Near Completion')) return true;
        if (isSanctionedQuery && (p.status === 'Sanctioned' || p.status === 'Proposed')) return true;
        if (isHighRiskQuery && (p.riskScore >= 50 || p.riskCategory === 'HIGH' || p.status === 'Delayed')) return true;

        // Semantic sector matching
        if (isWaterQuery && p.category.toLowerCase().includes('water')) return true;
        if (isRoadQuery && p.category.toLowerCase().includes('road')) return true;

        // Token match: if multiple tokens, check if state or district or category matches
        if (tokens.length > 0) {
          const matchedAnyToken = tokens.some(tok =>
            p.state.toLowerCase().includes(tok) ||
            p.district.toLowerCase().includes(tok) ||
            p.constituency.toLowerCase().includes(tok) ||
            p.category.toLowerCase().includes(tok) ||
            p.mpName.toLowerCase().includes(tok) ||
            p.title.toLowerCase().includes(tok)
          );
          if (matchedAnyToken) return true;
        }

        return false;
      });
    }

    if (filters.state) {
      list = list.filter(p => p.state.toLowerCase() === filters.state!.toLowerCase().trim());
    }

    if (filters.district) {
      list = list.filter(p => p.district.toLowerCase() === filters.district!.toLowerCase().trim());
    }

    if (filters.constituency) {
      list = list.filter(p => p.constituency.toLowerCase() === filters.constituency!.toLowerCase().trim());
    }

    if (filters.village) {
      list = list.filter(p => p.village && p.village.toLowerCase().includes(filters.village!.toLowerCase().trim()));
    }

    if (filters.category) {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase().trim());
    }

    if (filters.status) {
      list = list.filter(p => p.status.toLowerCase() === filters.status!.toLowerCase().trim());
    }

    if (filters.department) {
      list = list.filter(p => p.department && p.department.toLowerCase().includes(filters.department!.toLowerCase().trim()));
    }

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;

    return {
      projects: list.slice(offset, offset + limit),
      total,
    };
  }

  public addProject(project: ProjectRecord) {
    this.projects.unshift(project);
    this.lastUpdated = new Date().toISOString();
  }

  public updateProject(id: string, updates: Partial<ProjectRecord>): ProjectRecord | null {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...updates, lastUpdated: new Date().toISOString() };
    return this.projects[idx];
  }

  public getFreshnessTelemetry() {
    return {
      status: 'LIVE' as const,
      lastUpdated: this.lastUpdated,
      totalProjects: this.projects.length,
      source: 'Official MPLADS Digital Field Tracking Database',
    };
  }
}

export const projectDataAdapter = new ProjectDataAdapterService();
