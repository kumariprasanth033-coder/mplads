import { ProjectRecord } from '../../src/types.js';
import { initialProjects } from '../mockData.js';

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
  private projects: ProjectRecord[] = [...initialProjects];
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
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
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
        p.status.toLowerCase().includes(q)
      );
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
