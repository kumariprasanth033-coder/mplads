import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { ProjectRecord } from '../../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminProjectsPage: React.FC<Props> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProjects({
        query,
        status: statusFilter,
        sector: sectorFilter,
        limit: 50,
      });
      setProjects(res.projects || []);
    } catch (e) {
      console.error('Failed to load admin projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, sectorFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>National Central Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              National Project Governance Repository
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete oversight across all recommended, sanctioned, ongoing, and completed MPLADS works nationwide.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/dashboard/admin')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              ← Back to Admin Console
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by project title, code, district, MP, or village..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="">All Statuses</option>
                <option value="Sanctioned">Sanctioned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
                <option value="Recommended">Recommended</option>
              </select>

              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="">All Sectors</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Road Construction">Road Construction</option>
                <option value="School Building">School Building</option>
                <option value="Health & Family Welfare">Health &amp; Family Welfare</option>
                <option value="Community Infrastructure">Community Infrastructure</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              National Works Master Registry ({projects.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Live Nodal Sync
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-6 py-3">Project Title &amp; ID</th>
                  <th className="px-6 py-3">Location / MP</th>
                  <th className="px-6 py-3">Sanction Amount</th>
                  <th className="px-6 py-3">Progress</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Risk Score</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{p.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.code}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="text-slate-800 font-medium">{p.district}, {p.state}</div>
                      <div className="text-[11px] text-slate-400">{p.mpName}</div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      ₹{p.financial.sanctionedAmountLakhs} L
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${p.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-emerald-700">{p.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Delayed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px]">
                      <span className={p.riskScore > 60 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                        {p.riskScore} / 100
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate(`/projects/${p.id}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
