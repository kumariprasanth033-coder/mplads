import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FolderGit2,
  PlusCircle,
  Sparkles,
  MapPin,
  ChevronRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { ProjectRecord } from '../../types';
import { formatLakhsAmount } from '../../utils/safeCalculation';

interface Props {
  onNavigate: (path: string) => void;
}

export const MpDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.getProjects({ mpId: 'mp-tn-dharmapuri' });
        setProjects(res.projects || []);
      } catch (err) {
        console.error('Failed to load MP projects:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalSanctioned = projects.reduce((sum, p) => sum + p.financial.sanctionedAmountLakhs, 0);
  const totalExpended = projects.reduce((sum, p) => sum + p.financial.expenditureLakhs, 0);
  const delayedProjects = projects.filter(p => p.status === 'Delayed');

  const filtered = filterStatus === 'ALL' ? projects : projects.filter(p => p.status === filterStatus);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Workspace Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
              alt="MP"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-800 text-blue-200">
                  LOK SABHA (18TH)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">
                  SIH DEMO ACCOUNT
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mt-1">
                Dr. A. Senthilkumar, M.P.
              </h1>
              <p className="text-xs text-slate-400">
                Constituency: <strong>Dharmapuri</strong> (Tamil Nadu) • Active Entitlement FY 2024-25
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/ai/precheck')}
              className="px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Recommend New Community Work</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Entitlement Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 w-full">
          <div className="min-w-0 bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-xs text-xs flex flex-col justify-between overflow-hidden">
            <span className="text-slate-400 block font-medium truncate">Annual Quota Entitlement</span>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1 truncate tracking-tight w-full" title="₹500.00 L">
              ₹500.00 L
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block truncate">Statutory MPLADS Cap</span>
          </div>

          <div className="min-w-0 bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-xs text-xs flex flex-col justify-between overflow-hidden">
            <span className="text-slate-400 block font-medium truncate">Sanctioned Outlay (AS)</span>
            <div
              className="text-xl sm:text-2xl font-extrabold text-blue-400 mt-1 truncate tracking-tight w-full"
              title={formatLakhsAmount(totalSanctioned)}
            >
              {formatLakhsAmount(totalSanctioned)}
            </div>
            <span className="text-[10px] text-blue-400/80 mt-0.5 block truncate">Approved by Collector</span>
          </div>

          <div className="min-w-0 bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-xs text-xs flex flex-col justify-between overflow-hidden">
            <span className="text-slate-400 block font-medium truncate">Disbursed Expenditure</span>
            <div
              className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 truncate tracking-tight w-full"
              title={formatLakhsAmount(totalExpended)}
            >
              {formatLakhsAmount(totalExpended)}
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-0.5 block truncate">Against certified works</span>
          </div>

          <div className="min-w-0 bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-xs text-xs flex flex-col justify-between overflow-hidden">
            <span className="text-slate-400 block font-medium truncate">Unsanctioned Balance</span>
            <div
              className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1 truncate tracking-tight w-full"
              title={formatLakhsAmount(Math.max(0, 500 - totalSanctioned))}
            >
              {formatLakhsAmount(Math.max(0, 500 - totalSanctioned))}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-0.5 block truncate">Available for fresh works</span>
          </div>
        </div>

        {/* Proactive Delayed Projects Alert (if any) */}
        {delayedProjects.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="text-rose-950 block text-sm">
                  {delayedProjects.length} Delayed Project Identified in Your Constituency
                </strong>
                <span className="text-rose-800">
                  {delayedProjects[0].title} has exceeded sanctioned timeline by 68 days. Consider requesting review with District Collector.
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate(`/projects/${delayedProjects[0].id}`)}
              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
            >
              Review Delay Cause
            </button>
          </div>
        )}

        {/* Constituency Works Portfolio */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                Recommended Works Portfolio ({filtered.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage, review status, and inspect utilization records
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {['ALL', 'In Progress', 'Completed', 'Delayed', 'Proposed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    filterStatus === status
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-800/80 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Works' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-800 mt-2">
            {filtered.map(proj => (
              <div
                key={proj.id}
                onClick={() => onNavigate(`/projects/${proj.id}`)}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                      {proj.code}
                    </span>
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {proj.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : proj.status === 'Delayed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 mt-1 truncate">
                    {proj.title}
                  </h4>

                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{proj.village || 'Panchayat'}, {proj.district}</span>
                    <span>•</span>
                    <span>Agency: {proj.implementingAgency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                    <strong className="text-slate-100">₹{proj.financial.sanctionedAmountLakhs} L</strong>
                  </div>

                  <div className="w-24">
                    <span className="text-[10px] text-slate-400 block">Progress ({proj.progressPercentage}%)</span>
                    <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
