import { ALL_INDIAN_STATES, ALL_UNION_TERRITORIES } from '../data/indiaStates';
import { OFFICIAL_INDIAN_DISTRICTS } from '../../server/data/indiaDistrictsData';

export interface LocationStateItem {
  stateId: string;
  stateName: string;
  isoCode: string;
  type: 'State' | 'Union Territory';
  districtCount: number;
  cityCount: number;
}

export interface LocationDistrictItem {
  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;
  headquarters?: string;
  source: string;
  lastUpdated: string;
  type: 'district';
}

export interface LocationCityItem {
  cityId: string;
  cityName: string;
  stateId: string;
  stateName: string;
  districtId?: string;
  districtName?: string;
  latitude?: string;
  longitude?: string;
  source: string;
  lastUpdated: string;
  type: 'city' | 'town';
}

export interface CombinedLocationItem {
  id: string;
  name: string;
  type: 'district' | 'city' | 'town';
  stateName: string;
  stateId: string;
  districtName?: string;
  latitude?: string;
  longitude?: string;
  source: string;
}

export interface ConstituencyMappingResult {
  mapped: boolean;
  constituencyName?: string;
  stateName: string;
  locationName: string;
  locationType: 'district' | 'city' | 'town';
  districtName?: string;
  message?: string;
}

export interface LocationSummary {
  statesCount: number;
  unionTerritoriesCount: number;
  totalDistricts: number;
  totalCities: number;
  totalConstituencies: number;
  freshness: {
    status: 'LIVE' | 'CACHED';
    lastUpdated: string;
    source: string;
  };
}

// Client-side in-memory cache for ultra-responsive navigation
const combinedCache = new Map<string, CombinedLocationItem[]>();
const districtCache = new Map<string, LocationDistrictItem[]>();
let cachedSummary: LocationSummary | null = null;

