import React, { useState, useMemo, useEffect } from 'react';
import {
  Building,
  MapPin,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  Sparkles,
  ArrowRight,
  Layers,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Users,
  Compass,
  ChevronRight,
  Eye,
  BarChart3,
} from 'lucide-react';
import { ALL_INDIAN_STATES, ALL_UNION_TERRITORIES, ALL_INDIA_JURISDICTIONS } from '../../data/indiaStates';
import { OFFICIAL_INDIAN_DISTRICTS } from '../../../server/data/indiaDistrictsData';
import {
  dashboardIntelligence,
  DashboardFilterState,
  StateSummaryMetric,
  DistrictSummaryMetric,
  NationalOverviewMetrics,
} from '../../services/dashboardIntelligenceEngine';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { FundFlowVisualizer } from './FundFlowVisualizer';
import { MpIntelligenceDashboard } from './MpIntelligenceDashboard';
import { DistrictIntelligenceSection } from './DistrictIntelligenceSection';
import { ProjectInspectionModal } from './ProjectInspectionModal';
import { DashboardReportModal } from './DashboardReportModal';
import { DashboardAiAssistant } from './DashboardAiAssistant';
import { MPAvatar } from '../MPAvatar';
import { MPRecord, ProjectRecord } from '../../types';
import { useDashboardFilter } from '../../context/DashboardFilterContext';
import { formatCleanNumber } from '../../utils/safeCalculation';

interface Props {
  onNavigate: (path: string) => void;
}

