import { digitalSansadMemberAdapter } from './digitalSansadMemberAdapter.js';
import { projectDataAdapter } from './projectDataAdapter.js';
import { mpladsDataAdapter } from './mpladsDataAdapter.js';

export interface UnifiedSearchResultItem {
  id: string;
  name: string;
  type: 'MP' | 'Constituency' | 'Project' | 'Location' | 'Department' | 'Category';
  title?: string;
  state: string;
  constituency?: string;
  district?: string;
  village?: string;
  status: string;
  party?: string;
  category?: string;
  sanctionedAmountLakhs?: number;
  source: string;
  lastUpdated: string;
  officialProfileUrl?: string;
  photoUrl?: string;
  photoVerified?: boolean;
  navPath: string;
  metaBadge?: string;
}

export interface UnifiedSearchResponse {
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
    all: UnifiedSearchResultItem[];
    mps: UnifiedSearchResultItem[];
    constituencies: UnifiedSearchResultItem[];
    projects: UnifiedSearchResultItem[];
    locations: UnifiedSearchResultItem[];
  };
  freshness: {
    status: 'LIVE' | 'CACHED' | 'DEMO';
    lastUpdated: string;
    source: string;
  };
}

export class UnifiedSearchService {
  public search(rawQuery: string): UnifiedSearchResponse {
    const query = (rawQuery || '').trim();
    if (!query) {
      return {
        query: '',
        totalMatches: 0,
        counts: { all: 0, mps: 0, constituencies: 0, projects: 0, locations: 0 },
        results: { all: [], mps: [], constituencies: [], projects: [], locations: [] },
        freshness: digitalSansadMemberAdapter.getFreshnessTelemetry(),
      };
    }

    const q = query.toLowerCase();

    // 1. Search MPs
    const allMembers = digitalSansadMemberAdapter.getAllMembers();
    const matchedMembers = allMembers.filter(mp =>
      mp.name.toLowerCase().includes(q) ||
      (mp.displayName && mp.displayName.toLowerCase().includes(q)) ||
      mp.constituency.toLowerCase().includes(q) ||
      mp.party.toLowerCase().includes(q) ||
      mp.state.toLowerCase().includes(q)
    );

    const mpItems: UnifiedSearchResultItem[] = matchedMembers.map(mp => ({
      id: mp.id,
      name: mp.name,
      type: 'MP',
      state: mp.state,
      constituency: mp.constituency,
      status: `${mp.membershipStatus} MP (${mp.party})`,
      party: mp.party,
      source: 'Official Digital Sansad (18th Lok Sabha)',
      lastUpdated: mp.lastUpdated || '2024-06-05T10:00:00Z',
      officialProfileUrl: mp.officialProfileUrl,
      photoUrl: mp.photoVerified ? mp.officialPhotoUrl : undefined,
      photoVerified: mp.photoVerified,
      navPath: `/mp/${mp.id}`,
      metaBadge: mp.house || 'Lok Sabha',
    }));

    // 2. Search Projects
    const { projects: matchedProjects } = projectDataAdapter.searchProjects({ query: q, limit: 100 });
    const projectItems: UnifiedSearchResultItem[] = matchedProjects.map(p => ({
      id: p.id,
      name: p.title,
      type: 'Project',
      title: p.title,
      state: p.state,
      constituency: p.constituency,
      district: p.district,
      village: p.village,
      status: p.status,
      category: p.category,
      sanctionedAmountLakhs: p.financial.sanctionedAmountLakhs,
      source: p.source || 'Official MPLADS Digital Repository',
      lastUpdated: p.lastUpdated || new Date().toISOString(),
      navPath: `/projects/${p.id}`,
      metaBadge: `₹${p.financial.sanctionedAmountLakhs || p.financial.recommendedAmountLakhs}L • ${p.category}`,
    }));

    // 3. Search Constituencies (Unique from MP roster + Projects)
    const constituencyMap = new Map<string, { state: string; mpName: string; mpId: string; party: string }>();
    allMembers.forEach(m => {
      const key = `${m.constituency.toLowerCase()}_${m.state.toLowerCase()}`;
      if (
        m.constituency.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        (q.includes(m.constituency.toLowerCase()) && m.constituency.length > 3)
      ) {
        if (!constituencyMap.has(key)) {
          constituencyMap.set(key, {
            state: m.state,
            mpName: m.name,
            mpId: m.id,
            party: m.party,
          });
        }
      }
    });

    const constituencyItems: UnifiedSearchResultItem[] = Array.from(constituencyMap.entries()).map(([key, data]) => {
      const constName = key.split('_')[0];
      // Capitalize constituency name properly
      const capitalized = constName.charAt(0).toUpperCase() + constName.slice(1);
      return {
        id: `constituency-${key}`,
        name: `${capitalized} Parliamentary Constituency`,
        type: 'Constituency',
        state: data.state,
        constituency: capitalized,
        status: `Represented by ${data.mpName} (${data.party})`,
        party: data.party,
        source: 'Official Digital Sansad & Delimitation Commission',
        lastUpdated: new Date().toISOString(),
        navPath: `/map?constituency=${encodeURIComponent(capitalized)}`,
        metaBadge: `${data.state} • Lok Sabha`,
      };
    });

    // 4. Search Locations (States, Districts, Villages)
    const locationSet = new Map<string, { state: string; district?: string; village?: string; typeStr: string; path: string }>();

    // Check states
    const states = Array.from(new Set(allMembers.map(m => m.state)));
    states.forEach(stateName => {
      if (stateName.toLowerCase().includes(q)) {
        const key = `state_${stateName.toLowerCase()}`;
        locationSet.set(key, {
          state: stateName,
          typeStr: 'State / Union Territory',
          path: `/mps?state=${encodeURIComponent(stateName)}`,
        });
      }
    });

    // Check districts & villages in projects
    matchedProjects.forEach(p => {
      if (p.district && p.district.toLowerCase().includes(q)) {
        const key = `district_${p.district.toLowerCase()}_${p.state.toLowerCase()}`;
        if (!locationSet.has(key)) {
          locationSet.set(key, {
            state: p.state,
            district: p.district,
            typeStr: `District (${p.state})`,
            path: `/projects?district=${encodeURIComponent(p.district)}`,
          });
        }
      }
      if (p.village && p.village.toLowerCase().includes(q)) {
        const key = `village_${p.village.toLowerCase()}_${p.district.toLowerCase()}`;
        if (!locationSet.has(key)) {
          locationSet.set(key, {
            state: p.state,
            district: p.district,
            village: p.village,
            typeStr: `Village / Block (${p.district}, ${p.state})`,
            path: `/projects?query=${encodeURIComponent(p.village)}`,
          });
        }
      }
    });

    const locationItems: UnifiedSearchResultItem[] = Array.from(locationSet.entries()).map(([key, data]) => ({
      id: `loc-${key}`,
      name: data.village ? `${data.village}, ${data.district}` : data.district ? `${data.district} District` : data.state,
      type: 'Location',
      state: data.state,
      district: data.district,
      village: data.village,
      status: data.typeStr,
      source: 'Census & District Administration Directory',
      lastUpdated: new Date().toISOString(),
      navPath: data.path,
      metaBadge: data.state,
    }));

    // Combine All
    const allItems = [...mpItems, ...constituencyItems, ...projectItems, ...locationItems];

    return {
      query,
      totalMatches: allItems.length,
      counts: {
        all: allItems.length,
        mps: mpItems.length,
        constituencies: constituencyItems.length,
        projects: projectItems.length,
        locations: locationItems.length,
      },
      results: {
        all: allItems,
        mps: mpItems,
        constituencies: constituencyItems,
        projects: projectItems,
        locations: locationItems,
      },
      freshness: {
        status: mpItems.length > 0 ? 'CACHED' : 'LIVE',
        lastUpdated: new Date().toISOString(),
        source: 'Digital Sansad & Official MPLADS Repositories',
      },
    };
  }
}

export const unifiedSearchService = new UnifiedSearchService();