class ClientLocationService {
  /**
   * Get all 28 States
   */
  async getAllStates(): Promise<LocationStateItem[]> {
    try {
      const res = await fetch('/api/locations/states');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return await res.json();
        }
      }
    } catch {
      // Fallback to offline list
    }
    return ALL_INDIAN_STATES.map((name, i) => {
      const count = OFFICIAL_INDIAN_DISTRICTS.filter(d => d.stateName.toLowerCase() === name.toLowerCase()).length;
      return {
        stateId: `state-${i + 1}`,
        stateName: name,
        isoCode: '',
        type: 'State' as const,
        districtCount: count,
        cityCount: 0
      };
    });
  }

  /**
   * Get all 8 Union Territories
   */
  async getAllUnionTerritories(): Promise<LocationStateItem[]> {
    try {
      const res = await fetch('/api/locations/union-territories');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return await res.json();
        }
      }
    } catch {
      // Fallback
    }
    return ALL_UNION_TERRITORIES.map((name, i) => {
      const count = OFFICIAL_INDIAN_DISTRICTS.filter(d => d.stateName.toLowerCase() === name.toLowerCase()).length;
      return {
        stateId: `ut-${i + 1}`,
        stateName: name,
        isoCode: '',
        type: 'Union Territory' as const,
        districtCount: count,
        cityCount: 0
      };
    });
  }

  /**
   * Get Combined Districts and Cities for a State
   * Used for the "City / District / Constituency Area" Dropdown
   */
  async getCombinedLocations(stateName: string, query: string = ''): Promise<CombinedLocationItem[]> {
    if (!stateName) {
      return [];
    }

    const cacheKey = `${stateName.toLowerCase()}_${query.toLowerCase()}`;
    if (combinedCache.has(cacheKey)) {
      return combinedCache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams();
      params.append('state', stateName);
      if (query.trim()) params.append('q', query.trim());

      const res = await fetch(`/api/locations/combined?${params.toString()}`);
      if (res.ok) {
        const data: CombinedLocationItem[] = await res.json();
        combinedCache.set(cacheKey, data);
        return data;
      }
    } catch (err) {
      console.warn('[ClientLocationService] Fallback to cached districts for state:', stateName, err);
    }

    // Cached fallback if server endpoint is unavailable
    const cachedDistricts = await this.getDistrictsByState(stateName);
    const fallback: CombinedLocationItem[] = cachedDistricts.map(d => ({
      id: d.districtId,
      name: d.districtName,
      type: 'district',
      stateName: d.stateName,
      stateId: d.stateId,
      source: 'Authoritative Official Dataset (Cached)'
    }));

    combinedCache.set(cacheKey, fallback);
    return fallback;
  }

  /**
   * Get Official Administrative Districts for a State
   */
  async getDistrictsByState(stateName: string): Promise<LocationDistrictItem[]> {
    const norm = (stateName || '').toLowerCase().trim();
    if (districtCache.has(norm)) {
      return districtCache.get(norm)!;
    }

    try {
      const params = new URLSearchParams();
      if (stateName) params.append('state', stateName);
      const res = await fetch(`/api/locations/districts?${params.toString()}`);
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data: LocationDistrictItem[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            districtCache.set(norm, data);
            return data;
          }
        }
      }
    } catch (err) {
      console.warn('[ClientLocationService] Error fetching districts from API, using authoritative offline data:', err);
    }

    const localDistricts: LocationDistrictItem[] = OFFICIAL_INDIAN_DISTRICTS.filter(d => 
      !stateName || d.stateName.toLowerCase() === norm || d.stateId.toLowerCase() === norm
    ).map(d => ({
      districtId: d.districtId,
      districtName: d.districtName,
      stateId: d.stateId,
      stateName: d.stateName,
      headquarters: d.headquarters,
      source: d.source,
      lastUpdated: d.lastUpdated,
      type: 'district' as const,
    }));

    if (localDistricts.length > 0) {
      districtCache.set(norm, localDistricts);
    }
    return localDistricts;
  }

  /**
   * Get Cities for a State or specific District
   */
  async getCities(stateName: string, districtName?: string): Promise<LocationCityItem[]> {
    try {
      const params = new URLSearchParams();
      if (stateName) params.append('state', stateName);
      if (districtName) params.append('district', districtName);
      const res = await fetch(`/api/locations/cities?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ClientLocationService] Error fetching cities:', err);
    }
    return [];
  }

  /**
   * Resolve Constituency Mapping
   * Adheres strictly to rule:
   * "A city is NOT automatically equivalent to a Lok Sabha constituency.
   * Do not invent City -> MP relationships.
   * If exact mapping is unavailable:
   * show: 'Constituency mapping unavailable for this city.'"
   */
  async getConstituencyMapping(stateName: string, locationName: string): Promise<ConstituencyMappingResult> {
    try {
      const params = new URLSearchParams();
      params.append('state', stateName);
      params.append('location', locationName);
      const res = await fetch(`/api/locations/constituency-mapping?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ClientLocationService] Error checking constituency mapping:', err);
    }

    return {
      mapped: false,
      stateName,
      locationName,
      locationType: 'city',
      message: 'Constituency mapping unavailable for this city.'
    };
  }

  /**
   * Get Location Dataset Summary
   */
  async getLocationSummary(): Promise<LocationSummary> {
    if (cachedSummary) return cachedSummary;

    try {
      const res = await fetch('/api/locations/summary');
      if (res.ok) {
        cachedSummary = await res.json();
        return cachedSummary!;
      }
    } catch (err) {
      console.warn('[ClientLocationService] Error fetching location summary:', err);
    }

    return {
      statesCount: 28,
      unionTerritoriesCount: 8,
      totalDistricts: 786,
      totalCities: 4074,
      totalConstituencies: 543,
      freshness: {
        status: 'CACHED',
        lastUpdated: new Date().toISOString(),
        source: 'Official GoI india.gov.in & Country State City Open Data'
      }
    };
  }
}

export const clientLocationService = new ClientLocationService();
