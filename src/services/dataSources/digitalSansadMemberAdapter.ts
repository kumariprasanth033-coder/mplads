import { MPRecord } from '../../types';

export interface MemberSearchFilters {
  state?: string;
  district?: string;
  city?: string;
  party?: string;
  house?: 'Lok Sabha' | 'Rajya Sabha';
  status?: 'Sitting' | 'Former';
  constituency?: string;
  page?: number;
  limit?: number;
}

export interface FreshnessTelemetry {
  status: 'LIVE' | 'CACHED' | 'DEMO';
  lastUpdated: string;
  source: string;
  totalMembers: number;
}

/**
 * Digital Sansad Member Data Adapter (Client-Side)
 * Official Parliamentary Data Interface for 18th Lok Sabha Members
 * Connects to the server-side digitalSansadMemberAdapter
 */
export const digitalSansadMemberAdapter = {
  /**
   * Search Members by Query (Name, Constituency, State, Party) and Filters
   */
  async searchMembers(
    query: string = '',
    filters: MemberSearchFilters = {}
  ): Promise<{ mps: MPRecord[]; total: number; freshness: FreshnessTelemetry }> {
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      if (filters.state) params.append('state', filters.state);
      if (filters.district) params.append('district', filters.district);
      if (filters.city) params.append('city', filters.city);
      if (filters.party) params.append('party', filters.party);
      if (filters.house) params.append('house', filters.house);
      if (filters.status) params.append('status', filters.status);
      if (filters.constituency) params.append('constituency', filters.constituency);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const res = await fetch(`/api/mps?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Digital Sansad member endpoint failed with status ${res.status}`);
      }
      const data = await res.json();
      return {
        mps: data.mps || [],
        total: data.total ?? (data.mps ? data.mps.length : 0),
        freshness: data.freshness || {
          status: 'CACHED',
          lastUpdated: new Date().toISOString(),
          source: 'Digital Sansad Parliamentary Records',
          totalMembers: data.count || 0,
        },
      };
    } catch (err) {
      console.warn('digitalSansadMemberAdapter searchMembers failed:', err);
      throw err;
    }
  },

  /**
   * Get all registered Members across all States & Union Territories
   */
  async getAllMembers(page: number = 1, limit: number = 100): Promise<MPRecord[]> {
    const result = await this.searchMembers('', { page, limit });
    return result.mps;
  },

  /**
   * Get Members of Parliament for a specific State or Union Territory
   */
  async getMembersByState(state: string): Promise<MPRecord[]> {
    if (!state) return this.getAllMembers();
    const result = await this.searchMembers('', { state });
    return result.mps;
  },

  /**
   * Get Member by full or partial Name
   */
  async getMemberByName(name: string): Promise<MPRecord | null> {
    if (!name.trim()) return null;
    const result = await this.searchMembers(name.trim());
    return (
      result.mps.find(
        m =>
          m.name.toLowerCase().includes(name.toLowerCase().trim()) ||
          (m.displayName && m.displayName.toLowerCase().includes(name.toLowerCase().trim()))
      ) || null
    );
  },

  /**
   * Get Member representing a specific Parliamentary Constituency
   */
  async getMemberByConstituency(constituency: string): Promise<MPRecord | null> {
    if (!constituency.trim()) return null;
    const result = await this.searchMembers(constituency.trim(), { constituency: constituency.trim() });
    return (
      result.mps.find(
        m => m.constituency.toLowerCase() === constituency.toLowerCase().trim()
      ) || (result.mps.length > 0 ? result.mps[0] : null)
    );
  },

  /**
   * Get single Member details by official ID
   */
  async getMemberById(id: string): Promise<{ mp: MPRecord; projects: any[] } | null> {
    try {
      const res = await fetch(`/api/mps/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('digitalSansadMemberAdapter getMemberById failed:', err);
      return null;
    }
  },

  /**
   * Get official photo metadata for a member
   */
  getMemberPhoto(member: MPRecord): {
    photoUrl: string;
    isVerified: boolean;
    photoSource: string;
  } {
    const verifiedUrl = member.officialPhotoUrl || member.photoUrl || member.photo;
    if (member.photoVerified && verifiedUrl) {
      return {
        photoUrl: verifiedUrl,
        isVerified: true,
        photoSource: member.photoSource || 'Official Digital Sansad',
      };
    }
    return {
      photoUrl: '',
      isVerified: false,
      photoSource: 'Official photo unavailable',
    };
  },

  /**
   * Refresh Member data from official parliamentary upstream
   */
  async refreshMemberData(): Promise<{
    success: boolean;
    status: 'LIVE' | 'CACHED' | 'DEMO';
    lastUpdated: string;
  }> {
    try {
      const res = await fetch('/api/mps/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Refresh endpoint error');
      return await res.json();
    } catch (err) {
      console.warn('refreshMemberData error:', err);
      return {
        success: false,
        status: 'CACHED',
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch current data freshness indicator status
   */
  async getDataFreshness(): Promise<FreshnessTelemetry> {
    try {
      const res = await fetch('/api/mps/telemetry');
      if (!res.ok) throw new Error('Telemetry endpoint error');
      return await res.json();
    } catch (err) {
      return {
        status: 'CACHED',
        lastUpdated: new Date().toISOString(),
        source: 'Digital Sansad Parliamentary Records',
        totalMembers: 0,
      };
    }
  },

  /**
   * Fetch politician information & imagery from Wikidata API & Google Civic Information API
   */
  async getCivicInfo(mpId: string): Promise<any> {
    try {
      const res = await fetch(`/api/mps/${encodeURIComponent(mpId)}/civic-info`);
      if (!res.ok) throw new Error('Civic info endpoint returned non-200');
      return await res.json();
    } catch (err) {
      console.warn('getCivicInfo error:', err);
      return null;
    }
  },

  /**
   * Force live re-enrichment from Wikidata API & Google Civic Information API
   */
  async enrichWithCivicData(mpId: string): Promise<any> {
    try {
      const res = await fetch(`/api/mps/${encodeURIComponent(mpId)}/civic-enrich`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Civic enrich endpoint returned non-200');
      return await res.json();
    } catch (err) {
      console.warn('enrichWithCivicData error:', err);
      return null;
    }
  },

  /**
   * Sync official photo via verified identity pipeline (Digital Sansad -> Wikidata P18 -> Wikimedia Commons)
   * Adheres strictly to the requirement:
   * Real progress steps: Finding official identity -> Resolving Wikidata -> Finding verified image -> Verifying image -> Saving image -> Completed
   */
  async syncOfficialPhoto(mpId: string): Promise<{
    success: boolean;
    phase: string;
    steps: { title: string; status: 'completed' | 'pending' | 'failed' | 'skipped' }[];
    mp?: MPRecord;
    photoRecord?: any;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/mps/${encodeURIComponent(mpId)}/sync-photo`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          phase: 'Official photo unavailable',
          steps: errJson.steps || [],
          error: errJson.error || 'Failed to sync official photo',
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        phase: 'Official photo unavailable',
        steps: [],
        error: err?.message || 'Network error syncing photo',
      };
    }
  },

  /**
   * Refresh Members (alias required by Requirement 14)
   */
  async refreshMembers() {
    return this.refreshMemberData();
  },
};

/**
 * Standard alias matching Requirement 14
 */
export const digitalSansadAdapter = digitalSansadMemberAdapter;

