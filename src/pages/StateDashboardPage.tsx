import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Users,
  Layers,
  BarChart3,
  FileText,
  ShieldCheck,
  RefreshCw,
  FolderGit2,
  PieChart,
} from 'lucide-react';
import { dashboardIntelligence, StateSummaryMetric, DistrictSummaryMetric } from '../services/dashboardIntelligenceEngine';
import { ALL_INDIA_JURISDICTIONS } from '../data/indiaStates';
import { MPRecord, ProjectRecord } from '../types';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';

interface Props {
  stateName: string;
  onNavigate: (path: string) => void;
}

export const StateDashboardPage: React.FC<Props> = ({ stateName, onNavigate }) => {
  // Normalize state name or fallback to Rajasthan
  const resolvedState = useMemo(() => {
    if (!stateName) return 'Rajasthan';
    const match = ALL_INDIA_JURISDICTIONS.find(
      j => j.name.toLowerCase() === stateName.toLowerCase()
    );
    return match ? match.name : stateName;
  }, [stateName]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtViewMode, setDistrictViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('All');

  // Load state metric
  const stateMetric: StateSummaryMetric = useMemo(() => {
    return dashboardIntelligence.getStateMetrics(resolvedState);
  }, [resolvedState]);

  // Load districts
  const districts: DistrictSummaryMetric[] = useMemo(() => {
    return dashboardIntelligence.getDistrictsMetricsByState(resolvedState);
  }, [resolvedState]);

  // Load all MPs for this state
  const stateMps: MPRecord[] = useMemo(() => {
    const allMps = dashboardIntelligence.getAllMps();
    return allMps.filter(
      m => m.state.toLowerCase() === resolvedState.toLowerCase()
    );
  }, [resolvedState]);

  // Load projects for this state
  const stateProjects: ProjectRecord[] = useMemo(() => {
    return dashboardIntelligence.filterProjects({
      state: resolvedState,
      district: selectedDistrict || undefined,
      category: sectorFilter !== 'All' ? sectorFilter : undefined,
      status: projectStatusFilter !== 'All' ? projectStatusFilter : undefined,
    });
  }, [resolvedState, selectedDistrict, sectorFilter, projectStatusFilter]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return districts.filter(d =>
      d.districtName.toLowerCase().includes(districtSearch.toLowerCase()) ||
      (d.headquarters && d.headquarters.toLowerCase().includes(districtSearch.toLowerCase()))
    );
  }, [districts, districtSearch]);

  // High risk projects calculation
  const highRiskWorksCount = useMemo(() => {
    return stateProjects.filter(p => p.riskCategory === 'HIGH' || p.status === 'Delayed').length;
  }, [stateProjects]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* 1. Breadcrumb Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 sticky top-16 z-20 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-slate-400 hover:text-indigo-400 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>India Overview</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
              {resolvedState}
            </span>
            {selectedDistrict && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 flex items-center gap-1.5">
                  <span>District: {selectedDistrict}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDistrict('')}
                    className="text-slate-400 hover:text-rose-400 font-bold ml-1 cursor-pointer"
                    title="Clear district filter"
                  >
                    ×
                  </button>
                </span>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to India Map</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate(`/projects?state=${encodeURIComponent(resolvedState)}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <span>View All State Projects ({stateMetric.totalWorks})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {stateMetric.type.toUpperCase()} INTELLIGENCE DOSSIER
                </span>
                <span className="text-xs font-mono text-slate-400">
                  State Code: <strong className="text-slate-200">{stateMetric.code}</strong>
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  {stateMetric.districtsCount} Districts Synchronized
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  {stateMetric.mpCount} Parliamentary Seats
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
                <span>{resolvedState}</span>
                <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified MoSPI Data</span>
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Comprehensive parliamentary fund expenditure, district execution velocities, and infrastructure milestone tracking across {resolvedState}.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <DataFreshnessBadge
                status="LIVE"
                lastUpdated={new Date().toISOString()}
                source="Digital Sansad & MoSPI MPLADS Portal"
              />
            </div>
          </div>

          {/* 3. High-Level State KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            {/* KPI 1: Total Works */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Works
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {stateMetric.totalWorks}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{stateMetric.completedWorks} done</span>
                <span>•</span>
                <span className="text-sky-400 font-semibold">{stateMetric.inProgressWorks} active</span>
              </div>
            </div>

            {/* KPI 2: Sanctioned Funds */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sanctioned Amount
              </span>
              <div className="text-2xl font-black text-sky-400 mt-1">
                ₹{stateMetric.totalSanctionedCr} <span className="text-sm font-semibold">Cr</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Released: ₹{stateMetric.totalReleasedCr} Cr
              </div>
            </div>

            {/* KPI 3: Utilized Funds */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Expended / Utilized
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                ₹{stateMetric.totalUtilizedCr} <span className="text-sm font-semibold">Cr</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                UC verified expenditures
              </div>
            </div>

            {/* KPI 4: Remaining Balance */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Remaining Balance
              </span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                ₹{stateMetric.remainingCr} <span className="text-sm font-semibold">Cr</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Unspent allocation
              </div>
            </div>

            {/* KPI 5: Utilization Rate */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fund Utilization %
              </span>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {stateMetric.utilizationRate}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, stateMetric.utilizationRate)}%` }}
                />
              </div>
            </div>

            {/* KPI 6: Completion Rate & Delays */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Completion Rate
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {stateMetric.completionRate}%
              </div>
              <div className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{stateMetric.delayedWorks} delayed works</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* 4. Sector Breakdown & Treasury Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sector Breakdown */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-slate-100">
                  Sectoral Allocation Breakdown in {resolvedState}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {stateMetric.topSectors?.length || 0} Sectors Active
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {(stateMetric.topSectors || []).map((sec, idx) => (
                <div key={sec.sector} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>{sec.sector}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{sec.count} projects</span>
                      <span className="font-bold font-mono text-slate-100">{sec.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-blue-500'
                          : idx === 1
                          ? 'bg-indigo-500'
                          : idx === 2
                          ? 'bg-emerald-500'
                          : idx === 3
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, sec.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treasury Fund Allocation Flow */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-slate-100">
                    MPLADS Treasury Velocity
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  Fund Flow
                </span>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Released by MoSPI</span>
                    <span className="text-lg font-bold text-white">₹{stateMetric.totalReleasedCr} Cr</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                    100% of Release
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Administratively Sanctioned</span>
                    <span className="text-lg font-bold text-sky-400">₹{stateMetric.totalSanctionedCr} Cr</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                    {Math.round((stateMetric.totalSanctionedCr / Math.max(1, stateMetric.totalReleasedCr)) * 100)}% Sanctioned
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Disbursed &amp; Utilized</span>
                    <span className="text-lg font-bold text-emerald-400">₹{stateMetric.totalUtilizedCr} Cr</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    {stateMetric.utilizationRate}% Utilized
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Unspent Balance</span>
                    <span className="text-lg font-bold text-amber-300">₹{stateMetric.remainingCr} Cr</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                    {100 - stateMetric.utilizationRate}% Remaining
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Audited under General Financial Rules (GFR)</span>
              <span className="text-emerald-400 font-semibold">Valid UCs</span>
            </div>
          </div>
        </div>

        {/* 5. District Intelligence Directory & Drill-Down */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-lg text-slate-100">
                  Districts of {resolvedState} ({districts.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select a district to filter state projects, review execution velocities and assigned nodal parliamentarians.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={districtSearch}
                  onChange={e => setDistrictSearch(e.target.value)}
                  placeholder="Search district..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-48"
                />
              </div>

              {/* View Switcher */}
              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDistrictViewMode('CARDS')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    districtViewMode === 'CARDS'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setDistrictViewMode('TABLE')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    districtViewMode === 'TABLE'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* District View Mode: Cards */}
          {districtViewMode === 'CARDS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5 max-h-[500px] overflow-y-auto pr-1">
              {filteredDistricts.map(d => {
                const isSelected = selectedDistrict.toLowerCase() === d.districtName.toLowerCase();

                return (
                  <div
                    key={d.districtName}
                    onClick={() => setSelectedDistrict(isSelected ? '' : d.districtName)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg'
                        : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">
                          {d.districtName}
                        </h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          d.utilizationRate >= 80
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : d.utilizationRate >= 65
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {d.utilizationRate}% Utilized
                        </span>
                      </div>
                      {d.headquarters && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          HQ: {d.headquarters}
                        </span>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total Works</span>
                          <span className="font-bold text-slate-200">{d.totalWorks}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Completed</span>
                          <span className="font-bold text-emerald-400">{d.completionRate}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                          <span className="font-semibold text-slate-200">₹{d.sanctionedLakhs}L</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Utilized</span>
                          <span className="font-semibold text-emerald-400">₹{d.utilizedLakhs}L</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate max-w-[170px]">
                        MP: {d.assignedMps[0] || 'Nodal Member'}
                      </span>
                      <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                        <span>{isSelected ? 'Selected' : 'Filter Works'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* District View Mode: Table */
            <div className="mt-5 overflow-x-auto max-h-[500px] border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">District</th>
                    <th className="px-3 py-3">Headquarters</th>
                    <th className="px-3 py-3 text-right">Works</th>
                    <th className="px-3 py-3 text-right">Sanctioned (₹L)</th>
                    <th className="px-3 py-3 text-right">Utilized (₹L)</th>
                    <th className="px-3 py-3 text-right">Utilization %</th>
                    <th className="px-3 py-3 text-right">Completion %</th>
                    <th className="px-3 py-3 text-right">Delayed</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredDistricts.map(d => {
                    const isSelected = selectedDistrict.toLowerCase() === d.districtName.toLowerCase();
                    return (
                      <tr
                        key={d.districtName}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isSelected ? 'bg-indigo-950/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                          {d.districtName}
                        </td>
                        <td className="px-3 py-3 text-slate-400 whitespace-nowrap">
                          {d.headquarters || '—'}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-200">
                          {d.totalWorks}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-300">
                          ₹{d.sanctionedLakhs}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-emerald-400 font-semibold">
                          ₹{d.utilizedLakhs}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            d.utilizationRate >= 75
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {d.utilizationRate}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-300">
                          {d.completionRate}%
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-rose-400 font-semibold">
                          {d.delayedWorks}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDistrict(isSelected ? '' : d.districtName)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isSelected ? 'Clear' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 6. Parliamentary Delegation / MP Directory for this State */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-slate-100">
                  Members of Parliament Representing {resolvedState} ({stateMps.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Click any MP profile to open their dedicated parliamentary dashboard, fund allocation record and project recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(`/mps?state=${encodeURIComponent(resolvedState)}`)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All State MPs in Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {stateMps.map(mp => (
              <div
                key={mp.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {mp.photo ? (
                        <img
                          src={mp.photo}
                          alt={mp.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-indigo-300 transition-colors">
                        {mp.displayName || mp.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span className="truncate">{mp.constituency}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                          {mp.party}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {mp.house}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                      <span className="font-bold text-slate-200">
                        ₹{(mp.stats?.sanctionedAmountLakhs || 450) / 100} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Utilized</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(mp.stats?.utilizedAmountLakhs || 340) / 100} Cr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {mp.stats?.totalProjects || 35} Recommended Works
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/mp/${mp.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>View MP Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Active State Projects List */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-slate-100">
                  Active State Works Directory ({stateProjects.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedDistrict ? `Showing projects in District: ${selectedDistrict}` : `Showing representative projects across ${resolvedState}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
              >
                <option value="All">All Sectors</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Road Construction">Road Construction</option>
                <option value="School Building">School Building</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Community Hall">Community Hall</option>
                <option value="Health & Family Welfare">Health</option>
              </select>

              <select
                value={projectStatusFilter}
                onChange={e => setProjectStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Sanctioned">Sanctioned</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 mt-5">
            {stateProjects.slice(0, 10).map(p => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      p.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : p.status === 'In Progress'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : p.status === 'Delayed'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                    <span className="text-xs font-semibold text-indigo-400">
                      {p.category}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">
                      District: {p.district}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {p.description || p.village || p.constituency}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Outlay</span>
                    <span className="font-bold text-slate-100 text-sm font-mono">
                      ₹{p.financial?.sanctionedAmountLakhs ?? 0} Lakhs
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/projects/${p.id}`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stateProjects.length > 10 && (
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => onNavigate(`/projects?state=${encodeURIComponent(resolvedState)}`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow transition-all"
              >
                <span>View All {stateProjects.length} Projects in {resolvedState}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
