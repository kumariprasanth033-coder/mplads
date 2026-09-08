import { State, City } from 'country-state-city';
import { OFFICIAL_INDIAN_DISTRICTS, OfficialDistrict } from '../data/indiaDistrictsData.js';

export interface LocationStateItem {
  stateId: string;
  stateName: string;
  isoCode: string;
  type: 'State' | 'Union Territory';
  districtCount: number;
  cityCount: number;
  latitude?: string;
  longitude?: string;
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

// 28 Official States of India (Authoritative list per india.gov.in)
const OFFICIAL_28_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// 8 Official Union Territories of India (Authoritative list per india.gov.in)
const OFFICIAL_8_UNION_TERRITORIES: string[] = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

// Standard state name to ISO code mapping for country-state-city
const STATE_NAME_TO_ISO: Record<string, string> = {
  'andaman and nicobar islands': 'AN',
  'andhra pradesh': 'AP',
  'arunachal pradesh': 'AR',
  'assam': 'AS',
  'bihar': 'BR',
  'chandigarh': 'CH',
  'chhattisgarh': 'CT',
  'dadra and nagar haveli and daman and diu': 'DH',
  'delhi': 'DL',
  'goa': 'GA',
  'gujarat': 'GJ',
  'haryana': 'HR',
  'himachal pradesh': 'HP',
  'jammu and kashmir': 'JK',
  'jharkhand': 'JH',
  'karnataka': 'KA',
  'kerala': 'KL',
  'ladakh': 'LA',
  'lakshadweep': 'LD',
  'madhya pradesh': 'MP',
  'maharashtra': 'MH',
  'manipur': 'MN',
  'meghalaya': 'ML',
  'mizoram': 'MZ',
  'nagaland': 'NL',
  'odisha': 'OD',
  'puducherry': 'PY',
  'punjab': 'PB',
  'rajasthan': 'RJ',
  'sikkim': 'SK',
  'tamil nadu': 'TN',
  'telangana': 'TG',
  'tripura': 'TR',
  'uttar pradesh': 'UP',
  'uttarakhand': 'UK',
  'west bengal': 'WB'
};

class LocationService {
  private cacheStatus: 'LIVE' | 'CACHED' = 'CACHED';
  private lastUpdated: string = '2026-09-08T00:00:00.000Z';
  private stateCache: Map<string, LocationStateItem> = new Map();
  private districtCache: Map<string, LocationDistrictItem[]> = new Map();
  private cityCache: Map<string, LocationCityItem[]> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeData();
  }

  private normalize(str: string): string {
    return (str || '').toLowerCase().trim();
  }

