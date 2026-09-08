import React, { useState, useEffect, useRef } from 'react';
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
  BarChart3,
  Map as MapIcon,
  Layers,
  X,
  Bot,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MPAvatar } from '../components/MPAvatar';
import { searchIntentEngine } from '../services/searchIntentEngine';
import { MPLADSSearchIntent } from '../types';
import { useDashboardFilter } from '../context/DashboardFilterContext';

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
  const { filters: globalFilters, updateFilter } = useDashboardFilter();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'mps' | 'districts' | 'riskAlerts'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIntent, setActiveIntent] = useState<MPLADSSearchIntent | null>(null);

  const [searchData, setSearchData] = useState<{
    query: string;
    understoodQuery?: string;
    filtersDetected?: Record<string, string>;
    aiExplanation?: string;
    actions?: {
      viewAllPath: string;
      viewOnMapPath: string;
      viewAnalyticsPath: string;
      askDrishtiPrompt: string;
    };
    totalMatches: number;
    counts: {
      all: number;
      mps: number;
      projects: number;
      districts: number;
      riskAlerts?: number;
      locations?: number;
      constituencies?: number;
    };
    results: {
      all: any[];
      mps: any[];
      projects: any[];
      districts: any[];
      riskAlerts?: any[];
      locations?: any[];
      constituencies?: any[];
    };
    freshness: {
      status: 'LIVE' | 'CACHED' | 'DEMO';
      lastUpdated: string;
      source: string;
    };
    firstMatchPath?: string;
  } | null>(null);

  const executeSearch = async (searchTerm: string, isFollowUp = false) => {
    const term = searchTerm.trim();
    if (!term) return;

    // Direct command: "open the first one" / "open first"
    const lower = term.toLowerCase();
    if ((lower.includes('open first') || lower.includes('first one') || lower === 'open') && searchData?.results?.all?.length) {
      const firstTarget = searchData.results.all[0].navPath;
      if (firstTarget) {
        onNavigate(firstTarget);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use searchIntentEngine to execute intelligent semantic search
      const result = await searchIntentEngine.executeSearch(term, isFollowUp ? activeIntent : null);
      setActiveIntent(result.intent);

      // Normalise response
      const normalizedData = {
        query: result.query,
        understoodQuery: result.understoodQuery,
        filtersDetected: result.filtersDetected,
        aiExplanation: result.aiExplanation,
        actions: result.actions,
        totalMatches: result.totalMatches,
        counts: {
          all: result.counts.all,
          mps: result.counts.mps,
          projects: result.counts.projects,
          districts: result.counts.districts,
          riskAlerts: result.counts.riskAlerts,
          locations: result.counts.locations,
          constituencies: result.counts.mps,
        },
        results: {
          all: result.results.all,
          mps: result.results.mps,
          projects: result.results.projects,
          districts: result.results.districts,
          riskAlerts: result.results.riskAlerts,
          locations: result.results.locations,
          constituencies: result.results.mps,
        },
        freshness: result.freshness,
        firstMatchPath: result.firstMatchPath,
      };

      setSearchData(normalizedData);
    } catch (err: any) {
      console.error('Semantic search error:', err);
      setError('Unable to complete semantic search. Falling back to default repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery, false);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, false);
  };

  const handleFollowUp = (modifierText: string) => {
    const combined = `${modifierText}`;
    setQuery(combined);
    executeSearch(combined, true);
  };

  const handleRemoveFilter = (filterKey: string) => {
    // If removing state, or status, re-run with cleared intent
    const nextQuery = query.replace(new RegExp(filterKey, 'gi'), '').trim();
    const fallback = nextQuery.length > 2 ? nextQuery : 'All Projects';
    setQuery(fallback);
    executeSearch(fallback, false);
  };

  const handleAskAI = (customPrompt?: string) => {
    const promptText =
      customPrompt ||
      searchData?.actions?.askDrishtiPrompt ||
      `Analyze these ${searchData?.totalMatches || 0} search results for "${query}". Highlight delayed works, fund allocations, and recommendations for ${role}.`;

    if (onOpenCopilotWithPrompt) {
      onOpenCopilotWithPrompt(promptText);
    } else {
      window.dispatchEvent(new CustomEvent('open-role-copilot', { detail: { prompt: promptText } }));
    }
  };

  // Determine active list based on active tab
  const getDisplayList = () => {
    if (!searchData?.results) return [];
    if (activeTab === 'all') return searchData.results.all || [];
    if (activeTab === 'projects') return searchData.results.projects || [];
    if (activeTab === 'mps') return searchData.results.mps || [];
    if (activeTab === 'districts') return searchData.results.districts || searchData.results.locations || [];
    if (activeTab === 'riskAlerts') return searchData.results.riskAlerts || [];
    return searchData.results.all || [];
  };

  const currentList = getDisplayList();

  return (
    <div id="search-results-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div id="search-input-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="search-input-field"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask anything (e.g., 'Delayed projects in Rajasthan', 'High risk works', 'Drinking water near Jaipur', 'Narendra Modi')..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <button
            id="search-submit-button"
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Interpreting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Follow-up Modifiers */}
        <div id="search-modifiers-bar" className="mt-4 flex items-center gap-2 overflow-x-auto text-xs text-slate-600 pt-3 border-t border-slate-100">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Modifiers:
          </span>
          {[
            'Only Jaipur',
            'Only high risk ones',
            'Delayed Projects',
            'Projects in Rajasthan',
            'Drinking water only',
            'Open first one',
          ].map(mod => (
            <button
              key={mod}
              type="button"
              onClick={() => handleFollowUp(mod)}
              className="whitespace-nowrap px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 transition-colors cursor-pointer text-slate-700 font-medium"
            >
              + {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Understood Query & Detected Filters Card */}
      {searchData && (
        <div id="understood-query-card" className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> INTENT UNDERSTOOD
                </span>
                <span className="text-xs text-slate-400">
                  {searchData.freshness.source}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Showing:</span>
                <span className="text-emerald-400 font-extrabold underline decoration-emerald-500/40">
                  {searchData.understoodQuery || searchData.query}
                </span>
              </h1>

              {searchData.aiExplanation && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {searchData.aiExplanation}
                </p>
              )}
            </div>

            {/* Total count badge */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-xl text-center min-w-[100px]">
                <div className="text-2xl font-black text-white">{searchData.totalMatches}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Matched Records</div>
              </div>
            </div>
          </div>

          {/* Detected Filter Chips */}
          {searchData.filtersDetected && Object.keys(searchData.filtersDetected).length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Active Intent Filters:</span>
              {Object.entries(searchData.filtersDetected).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-white font-bold">{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter(String(v))}
                    className="hover:text-red-400 ml-1 cursor-pointer"
                    title="Remove filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Quick Result Action Bar (Part F) */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
            <button
              id="action-view-all"
              onClick={() => {
                const detected = (searchData.filtersDetected || {}) as Record<string, string>;
                updateFilter({
                  state: detected.state || activeIntent?.state || '',
                  district: detected.district || activeIntent?.district || '',
                  constituency: detected.constituency || activeIntent?.constituency || '',
                  projectStatus: ((detected.status || activeIntent?.projectStatus || 'All') as any),
                  workType: detected.workType || activeIntent?.workType || 'All',
                  riskLevel: ((detected.risk || activeIntent?.riskLevel || 'ALL') as any),
                });
                onNavigate(searchData.actions?.viewAllPath || '/projects');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>View All in Explorer</span>
            </button>

            <button
              id="action-view-map"
              onClick={() => {
                const detected = (searchData.filtersDetected || {}) as Record<string, string>;
                updateFilter({
                  state: detected.state || activeIntent?.state || '',
                  district: detected.district || activeIntent?.district || '',
                  constituency: detected.constituency || activeIntent?.constituency || '',
                  projectStatus: ((detected.status || activeIntent?.projectStatus || 'All') as any),
                  workType: detected.workType || activeIntent?.workType || 'All',
                });
                onNavigate(searchData.actions?.viewOnMapPath || '/');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>View on Map</span>
            </button>

            <button
              id="action-view-analytics"
              onClick={() => {
                const detected = (searchData.filtersDetected || {}) as Record<string, string>;
                updateFilter({
                  state: detected.state || activeIntent?.state || '',
                  district: detected.district || activeIntent?.district || '',
                  constituency: detected.constituency || activeIntent?.constituency || '',
                  projectStatus: ((detected.status || activeIntent?.projectStatus || 'All') as any),
                });
                onNavigate(searchData.actions?.viewAnalyticsPath || '/');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>View Analytics</span>
            </button>

            <button
              id="action-ask-drishti"
              onClick={() => handleAskAI()}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ml-auto"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Drishti AI About Results</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs Grouped by Entity */}
      {searchData && (
        <div id="search-entity-tabs" className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-sm">
          <button
            id="tab-all"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Results ({searchData.counts.all})</span>
          </button>
          <button
            id="tab-projects"
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Projects ({searchData.counts.projects})</span>
          </button>
          <button
            id="tab-mps"
            onClick={() => setActiveTab('mps')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'mps'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>MPs ({searchData.counts.mps})</span>
          </button>
          <button
            id="tab-districts"
            onClick={() => setActiveTab('districts')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'districts'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Districts ({searchData.counts.districts || searchData.counts.locations || 0})</span>
          </button>
          <button
            id="tab-risk"
            onClick={() => setActiveTab('riskAlerts')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'riskAlerts'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Risk Alerts ({searchData.counts.riskAlerts || 0})</span>
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
        <div id="search-results-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item: any) => (
            <div
              key={item.id}
              id={`result-card-${item.id}`}
              onClick={() => {
                if (item.type === 'Project') {
                  updateFilter({
                    state: item.state || '',
                    district: item.district || '',
                    constituency: item.constituency || '',
                    projectStatus: (item.status === 'Delayed' || item.status === 'Completed' || item.status === 'In Progress' || item.status === 'Sanctioned') ? item.status : 'All',
                  });
                } else if (item.type === 'MP') {
                  updateFilter({
                    state: item.state || '',
                    constituency: item.constituency || '',
                    mpId: item.id || '',
                  });
                } else if (item.type === 'District') {
                  updateFilter({
                    state: item.state || '',
                    district: item.district || item.name || '',
                  });
                } else if (item.type === 'Constituency') {
                  updateFilter({
                    state: item.state || '',
                    constituency: item.constituency || item.name || '',
                  });
                }
                onNavigate(item.navPath);
              }}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
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
                        : item.type === 'RiskAlert'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.type === 'MP' && <User className="w-3 h-3" />}
                    {item.type === 'Project' && <FolderGit2 className="w-3 h-3" />}
                    {item.type === 'Constituency' && <Building2 className="w-3 h-3" />}
                    {item.type === 'District' && <MapPin className="w-3 h-3" />}
                    {item.type === 'RiskAlert' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                    <span>{item.type}</span>
                  </span>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                      item.status === 'Delayed'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : item.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Main Name / Title */}
                <div className="flex items-start gap-3">
                  {item.type === 'MP' && (
                    <div className="shrink-0">
                      <MPAvatar
                        mp={{
                          name: item.name,
                          photo: item.photoUrl,
                          constituency: item.constituency,
                          state: item.state,
                          party: item.party,
                          house: item.house,
                        }}
                        size="sm"
                        showBadge={true}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {item.name || item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-700">{item.state}</span>
                      {item.district && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>District: {item.district}</span>
                        </>
                      )}
                      {item.constituency && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>Constituency: {item.constituency}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Additional Metadata badge */}
                {item.metaBadge && (
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-medium">{item.metaBadge}</span>
                    {item.sanctionedAmountLakhs && (
                      <span className="font-bold text-slate-800">₹{item.sanctionedAmountLakhs} Lakhs</span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer: Provenance & Action Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 truncate max-w-[220px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">Official MPLADS Verified</span>
                </div>
                <div className="flex items-center gap-1 text-blue-900 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchData ? (
        <div id="no-search-results" className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No records found for "{query}".</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Try broader terms like "Delayed Projects", "Projects in Rajasthan", or "Drinking Water".
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Try clicking:</span>
            {['Delayed Projects', 'Projects in Rajasthan', 'High Risk Projects', 'Drinking Water', 'Narendra Modi'].map(t => (
              <button
                key={t}
                onClick={() => {
                  setQuery(t);
                  executeSearch(t, false);
                }}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-xs text-slate-600 transition-colors font-medium cursor-pointer"
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
          <h3 className="text-lg font-bold text-slate-800">Intelligent Natural Language Search</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Type natural queries such as "Delayed works in Rajasthan", "High risk projects", or "Roads in Jaipur".
          </p>
        </div>
      )}
    </div>
  );
};
