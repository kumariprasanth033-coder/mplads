import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FolderGit2,
  MapPin,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  QrCode,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { api, ProjectSearchParams } from '../services/api';
import { ProjectRecord } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<Props> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sector, setSector] = useState('');
  const [state, setState] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'amount' | 'progress' | 'risk'>('latest');
  const [page, setPage] = useState(1);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProjects({
        query,
        status,
        sector,
        state,
        sortBy,
        page,
        limit: 12,
      });
      setProjects(res.projects || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [status, sector, state, sortBy, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProjects();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Page Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <FolderGit2 className="w-4 h-4" />
              <span>Public Asset Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              MPLADS Development Projects
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live tracking of community infrastructure works, expenditure milestones, and photographic evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
              Total Works: <strong>{totalCount}</strong>
            </span>
            <button
              onClick={() => onNavigate('/ai/precheck')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Pre-Check New Work</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by project name, village, MP, or reference code..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={sector}
                onChange={e => {
                  setSector(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-medium"
              >
                <option value="">All Sectors</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Road Construction">Road Construction</option>
                <option value="School Building">School Building</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Health & Family Welfare">Health &amp; Family Welfare</option>
                <option value="Non-Conventional Energy">Solar &amp; Energy</option>
                <option value="Community Hall">Community Hall</option>
              </select>

              <select
                value={status}
                onChange={e => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Sanctioned">Sanctioned</option>
                <option value="Delayed">Delayed</option>
                <option value="Proposed">Proposed</option>
              </select>

              <select
                value={sortBy}
                onChange={e => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-medium"
              >
                <option value="latest">Sort: Latest</option>
                <option value="amount">Sort: Highest Budget</option>
                <option value="progress">Sort: Highest Progress</option>
                <option value="risk">Sort: High Risk First</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Apply
              </button>

              {(query || sector || status || state) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSector('');
                    setStatus('');
                    setState('');
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-medium">Querying project repository...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Projects Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <div
                key={proj.id}
                onClick={() => onNavigate(`/projects/${proj.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Photo header */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    {proj.evidence.length > 0 ? (
                      <img
                        src={proj.evidence[proj.evidence.length - 1].url}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <FolderGit2 className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 text-white backdrop-blur-xs font-semibold">
                      {proj.code}
                    </span>
                    <span
                      className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {proj.category}
                      </span>
                      {proj.riskCategory === 'HIGH' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Audit Flag</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-900 mt-2 line-clamp-2 leading-snug">
                      {proj.title}
                    </h3>

                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{proj.village || 'Panchayat'}, {proj.district}, {proj.state}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">MP: {proj.mpName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Physical Progress</span>
                      <span className="font-bold text-slate-800">{proj.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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

                  {/* Financial stats */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                      <span className="font-bold text-slate-900">
                        ₹{proj.financial.sanctionedAmountLakhs} L
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expended</span>
                      <span className="font-bold text-emerald-700">
                        ₹{proj.financial.expenditureLakhs} L
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Site Plaque Ready</span>
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
