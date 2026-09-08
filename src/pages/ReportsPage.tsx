import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const ReportsPage: React.FC<Props> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getAnalytics();
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500 font-medium">Computing parliamentary analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>National &amp; State Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              MPLADS Fund Utilization &amp; Sector Intelligence Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consolidated statistics on scheme sanctions, physical progress, and priority sector allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={() => alert('Exporting full parliamentary dataset as CSV (SIH Demo)...')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-medium block">Total Projects Monitored</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalProjects}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Across Lok &amp; Rajya Sabha</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-medium block">Total Sanctioned Value</span>
            <div className="text-2xl font-extrabold text-blue-900 mt-1">₹{stats.totalSanctionedCr} Cr</div>
            <span className="text-[10px] text-blue-600 mt-0.5 block">Under Administrative Accords</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-medium block">Total Disbursed Outflow</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{stats.totalExpendedCr} Cr</div>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">
              {Math.round((stats.totalExpendedCr / stats.totalSanctionedCr) * 100)}% fund absorption
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[11px] font-medium block">Average Physical Completion</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{stats.avgCompletionRate}%</div>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">Verified on-site milestones</span>
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Sectoral Allocation Breakdown
              </h3>
              <p className="text-xs text-slate-500">Distribution of public development capital across vital community needs</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900 px-3 py-1 bg-blue-50 rounded-lg">
              FY {financialYear}
            </span>
          </div>

          <div className="space-y-4 mt-6">
            {stats.sectorBreakdown.map((sec, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                    <span>{sec.sector}</span>
                  </span>
                  <span>₹{sec.amountLakhs} Lakhs ({sec.count} works) • {sec.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-900 to-indigo-600 rounded-full"
                    style={{ width: `${sec.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Performance Ranking Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
            District Performance &amp; Utilization Ranking
          </h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">District</th>
                  <th className="py-2.5">State</th>
                  <th className="py-2.5">Total Works</th>
                  <th className="py-2.5">Sanctioned</th>
                  <th className="py-2.5">Utilization %</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.districtPerformance.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{dist.district}</td>
                    <td className="py-3 text-slate-500">{dist.state}</td>
                    <td className="py-3">{dist.worksCount}</td>
                    <td className="py-3 font-semibold">₹{dist.sanctionedAmountLakhs} L</td>
                    <td className="py-3 font-bold text-emerald-700">{dist.utilizationPercentage}%</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        High Performing
                      </span>
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
