import { locationService, LocationStateItem, LocationDistrictItem, LocationCityItem } from './locationService.js';

export interface LocationItem {
  id: string;
  name: string;
  type: 'state' | 'union_territory' | 'district' | 'city' | 'town';
  stateName?: string;
  districtName?: string;
}

/**
 * Server-side indiaLocationService
 * Authoritative Indian State/UT and Location Data Layer
 */
export const indiaLocationService = {
  getStates(): LocationStateItem[] {
    return locationService.getAllStates();
  },

  getUnionTerritories(): LocationStateItem[] {
    return locationService.getAllUnionTerritories();
  },

  getDistrictsByState(state: string): LocationDistrictItem[] {
    return locationService.getDistrictsByState(state);
  },

  getCitiesByDistrict(district: string, state?: string): LocationCityItem[] {
    return locationService.getCitiesByDistrict(district, state);
  },

  searchLocations(query: string): LocationItem[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];

    const results: LocationItem[] = [];

    for (const s of locationService.getAllStates()) {
      if (s.stateName.toLowerCase().includes(q)) {
        results.push({ id: s.stateId, name: s.stateName, type: 'state' });
      }
    }

    for (const ut of locationService.getAllUnionTerritories()) {
      if (ut.stateName.toLowerCase().includes(q)) {
        results.push({ id: ut.stateId, name: ut.stateName, type: 'union_territory' });
      }
    }

    const dists = locationService.searchDistricts(q);
    for (const d of dists) {
      results.push({
        id: d.districtId,
        name: d.districtName,
        type: 'district',
        stateName: d.stateName,
      });
    }

    const cities = locationService.searchCities(q);
    for (const c of cities) {
      results.push({
        id: c.cityId,
        name: c.cityName,
        type: 'city',
        stateName: c.stateName,
        districtName: c.districtName,
      });
    }

    return results;
  },

  getLocation(id: string): LocationItem | null {
    const states = locationService.getAllStates();
    const s = states.find(x => x.stateId === id || x.stateName.toLowerCase() === id.toLowerCase());
    if (s) return { id: s.stateId, name: s.stateName, type: 'state' };

    const uts = locationService.getAllUnionTerritories();
    const u = uts.find(x => x.stateId === id || x.stateName.toLowerCase() === id.toLowerCase());
    if (u) return { id: u.stateId, name: u.stateName, type: 'union_territory' };

    return null;
  },
};
