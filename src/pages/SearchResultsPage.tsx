import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  FolderGit2,
  MapPin,
  Building2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Props {
  initialQuery?: string;
  onNavigate: (path: string) => void;
  onOpenCopilotWithPrompt?: (prompt: string) => void;
}

export const SearchResultsPage: React.FC<Props> = ({
  initialQuery = '',
  onNavigate,
  onOpenCopilotWithPrompt,
}) => {
  const { role } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'mps' | 'projects' | 'constituencies' | 'locations'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState<{
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
      all: any[];
      mps: any[];
      constituencies: any[];
      projects: any[];
      locations: any[];
    };
    freshness: {
      status: 'LIVE' | 'CACHED' | 'DEMO';
      lastUpdated: string;
      source: string;
    };
  } | null>(null);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    setSearchData(null); // Clear previous results immediately
    try {
      const data = await api.search(searchTerm.trim());
      setSearchData(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Unable to retrieve MP data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const currentList = searchData?.results ? searchData.results[activeTab] : [];

  const handleAskAI = (customPrompt?: string) => {
    const promptText = customPrompt || `Analyze these ${searchData?.totalMatches || 0} search results for "${query}". Highlight delayed works, fund allocations, and key takeaways for ${role}.`;
    if (onOpenCopilotWithPrompt) {
      onOpenCopilotWithPrompt(promptText);
    } else {
      // Dispatches a global event that RoleCopilotWidget listens to
      window.dispatchEvent(new CustomEvent('open-role-copilot', { detail: { prompt: promptText } }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search MPs, projects, constituencies, villages, districts... (e.g. Narendra Modi, Tamil Nadu, Drinking Water)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Searching official data...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Search Suggestions */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span className="text-slate-400 font-medium shrink-0">Popular:</span>
          {['Narendra Modi', 'Rahul Gandhi', 'Drinking Water', 'Tamil Nadu', 'Completed', 'Delayed', 'Dharmapuri', 'Varanasi'].map(term => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                executeSearch(term);
              }}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Header and Telemetry */}
      {searchData && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Search Results for <span className="text-blue-900">"{searchData.query}"</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Found <span className="font-semibold text-slate-800">{searchData.totalMatches}</span> verified records across official parliamentary & project repositories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                searchData.freshness.status === 'LIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${searchData.freshness.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{searchData.freshness.status === 'LIVE' ? 'LIVE OFFICIAL DATA' : 'VERIFIED CACHED DATA'}</span>
            </span>
          </div>
        </div>
      )}

      {/* AI Assistant Integration Banner */}
      {searchData && searchData.totalMatches > 0 && (
        <div className="mb-8 p-4 sm:p-5 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
                <span>AI Intelligence Integration</span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-800 text-blue-200 font-mono">
                  {role}
                </span>
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Let your role copilot analyze these {searchData.totalMatches} matching results for scheme convergence, delays, or duplicate works.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAskAI()}
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI About These Results</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      {searchData && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results ({searchData.counts.all})
          </button>
          <button
            onClick={() => setActiveTab('mps')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'mps'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            MPs ({searchData.counts.mps})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'projects'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Projects ({searchData.counts.projects})
          </button>
          <button
            onClick={() => setActiveTab('constituencies')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'constituencies'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Constituencies ({searchData.counts.constituencies})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'locations'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Locations ({searchData.counts.locations})
          </button>
        </div>
      )}

      {/* Results Container */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-sm w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item: any) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.navPath)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Type Badge & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.type === 'MP'
                        ? 'bg-purple-100 text-purple-800'
                        : item.type === 'Project'
                        ? 'bg-blue-100 text-blue-800'
                        : item.type === 'Constituency'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.type === 'MP' && <User className="w-3 h-3" />}
                    {item.type === 'Project' && <FolderGit2 className="w-3 h-3" />}
                    {item.type === 'Constituency' && <Building2 className="w-3 h-3" />}
                    {item.type === 'Location' && <MapPin className="w-3 h-3" />}
                    <span>{item.type}</span>
                  </span>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.status}
                  </span>
                </div>

                {/* Main Name / Title */}
                <div className="flex items-start gap-3">
                  {item.type === 'MP' && (
                    item.photoVerified && item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex flex-col items-center justify-center text-[7px] text-center border border-slate-200 shrink-0 p-1 leading-tight">
                        <User className="w-4 h-4 mb-0.5 text-slate-300" />
                        <span>Official photo unavailable</span>
                      </div>
                    )
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-700">{item.state}</span>
                      {item.constituency && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>Constituency: {item.constituency}</span>
                        </>
                      )}
                      {item.district && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>District: {item.district}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Additional Metadata badge */}
                {item.metaBadge && (
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-medium">{item.metaBadge}</span>
                    {item.party && (
                      <span className="font-bold text-slate-800">{item.party}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer: Provenance & Action Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 truncate max-w-[220px]">
                  <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.source}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-900 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching MP found.</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Try searching by MP name, constituency, state or party.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Try searching:</span>
            {['Narendra Modi', 'Tamil Nadu', 'Drinking Water', 'Dharmapuri'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setQuery(t);
                  executeSearch(t);
                }}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-xs text-slate-600 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Explore the Complete MPLADS & Parliament Repository</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Type any MP name, Indian State, Union Territory, Parliamentary Constituency, village, or work category above.
          </p>
        </div>
      )}
    </div>
  );
};
