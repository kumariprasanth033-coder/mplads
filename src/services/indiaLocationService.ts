import { clientLocationService, LocationStateItem, LocationDistrictItem, LocationCityItem } from './locationService.js';
import { ALL_INDIAN_STATES, ALL_UNION_TERRITORIES } from '../data/indiaStates.js';
import { OFFICIAL_INDIAN_DISTRICTS } from '../../server/data/indiaDistrictsData.js';

export interface LocationItem {
  id: string;
  name: string;
  type: 'state' | 'union_territory' | 'district' | 'city' | 'town';
  stateName?: string;
  districtName?: string;
}

/**
 * Authoritative Indian Location Service (Client)
 * Adheres strictly to Official Government of India jurisdiction hierarchy:
 * 28 States + 8 Union Territories -> Official Districts -> Cities/Towns
 */
export const indiaLocationService = {
  /**
   * Get all 28 Official States
   */
  async getStates(): Promise<LocationStateItem[]> {
    return clientLocationService.getAllStates();
  },

  /**
   * Get all 8 Official Union Territories
   */
  async getUnionTerritories(): Promise<LocationStateItem[]> {
    return clientLocationService.getAllUnionTerritories();
  },

  /**
   * Get official districts for a state or union territory
   */
  async getDistrictsByState(state: string): Promise<LocationDistrictItem[]> {
    return clientLocationService.getDistrictsByState(state);
  },

  /**
   * Get cities / towns located in a district
   */
  async getCitiesByDistrict(district: string, state?: string): Promise<LocationCityItem[]> {
    return clientLocationService.getCities(state || '', district);
  },

  /**
   * Search nationwide locations (States, UTs, Districts, Cities)
   */
  async searchLocations(query: string): Promise<LocationItem[]> {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];

    const results: LocationItem[] = [];

    // Search States
    for (const s of ALL_INDIAN_STATES) {
      if (s.toLowerCase().includes(q)) {
        results.push({ id: `state-${s.toLowerCase().replace(/\s+/g, '-')}`, name: s, type: 'state' });
      }
    }

    // Search UTs
    for (const ut of ALL_UNION_TERRITORIES) {
      if (ut.toLowerCase().includes(q)) {
        results.push({ id: `ut-${ut.toLowerCase().replace(/\s+/g, '-')}`, name: ut, type: 'union_territory' });
      }
    }

    // Search Districts & Cities via server API with fallback
    let foundApiDistricts = false;
    try {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data.districts) && data.districts.length > 0) {
            foundApiDistricts = true;
            for (const d of data.districts) {
              results.push({
                id: d.districtId || `dist-${d.districtName.toLowerCase().replace(/\s+/g, '-')}`,
                name: d.districtName,
                type: 'district',
                stateName: d.stateName,
              });
            }
          }
          if (Array.isArray(data.cities)) {
            for (const c of data.cities) {
              results.push({
                id: c.cityId || `city-${c.cityName.toLowerCase().replace(/\s+/g, '-')}`,
                name: c.cityName,
                type: 'city',
                stateName: c.stateName,
                districtName: c.districtName,
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('indiaLocationService searchLocations API fallback:', err);
    }

    // Fallback to local official districts if API didn't return results
    if (!foundApiDistricts) {
      const matched = OFFICIAL_INDIAN_DISTRICTS.filter(d => 
        d.districtName.toLowerCase().includes(q) || d.stateName.toLowerCase().includes(q)
      ).slice(0, 15);
      for (const d of matched) {
        results.push({
          id: d.districtId,
          name: d.districtName,
          type: 'district',
          stateName: d.stateName,
        });
      }
    }

    return results;
  },

  /**
   * Get single location details by ID
   */
  async getLocation(id: string): Promise<LocationItem | null> {
    const allStates = await this.getStates();
    const stateMatch = allStates.find(s => s.stateId === id || s.stateName.toLowerCase() === id.toLowerCase());
    if (stateMatch) {
      return { id: stateMatch.stateId, name: stateMatch.stateName, type: 'state' };
    }

    const allUts = await this.getUnionTerritories();
    const utMatch = allUts.find(ut => ut.stateId === id || ut.stateName.toLowerCase() === id.toLowerCase());
    if (utMatch) {
      return { id: utMatch.stateId, name: utMatch.stateName, type: 'union_territory' };
    }

    return null;
  },
};
