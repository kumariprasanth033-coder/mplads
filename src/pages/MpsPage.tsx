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
} from 'lucide-react';
import { digitalSansadMemberAdapter } from '../services/dataSources/digitalSansadMemberAdapter';
import { MPRecord } from '../types';
import { StateDropdown } from '../components/StateDropdown';
import { MPCard } from '../components/MPCard';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';

interface Props {
  onNavigate: (path: string) => void;
}

export const MpsPage: React.FC<Props> = ({ onNavigate }) => {
  const [mps, setMps] = useState<MPRecord[]>([]);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<'Lok Sabha' | 'Rajya Sabha' | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
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

  const loadMps = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await digitalSansadMemberAdapter.searchMembers(query, {
        state: selectedState,
        party: selectedParty,
        house: selectedHouse || undefined,
        limit: 150,
      });
      setMps(res.mps);
      setFreshness(res.freshness);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load parliamentary MP data:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMps();
  }, [selectedState, selectedParty, selectedHouse]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMps();
  };

  const handleRefresh = async () => {
    await digitalSansadMemberAdapter.refreshMemberData();
    await loadMps();
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedState('');
    setSelectedParty('');
    setSelectedHouse('');
  };

  // Client-side pagination of fetched results
  const totalResults = mps.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const paginatedMps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mps.slice(start, start + pageSize);
  }, [mps, currentPage, pageSize]);

  // Extract unique parties in current result set for quick filter
  const availableParties = useMemo(() => {
    const set = new Set<string>();
    mps.forEach(m => {
      if (m.party) set.add(m.party);
    });
    return Array.from(set).sort();
  }, [mps]);

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
              Members of Parliament &amp; Constituency Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Official data from Digital Sansad across all 28 Indian States and 8 Union Territories.
              Inspect fund utilization, recommended works, and local project execution.
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
        {/* Top Search & Filter Bar (Matching user specification & screenshot) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search MP / Constituency Input */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search MP name, constituency, or party (e.g. Narendra Modi, Varanasi, DMK, Rahul Gandhi)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Complete India State + Union Territory Dropdown */}
              <div className="shrink-0">
                <StateDropdown
                  value={selectedState}
                  onChange={setStateVal => setSelectedState(setStateVal)}
                  placeholder="All States &amp; UTs"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>

            {/* Sub-Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* House Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedHouse === '' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Houses
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('Lok Sabha')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedHouse === 'Lok Sabha' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lok Sabha
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHouse('Rajya Sabha')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedHouse === 'Rajya Sabha' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
                {(query || selectedState || selectedParty || selectedHouse) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Count Indicator */}
              <div className="text-xs text-slate-500 font-mono">
                Showing <strong>{mps.length}</strong> MPs
                {selectedState ? ` in ${selectedState}` : ' across India'}
              </div>
            </div>
          </form>
        </div>

        {/* MP Grid & States Flow */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-medium text-slate-600">
              Querying Digital Sansad official records...
            </span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-rose-200 p-8 shadow-xs">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Unable to load current MP data.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Please try again. Upstream parliamentary connection may be refreshing.
            </p>
            <button
              type="button"
              onClick={loadMps}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : mps.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No MPs Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              No matching Member of Parliament found for &ldquo;{query}&rdquo;
              {selectedState ? ` in ${selectedState}` : ''}.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Clear Search Filters
            </button>
          </div>
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
                <div className="text-xs text-slate-500">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-blue-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

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
