import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  User,
  MapPin,
  Building,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Filter,
  Navigation,
  Globe2,
} from 'lucide-react';
import { digitalSansadMemberAdapter } from '../services/dataSources/digitalSansadMemberAdapter';
import { MPRecord } from '../types';
import { StateDropdown } from '../components/StateDropdown';
import { DistrictCityDropdown } from '../components/DistrictCityDropdown';
import { clientLocationService, LocationSummary } from '../services/locationService';
import { MPCard } from '../components/MPCard';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';

interface Props {
  initialQuery?: string;
  onNavigate: (path: string) => void;
}

export const MpsPage: React.FC<Props> = ({ initialQuery = '', onNavigate }) => {
  // Master state variables
  const [allStateMps, setAllStateMps] = useState<MPRecord[]>([]);
  const [query, setQuery] = useState(initialQuery || '');
  const [lastExecutedQuery, setLastExecutedQuery] = useState(initialQuery || '');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<'Lok Sabha' | 'Rajya Sabha' | ''>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [suggestions, setSuggestions] = useState<MPRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [officialDistricts, setOfficialDistricts] = useState<string[]>([]);
  const [locationSummary, setLocationSummary] = useState<LocationSummary | null>(null);

  // Load official nationwide location summary (28 States, 8 UTs, 786 Districts)
  useEffect(() => {
    clientLocationService.getLocationSummary().then(setLocationSummary).catch(() => {});
  }, []);

  // Fetch complete official administrative districts for the chosen State/UT
  useEffect(() => {
    if (!selectedState) {
      setOfficialDistricts([]);
      return;
    }
    clientLocationService
      .getDistrictsByState(selectedState)
      .then(dists => {
        setOfficialDistricts(dists.map(d => d.districtName));
      })
      .catch(() => {
        setOfficialDistricts([]);
      });
  }, [selectedState]);

  const [freshness, setFreshness] = useState<{
    status: 'LIVE' | 'CACHED' | 'DEMO';
    lastUpdated: string;
    source: string;
    totalMembers: number;
  }>({
    status: 'CACHED',
    lastUpdated: new Date().toISOString(),
    source: 'Digital Sansad Parliamentary Records',
    totalMembers: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 18;

  // Real search execution function
  // Complies strictly with all user requirements:
  // - Avoids stale state by accepting target query directly
  // - Clears previous search results immediately (Req 5)
  // - Sets loading state "Searching MPs..." (Req 6)
  // - Queries official Digital Sansad parliamentary data across India (Req 3, 12)
  // - Handles error and empty states (Req 7, 8)
  const executeSearch = async (targetQuery: string, overrideState?: string) => {
    const trimmed = (targetQuery ?? '').trim();
    setShowSuggestions(false);

    // Requirement 5: CLEAR previous results immediately
    setAllStateMps([]);
    setIsLoading(true);
    setIsError(false);
    setCurrentPage(1);
    setLastExecutedQuery(trimmed);

    try {
      if (!trimmed) {
        const stateToUse = overrideState !== undefined ? overrideState : selectedState;
        const res = await digitalSansadMemberAdapter.searchMembers('', {
          state: stateToUse || undefined,
          house: selectedHouse || undefined,
          party: selectedParty || undefined,
          limit: stateToUse ? 200 : 150,
        });
        setAllStateMps(res.mps);
        setFreshness(res.freshness);
        return;
      }

      // If universal query is provided, search across all India
      const res = await digitalSansadMemberAdapter.searchMembers(trimmed, {
        house: selectedHouse || undefined,
        party: selectedParty || undefined,
        limit: 300,
      });

      setAllStateMps(res.mps);
      setFreshness(res.freshness);
    } catch (err) {
      console.error('Failed to search MPs:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial mount or initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    } else {
      executeSearch('');
    }
  }, [initialQuery]);

  // Live real-time search suggestions (Requirement 9)
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const trimmed = val.trim().toLowerCase();
    if (trimmed.length >= 2) {
      // Find matches in currently loaded MPs or quick search
      const matches = allStateMps
        .filter(
          m =>
            m.name.toLowerCase().includes(trimmed) ||
            (m.displayName && m.displayName.toLowerCase().includes(trimmed)) ||
            m.constituency.toLowerCase().includes(trimmed) ||
            m.state.toLowerCase().includes(trimmed) ||
            m.party.toLowerCase().includes(trimmed)
        )
        .slice(0, 5);

      if (matches.length > 0) {
        setSuggestions(matches);
        setShowSuggestions(true);
      } else {
        // If not in currently loaded state, query API for suggestions
        digitalSansadMemberAdapter
          .searchMembers(trimmed, { limit: 5 })
          .then(res => {
            if (res.mps && res.mps.length > 0) {
              setSuggestions(res.mps.slice(0, 5));
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          })
          .catch(() => {
            setSuggestions([]);
            setShowSuggestions(false);
          });
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // When state changes, reset child filters and reload state MPs if no universal query
  const handleStateChange = (stateVal: string) => {
    setSelectedState(stateVal);
    setSelectedDistrict('');
    setSelectedConstituency('');
    setCurrentPage(1);
    if (!query.trim()) {
      executeSearch('', stateVal);
    }
  };

  // When city/district changes, reset child filter (Constituency)
  const handleDistrictChange = (districtVal: string) => {
    setSelectedDistrict(districtVal);
    setSelectedConstituency('');
    setCurrentPage(1);
  };

  const handleConstituencyChange = (constituencyVal: string) => {
    setSelectedConstituency(constituencyVal);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const [isAdminSyncing, setIsAdminSyncing] = useState(false);
  const [adminSyncStats, setAdminSyncStats] = useState<{
    totalChecked: number;
    photosVerified: number;
    alreadyCached: number;
    unavailable: number;
    failed: number;
    message?: string;
  } | null>(null);

  const handleRefresh = async () => {
    setIsAdminSyncing(true);
    try {
      await digitalSansadMemberAdapter.refreshMemberData();
      await executeSearch(query);
    } finally {
      setIsAdminSyncing(false);
    }
  };

  const handleSyncMissingPhotos = async () => {
    setIsAdminSyncing(true);
    setAdminSyncStats(null);
    try {
      const res = await fetch('/api/admin/sync-missing-photos?limit=50', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setAdminSyncStats(json.stats);
        await executeSearch(query);
      }
    } catch (err) {
      console.error('Failed to sync missing photos:', err);
    } finally {
      setIsAdminSyncing(false);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setLastExecutedQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedConstituency('');
    setSelectedParty('');
    setSelectedHouse('');
    setCurrentPage(1);
    setShowSuggestions(false);
    executeSearch('', '');
  };

  // Dynamic Cities & Districts list for the chosen State
  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    const districtSet = new Set<string>();

    // 1. Authoritative official administrative districts from GoI dataset
    officialDistricts.forEach(d => districtSet.add(d));

    // 2. Any verified districts or cities from Parliamentary dataset
    allStateMps.forEach(mp => {
      if (mp.district && mp.district.trim()) {
        districtSet.add(mp.district.trim());
      }
      if (mp.city && mp.city.trim() && mp.city !== mp.district) {
        districtSet.add(mp.city.trim());
      }
    });

    return Array.from(districtSet).sort((a, b) => a.localeCompare(b));
  }, [allStateMps, selectedState, officialDistricts]);

  // Dynamic Constituencies list based on State & (optionally) District
  const availableConstituencies = useMemo(() => {
    if (!selectedState || allStateMps.length === 0) return [];
    let pool = allStateMps;

    if (selectedDistrict) {
      const d = selectedDistrict.toLowerCase().trim();
      const matched = pool.filter(
        mp =>
          (mp.district && (mp.district.toLowerCase() === d || mp.district.toLowerCase().includes(d) || d.includes(mp.district.toLowerCase()))) ||
          (mp.city && (mp.city.toLowerCase() === d || mp.city.toLowerCase().includes(d) || d.includes(mp.city.toLowerCase()))) ||
          mp.constituency.toLowerCase() === d ||
          mp.constituency.toLowerCase().includes(d) ||
          d.includes(mp.constituency.toLowerCase())
      );
      if (matched.length > 0) {
        pool = matched;
      }
    }

    const constSet = new Set<string>();
    pool.forEach(mp => {
      if (mp.constituency) constSet.add(mp.constituency.trim());
    });

    return Array.from(constSet).sort((a, b) => a.localeCompare(b));
  }, [allStateMps, selectedState, selectedDistrict]);

  // Dynamic Parties available in the current dataset
  const availableParties = useMemo(() => {
    const set = new Set<string>();
    allStateMps.forEach(m => {
      if (m.party) set.add(m.party.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allStateMps]);

  // Filtered MPs applying full hierarchy: State -> City/District -> Constituency + Query + Party + House
  const filteredMps = useMemo(() => {
    let list = allStateMps;

    // 1. City / District filter
    if (selectedDistrict) {
      const d = selectedDistrict.toLowerCase().trim();
      list = list.filter(
        mp =>
          (mp.district && (mp.district.toLowerCase() === d || mp.district.toLowerCase().includes(d) || d.includes(mp.district.toLowerCase()))) ||
          (mp.city && (mp.city.toLowerCase() === d || mp.city.toLowerCase().includes(d) || d.includes(mp.city.toLowerCase()))) ||
          mp.constituency.toLowerCase() === d ||
          mp.constituency.toLowerCase().includes(d) ||
          d.includes(mp.constituency.toLowerCase())
      );
    }

    // 2. Constituency filter
    if (selectedConstituency) {
      const c = selectedConstituency.toLowerCase().trim();
      list = list.filter(mp => mp.constituency.toLowerCase() === c);
    }

    // 3. Party filter
    if (selectedParty) {
      const p = selectedParty.toLowerCase().trim();
      list = list.filter(mp => mp.party.toLowerCase() === p);
    }

    // 4. House filter
    if (selectedHouse) {
      const h = selectedHouse.toLowerCase().trim();
      list = list.filter(mp => mp.house.toLowerCase() === h);
    }

    // 5. Query Search (matches Name, Constituency, State, District, City, Party, MembershipStatus, House)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        mp =>
          mp.name.toLowerCase().includes(q) ||
          (mp.displayName && mp.displayName.toLowerCase().includes(q)) ||
          mp.constituency.toLowerCase().includes(q) ||
          mp.state.toLowerCase().includes(q) ||
          mp.party.toLowerCase().includes(q) ||
          (mp.district && mp.district.toLowerCase().includes(q)) ||
          (mp.city && mp.city.toLowerCase().includes(q)) ||
          (mp.membershipStatus && mp.membershipStatus.toLowerCase().includes(q)) ||
          (mp.house && mp.house.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allStateMps, selectedDistrict, selectedConstituency, selectedParty, selectedHouse, query]);

  // Client-side pagination of filtered results
  const totalResults = filteredMps.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const paginatedMps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMps.slice(start, start + pageSize);
  }, [filteredMps, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Official Parliamentary Directory (18th Lok Sabha)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Find Members of Parliament
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Hierarchical MP discovery across all 28 Indian States &amp; 8 Union Territories.
              Filter by State, City / District, and Parliamentary Constituency to locate your sitting MP.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <DataFreshnessBadge
              status={freshness.status}
              lastUpdated={freshness.lastUpdated}
              source={freshness.source}
              onRefresh={handleRefresh}
            />
            <span className="text-[10px] text-slate-400 font-mono">
              Constituency Connect • Sansad Member Portal
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* External API Integration Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-3.5 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Politician Imagery &amp; Bio Integration</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded">
                  Live Active
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Official portraits and biographical dossiers powered by <strong>Wikidata API (Wikimedia Commons)</strong> &amp; <strong>Google Civic Information API</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isAdminSyncing}
              className="px-2.5 py-1.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg border border-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isAdminSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Parliamentary Data</span>
            </button>
            <button
              type="button"
              onClick={handleSyncMissingPhotos}
              disabled={isAdminSyncing}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg border border-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Sync Missing MP Photos</span>
            </button>
          </div>
        </div>

        {/* Admin Batch Photo Sync Progress / Results Banner */}
        {adminSyncStats && (
          <div className="mb-4 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Batch Photo Verification Finished</span>
                <p className="text-[11px] text-slate-300">Identity matching strictly enforced. Unmatched portraits safely omitted.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
              <div className="bg-white/10 px-2.5 py-1 rounded border border-white/10">
                <span className="text-slate-400 block">Checked</span>
                <span className="font-bold text-white">{adminSyncStats.totalChecked} MPs</span>
              </div>
              <div className="bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30">
                <span className="text-emerald-300 block">Verified</span>
                <span className="font-bold text-emerald-200">+{adminSyncStats.photosVerified}</span>
              </div>
              <div className="bg-blue-500/20 px-2.5 py-1 rounded border border-blue-500/30">
                <span className="text-blue-300 block">Cached</span>
                <span className="font-bold text-blue-200">{adminSyncStats.alreadyCached}</span>
              </div>
              <div className="bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30">
                <span className="text-amber-300 block">Unavailable</span>
                <span className="font-bold text-amber-200">{adminSyncStats.unavailable}</span>
              </div>
              <div className="bg-rose-500/20 px-2.5 py-1 rounded border border-rose-500/30">
                <span className="text-rose-300 block">Failed / Skipped</span>
                <span className="font-bold text-rose-200">{adminSyncStats.failed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Hierarchical Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
          {/* Top Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="mp-universal-search-input"
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch(query);
                  }
                }}
                autoComplete="off"
                placeholder="Search by MP name, City, District, Constituency, or Party (e.g., Narendra Modi, Varanasi, Tamil Nadu, DMK)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
              />

              {/* Real-time Search Suggestions from Official MP Dataset (Requirement 9) */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Suggested Parliamentary Members
                  </div>
                  {suggestions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setQuery(s.name);
                        setShowSuggestions(false);
                        executeSearch(s.name);
                      }}
                      className="px-3.5 py-2 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {s.officialPhotoUrl || s.photoUrl || s.photo ? (
                          <img
                            src={s.officialPhotoUrl || s.photoUrl || s.photo}
                            alt={s.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            onError={e => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">
                            {s.displayName || s.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            MP • {s.constituency} • {s.state} ({s.party})
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-800 font-semibold shrink-0 group-hover:underline ml-2">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              id="mp-search-submit-button"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching MPs...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>

          {/* Popular Search Chips (Requirement 10) */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Popular:</span>
            </span>
            {[
              'Narendra Modi',
              'Drinking Water',
              'Tamil Nadu',
              'Constituency Projects',
              'Delayed Works',
              'Varanasi',
              'Maharashtra',
              'Rahul Gandhi',
            ].map(term => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  if (term === 'Constituency Projects' || term === 'Delayed Works') {
                    onNavigate(`/projects?q=${encodeURIComponent(term)}`);
                    return;
                  }
                  setQuery(term);
                  executeSearch(term);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Hierarchical Cascading Filter Controls: STATE -> CITY/DISTRICT -> CONSTITUENCY */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <Filter className="w-3.5 h-3.5 text-blue-900" />
              <span>Hierarchical Discovery Filter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* LEVEL 1: STATE SELECTION */}
              <div>
                <label
                  htmlFor="filter-state-select"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  1. State / Union Territory
                </label>
                <StateDropdown
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="All States &amp; UTs (All India)"
                />
              </div>

              {/* LEVEL 2: CITY / DISTRICT FILTER */}
              <div>
                <label
                  htmlFor="filter-district-select-btn"
                  className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between"
                >
                  <span>2. City / District / Local Area</span>
                  {selectedState && officialDistricts.length > 0 && (
                    <span className="text-[10px] text-blue-700 font-mono font-normal">
                      {officialDistricts.length} Official Districts
                    </span>
                  )}
                </label>
                <DistrictCityDropdown
                  selectedState={selectedState}
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  placeholder={
                    selectedState
                      ? `All Cities & Districts in ${selectedState}`
                      : 'Select a State First'
                  }
                />
              </div>

              {/* LEVEL 3: CONSTITUENCY FILTER */}
              <div>
                <label
                  htmlFor="filter-constituency-select"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  3. Parliamentary Constituency
                </label>
                <select
                  id="filter-constituency-select"
                  value={selectedConstituency}
                  onChange={e => handleConstituencyChange(e.target.value)}
                  disabled={!selectedState}
                  className={`w-full px-3 py-2 text-xs border rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800 cursor-pointer ${
                    !selectedState
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <option value="">
                    {selectedDistrict
                      ? `All Constituencies in ${selectedDistrict}`
                      : selectedState
                      ? `All Constituencies in ${selectedState}`
                      : 'Select a State First'}
                  </option>
                  {availableConstituencies.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick-Filter Pills for Selected State's Major Cities/Districts */}
          {selectedState && availableDistricts.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Quick Cities / Districts:</span>
              </span>
              <button
                type="button"
                onClick={() => handleDistrictChange('')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDistrict === ''
                    ? 'bg-blue-900 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All {selectedState}
              </button>
              {availableDistricts.slice(0, 10).map(dist => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => handleDistrictChange(dist)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedDistrict === dist
                      ? 'bg-blue-900 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          )}

          {/* Secondary Sub-Filters Row: House, Party, Reset, and Live Hierarchy Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* House Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedHouse('')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedHouse === ''
                      ? 'bg-white text-blue-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Houses
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHouse('Lok Sabha')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedHouse === 'Lok Sabha'
                      ? 'bg-white text-blue-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lok Sabha
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHouse('Rajya Sabha')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedHouse === 'Rajya Sabha'
                      ? 'bg-white text-blue-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rajya Sabha
                </button>
              </div>

              {/* Party Filter */}
              {availableParties.length > 0 && (
                <select
                  value={selectedParty}
                  onChange={e => setSelectedParty(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="">All Parties</option>
                  {availableParties.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              {/* Reset Filters */}
              {(query || selectedState || selectedDistrict || selectedConstituency || selectedParty || selectedHouse) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Hierarchical Breadcrumb & Count Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
              <span className="font-bold text-slate-900">{filteredMps.length}</span>
              <span>MPs</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                {selectedState ? selectedState : 'All India'}
                {selectedDistrict ? ` → ${selectedDistrict}` : ''}
                {selectedConstituency ? ` → ${selectedConstituency}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Active Hierarchy Breadcrumb Banner */}
        {(selectedState || selectedDistrict || selectedConstituency) && (
          <div className="mb-6 p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-blue-950 font-medium">
              <Navigation className="w-4 h-4 text-blue-700 shrink-0" />
              <button
                type="button"
                onClick={() => handleStateChange('')}
                className="hover:underline text-blue-700 font-semibold cursor-pointer"
              >
                All India
              </button>
              {selectedState && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistrict('');
                      setSelectedConstituency('');
                    }}
                    className={`font-semibold cursor-pointer ${
                      !selectedDistrict ? 'text-blue-900 font-bold' : 'hover:underline text-blue-700'
                    }`}
                  >
                    {selectedState}
                  </button>
                </>
              )}
              {selectedDistrict && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                  <button
                    type="button"
                    onClick={() => setSelectedConstituency('')}
                    className={`font-semibold cursor-pointer ${
                      !selectedConstituency ? 'text-blue-900 font-bold' : 'hover:underline text-blue-700'
                    }`}
                  >
                    {selectedDistrict}
                  </button>
                </>
              )}
              {selectedConstituency && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    {selectedConstituency}
                  </span>
                </>
              )}
            </div>

            <div className="text-[11px] text-blue-700 font-mono">
              Showing {filteredMps.length} sitting MP{filteredMps.length === 1 ? '' : 's'}
            </div>
          </div>
        )}

        {/* Search Results Summary Header (Requirement 4) */}
        {lastExecutedQuery && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Search Results
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-bold text-slate-800">{filteredMps.length}</span>{' '}
                {filteredMps.length === 1 ? 'result found' : 'results found'} for{' '}
                <span className="font-bold text-blue-900">&ldquo;{lastExecutedQuery}&rdquo;</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-blue-900 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1 self-start sm:self-auto hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {/* MP Grid & States Flow */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-semibold text-slate-800">
              Searching MPs...
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Searching official data from 18th Lok Sabha parliamentary repository...
            </span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-rose-200 p-8 shadow-xs">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Unable to retrieve MP data.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Please try again. Upstream parliamentary data connection may be refreshing.
            </p>
            <button
              type="button"
              onClick={() => executeSearch(query || lastExecutedQuery)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Please try again
            </button>
          </div>
        ) : filteredMps.length === 0 ? (
          selectedDistrict ? (
            <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 p-8 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-700">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Constituency mapping unavailable for this city.</h3>
              <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                <strong>&ldquo;{selectedDistrict}&rdquo;</strong> is an official local urban / town area in <strong>{selectedState}</strong>.
                In the Election Commission of India administrative delineation, a city is not automatically equivalent to a standalone Lok Sabha parliamentary constituency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDistrictChange('')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  View All {selectedState} MPs ({allStateMps.length})
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No matching MP found.</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Try searching by MP name, constituency, state or party.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMps.map(mp => (
                <MPCard
                  key={mp.id}
                  mp={mp}
                  onSelect={id => onNavigate(`/mp/${id}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4">
                <div className="text-xs text-slate-500 font-mono">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalResults} total MPs)
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 8 && currentPage > 4) {
                      pageNum = Math.min(totalPages, currentPage - 3 + i);
                    }
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
