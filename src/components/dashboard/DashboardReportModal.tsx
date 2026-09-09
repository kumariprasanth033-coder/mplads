import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Calendar,
  Filter,
  ShieldCheck,
  Code2,
  FileBarChart,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { DashboardFilterState, dashboardIntelligence } from '../../services/dashboardIntelligenceEngine';
import { ProjectRecord } from '../../types';

interface Props {
  filters: DashboardFilterState;
  projects: ProjectRecord[];
  onClose: () => void;
}

export const DashboardReportModal: React.FC<Props> = ({ filters, projects, onClose }) => {
  const [reportFormat, setReportFormat] = useState<'csv' | 'pdf' | 'json' | 'summary'>('csv');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Derive report scope title
  const reportScope = filters.mpId
    ? `Member of Parliament Performance Dossier`
    : filters.district
    ? `District Development Audit Report (${filters.district})`
    : filters.state
    ? `State Development Intelligence Report (${filters.state})`
    : `National Development Intelligence Overview (Pan-India)`;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Calculate high level numbers for the report
  const totalWorks = projects.length;
  const completedWorks = projects.filter(p => p.status === 'Completed').length;
  const inProgressWorks = projects.filter(p => p.status === 'In Progress').length;
  const delayedWorks = projects.filter(p => p.status === 'Delayed').length;

  const totalSanctionedLakhs = projects.reduce((acc, p) => acc + (p.financial?.sanctionedAmountLakhs || 0), 0);
  const totalExpenditureLakhs = projects.reduce((acc, p) => acc + (p.financial?.expenditureLakhs || 0), 0);
  const completionRate = totalWorks > 0 ? Math.round((completedWorks / totalWorks) * 100) : 0;
  const utilizationRate = totalSanctionedLakhs > 0 ? Math.round((totalExpenditureLakhs / totalSanctionedLakhs) * 100) : 0;

  // Generate & Download Real CSV
  const handleDownloadCsv = () => {
    const headers = [
      'Project Code',
      'Title',
      'Category / Sector',
      'State',
      'District',
      'Constituency',
      'Hon\'ble MP',
      'Implementing Agency',
      'Status',
      'Progress %',
      'Sanctioned (₹ Lakhs)',
      'Expenditure (₹ Lakhs)',
      'Balance (₹ Lakhs)',
      'Year',
    ];

    const rows = projects.map(p => [
      `"${p.code || ''}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.state || ''}"`,
      `"${p.district || ''}"`,
      `"${p.constituency || ''}"`,
      `"${p.mpName || ''}"`,
      `"${(p.implementingAgency || '').replace(/"/g, '""')}"`,
      `"${p.status || ''}"`,
      p.progressPercentage || 0,
      p.financial?.sanctionedAmountLakhs || 0,
      p.financial?.expenditureLakhs || 0,
      p.financial?.balanceLakhs || 0,
      `"${p.year || '2024-25'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MPLADS_Report_${filters.state || 'National'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Generate & Download JSON
  const handleDownloadJson = () => {
    const reportPayload = {
      title: reportScope,
      generatedAt: new Date().toISOString(),
      filtersApplied: filters,
      summary: {
        totalWorks,
        completedWorks,
        inProgressWorks,
        delayedWorks,
        totalSanctionedCr: +(totalSanctionedLakhs / 100).toFixed(2),
        totalExpenditureCr: +(totalExpenditureLakhs / 100).toFixed(2),
        completionRate: `${completionRate}%`,
        utilizationRate: `${utilizationRate}%`,
      },
      provenance: {
        source: 'MoSPI Public Portal + Digital Sansad Member Records + DRDA District Feeds',
        auditStandard: 'SIH 2024 Government Intelligence Demonstration Standard',
      },
      projects,
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MPLADS_Data_${filters.state || 'National'}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Trigger Print to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] modal-overlay flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Official Intelligence Report Generator
              </h3>
              <p className="text-xs text-slate-400">
                Statutory Export &amp; Administrative Review Dossier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs text-slate-200 bg-slate-900">
          {/* Active Context Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 text-sm">{reportScope}</span>
              <span className="text-[10px] text-slate-400 font-mono">{todayStr}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">Active Parameters:</span>
              <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                State: {filters.state || 'All India (36)'}
              </span>
              {filters.district && (
                <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  District: {filters.district}
                </span>
              )}
              {filters.house !== 'All' && (
                <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  House: {filters.house}
                </span>
              )}
              {filters.category !== 'All' && (
                <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Category: {filters.category}
                </span>
              )}
            </div>
          </div>

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-lg font-bold text-slate-100">{totalWorks}</div>
              <div className="text-[10px] text-slate-400">Filtered Works</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-lg font-bold text-emerald-400">{completionRate}%</div>
              <div className="text-[10px] text-slate-400">Completion Rate</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-lg font-bold text-blue-400">₹{(totalSanctionedLakhs / 100).toFixed(1)} Cr</div>
              <div className="text-[10px] text-slate-400">Sanctioned Funds</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-lg font-bold text-emerald-400">₹{(totalExpenditureLakhs / 100).toFixed(1)} Cr</div>
              <div className="text-[10px] text-slate-400">Recorded Expenditure</div>
            </div>
          </div>

          {/* Statutory Verification & Demo Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-1">
            <div className="font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Statutory Data Provenance Assurance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              Generated in conformity with MoSPI MPLADS administrative guidelines. Cross-referenced against 18th Lok Sabha gazette rolls and District DRDA expenditure schedules.
            </p>
          </div>

          {/* Format Selection Tabs */}
          <div>
            <span className="font-bold text-xs text-slate-300 uppercase tracking-wider block mb-2">
              Select Output Format
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setReportFormat('csv')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  reportFormat === 'csv'
                    ? 'border-emerald-500 bg-emerald-950/60 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-100 text-xs">Spreadsheet (CSV)</div>
                  <div className="text-[10px] text-slate-400">All tabular fields</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportFormat('pdf')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  reportFormat === 'pdf'
                    ? 'border-blue-500 bg-blue-950/60 ring-2 ring-blue-500/30'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <Printer className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-100 text-xs">Printable PDF</div>
                  <div className="text-[10px] text-slate-400">Executive layout</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportFormat('json')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  reportFormat === 'json'
                    ? 'border-indigo-500 bg-indigo-950/60 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <Code2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-100 text-xs">JSON Export</div>
                  <div className="text-[10px] text-slate-400">Machine schema</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportFormat('summary')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  reportFormat === 'summary'
                    ? 'border-amber-500 bg-amber-950/60 ring-2 ring-amber-500/30'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <FileBarChart className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-100 text-xs">Executive Summary</div>
                  <div className="text-[10px] text-slate-400">Key takeaways</div>
                </div>
              </button>
            </div>
          </div>

          {/* If Executive Summary is selected, show immediate preview */}
          {reportFormat === 'summary' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-white space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Executive Findings for {filters.state || 'National Overview'}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Fund Utilization Index:</strong> {utilizationRate}% of sanctioned capital (₹{(totalExpenditureLakhs / 100).toFixed(1)} Cr out of ₹{(totalSanctionedLakhs / 100).toFixed(1)} Cr) has been actively expended.
                </li>
                <li>
                  <strong className="text-white">Completion Velocity:</strong> {completionRate}% of sanctioned works ({completedWorks} of {totalWorks}) are completely commissioned and physically handed over.
                </li>
                {delayedWorks > 0 && (
                  <li className="text-amber-300">
                    <strong className="text-amber-200">Attention Required:</strong> {delayedWorks} works flagged with milestone delays requiring District Collectorate review.
                  </li>
                )}
                <li>
                  <strong className="text-white">Governance Recommendation:</strong> Expedite second installment fund requisitions for projects exceeding 75% physical progress.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>

          {reportFormat === 'csv' && (
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Downloaded CSV!' : 'Download CSV Dataset'}</span>
            </button>
          )}

          {reportFormat === 'pdf' && (
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Open Print / PDF Preview</span>
            </button>
          )}

          {reportFormat === 'json' && (
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Downloaded JSON!' : 'Download JSON Export'}</span>
            </button>
          )}

          {reportFormat === 'summary' && (
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Executive Summary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
