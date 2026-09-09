import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Building,
  QrCode,
  Layers,
  FileCheck,
  ExternalLink,
  ChevronRight,
  MapPin,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { ProjectIntelligenceCoreVisual } from '../components/ProjectIntelligenceCoreVisual';
import { MasterIntelligenceDashboard } from '../components/dashboard/MasterIntelligenceDashboard';
import { ProjectRecord } from '../types';
import { searchIntentEngine } from '../services/searchIntentEngine';
import { formatLakhsAmount, formatCleanNumber } from '../utils/safeCalculation';


interface Props {
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate, onOpenSearch }) => {
  const [stats, setStats] = useState<any>(null);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, projectsData] = await Promise.all([
          api.getStats(),
          api.getProjects({ limit: 4, sortBy: 'amount' }),
        ]);
        setStats(statsData);
        setFeaturedProjects(projectsData.projects || []);
      } catch (err) {
        console.error('Home load data error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Live semantic autocomplete & intent suggestion
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const smartIntents = searchIntentEngine.getSmartSuggestions(searchQuery.trim());
        const data = await api.search(searchQuery.trim());
        const directItems = (data?.results?.all || []).slice(0, 4);

        // Merge smart intent suggestions with direct records
        const combined = [
          ...smartIntents.map(si => ({
            id: `intent-${si.text}`,
            name: si.text,
            type: si.type || 'Intent',
            category: si.category,
            status: 'Semantic Query',
            isIntentQuery: true,
            navPath: `/search?q=${encodeURIComponent(si.text)}`,
          })),
          ...directItems.map((item: any) => ({
            ...item,
            isIntentQuery: false,
          })),
        ];

        setSuggestions(combined.slice(0, 7));
        setShowDropdown(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const term = (customQuery || searchQuery).trim();
    if (!term) return;
    setShowDropdown(false);
    onNavigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric backdrop */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* SIH Tag & Badge */}
          <div className="flex flex-wrap items-center gap-3 justify-center text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SMART INDIA HACKATHON PROTOTYPE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Human Decision Remains Final
            </span>
          </div>

          {/* Main Title & Tagline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              MPLADS SMART &amp; AI POWERED PORTAL
            </h1>
            <p className="mt-4 text-base sm:text-xl text-slate-300 font-normal tracking-wide">
              Transparent • Intelligent • Accountable • Citizen Centric
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Transforming the Member of Parliament Local Area Development Scheme into an explainable, data-driven, and public-verified infrastructure delivery ecosystem.
            </p>
          </div>

          {/* Central Hero Search Bar - Fully Functional & Connected */}
          <div className="mt-8 max-w-2xl mx-auto relative z-30">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-slate-800 text-slate-200 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-blue-900 text-white shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  placeholder="🔎 Search MPs, projects, constituencies, villages... (e.g. Narendra Modi, Tamil Nadu)"
                  className="w-full text-xs sm:text-sm font-medium text-slate-100 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {isSearching ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </button>
            </form>

            {/* Real-time Autocomplete Dropdown */}
            {showDropdown && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 text-slate-100 overflow-hidden z-50 animate-in fade-in duration-100">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Suggestions for &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {suggestions.length > 0 ? (
                    suggestions.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowDropdown(false);
                          onNavigate(item.navPath);
                        }}
                        className="p-3 hover:bg-blue-50/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.type === 'MP'
                                ? 'bg-purple-100 text-purple-800'
                                : item.type === 'Project'
                                ? 'bg-blue-100 text-blue-800'
                                : item.type === 'Constituency'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.type}
                          </span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-100 truncate block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {item.state} {item.constituency ? `• ${item.constituency}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No immediate suggestions. Press Search or ENTER for full query.
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center justify-center gap-1 w-full cursor-pointer"
                  >
                    <span>View all matching results on full search page</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Popular Search Pills */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Popular:</span>
              {[
                'Narendra Modi',
                'Drinking Water',
                'Tamil Nadu',
                'Completed Projects',
                'Delayed Projects',
                'Varanasi',
                'Dharmapuri',
              ].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setSearchQuery(q);
                    setShowDropdown(false);
                    onNavigate(`/search?q=${encodeURIComponent(q)}`);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-800/90 hover:bg-blue-900 hover:text-white text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer shadow-xs"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Data Source Provenance Pill */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected to Digital Sansad 18th Lok Sabha &amp; Official MPLADS Hub</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
            <div className="min-w-0 bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 text-center backdrop-blur-xs flex flex-col justify-between overflow-hidden shadow-xs">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white truncate w-full tracking-tight"
                title={String(stats?.totalProjects ?? '58')}
              >
                {formatCleanNumber(stats?.totalProjects ?? 58)}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium leading-snug break-words">Total Sanctioned Works</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 truncate block">National Demo Index</div>
            </div>

            <div className="min-w-0 bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 text-center backdrop-blur-xs flex flex-col justify-between overflow-hidden shadow-xs">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 truncate w-full tracking-tight"
                title={formatLakhsAmount(stats?.sanctionedAmountLakhs ?? 948.5)}
              >
                {formatLakhsAmount(stats?.sanctionedAmountLakhs ?? 948.5)}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium leading-snug break-words">Total Sanctioned Funds</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate block">Across Entitlement Batches</div>
            </div>

            <div className="min-w-0 bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 text-center backdrop-blur-xs flex flex-col justify-between overflow-hidden shadow-xs">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-400 truncate w-full tracking-tight"
                title={formatLakhsAmount(stats?.utilizedAmountLakhs ?? 512.2)}
              >
                {formatLakhsAmount(stats?.utilizedAmountLakhs ?? 512.2)}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium leading-snug break-words">Recorded Expenditure</div>
              <div className="text-[10px] text-blue-300 mt-0.5 truncate block">Verified Milestone Invoices</div>
            </div>

            <div className="min-w-0 bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 text-center backdrop-blur-xs flex flex-col justify-between overflow-hidden shadow-xs">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-400 truncate w-full tracking-tight"
                title={`${stats ? Math.round(((stats.completedProjects || 0) / (stats.totalProjects || 1)) * 100) : '62'}%`}
              >
                {stats ? Math.round(((stats.completedProjects || 0) / (stats.totalProjects || 1)) * 100) : '62'}%
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium leading-snug break-words">Completion Rate</div>
              <div className="text-[10px] text-amber-300 mt-0.5 truncate block">Geotagged Handover</div>
            </div>
          </div>
        </div>
      </section>

      {/* Central Development Intelligence Layer (SIH Master Dashboard) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-800/80/70 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <MasterIntelligenceDashboard onNavigate={onNavigate} />
        </div>
      </section>

      {/* Flagship Feature Section: Project Intelligence Core */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Flagship SIH Module</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Before Fund Release — Project Intelligence Core
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mt-1">
                Autonomous 6-pillar validation prevents duplicate sanctions, checks convergence with Central/State schemes, evaluates documents, and calculates risk scores before an Administrative Sanction is issued.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/ai/precheck')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <span>Launch Live AI Pre-Check Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* The Orbital Component */}
          <ProjectIntelligenceCoreVisual />
        </div>
      </section>

      {/* 6 Role Workspaces Overview (Crucial for SIH Evaluators) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Role-Based Governance Workspaces
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mt-3">
              One Unified Platform. Six Tailored Dashboards.
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every stakeholder has dedicated toolsets with strict role-based access control, synchronized to the central MPLADS database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: MP */}
            <div
              onClick={() => onNavigate('/dashboard/mp')}
              className="p-6 rounded-2xl border border-slate-700 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-900">
                    Member of Parliament (MP)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-100 text-blue-900 font-mono font-bold">
                    MP
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Recommend new community works, review AI pre-check advisories, monitor constituency fund utilization against the ₹5 Crore quota, and identify asset-deficient areas.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>Enter MP Workspace</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: District Officer */}
            <div
              onClick={() => onNavigate('/dashboard/district')}
              className="p-6 rounded-2xl border border-slate-700 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-900">
                    District Collector / Nodal
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 font-mono font-bold">
                    COLLECTOR
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Review MP recommendations, inspect action queues, examine AI duplicate/convergence flags, accord Administrative Sanctions (AS), and assign implementing agencies.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Enter Collector Workspace</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Implementing Agency */}
            <div
              onClick={() => onNavigate('/dashboard/agency')}
              className="p-6 rounded-2xl border border-slate-700 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-900">
                    Implementing Agency (DRDA/PWD)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 font-mono font-bold">
                    AGENCY
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Upload geotagged photographic milestone evidence (Before, During, Completed), record physical progress %, file expenditure invoices, and submit Utilization Certificates (UC).
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Enter Agency Workspace</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Auditor */}
            <div
              onClick={() => onNavigate('/dashboard/auditor')}
              className="p-6 rounded-2xl border border-slate-700 hover:border-rose-500 hover:shadow-lg transition-all cursor-pointer group bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-700 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-rose-900">
                    Auditor &amp; Monitoring Wing
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-rose-100 text-rose-900 font-mono font-bold">
                    AUDITOR
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Automated risk scoring (0-100), schedule rate variance checks, stagnant site alerts, unutilized fund balances, and inspection audit trail generation.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-rose-700">
                <span>Enter Auditor Workspace</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Citizen */}
            <div
              onClick={() => onNavigate('/dashboard/citizen')}
              className="p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-900">
                    Citizen &amp; Community Voice
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-900 font-mono font-bold">
                    CITIZEN
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Lodge civic issues in natural language via AI grievance assistant, discover local development works, verify physical QR boards, and track progress transparently.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>Lodge Grievance &amp; Track</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: Administrator */}
            <div
              onClick={() => onNavigate('/dashboard/admin')}
              className="p-6 rounded-2xl border border-slate-700 hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer group bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-slate-100">
                    Central Portal Administrator
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-200 text-slate-200 font-mono font-bold">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  System configuration, user provisioning, security rule enforcement, telemetry audit logs, and master schema management across national data feeds.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>Admin Console</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Community Projects Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-700 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Public Transparency Feed
              </span>
              <h2 className="text-2xl font-bold text-slate-100 mt-1">
                Recent High-Impact Development Works
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time synchronized records with photographic evidence and utilization certificates
              </p>
            </div>

            <button
              onClick={() => onNavigate('/projects')}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All 58 Works</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {featuredProjects.map(proj => (
              <div
                key={proj.id}
                onClick={() => onNavigate(`/projects/${proj.id}`)}
                className="bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Photo thumbnail */}
                  <div className="h-36 bg-slate-800/80 relative overflow-hidden">
                    {proj.evidence.length > 0 ? (
                      <img
                        src={proj.evidence[proj.evidence.length - 1].url}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-slate-400">
                        <FolderGit2 className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                      {proj.code}
                    </span>
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.status === 'Completed'
                          ? 'bg-emerald-600 text-white'
                          : proj.status === 'Delayed'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <div className="p-4">
                    <span className="text-[11px] font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      {proj.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-blue-900 mt-2 line-clamp-2 leading-snug">
                      {proj.title}
                    </h4>
                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{proj.district}, {proj.state}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Physical Progress</span>
                      <span className="font-bold text-slate-200">{proj.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          proj.progressPercentage === 100
                            ? 'bg-emerald-600'
                            : proj.status === 'Delayed'
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Sanctioned</div>
                      <div className="font-bold text-slate-200">₹{proj.financial.sanctionedAmountLakhs} L</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">MP</div>
                      <div className="font-medium text-slate-300 truncate max-w-[110px]">{proj.mpName}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Project Verification Spotlight (Requirement #16) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              <span>Statutory Transparency Mandate</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              On-Site Public QR Verification
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every completed or in-progress community asset is assigned a cryptographic QR code affixed to the physical site foundation plaque. Citizens can scan the plaque with any smartphone camera to inspect sanctioned budget, contractor name, geotagged evidence, and lodge instant feedback.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('/verify')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-800/80 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <QrCode className="w-4 h-4 text-blue-900" />
                <span>Test QR Code Verification Page</span>
              </button>
              <button
                onClick={() => onNavigate('/projects')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 cursor-pointer"
              >
                Browse Projects with Generated QR
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl text-slate-100 max-w-[280px] w-full text-center border-4 border-amber-500/80">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Sample Physical Site Plaque
              </div>
              <div className="w-36 h-36 mx-auto bg-slate-800/80 rounded-xl p-2 flex items-center justify-center border border-slate-700">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://mplads.gov.in/verify/proj-101"
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-3 text-xs font-mono font-bold text-slate-200">
                MPLADS/2024-25/TN-DHA/101
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Pennagaram Bus Stand RO Water Plant
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
