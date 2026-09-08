import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  FolderGit2,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mps' | 'projects' | 'constituencies' | 'locations'>('all');
  const [isLoading, setIsLoading] = useState(false);
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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSearchData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.search(query.trim());
        setSearchData(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      onClose();
      onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleAskAI = (promptText?: string) => {
    const text = promptText || `Analyze these ${searchData?.totalMatches || 0} search results for "${query}". Highlight delayed projects and fund status.`;
    onClose();
    window.dispatchEvent(new CustomEvent('open-role-copilot', { detail: { prompt: text } }));
  };

  if (!isOpen) return null;

  const currentList = searchData?.results ? searchData.results[activeTab] : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="🔎 Search MPs, projects, constituencies, villages, districts... (Press ENTER to search)"
            className="w-full px-3 py-1.5 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (query.trim()) {
                onClose();
                onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            disabled={!query.trim()}
            className="ml-2 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
          >
            Search
          </button>
          <button
            onClick={onClose}
            className="ml-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-600 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Quick Popular Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Popular:</span>
          {['Narendra Modi', 'Drinking Water', 'Tamil Nadu', 'Completed', 'Delayed', 'Varanasi', 'Dharmapuri'].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setQuery(p)}
              className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 text-slate-700 text-[11px] cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Filter Pills when there are results */}
        {searchData && searchData.totalMatches > 0 && (
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-xs overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {(['all', 'mps', 'projects', 'constituencies', 'locations'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-blue-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab === 'all'
                    ? `All (${searchData.counts.all})`
                    : tab === 'mps'
                    ? `MPs (${searchData.counts.mps})`
                    : tab === 'projects'
                    ? `Projects (${searchData.counts.projects})`
                    : tab === 'constituencies'
                    ? `Constituencies (${searchData.counts.constituencies})`
                    : `Locations (${searchData.counts.locations})`}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <span>Full Results Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-slate-500">Querying live Digital Sansad &amp; MPLADS repositories...</span>
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-8 px-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">MPLADS Universal Search</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Query across 543 Parliamentary Constituencies, 18th Lok Sabha Members, official project sanctions, and village-level works.
              </p>
            </div>
          )}

          {!isLoading && query && searchData && searchData.totalMatches === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No records found matching "{query}".</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching an MP name, state (e.g. Tamil Nadu, Kerala), or work category (e.g. Road, Drinking Water).
              </p>
            </div>
          )}

          {/* AI Helper Card */}
          {!isLoading && searchData && searchData.totalMatches > 0 && (
            <div className="p-3 bg-linear-to-r from-blue-900 to-indigo-900 rounded-xl text-white flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ask AI to summarize these {searchData.totalMatches} records or check for project delays.</span>
              </div>
              <button
                onClick={() => handleAskAI()}
                className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
              >
                Ask AI
              </button>
            </div>
          )}

          {/* Results List */}
          {!isLoading && currentList.length > 0 && (
            <div className="space-y-2">
              {currentList.slice(0, 10).map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose();
                    onNavigate(item.navPath);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'MP'
                          ? 'bg-purple-100 text-purple-800'
                          : item.type === 'Project'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'Constituency'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.type === 'MP' && <User className="w-3.5 h-3.5" />}
                      {item.type === 'Project' && <FolderGit2 className="w-3.5 h-3.5" />}
                      {item.type === 'Constituency' && <Building2 className="w-3.5 h-3.5" />}
                      {item.type === 'Location' && <MapPin className="w-3.5 h-3.5" />}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 font-medium">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.state}
                        {item.constituency ? ` • ${item.constituency}` : ''}
                        {item.metaBadge ? ` • ${item.metaBadge}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Telemetry */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital Sansad 18th Lok Sabha &amp; Official MPLADS Hub</span>
          </span>
          <span className="text-[10px] text-slate-400">Press ENTER for full page</span>
        </div>
      </div>
    </div>
  );
};