  private initializeData() {
    try {
      this.stateCache.clear();
      this.districtCache.clear();
      this.cityCache.clear();

      const cscStates = State.getStatesOfCountry('IN');
      const stateByIso = new Map(cscStates.map(s => [s.isoCode, s]));

      // 1. Initialize Districts cache grouped by normalized state name
      for (const d of OFFICIAL_INDIAN_DISTRICTS) {
        const normState = this.normalize(d.stateName);
        if (!this.districtCache.has(normState)) {
          this.districtCache.set(normState, []);
        }
        this.districtCache.get(normState)!.push({
          districtId: d.districtId,
          districtName: d.districtName,
          stateId: d.stateId,
          stateName: d.stateName,
          headquarters: d.headquarters,
          source: d.source,
          lastUpdated: d.lastUpdated,
          type: 'district'
        });
      }

      // 2. Initialize Cities cache for each state
      for (const [stateName, iso] of Object.entries(STATE_NAME_TO_ISO)) {
        const cscCities = City.getCitiesOfState('IN', iso) || [];
        const stateDistricts = this.districtCache.get(stateName) || [];

        const cityList: LocationCityItem[] = cscCities.map(c => {
          // Attempt to match district name
          const matchedDistrict = stateDistricts.find(d =>
            this.normalize(d.districtName) === this.normalize(c.name) ||
            this.normalize(c.name).includes(this.normalize(d.districtName))
          );

          return {
            cityId: `${iso.toLowerCase()}-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            cityName: c.name,
            stateId: iso,
            stateName: cscStates.find(s => s.isoCode === iso)?.name || stateName,
            districtId: matchedDistrict?.districtId,
            districtName: matchedDistrict?.districtName,
            latitude: c.latitude,
            longitude: c.longitude,
            source: 'Country State City Open Dataset',
            lastUpdated: '2026-09-08',
            type: 'city'
          };
        });

        this.cityCache.set(stateName, cityList);
      }

      // 3. Build All 36 States & Union Territories
      const allJurisdictions = [
        ...OFFICIAL_28_STATES.map(s => ({ name: s, type: 'State' as const })),
        ...OFFICIAL_8_UNION_TERRITORIES.map(ut => ({ name: ut, type: 'Union Territory' as const }))
      ];

      for (const item of allJurisdictions) {
        const norm = this.normalize(item.name);
        const iso = STATE_NAME_TO_ISO[norm] || '';
        const cscState = stateByIso.get(iso);
        const dists = this.districtCache.get(norm) || [];
        const cities = this.cityCache.get(norm) || [];

        this.stateCache.set(norm, {
          stateId: iso.toLowerCase(),
          stateName: item.name,
          isoCode: iso,
          type: item.type,
          districtCount: dists.length,
          cityCount: cities.length,
          latitude: cscState?.latitude,
          longitude: cscState?.longitude
        });
      }

      this.cacheStatus = 'LIVE';
      this.lastUpdated = new Date().toISOString();
      this.initialized = true;
    } catch (err) {
      console.error('[LocationService] Initialization fallback triggered:', err);
      this.cacheStatus = 'CACHED';
    }
  }

  public getAllStates(): LocationStateItem[] {
    return Array.from(this.stateCache.values()).filter(s => s.type === 'State');
  }

  public getAllUnionTerritories(): LocationStateItem[] {
    return Array.from(this.stateCache.values()).filter(s => s.type === 'Union Territory');
  }

  public getAllJurisdictions(): LocationStateItem[] {
    return Array.from(this.stateCache.values());
  }

  public getDistrictsByState(stateIdOrName: string): LocationDistrictItem[] {
    if (!stateIdOrName) {
      // Return all districts across India
      const all: LocationDistrictItem[] = [];
      for (const distList of this.districtCache.values()) {
        all.push(...distList);
      }
      return all;
    }

    const norm = this.normalize(stateIdOrName);
    // Search by state name or ISO code
    let key = norm;
    if (norm.length === 2) {
      const match = Object.entries(STATE_NAME_TO_ISO).find(([_, code]) => code.toLowerCase() === norm);
      if (match) key = match[0];
    }

    return this.districtCache.get(key) || [];
  }

  public getCitiesByState(stateIdOrName: string): LocationCityItem[] {
    if (!stateIdOrName) {
      const all: LocationCityItem[] = [];
      for (const list of this.cityCache.values()) {
        all.push(...list);
      }
      return all;
    }

    const norm = this.normalize(stateIdOrName);
    let key = norm;
    if (norm.length === 2) {
      const match = Object.entries(STATE_NAME_TO_ISO).find(([_, code]) => code.toLowerCase() === norm);
      if (match) key = match[0];
    }

    return this.cityCache.get(key) || [];
  }

  public getCitiesByDistrict(districtNameOrId: string, stateIdOrName?: string): LocationCityItem[] {
    if (!districtNameOrId) return [];
    const normDist = this.normalize(districtNameOrId);
    const pool = stateIdOrName ? this.getCitiesByState(stateIdOrName) : this.getCitiesByState('');

    return pool.filter(c => {
      if (c.districtName && this.normalize(c.districtName) === normDist) return true;
      if (c.districtId && this.normalize(c.districtId) === normDist) return true;
      if (this.normalize(c.cityName).includes(normDist) || normDist.includes(this.normalize(c.cityName))) return true;
      return false;
    });
  }

  /**
   * Combined Locations for the "City / District / Constituency Area" Dropdown
   * Returns:
   * 1. Official Districts first (clearly tagged type: 'district')
   * 2. Cities & Towns (clearly tagged type: 'city' or 'town')
   * Eliminates pure duplicate names to avoid confusing the user while preserving classification.
   */
  public getCombinedLocations(stateIdOrName: string, query?: string): CombinedLocationItem[] {
    const districts = this.getDistrictsByState(stateIdOrName);
    const cities = this.getCitiesByState(stateIdOrName);
    const q = this.normalize(query || '');

    const results: CombinedLocationItem[] = [];
    const seenNames = new Set<string>();

    // Add Districts first
    for (const d of districts) {
      if (!q || this.normalize(d.districtName).includes(q)) {
        const key = `${this.normalize(d.districtName)}-district`;
        if (!seenNames.has(key)) {
          seenNames.add(key);
          results.push({
            id: d.districtId,
            name: d.districtName,
            type: 'district',
            stateName: d.stateName,
            stateId: d.stateId,
            source: d.source
          });
        }
      }
    }

    // Add Cities & Towns
    for (const c of cities) {
      if (!q || this.normalize(c.cityName).includes(q)) {
        // Only include if not already added as identical district name or distinctly mark as city
        const districtKey = `${this.normalize(c.cityName)}-district`;
        const cityKey = `${this.normalize(c.cityName)}-city`;

        if (!seenNames.has(cityKey) && !seenNames.has(districtKey)) {
          seenNames.add(cityKey);
          results.push({
            id: c.cityId,
            name: c.cityName,
            type: 'city',
            stateName: c.stateName,
            stateId: c.stateId,
            districtName: c.districtName,
            latitude: c.latitude,
            longitude: c.longitude,
            source: c.source
          });
        }
      }
    }

    return results;
  }

  public searchCities(query: string, stateIdOrName?: string): LocationCityItem[] {
    if (!query) return [];
    const q = this.normalize(query);
    const pool = stateIdOrName ? this.getCitiesByState(stateIdOrName) : this.getCitiesByState('');
    return pool.filter(c => this.normalize(c.cityName).includes(q)).slice(0, 50);
  }

  public searchDistricts(query: string, stateIdOrName?: string): LocationDistrictItem[] {
    if (!query) return [];
    const q = this.normalize(query);
    const pool = stateIdOrName ? this.getDistrictsByState(stateIdOrName) : this.getDistrictsByState('');
    return pool.filter(d => this.normalize(d.districtName).includes(q)).slice(0, 50);
  }

  public getLocationById(id: string): CombinedLocationItem | null {
    if (!id) return null;
    const normId = this.normalize(id);

    for (const distList of this.districtCache.values()) {
      const match = distList.find(d => this.normalize(d.districtId) === normId);
      if (match) {
        return {
          id: match.districtId,
          name: match.districtName,
          type: 'district',
          stateName: match.stateName,
          stateId: match.stateId,
          source: match.source
        };
      }
    }

    for (const cityList of this.cityCache.values()) {
      const match = cityList.find(c => this.normalize(c.cityId) === normId);
      if (match) {
        return {
          id: match.cityId,
          name: match.cityName,
          type: 'city',
          stateName: match.stateName,
          stateId: match.stateId,
          districtName: match.districtName,
          latitude: match.latitude,
          longitude: match.longitude,
          source: match.source
        };
      }
    }

    return null;
  }

  /**
   * Official City/District to Parliamentary Constituency Mapping Rule:
   * "A city is NOT automatically equivalent to a Lok Sabha constituency.
   * Do not invent City -> MP relationships.
   * Only show a city-to-constituency/MP relationship when the available official data supports it.
   * If exact city-to-constituency mapping is unavailable:
   * show: 'Constituency mapping unavailable for this city.' Do NOT guess."
   */
  public getConstituencyMapping(
    stateName: string,
    locationName: string,
    officialConstituencies: string[]
  ): ConstituencyMappingResult {
    const normLoc = this.normalize(locationName);
    const normState = this.normalize(stateName);

    // Check if the location is an exact or direct match for a verified Lok Sabha Constituency
    const exactMatch = officialConstituencies.find(
      c => this.normalize(c) === normLoc || this.normalize(c).includes(normLoc) || normLoc.includes(this.normalize(c))
    );

    if (exactMatch) {
      return {
        mapped: true,
        constituencyName: exactMatch,
        stateName,
        locationName,
        locationType: 'district',
      };
    }

    // Unmapped city/town: explicit failure notice per rule
    return {
      mapped: false,
      stateName,
      locationName,
      locationType: 'city',
      message: 'Constituency mapping unavailable for this city.'
    };
  }

  public getLocationSummary(): LocationSummary {
    let totalDistricts = 0;
    for (const dists of this.districtCache.values()) {
      totalDistricts += dists.length;
    }

    let totalCities = 0;
    for (const cities of this.cityCache.values()) {
      totalCities += cities.length;
    }

    return {
      statesCount: OFFICIAL_28_STATES.length,
      unionTerritoriesCount: OFFICIAL_8_UNION_TERRITORIES.length,
      totalDistricts,
      totalCities,
      totalConstituencies: 543,
      freshness: {
        status: this.cacheStatus,
        lastUpdated: this.lastUpdated,
        source: 'Official GoI india.gov.in & Country State City Open Data'
      }
    };
  }

  public refreshLocationData(): LocationSummary {
    this.initializeData();
    return this.getLocationSummary();
  }

  public getFreshness() {
    return {
      status: this.cacheStatus,
      lastUpdated: this.lastUpdated,
      source: 'Official GoI india.gov.in & Country State City Open Data'
    };
  }
}

export const locationService = new LocationService();
