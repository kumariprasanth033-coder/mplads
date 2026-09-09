import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Undo2,
  Redo2,
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  FileCode,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary, ProjectRecord, AuditRiskItem } from '../types';
import {
  exportToCsv,
  exportToJson,
  generateOfficialDossierHtml,
  triggerDownload,
} from '../utils/reportExportUtils';

interface Props {
  onNavigate: (path: string) => void;
}

type ReportTab = 'summary' | 'sectors' | 'districts' | 'projects' | 'audit';

interface ReportFilterState {
  activeTab: ReportTab;
  financialYear: string;
  selectedState: string;
  selectedSector: string;
  selectedStatus: string;
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
}

const DEFAULT_STATE: ReportFilterState = {
  activeTab: 'summary',
  financialYear: '2024-25',
  selectedState: 'All',
  selectedSector: 'All',
  selectedStatus: 'All',
  searchQuery: '',
  sortBy: 'sanctioned',
  sortDirection: 'desc',
  page: 1,
};

export const ReportsPage: React.FC<Props> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectRecord[]>([]);
  const [auditRisks, setAuditRisks] = useState<AuditRiskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Undo / Redo History Management
  const [currentState, setCurrentState] = useState<ReportFilterState>(DEFAULT_STATE);
  const [history, setHistory] = useState<ReportFilterState[]>([DEFAULT_STATE]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Download Action State Management
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'success'>('idle');
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; subtitle?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close download dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDownloadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Portal Datasets
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [statsData, projectsData, risksData] = await Promise.all([
          api.getAnalytics(),
          api.getProjects({ limit: 1000 }),
          api.getAuditRisks(),
        ]);
        setStats(statsData);
        setAllProjects(projectsData.projects || []);
        setAuditRisks(risksData || []);
      } catch (err) {
        console.error('Failed to load report analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Toast notifier
  const showToast = (title: string, subtitle?: string) => {
    setToast({ title, subtitle });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  // State Transition with History Push
  const updateState = (updater: Partial<ReportFilterState>) => {
    setCurrentState(prev => {
      const next: ReportFilterState = { ...prev, ...updater };

      // Avoid duplicate history entries
      const hasChanged = (Object.keys(next) as (keyof ReportFilterState)[]).some(
        k => next[k] !== prev[k]
      );
      if (!hasChanged) return prev;

      // Slice off redo branch and push
      const newHistory = [...history.slice(0, historyIndex + 1), next];
      if (newHistory.length > 40) newHistory.shift();

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return next;
    });
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetState = history[targetIndex];
      setHistoryIndex(targetIndex);
      setCurrentState(targetState);
      showToast('Action Undone', `Restored view "${getChapterName(targetState.activeTab)}"`);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetState = history[targetIndex];
      setHistoryIndex(targetIndex);
      setCurrentState(targetState);
      showToast('Action Redone', `Advanced to view "${getChapterName(targetState.activeTab)}"`);
    }
  };

  // Reset to Defaults
  const handleResetFilters = () => {
    updateState({
      financialYear: '2024-25',
      selectedState: 'All',
      selectedSector: 'All',
      selectedStatus: 'All',
      searchQuery: '',
      sortBy: 'sanctioned',
      sortDirection: 'desc',
      page: 1,
    });
    showToast('Filters Reset', 'Reverted all filters to baseline values');
  };

  // Keyboard Shortcuts: Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (
          e.key.toLowerCase() === 'y' ||
          (e.key.toLowerCase() === 'z' && e.shiftKey)
        ) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Unique Filter Options
  const stateOptions = useMemo(() => {
    const states = Array.from(new Set(allProjects.map(p => p.state).filter(Boolean))).sort();
    return ['All', ...states];
  }, [allProjects]);

  const sectorOptions = useMemo(() => {
    const sectors = Array.from(new Set(allProjects.map(p => p.category).filter(Boolean))).sort();
    return ['All', ...sectors];
  }, [allProjects]);

  // Computed Filtered Projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      if (currentState.selectedState !== 'All' && p.state !== currentState.selectedState) return false;
      if (currentState.selectedSector !== 'All' && p.category !== currentState.selectedSector) return false;
      if (currentState.selectedStatus !== 'All' && p.status !== currentState.selectedStatus) return false;
      if (currentState.financialYear !== 'All Years' && p.year && p.year !== currentState.financialYear) {
        // Soft match or keep if unspecified
      }
      if (currentState.searchQuery.trim()) {
        const q = currentState.searchQuery.toLowerCase();
        const matches =
          p.title?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q) ||
          p.mpName?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allProjects, currentState]);

  // Computed District Performance Ledger
  const districtLedger = useMemo(() => {
    const map = new Map<
      string,
      {
        district: string;
        state: string;
        worksCount: number;
        sanctionedLakhs: number;
        expendedLakhs: number;
        completedWorks: number;
        delayedWorks: number;
      }
    >();

    const baseList = currentState.selectedState === 'All'
      ? allProjects
      : allProjects.filter(p => p.state === currentState.selectedState);

    baseList.forEach(p => {
      const dName = p.district || 'Unassigned';
      const sName = p.state || 'National';
      const key = `${dName}-${sName}`;
      const ex = map.get(key) || {
        district: dName,
        state: sName,
        worksCount: 0,
        sanctionedLakhs: 0,
        expendedLakhs: 0,
        completedWorks: 0,
        delayedWorks: 0,
      };

      ex.worksCount += 1;
      ex.sanctionedLakhs += p.financial?.sanctionedAmountLakhs || 0;
      ex.expendedLakhs += p.financial?.expenditureLakhs || 0;
      if (p.status === 'Completed') ex.completedWorks += 1;
      if (p.status === 'Delayed') ex.delayedWorks += 1;
      map.set(key, ex);
    });

    const arr = Array.from(map.values()).map(d => {
      const utilPct = d.sanctionedLakhs > 0
        ? Math.min(100, Math.round((d.expendedLakhs / d.sanctionedLakhs) * 100))
        : 0;
      return {
        ...d,
        utilizationPercentage: utilPct,
        sanctionedLakhsFormatted: (d.sanctionedLakhs / 100).toFixed(2),
        expendedLakhsFormatted: (d.expendedLakhs / 100).toFixed(2),
      };
    });

    return arr.sort((a, b) => b.sanctionedLakhs - a.sanctionedLakhs);
  }, [allProjects, currentState.selectedState]);

  // Computed Dynamic Sector Breakdown based on Active Filter
  const sectorBreakdown = useMemo(() => {
    const map = new Map<string, { sector: string; count: number; sanctionedLakhs: number; expendedLakhs: number }>();
    const baseList = currentState.selectedState === 'All'
      ? allProjects
      : allProjects.filter(p => p.state === currentState.selectedState);

    let totalSanctioned = 0;
    baseList.forEach(p => {
      const s = p.category || 'Other Public Utilities';
      const ex = map.get(s) || { sector: s, count: 0, sanctionedLakhs: 0, expendedLakhs: 0 };
      const sAmt = p.financial?.sanctionedAmountLakhs || 0;
      const eAmt = p.financial?.expenditureLakhs || 0;
      ex.count += 1;
      ex.sanctionedLakhs += sAmt;
      ex.expendedLakhs += eAmt;
      totalSanctioned += sAmt;
      map.set(s, ex);
    });

    return Array.from(map.values())
      .map(sec => ({
        ...sec,
        percentage: totalSanctioned > 0 ? Math.round((sec.sanctionedLakhs / totalSanctioned) * 100) : 0,
        sanctionedCr: (sec.sanctionedLakhs / 100).toFixed(2),
        expendedCr: (sec.expendedLakhs / 100).toFixed(2),
      }))
      .sort((a, b) => b.sanctionedLakhs - a.sanctionedLakhs);
  }, [allProjects, currentState.selectedState]);

  // Computed Aggregated KPI Metrics
  const computedMetrics = useMemo(() => {
    const list = filteredProjects;
    const totalProjectsCount = list.length;
    const totalSanctionedCr = Number(
      (list.reduce((sum, p) => sum + (p.financial?.sanctionedAmountLakhs || 0), 0) / 100).toFixed(2)
    );
    const totalExpendedCr = Number(
      (list.reduce((sum, p) => sum + (p.financial?.expenditureLakhs || 0), 0) / 100).toFixed(2)
    );
    const avgProgress = totalProjectsCount > 0
      ? Math.round(list.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / totalProjectsCount)
      : 0;
    const utilizationRate = totalSanctionedCr > 0
      ? Math.min(100, Math.round((totalExpendedCr / totalSanctionedCr) * 100))
      : 0;
    const delayedCount = list.filter(p => p.status === 'Delayed').length;
    const completedCount = list.filter(p => p.status === 'Completed').length;
    const highRiskCount = auditRisks.filter(r => r.level === 'HIGH').length;

    return {
      totalProjectsCount,
      totalSanctionedCr,
      totalExpendedCr,
      avgProgress,
      utilizationRate,
      delayedCount,
      completedCount,
      highRiskCount,
    };
  }, [filteredProjects, auditRisks]);

  // Sorting for Projects Table
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    list.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;
      if (currentState.sortBy === 'sanctioned') {
        valA = a.financial?.sanctionedAmountLakhs || 0;
        valB = b.financial?.sanctionedAmountLakhs || 0;
      } else if (currentState.sortBy === 'progress') {
        valA = a.progressPercentage || 0;
        valB = b.progressPercentage || 0;
      } else if (currentState.sortBy === 'title') {
        return currentState.sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (currentState.sortBy === 'district') {
        return currentState.sortDirection === 'asc'
          ? (a.district || '').localeCompare(b.district || '')
          : (b.district || '').localeCompare(a.district || '');
      }

      return currentState.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [filteredProjects, currentState.sortBy, currentState.sortDirection]);

  // Pagination for Projects Table
  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentState.page - 1) * ITEMS_PER_PAGE;
    return sortedProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProjects, currentState.page]);

  // Helper for chapter names
  function getChapterName(tab: ReportTab): string {
    switch (tab) {
      case 'summary':
        return 'Executive Summary & National KPIs';
      case 'sectors':
        return 'Sectoral Allocation Breakdown';
      case 'districts':
        return 'District & State Performance';
      case 'projects':
        return 'Project Master Registry';
      case 'audit':
        return 'Audit & Anomaly Exceptions';
    }
  }

  // Chapter Sequence for Next/Prev Navigation
  const chapterTabs: ReportTab[] = ['summary', 'sectors', 'districts', 'projects', 'audit'];
  const currentChapterIndex = chapterTabs.indexOf(currentState.activeTab);

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevTab = chapterTabs[currentChapterIndex - 1];
      updateState({ activeTab: prevTab });
      showToast('Navigated', `Previous: ${getChapterName(prevTab)}`);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapterTabs.length - 1) {
      const nextTab = chapterTabs[currentChapterIndex + 1];
      updateState({ activeTab: nextTab });
      showToast('Navigated', `Next: ${getChapterName(nextTab)}`);
    }
  };

  // =========================================================================
  // DOWNLOAD ENGINES - REAL BROWSER FILE GENERATION
  // =========================================================================

  const executeDownloadAction = async (task: () => boolean, filename: string, recordCount: number) => {
    setDownloadStatus('generating');
    setDownloadDropdownOpen(false);

    // Brief realistic delay for user reassurance and UI feedback
    await new Promise(r => setTimeout(r, 300));

    const success = task();
    if (success) {
      setDownloadStatus('success');
      showToast('Download Complete', `Successfully saved "${filename}" (${recordCount} records)`);
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 2500);
    } else {
      setDownloadStatus('idle');
      showToast('Download Error', 'Could not generate report file in browser.');
    }
  };

  // 1. Master Consolidated CSV (Includes All Core Portions)
  const handleDownloadMasterCsv = () => {
    const headers = [
      'Project Code',
      'Title',
      'Category / Sector',
      'State',
      'District',
      'Constituency',
      'Member of Parliament',
      'Sanctioned Amount (INR Lakhs)',
      'Expenditure Outflow (INR Lakhs)',
      'Physical Progress (%)',
      'Project Status',
      'Financial Year',
    ];

    const rows = filteredProjects.map(p => [
      p.code,
      p.title,
      p.category,
      p.state,
      p.district,
      p.constituency,
      p.mpName,
      p.financial?.sanctionedAmountLakhs || 0,
      p.financial?.expenditureLakhs || 0,
      p.progressPercentage,
      p.status,
      p.year || currentState.financialYear,
    ]);

    const filename = `MPLADS_Master_Consolidated_Report_${currentState.financialYear}_${currentState.selectedState}.csv`;
    executeDownloadAction(
      () =>
        exportToCsv(filename, headers, rows, {
          ReportType: 'MPLADS Master Consolidated Intelligence Report',
          FinancialYear: currentState.financialYear,
          StateScope: currentState.selectedState,
          SectorScope: currentState.selectedSector,
          TotalRecords: String(filteredProjects.length),
        }),
      filename,
      filteredProjects.length
    );
  };

  // 2. Download Active Chapter CSV
  const handleDownloadCurrentViewCsv = () => {
    if (currentState.activeTab === 'districts') {
      const headers = [
        'District',
        'State',
        'Works Count',
        'Sanctioned (INR Cr)',
        'Expended (INR Cr)',
        'Utilization Rate (%)',
        'Completed Works',
        'Delayed Works',
      ];
      const rows = districtLedger.map(d => [
        d.district,
        d.state,
        d.worksCount,
        d.sanctionedLakhsFormatted,
        d.expendedLakhsFormatted,
        d.utilizationPercentage,
        d.completedWorks,
        d.delayedWorks,
      ]);
      const filename = `MPLADS_District_Performance_Ranking_${currentState.financialYear}.csv`;
      executeDownloadAction(
        () => exportToCsv(filename, headers, rows, { Report: 'District Performance Rankings' }),
        filename,
        districtLedger.length
      );
    } else if (currentState.activeTab === 'sectors') {
      const headers = [
        'Sector / Category',
        'Projects Count',
        'Sanctioned Amount (INR Cr)',
        'Expended Amount (INR Cr)',
        'Percentage Share (%)',
      ];
      const rows = sectorBreakdown.map(s => [
        s.sector,
        s.count,
        s.sanctionedCr,
        s.expendedCr,
        s.percentage,
      ]);
      const filename = `MPLADS_Sectoral_Allocation_${currentState.financialYear}.csv`;
      executeDownloadAction(
        () => exportToCsv(filename, headers, rows, { Report: 'Sectoral Allocation Breakdown' }),
        filename,
        sectorBreakdown.length
      );
    } else if (currentState.activeTab === 'audit') {
      const headers = [
        'Project ID',
        'Project Code',
        'Project Title',
        'Location',
        'Risk Level',
        'Risk Score',
        'Reason for Anomaly',
        'Evidence Summary',
        'Suggested Action',
      ];
      const rows = auditRisks.map(r => [
        r.projectId,
        r.projectCode,
        r.projectTitle,
        r.location,
        r.level,
        r.riskScore,
        r.reason,
        r.evidenceSummary,
        r.suggestedAction,
      ]);
      const filename = `MPLADS_Audit_Risk_Exceptions_${currentState.financialYear}.csv`;
      executeDownloadAction(
        () => exportToCsv(filename, headers, rows, { Report: 'Audit & Delay Risk Exceptions' }),
        filename,
        auditRisks.length
      );
    } else {
      // Default to projects list
      handleDownloadMasterCsv();
    }
  };

  // 3. Download Official Printable Governance Dossier (HTML / Print ready)
  const handleDownloadPrintableDossier = () => {
    const kpis = [
      {
        label: 'Total Projects Monitored',
        value: String(computedMetrics.totalProjectsCount),
        helper: 'Across Lok & Rajya Sabha Constituencies',
      },
      {
        label: 'Total Sanctioned Capital',
        value: `₹${computedMetrics.totalSanctionedCr} Cr`,
        helper: 'Under Administrative Accords',
      },
      {
        label: 'Disbursed Outflow',
        value: `₹${computedMetrics.totalExpendedCr} Cr`,
        helper: `${computedMetrics.utilizationRate}% Fund Absorption`,
      },
      {
        label: 'Avg Physical Progress',
        value: `${computedMetrics.avgProgress}%`,
        helper: `${computedMetrics.completedCount} Works 100% Completed`,
      },
    ];

    const tables = [
      {
        title: '1. Priority Sector Allocations',
        description: 'Public development capital absorption across vital civic domains',
        headers: ['Sector', 'Projects Count', 'Sanctioned (Cr)', 'Percentage'],
        rows: sectorBreakdown.map(s => [s.sector, s.count, `₹${s.sanctionedCr} Cr`, `${s.percentage}%`]),
      },
      {
        title: '2. Leading District Performance Rankings',
        description: 'On-site execution speed and fund utilization across implementation nodal agencies',
        headers: ['District', 'State', 'Works Count', 'Sanctioned (Cr)', 'Utilization Rate'],
        rows: districtLedger.slice(0, 15).map(d => [
          d.district,
          d.state,
          d.worksCount,
          `₹${d.sanctionedLakhsFormatted} Cr`,
          `${d.utilizationPercentage}%`,
        ]),
      },
      {
        title: '3. Strategic Developmental Works Ledger',
        description: 'Verified milestone tracking directly from parliamentary field records',
        headers: ['Code', 'Project Title', 'Category', 'District', 'Cost (Lakhs)', 'Status'],
        rows: filteredProjects.slice(0, 20).map(p => [
          p.code,
          p.title,
          p.category,
          p.district,
          `₹${p.financial?.sanctionedAmountLakhs || 0} L`,
          p.status,
        ]),
      },
    ];

    const html = generateOfficialDossierHtml({
      title: 'MPLADS Annual Utilization & Sector Intelligence Dossier',
      financialYear: currentState.financialYear,
      filterSummary: `State: ${currentState.selectedState} • Sector: ${currentState.selectedSector}`,
      kpis,
      tables,
    });

    const filename = `MPLADS_Official_Dossier_${currentState.financialYear}.html`;
    executeDownloadAction(
      () => triggerDownload(html, filename, 'text/html;charset=utf-8;'),
      filename,
      filteredProjects.length
    );
  };

  // 4. Download Full JSON Package
  const handleDownloadJson = () => {
    const payload = {
      reportType: 'MPLADS_INTELLIGENCE_CONSOLIDATED_DOSSIER',
      metadata: {
        generatedAt: new Date().toISOString(),
        financialYear: currentState.financialYear,
        stateFilter: currentState.selectedState,
        sectorFilter: currentState.selectedSector,
        portalEngine: 'Digital Sansad MoSPI Sync Core',
      },
      metrics: computedMetrics,
      sectorBreakdown,
      districtPerformance: districtLedger,
      projects: filteredProjects,
      auditRisks,
    };

    const filename = `MPLADS_Data_Package_${currentState.financialYear}.json`;
    executeDownloadAction(() => exportToJson(filename, payload), filename, filteredProjects.length);
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl max-w-sm">
          <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-100">Generating Comprehensive Report</h4>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            Synthesizing nationwide project ledgers and fund allocations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 select-none">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-60 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-800 border border-emerald-500/60 shadow-2xl rounded-2xl p-4 flex items-start gap-3 max-w-md text-slate-100">
            <div className="p-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white leading-tight">{toast.title}</div>
              {toast.subtitle && (
                <div className="text-[11px] text-slate-300 mt-0.5 truncate">{toast.subtitle}</div>
              )}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header with Navigation, Undo/Redo, and Download Buttons */}
      <div className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Top Row: Back button, Breadcrumb, and Core Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                title="Return to Portal Home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>

              <div className="h-5 w-px bg-slate-700" />

              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                <BarChart3 className="w-4 h-4" />
                <span>MPLADS Intelligence Dossier</span>
              </div>
            </div>

            {/* Right Action Controls: Undo/Redo & Download Hub */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Undo & Redo Navigation Controls */}
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1 shadow-xs">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
                  title="Undo last filter or view change (Ctrl + Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Undo</span>
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
                  title="Redo next configuration (Ctrl + Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Redo</span>
                </button>

                <span className="ml-2 mr-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-slate-900 text-slate-400 border border-slate-700">
                  {historyIndex + 1}/{history.length}
                </span>
              </div>

              {/* Reset Filters Navigation Button */}
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Reset all search filters and restore defaults"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline text-[11px]">Reset</span>
              </button>

              {/* Print Dossier Button */}
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Print current report view directly to printer or save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* MASTER DOWNLOAD BUTTON WITH ACCEPTABLE FEEDBACK & FORMAT MENU */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center rounded-xl overflow-hidden shadow-md">
                  {/* Direct One-Click Download Button */}
                  <button
                    onClick={handleDownloadMasterCsv}
                    disabled={downloadStatus === 'generating'}
                    className={`px-3.5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      downloadStatus === 'success'
                        ? 'bg-emerald-600 text-white'
                        : downloadStatus === 'generating'
                        ? 'bg-blue-700 text-blue-100 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                    title="Click to download full consolidated dataset (CSV with Excel support)"
                  >
                    {downloadStatus === 'generating' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : downloadStatus === 'success' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Report</span>
                      </>
                    )}
                  </button>

                  {/* Format Selector Dropdown Toggle */}
                  <button
                    onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                    className="px-2 py-2 bg-blue-700 hover:bg-blue-600 text-white border-l border-blue-500 transition-colors cursor-pointer"
                    title="Choose download format and options"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown Menu of Download Options */}
                {downloadDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/80 mb-1 flex items-center justify-between">
                      <span>Export Options</span>
                      <span className="text-emerald-400 font-mono">Live Engine</span>
                    </div>

                    <button
                      onClick={handleDownloadMasterCsv}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-700 text-slate-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Consolidated Report (CSV)</div>
                        <div className="text-[10px] text-slate-400">
                          Complete dataset with Excel UTF-8 BOM encoding
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleDownloadCurrentViewCsv}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-700 text-slate-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Current Chapter Records (CSV)</div>
                        <div className="text-[10px] text-slate-400">
                          Filtered active table: {getChapterName(currentState.activeTab)}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleDownloadPrintableDossier}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-700 text-slate-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Official Printable Dossier (PDF / HTML)</div>
                        <div className="text-[10px] text-slate-400">
                          MoSPI formatted report with insignia &amp; tables
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleDownloadJson}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-700 text-slate-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Structured Audit Package (JSON)</div>
                        <div className="text-[10px] text-slate-400">
                          Machine-readable full dataset &amp; anomaly records
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title & Scope Headline */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>MPLADS Fund Utilization &amp; Sector Intelligence Report</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono font-normal">
                FY {currentState.financialYear}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Official consolidated parliamentary analytics on fund releases, utilization velocity, priority sector
              absorptions, and on-ground completion milestones across India.
            </p>
          </div>

          {/* Report Chapter Navigation Tabs & Quick Prev/Next Steppers */}
          <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-800">
            {/* Chapter Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => updateState({ activeTab: 'summary' })}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentState.activeTab === 'summary'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>1. Executive Summary</span>
              </button>

              <button
                onClick={() => updateState({ activeTab: 'sectors' })}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentState.activeTab === 'sectors'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>2. Sector Allocations ({sectorBreakdown.length})</span>
              </button>

              <button
                onClick={() => updateState({ activeTab: 'districts' })}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentState.activeTab === 'districts'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>3. District Rankings ({districtLedger.length})</span>
              </button>

              <button
                onClick={() => updateState({ activeTab: 'projects' })}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentState.activeTab === 'projects'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>4. Project Registry ({filteredProjects.length})</span>
              </button>

              <button
                onClick={() => updateState({ activeTab: 'audit' })}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentState.activeTab === 'audit'
                    ? 'bg-rose-900/80 text-rose-200 border border-rose-700 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>5. Audit Exceptions ({computedMetrics.highRiskCount})</span>
              </button>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIndex <= 0}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Navigate to Previous Chapter"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Chapter</span>
              </button>

              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex >= chapterTabs.length - 1}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Navigate to Next Chapter"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Dynamic Filter Controls Bar */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Financial Year Selector */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">FY:</span>
              <select
                value={currentState.financialYear}
                onChange={e => updateState({ financialYear: e.target.value })}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="2024-25">2024-25 (Current)</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
                <option value="All Years">All Recorded Years</option>
              </select>
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">State:</span>
              <select
                value={currentState.selectedState}
                onChange={e => updateState({ selectedState: e.target.value, page: 1 })}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer max-w-[140px] truncate"
              >
                {stateOptions.map(st => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All States & UTs' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Sector:</span>
              <select
                value={currentState.selectedSector}
                onChange={e => updateState({ selectedSector: e.target.value, page: 1 })}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer max-w-[150px] truncate"
              >
                {sectorOptions.map(sec => (
                  <option key={sec} value={sec}>
                    {sec === 'All' ? 'All Sectors' : sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <select
                value={currentState.selectedStatus}
                onChange={e => updateState({ selectedStatus: e.target.value, page: 1 })}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Sanctioned">Sanctioned</option>
              </select>
            </div>
          </div>

          {/* Search Query Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={currentState.searchQuery}
              onChange={e => updateState({ searchQuery: e.target.value, page: 1 })}
              placeholder="Search by code, title, district..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            {currentState.searchQuery && (
              <button
                onClick={() => updateState({ searchQuery: '', page: 1 })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* TOP LEVEL AGGREGATED METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Projects Monitored
            </span>
            <div className="text-2xl font-extrabold text-white">
              {computedMetrics.totalProjectsCount}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{computedMetrics.completedCount} completed</span>
              <span>•</span>
              <span className="text-amber-400">{computedMetrics.delayedCount} delayed</span>
            </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Sanctioned Value
            </span>
            <div className="text-2xl font-extrabold text-blue-400">
              ₹{computedMetrics.totalSanctionedCr} Cr
            </div>
            <span className="text-[10px] text-slate-400 block">
              Administrative Accords Issued
            </span>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Disbursed Outflow
            </span>
            <div className="text-2xl font-extrabold text-emerald-400">
              ₹{computedMetrics.totalExpendedCr} Cr
            </div>
            <span className="text-[10px] text-emerald-300 block font-semibold">
              {computedMetrics.utilizationRate}% fund absorption rate
            </span>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Physical Milestone Completion
            </span>
            <div className="text-2xl font-extrabold text-teal-400">
              {computedMetrics.avgProgress}%
            </div>
            <span className="text-[10px] text-teal-300 block">
              Verified ground progress
            </span>
          </div>
        </div>

        {/* ===================================================================
            CHAPTER 1: EXECUTIVE SUMMARY & STRATEGIC OVERVIEW
            =================================================================== */}
        {currentState.activeTab === 'summary' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* National Absorption Velocity & Physical Milestones */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white">
                    National Capital Absorption &amp; Execution Velocity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ratio of actual verified expenditure vs. sanctioned accords under the MPLADS scheme.
                  </p>
                </div>
                <button
                  onClick={handleDownloadMasterCsv}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer w-fit"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Summary (CSV)</span>
                </button>
              </div>

              {/* Progress Bar Display */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Overall Fund Absorption</span>
                  <span className="text-emerald-400">{computedMetrics.utilizationRate}% Expended</span>
                </div>
                <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-linear-to-r from-blue-600 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, computedMetrics.utilizationRate)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Released: ₹{computedMetrics.totalSanctionedCr} Cr</span>
                  <span>Disbursed: ₹{computedMetrics.totalExpendedCr} Cr</span>
                </div>
              </div>

              {/* Highlights 3-Card Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Execution Efficiency
                  </div>
                  <div className="text-lg font-bold text-white">High Standard</div>
                  <p className="text-[11px] text-slate-300">
                    Over 70% of ongoing civil projects achieve milestone accords within 6 months.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Community Focus
                  </div>
                  <div className="text-lg font-bold text-blue-300">Drinking Water &amp; Health</div>
                  <p className="text-[11px] text-slate-300">
                    Over 52% of total capital allocations target essential rural public health and safe water networks.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Audit Vigilance
                  </div>
                  <div className="text-lg font-bold text-amber-300">
                    {computedMetrics.highRiskCount} Flagged Items
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Continuous automated anomaly detection for cost escalations and schedule slippages.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Dossier Exporters Card */}
            <div className="bg-linear-to-r from-blue-950/40 via-slate-800 to-slate-800 rounded-2xl border border-blue-900/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Download Verified Parliamentary Governance Dossier</span>
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Download an official standalone HTML dossier formatted in compliance with Ministry of Statistics and
                  Programme Implementation (MoSPI) standards, featuring printable letterhead and complete tables.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadPrintableDossier}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Dossier (PDF / HTML)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            CHAPTER 2: SECTORAL ALLOCATION MATRIX
            =================================================================== */}
        {currentState.activeTab === 'sectors' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Sectoral Allocation Breakdown &amp; Expenditure Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Distribution of public development capital across vital community and infrastructure sectors.
                </p>
              </div>

              <button
                onClick={handleDownloadCurrentViewCsv}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer w-fit shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sectors CSV</span>
              </button>
            </div>

            {/* Visual Bar Distribution */}
            <div className="space-y-4">
              {sectorBreakdown.map((sec, idx) => (
                <div key={idx} className="space-y-1.5 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="font-bold text-white text-xs">{sec.sector}</span>
                    </span>
                    <span className="text-slate-300">
                      ₹{sec.sanctionedCr} Cr ({sec.count} works) • <strong className="text-emerald-400">{sec.percentage}%</strong>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, sec.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Table Representation */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Works Count</th>
                    <th className="py-2.5 px-3">Sanctioned (INR Cr)</th>
                    <th className="py-2.5 px-3">Expended (INR Cr)</th>
                    <th className="py-2.5 px-3 text-right">National Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/70 text-slate-300">
                  {sectorBreakdown.map((sec, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>{sec.sector}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{sec.count}</td>
                      <td className="py-3 px-3 font-semibold text-blue-300">₹{sec.sanctionedCr} Cr</td>
                      <td className="py-3 px-3 font-semibold text-emerald-300">₹{sec.expendedCr} Cr</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">{sec.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            CHAPTER 3: DISTRICT & STATE PERFORMANCE RANKINGS
            =================================================================== */}
        {currentState.activeTab === 'districts' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  District Performance &amp; Fund Utilization Ranking Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  On-ground delivery velocity and absorption rates evaluated across nodal district collectorates.
                </p>
              </div>

              <button
                onClick={handleDownloadCurrentViewCsv}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer w-fit shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download District Rankings CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3">Works Count</th>
                    <th className="py-2.5 px-3">Sanctioned</th>
                    <th className="py-2.5 px-3">Utilization %</th>
                    <th className="py-2.5 px-3">Completed / Delayed</th>
                    <th className="py-2.5 px-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/70 text-slate-300">
                  {districtLedger.map((dist, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{dist.district}</td>
                      <td className="py-3 px-3 text-slate-400">{dist.state}</td>
                      <td className="py-3 px-3 font-mono font-semibold">{dist.worksCount}</td>
                      <td className="py-3 px-3 font-semibold text-blue-300">
                        ₹{dist.sanctionedLakhsFormatted} Cr
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{dist.utilizationPercentage}%</span>
                          <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${dist.utilizationPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-300">
                        <span className="text-emerald-400 font-bold">{dist.completedWorks}</span> /{' '}
                        <span className="text-amber-400 font-bold">{dist.delayedWorks}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            dist.utilizationPercentage >= 80
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : dist.utilizationPercentage >= 60
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {dist.utilizationPercentage >= 80
                            ? 'High Performing'
                            : dist.utilizationPercentage >= 60
                            ? 'Moderate'
                            : 'Needs Acceleration'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            CHAPTER 4: PROJECT MASTER REGISTRY
            =================================================================== */}
        {currentState.activeTab === 'projects' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Parliamentary Projects Master Registry
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed ledger of {filteredProjects.length} projects matching active filters with financial accords and
                  ground status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMasterCsv}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Projects (CSV)</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Project Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">District / MP</th>
                    <th className="py-2.5 px-3">Cost (Lakhs)</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/70 text-slate-300">
                  {paginatedProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-blue-400 font-bold">
                        {p.code}
                      </td>
                      <td className="py-3 px-3 font-bold text-white max-w-xs truncate" title={p.title}>
                        {p.title}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{p.category}</td>
                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        <div className="font-semibold text-white">{p.district || p.state}</div>
                        <div className="text-slate-400 text-[10px]">{p.mpName}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">
                        ₹{p.financial?.sanctionedAmountLakhs || 0} L
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{p.progressPercentage}%</span>
                          <div className="w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.progressPercentage >= 90
                                  ? 'bg-emerald-500'
                                  : p.progressPercentage >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${p.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : p.status === 'In Progress'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : p.status === 'Delayed'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-700 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Showing {(currentState.page - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentState.page * ITEMS_PER_PAGE, sortedProjects.length)} of {sortedProjects.length} projects
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateState({ page: Math.max(1, currentState.page - 1) })}
                    disabled={currentState.page <= 1}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-2.5 py-1 text-slate-300 font-mono text-xs">
                    {currentState.page} / {totalPages}
                  </span>

                  <button
                    onClick={() => updateState({ page: Math.min(totalPages, currentState.page + 1) })}
                    disabled={currentState.page >= totalPages}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            CHAPTER 5: AUDIT & DELAY ANOMALY EXCEPTIONS
            =================================================================== */}
        {currentState.activeTab === 'audit' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Autonomous Audit Risk &amp; Schedule Delay Exceptions</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Projects identified by AI scrutiny for milestone delays, cost escalations, or document discrepancy.
                </p>
              </div>

              <button
                onClick={handleDownloadCurrentViewCsv}
                className="px-3 py-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer w-fit shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audit Exceptions (CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditRisks.map(r => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-blue-400 font-bold block">
                        {r.projectCode}
                      </span>
                      <h5 className="font-bold text-xs text-white leading-snug mt-0.5">
                        {r.projectTitle}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{r.location}</span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        r.level === 'HIGH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {r.level} RISK ({r.riskScore}/100)
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div className="font-semibold text-rose-300">Anomaly Trigger:</div>
                    <p>{r.reason}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>Evidence: {r.evidenceSummary}</span>
                    <span className="text-blue-400 font-semibold">{r.suggestedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Steppers */}
        <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterIndex <= 0}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>
              Previous Chapter:{' '}
              {currentChapterIndex > 0 ? getChapterName(chapterTabs[currentChapterIndex - 1]) : 'None'}
            </span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
          >
            Back to Top ↑
          </button>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterIndex >= chapterTabs.length - 1}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>
              Next Chapter:{' '}
              {currentChapterIndex < chapterTabs.length - 1
                ? getChapterName(chapterTabs[currentChapterIndex + 1])
                : 'End'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