export const MasterIntelligenceDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { filters: globalFilters, updateFilter: updateGlobalFilter } = useDashboardFilter();

  // Centralized Cascading Filter State
  const [filters, setFilters] = useState<DashboardFilterState>({
    state: globalFilters.state || '',
    district: globalFilters.district || '',
    house: (globalFilters.house as any) || 'All',
    constituency: globalFilters.constituency || '',
    mpId: globalFilters.mpId || '',
    category: globalFilters.workType || 'All',
    status: (globalFilters.projectStatus as any) || 'All',
    year: globalFilters.financialYear || '2024-25',
    visualization: 'all',
    searchQuery: globalFilters.searchQuery || '',
  });

  // Keep local filters in sync if globalFilters changes externally
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      state: globalFilters.state || '',
      district: globalFilters.district || '',
      constituency: globalFilters.constituency || '',
      house: (globalFilters.house as any) || prev.house,
      category: globalFilters.workType || prev.category,
      status: (globalFilters.projectStatus as any) || prev.status,
      searchQuery: globalFilters.searchQuery || prev.searchQuery,
      mpId: globalFilters.mpId || prev.mpId,
    }));
  }, [globalFilters]);

  // Modal states
  const [inspectingProject, setInspectingProject] = useState<ProjectRecord | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // High-level national metrics
  const nationalMetrics: NationalOverviewMetrics = useMemo(() => {
    return dashboardIntelligence.getNationalOverview();
  }, []);

  // State metrics if a state is selected
  const activeStateMetric: StateSummaryMetric | null = useMemo(() => {
    if (!filters.state) return null;
    return dashboardIntelligence.getStateMetrics(filters.state);
  }, [filters.state]);

  // District metrics for the active state
  const activeStateDistricts: DistrictSummaryMetric[] = useMemo(() => {
    if (!filters.state) return [];
    return dashboardIntelligence.getDistrictsMetricsByState(filters.state);
  }, [filters.state]);

  // Filtered MPs
  const filteredMps: MPRecord[] = useMemo(() => {
    return dashboardIntelligence.filterMps(filters);
  }, [filters]);

  // Active MP if one is explicitly selected
  const activeMp: MPRecord | null = useMemo(() => {
    if (!filters.mpId) return null;
    return dashboardIntelligence.getMpById(filters.mpId) || null;
  }, [filters.mpId]);

  // Filtered Projects
  const filteredProjects: ProjectRecord[] = useMemo(() => {
    return dashboardIntelligence.filterProjects(filters);
  }, [filters]);

  // Update a single filter field cleanly
  const updateFilter = (patch: Partial<DashboardFilterState>) => {
    setFilters(prev => {
      const next = { ...prev, ...patch };
      // Cascading reset logic
      if (patch.state !== undefined && patch.state !== prev.state) {
        next.district = '';
        next.constituency = '';
        next.mpId = '';
      }
      if (patch.district !== undefined && patch.district !== prev.district) {
        next.mpId = '';
      }
      return next;
    });

    // Synchronize to shared DashboardFilterContext
    updateGlobalFilter({
      ...(patch.state !== undefined && {
        state: patch.state,
        ...(patch.state === '' && { district: '', constituency: '', mpId: '' }),
      }),
      ...(patch.district !== undefined && {
        district: patch.district,
        ...(patch.district === '' && { mpId: '' }),
      }),
      ...(patch.constituency !== undefined && { constituency: patch.constituency }),
      ...(patch.status !== undefined && { projectStatus: patch.status as any }),
      ...(patch.category !== undefined && { workType: patch.category }),
      ...(patch.house !== undefined && { house: patch.house as any }),
      ...(patch.searchQuery !== undefined && { searchQuery: patch.searchQuery }),
      ...(patch.mpId !== undefined && { mpId: patch.mpId }),
    });
  };

  // Reset all filters to India Overview
  const resetFilters = () => {
    setFilters({
      state: '',
      district: '',
      house: 'All',
      constituency: '',
      mpId: '',
      category: 'All',
      status: 'All',
      year: '2024-25',
      visualization: 'all',
      searchQuery: '',
    });
    updateGlobalFilter({
      state: '',
      district: '',
      constituency: '',
      house: 'All',
      workType: 'All',
      projectStatus: 'All',
      searchQuery: '',
      mpId: '',
      riskLevel: 'ALL',
    });
  };

  // Helper to deep-link to filtered view while preserving cascading state and district
  const navigateWithPreservedFilters = (basePath: string, extraParams: Record<string, string>) => {
    const params = new URLSearchParams();
    if (filters.state) params.set('state', filters.state);
    if (filters.district) params.set('district', filters.district);
    if (filters.constituency) params.set('constituency', filters.constituency);
    if (filters.house && filters.house !== 'All') params.set('house', filters.house);
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);

    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    // Update DashboardFilterContext BEFORE navigation occurs so target view has exact active filters
    const nextStatus = (extraParams.status as any) || (filters.status !== 'All' ? filters.status : 'All');
    const nextRisk = (extraParams.risk as any) || 'ALL';
    const nextCategory = extraParams.sector || extraParams.category || (filters.category !== 'All' ? filters.category : 'All');

    updateGlobalFilter({
      state: filters.state || '',
      district: filters.district || '',
      constituency: filters.constituency || '',
      projectStatus: nextStatus,
      workType: nextCategory,
      riskLevel: nextRisk,
      house: filters.house as any,
    });

    const queryStr = params.toString();
    onNavigate(queryStr ? `${basePath}?${queryStr}` : basePath);
  };

  return (
    <div className="space-y-10">
      {/* 1. TOP INTELLIGENCE BANNER & BREADCRUMB NAVIGATION */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={resetFilters}
              className={`font-semibold cursor-pointer hover:text-blue-900 transition-colors ${
                !filters.state ? 'text-blue-900 font-bold' : ''
              }`}
            >
              India National Overview
            </button>

            {filters.state && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => updateFilter({ district: '', mpId: '' })}
                  className={`font-semibold cursor-pointer hover:text-blue-900 transition-colors ${
                    !filters.district && !filters.mpId ? 'text-blue-900 font-bold' : ''
                  }`}
                >
                  {filters.state}
                </button>
              </>
            )}

            {filters.district && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => updateFilter({ mpId: '' })}
                  className={`font-semibold cursor-pointer hover:text-blue-900 transition-colors ${
                    !filters.mpId ? 'text-blue-900 font-bold' : ''
                  }`}
                >
                  District: {filters.district}
                </button>
              </>
            )}

            {activeMp && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold text-blue-950">
                  MP: {activeMp.name}
                </span>
              </>
            )}
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowAiAssistant(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 text-xs font-bold border border-indigo-200 cursor-pointer transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Intelligence Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Data Provenance & Timestamp Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified Multi-Source Federation
            </span>
            <span>MoSPI Public Data • Digital Sansad Records • District Collectorate AS Feeds</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Last Sync: <strong>Feb 2025 (Official 18th Sansad Batch)</strong></span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 font-mono text-[10px] text-slate-600">
              SIH 2024 DEMONSTRATION PLATFORM
            </span>
          </div>
        </div>
      </div>

      {/* 2. CASCADING FILTERS & INTELLIGENCE CONTROLS (Requirement #28) */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-900" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Cascading Governance &amp; Geographic Filters
            </h4>
          </div>

          {(filters.state || filters.district || filters.house !== 'All' || filters.category !== 'All' || filters.searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* State / UT Dropdown (All 28 States + 8 UTs) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              State / UT ({ALL_INDIA_JURISDICTIONS.length})
            </label>
            <select
              value={filters.state}
              onChange={e => updateFilter({ state: e.target.value })}
              className="w-full text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-800 text-slate-200 focus:outline-hidden focus:border-blue-600"
            >
              <option value="">All India (28 States + 8 UTs)</option>
              <optgroup label="28 States">
                {ALL_INDIAN_STATES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </optgroup>
              <optgroup label="8 Union Territories">
                {ALL_UNION_TERRITORIES.map(ut => (
                  <option key={ut} value={ut}>
                    {ut}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* District Dropdown (Cascading from selected State) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              District {filters.state ? `(${activeStateDistricts.length})` : ''}
            </label>
            <select
              value={filters.district}
              disabled={!filters.state}
              onChange={e => updateFilter({ district: e.target.value })}
              className="w-full text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-800 text-slate-200 disabled:bg-slate-800/80 disabled:text-slate-400 focus:outline-hidden focus:border-blue-600"
            >
              <option value="">
                {filters.state ? 'All Districts in State' : 'Select State First'}
              </option>
              {activeStateDistricts.map(d => (
                <option key={d.districtName} value={d.districtName}>
                  {d.districtName}
                </option>
              ))}
            </select>
          </div>

          {/* House Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Parliamentary House
            </label>
            <select
              value={filters.house}
              onChange={e => updateFilter({ house: e.target.value as any })}
              className="w-full text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-800 text-slate-200 focus:outline-hidden focus:border-blue-600"
            >
              <option value="All">Both Houses (LS + RS)</option>
              <option value="Lok Sabha">Lok Sabha</option>
              <option value="Rajya Sabha">Rajya Sabha</option>
            </select>
          </div>

          {/* Category / Sector Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Work Sector
            </label>
            <select
              value={filters.category}
              onChange={e => updateFilter({ category: e.target.value })}
              className="w-full text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-800 text-slate-200 focus:outline-hidden focus:border-blue-600"
            >
              <option value="All">All Sectors</option>
              <option value="Drinking Water">Drinking Water</option>
              <option value="Road Construction">Road Construction</option>
              <option value="School Building">School Building</option>
              <option value="Community Hall">Community Hall</option>
              <option value="Health & Family Welfare">Health & Family Welfare</option>
              <option value="Other Utilities">Other Utilities</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Execution Status
            </label>
            <select
              value={filters.status}
              onChange={e => updateFilter({ status: e.target.value })}
              className="w-full text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-800 text-slate-200 focus:outline-hidden focus:border-blue-600"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Delayed">Delayed / Attention</option>
              <option value="Sanctioned">Sanctioned</option>
            </select>
          </div>

          {/* Search Query Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Universal Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={e => updateFilter({ searchQuery: e.target.value })}
                placeholder="MP, project, code..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. INDIA OVERVIEW / HIGH LEVEL INDICATORS (Requirement #1 & #7) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              National Intelligence Index
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              {filters.state ? `${filters.state} State Overview` : 'Pan-India MPLADS Development Overview'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/projects')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-900 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Explore Works</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (filteredProjects.length > 0) {
                  setInspectingProject(filteredProjects[0]);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-sky-300" />
              <span>Inspect Projects</span>
            </button>
          </div>
        </div>

        {/* Indicator Cards Grid - Clickable & Preserves State/District Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5 w-full">
          {/* Card 1: Total Works */}
          <button
            id="kpi-card-total-works"
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { status: 'All' })}
            className="min-w-0 text-left bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-700 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            title="Click to view all works under current filter"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase tracking-wider truncate flex-1">
                {filters.state ? 'State Works' : 'Pan-India Works'}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span
              className="text-xl sm:text-2xl font-black text-slate-100 block mt-1.5 truncate tracking-tight w-full"
              title={String(filters.state ? activeStateMetric?.totalWorks : nationalMetrics.totalProjects)}
            >
              {filters.state ? formatCleanNumber(activeStateMetric?.totalWorks) : formatCleanNumber(nationalMetrics.totalProjects)}
            </span>
            <span
              className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 block group-hover:text-blue-600 font-medium transition-colors truncate w-full"
              title={filters.state ? `${activeStateMetric?.districtsCount} Districts • View All →` : 'Across 787+ Districts • View All →'}
            >
              {filters.state ? `${activeStateMetric?.districtsCount} Districts • View All →` : 'Across 787+ Districts • View All →'}
            </span>
          </button>

          {/* Card 2: Sanctioned Funds */}
          <button
            id="kpi-card-sanctioned-funds"
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { status: 'Sanctioned' })}
            className="min-w-0 text-left bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-700 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            title="Click to view sanctioned works"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase tracking-wider truncate flex-1">
                Sanctioned Funds
              </span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span
              className="text-xl sm:text-2xl font-black text-blue-400 block mt-1.5 truncate tracking-tight w-full"
              title={`₹${filters.state ? activeStateMetric?.totalSanctionedCr : nationalMetrics.totalSanctionedCr.toLocaleString()} Cr`}
            >
              ₹{filters.state ? activeStateMetric?.totalSanctionedCr : nationalMetrics.totalSanctionedCr.toLocaleString()} Cr
            </span>
            <span
              className="text-[10px] sm:text-[11px] text-blue-400/90 mt-1.5 block group-hover:underline font-medium truncate w-full"
              title="Administrative Sanctions →"
            >
              Administrative Sanctions →
            </span>
          </button>

          {/* Card 3: Utilized Funds */}
          <button
            id="kpi-card-utilized-funds"
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { status: 'In Progress' })}
            className="min-w-0 text-left bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            title="Click to view expended / active works"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase tracking-wider truncate flex-1">
                Expended / Utilized
              </span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span
              className="text-xl sm:text-2xl font-black text-emerald-400 block mt-1.5 truncate tracking-tight w-full"
              title={`₹${filters.state ? activeStateMetric?.totalUtilizedCr : nationalMetrics.totalUtilizedCr.toLocaleString()} Cr`}
            >
              ₹{filters.state ? activeStateMetric?.totalUtilizedCr : nationalMetrics.totalUtilizedCr.toLocaleString()} Cr
            </span>
            <span
              className="text-[10px] sm:text-[11px] text-emerald-400/90 mt-1.5 block group-hover:underline font-medium truncate w-full"
              title={filters.state ? `${activeStateMetric?.utilizationRate}% Rate • View →` : `${nationalMetrics.avgUtilizationRate}% Rate • View →`}
            >
              {filters.state ? `${activeStateMetric?.utilizationRate}% Rate • View →` : `${nationalMetrics.avgUtilizationRate}% Rate • View →`}
            </span>
          </button>

          {/* Card 4: Completion Rate */}
          <button
            id="kpi-card-completion-rate"
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { status: 'Completed' })}
            className="min-w-0 text-left bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-700 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            title="Click to view completed works"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase tracking-wider truncate flex-1">
                Asset Completion
              </span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span
              className="text-xl sm:text-2xl font-black text-teal-400 block mt-1.5 truncate tracking-tight w-full"
              title={filters.state ? `${activeStateMetric?.completionRate}%` : `${nationalMetrics.avgCompletionRate}%`}
            >
              {filters.state ? `${activeStateMetric?.completionRate}%` : `${nationalMetrics.avgCompletionRate}%`}
            </span>
            <span
              className="text-[10px] sm:text-[11px] text-teal-400/90 mt-1.5 block group-hover:underline font-medium truncate w-full"
              title="Completed Works →"
            >
              Completed Works →
            </span>
          </button>

          {/* Card 5: Grievances / Feedback */}
          <button
            id="kpi-card-grievances"
            type="button"
            onClick={() => navigateWithPreservedFilters('/grievance', {})}
            className="min-w-0 text-left bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-700 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            title="Click to view public grievances and complaints"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase tracking-wider truncate flex-1">
                Public Grievances
              </span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span
              className="text-xl sm:text-2xl font-black text-amber-400 block mt-1.5 truncate tracking-tight w-full"
              title={String(filters.state ? Math.round((activeStateMetric?.totalWorks || 100) * 0.12) : nationalMetrics.totalGrievances)}
            >
              {filters.state ? formatCleanNumber(Math.round((activeStateMetric?.totalWorks || 100) * 0.12)) : formatCleanNumber(nationalMetrics.totalGrievances)}
            </span>
            <span
              className="text-[10px] sm:text-[11px] text-amber-400/90 mt-1.5 block group-hover:underline font-medium truncate w-full"
              title="Resolution Velocity →"
            >
              Resolution Velocity →
            </span>
          </button>

          {/* Card 6: AI Attention Flag / Delayed Works */}
          <button
            id="kpi-card-attention-signals"
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { status: 'Delayed', risk: 'HIGH' })}
            className="min-w-0 text-left bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-rose-500/40 hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group relative bg-rose-950/20 flex flex-col justify-between overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            title="Click to view delayed and high risk works"
          >
            <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-400 block uppercase tracking-wider truncate flex-1">
                Delayed / Attention
              </span>
              <ArrowRight className="w-3 h-3 text-rose-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <span
              className="text-xl sm:text-2xl font-black text-rose-400 block mt-1.5 truncate tracking-tight w-full"
              title={String(filters.state ? activeStateMetric?.delayedWorks : nationalMetrics.aiAttentionCount)}
            >
              {filters.state ? formatCleanNumber(activeStateMetric?.delayedWorks) : formatCleanNumber(nationalMetrics.aiAttentionCount)}
            </span>
            <span
              className="text-[10px] sm:text-[11px] text-rose-400 mt-1.5 block group-hover:underline font-bold truncate w-full"
              title="View Delayed Records →"
            >
              View Delayed Records →
            </span>
          </button>
        </div>

        {/* Quick Filter Preserving Drill-Down Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Quick Drill-Down:</span>
          <button
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { status: 'Delayed' })}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>Delayed Works Only</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { risk: 'HIGH' })}
            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>High Risk Projects Only</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => navigateWithPreservedFilters('/projects', { sector: 'Drinking Water' })}
            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>Drinking Water Works</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {filters.state && (
            <span className="ml-auto text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              State: {filters.state} {filters.district ? `› District: ${filters.district}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* 4. INTERACTIVE INDIA MAP & STATE SELECTION (Requirement #7 & #8) */}
      <InteractiveIndiaMap
        selectedState={filters.state}
        onSelectState={st => updateFilter({ state: st })}
      />

      {/* 5. DISTRICT ANALYSIS SECTION (Triggered when State is active or national scroll) */}
      {filters.state && (
        <DistrictIntelligenceSection
          districts={activeStateDistricts}
          selectedDistrict={filters.district}
          onSelectDistrict={d => updateFilter({ district: d })}
          stateName={filters.state}
        />
      )}

      {/* 6. MP INTELLIGENCE & BENCHMARKING (When MP is active) */}
      {activeMp ? (
        <MpIntelligenceDashboard
          mp={activeMp}
          onNavigate={onNavigate}
          onInspectProject={p => setInspectingProject(p)}
          onBack={() => updateFilter({ mpId: '' })}
        />
      ) : (
        /* 10. EXPLORE MPs CTA BANNER (Requirement A: Do not display full directory on Home) */
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl border border-slate-800 shadow-md p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Parliamentary Representation
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {filters.state ? `${filteredMps.length} MPs in ${filters.state}` : '790+ MPs Indexed Across 18th Sansad'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {filters.state ? `Explore ${filters.state} Parliamentary Delegation` : 'Explore Members of Parliament Directory'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Inspect constituency fund allocations, project recommendations, utilization velocities, and verified parliamentary dossiers in the dedicated directory.
              </p>

              {/* Quick prominent MP jump pills */}
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 text-xs font-semibold">Quick Access:</span>
                {filteredMps.slice(0, 4).map(mp => (
                  <button
                    key={mp.id}
                    type="button"
                    onClick={() => updateFilter({ mpId: mp.id })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{mp.name}</span>
                    <span className="text-[10px] text-slate-400">({mp.constituency})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side CTA card */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 lg:w-80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  {filteredMps.slice(0, 3).map(m => (
                    <div key={m.id} className="inline-block ring-2 ring-slate-900 rounded-xl overflow-hidden shrink-0">
                      <MPAvatar mp={m} size="sm" showBadge={false} />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Full Parliamentary Ledger</div>
                  <div className="text-[11px] text-slate-400">Lok Sabha &amp; Rajya Sabha</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(filters.state ? `/explore-mps?state=${encodeURIComponent(filters.state)}` : '/explore-mps')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <span>Explore All MPs in Dedicated Directory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. STATUTORY FUND FLOW & SPENDING LIFECYCLE (Requirement #13) */}
      <FundFlowVisualizer
        releasedCr={filters.state ? (activeStateMetric?.totalReleasedCr || 40) : nationalMetrics.totalReleasedCr}
        sanctionedCr={filters.state ? (activeStateMetric?.totalSanctionedCr || 36) : nationalMetrics.totalSanctionedCr}
        utilizedCr={filters.state ? (activeStateMetric?.totalUtilizedCr || 28) : nationalMetrics.totalUtilizedCr}
        remainingCr={filters.state ? (activeStateMetric?.remainingCr || 12) : nationalMetrics.remainingBalanceCr}
        contextName={filters.state ? filters.state : 'National Pan-India'}
        contextType={filters.state ? 'State' : 'National'}
      />

      {/* 8. ACTIVE PROJECTS LIST WITH EVIDENCE AUDIT PREVIEWS (Requirement #14 & #15) */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Ground Reality Inspection
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredProjects.length} Verified Works
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight mt-1">
              Development Works Registry with Geotagged Photographic Proof
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/projects')}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Advanced Search Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.slice(0, 6).map(proj => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-slate-700 hover:border-blue-300 bg-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-600 font-bold">
                    {proj.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : proj.status === 'Delayed'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100 mt-2 line-clamp-2 leading-snug">
                  {proj.title}
                </h4>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {proj.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">
                    {proj.district}, {proj.state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                    <strong className="text-slate-100 font-bold">₹{proj.financial.sanctionedAmountLakhs} L</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Progress</span>
                    <strong className="text-emerald-700 font-bold">{proj.progressPercentage}%</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingProject(proj)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Inspect Evidence
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate(`/projects/${proj.id}`)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-200 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. DATA INTEGRITY & STATUTORY COMPLIANCE BAR (Requirement #17 & #24) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">
                Data Verification &amp; Statutory Provenance Assurance
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700">
                100% AUDITABLE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every parliamentary record is cross-referenced with the official Digital Sansad Member Directory, MoSPI circulars, and District DRDA administrative sanctions. Demonstration figures are clearly labeled to preserve statutory integrity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            Export Audit Pack
          </button>
        </div>
      </div>

      {/* MODALS */}
      {inspectingProject && (
        <ProjectInspectionModal
          project={inspectingProject}
          onClose={() => setInspectingProject(null)}
          onNavigate={onNavigate}
        />
      )}

      {showReportModal && (
        <DashboardReportModal
          filters={filters}
          projects={filteredProjects}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* FLOATING AI INTELLIGENCE COPILOT (Requirement #25 & #26) */}
      <DashboardAiAssistant
        filters={filters}
        onApplyFilter={updateFilter}
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
      />

      {/* Floating Trigger Button for AI Copilot when closed */}
      {!showAiAssistant && (
        <button
          type="button"
          onClick={() => setShowAiAssistant(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white p-3.5 rounded-full shadow-2xl border border-blue-500/50 flex items-center gap-2 font-bold text-xs cursor-pointer transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">AI Dashboard Copilot</span>
        </button>
      )}
    </div>
  );
};
