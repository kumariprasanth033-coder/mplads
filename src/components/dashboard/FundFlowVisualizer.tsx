import React, { useState } from 'react';
import { ArrowRight, Info, TrendingUp, CheckCircle2, AlertCircle, Building2, Layers } from 'lucide-react';

interface FundFlowProps {
  releasedCr: number;
  sanctionedCr: number;
  utilizedCr: number;
  remainingCr: number;
  contextName?: string;
  contextType?: 'National' | 'State' | 'District' | 'MP';
}

export const FundFlowVisualizer: React.FC<FundFlowProps> = ({
  releasedCr,
  sanctionedCr,
  utilizedCr,
  remainingCr,
  contextName = 'National India Overview',
  contextType = 'National',
}) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Safe percentage calculations
  const safeReleased = Math.max(0.1, releasedCr);
  const sanctionedPct = Math.min(100, Math.round((sanctionedCr / safeReleased) * 100));
  const utilizedPct = Math.min(100, Math.round((utilizedCr / safeReleased) * 100));
  const remainingPct = Math.max(0, 100 - utilizedPct);

  const steps = [
    {
      id: 1,
      stepNumber: '01',
      title: 'Government Funds Released',
      badge: 'Tranche Disbursal',
      amount: `₹${releasedCr.toLocaleString()} Cr`,
      subtitle: 'Disbursed by Central Ministry (MoSPI)',
      description:
        'Official statutory funds disbursed to District Nodal Authority bank accounts in biannual tranches of ₹2.5 Crore per MP.',
      color: 'blue',
      pct: 100,
    },
    {
      id: 2,
      stepNumber: '02',
      title: 'Works Recommended by MP',
      badge: 'Prioritization',
      amount: `₹${(sanctionedCr * 1.05).toFixed(1)} Cr`,
      subtitle: 'Citizen & Gram Sabha Demands',
      description:
        'Works officially submitted by the Hon\'ble MP based on grassroots petitions, Gram Sabha resolutions, and asset gaps.',
      color: 'indigo',
      pct: Math.min(105, sanctionedPct + 5),
    },
    {
      id: 3,
      stepNumber: '03',
      title: 'Administratively Sanctioned',
      badge: 'District Approval',
      amount: `₹${sanctionedCr.toLocaleString()} Cr`,
      subtitle: 'Approved by District Collector',
      description:
        'Formal Administrative Sanction (AS) accorded by the District Collector after technical feasibility scrutiny and DRDA estimates.',
      color: 'emerald',
      pct: sanctionedPct,
    },
    {
      id: 4,
      stepNumber: '04',
      title: 'Expenditure / Utilized',
      badge: 'Milestone Disbursal',
      amount: `₹${utilizedCr.toLocaleString()} Cr`,
      subtitle: 'Certified by Utilization Certificates (UC)',
      description:
        'Actual payments released to implementing agencies (PWD, TWAD, DRDA) against geotagged physical milestone inspections.',
      color: 'teal',
      pct: utilizedPct,
    },
    {
      id: 5,
      stepNumber: '05',
      title: 'Remaining Available Balance',
      badge: 'Unspent Allotment',
      amount: `₹${remainingCr.toLocaleString()} Cr`,
      subtitle: 'Committed & Available for Allocation',
      description:
        'Unexpended funds safely maintained in interest-bearing nodal treasury accounts, available for subsequent milestone releases.',
      color: 'amber',
      pct: remainingPct,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      {/* Header with Statutory Clarification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Statutory Fund Journey
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Scope: {contextName} ({contextType})
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
            Government Fund Release, Sanction &amp; Expenditure Tracking
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently records the transition from Central allocation to verified on-site public asset expenditure.
          </p>
        </div>

        {/* Total Utilization Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl self-start md:self-auto">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Effective Utilization
            </div>
            <div className="text-xl font-black text-emerald-700">
              {utilizedPct}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Statutory Guidance Note */}
      <div className="mt-4 p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Official Terminology Clarification: </strong>
          MPLADS funds are released directly by the Government of India to the District Authority. Members of Parliament recommend eligible community development works; the District Collector accords Administrative Sanction and releases expenditure to executing agencies. Figures shown represent statutory public allocations, not personal member funds.
        </div>
      </div>

      {/* Step-by-Step Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {steps.map(s => {
          const isSelected = activeStep === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setActiveStep(isSelected ? null : s.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                  <span className="font-mono">{s.stepNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                    {s.badge}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-600 leading-tight">
                  {s.title}
                </div>

                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  {s.amount}
                </div>

                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {s.subtitle}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                  <span>Relative Volume</span>
                  <span className="font-bold text-slate-700">{s.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.id === 4 ? 'bg-emerald-600' : s.id === 5 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, s.pct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Step Explanation Detail */}
      {activeStep !== null && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white border border-slate-700 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-sky-400">
              {steps[activeStep - 1].title} Details
            </span>
            <button
              type="button"
              onClick={() => setActiveStep(null)}
              className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {steps[activeStep - 1].description}
          </p>
        </div>
      )}

      {/* Visual Proportional Comparison Bar */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Macro Distribution: Released vs Sanctioned vs Expended</span>
          <span className="text-[11px] text-slate-500">
            ₹{releasedCr.toLocaleString()} Cr Total Available
          </span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${utilizedPct}%` }}
            title={`Utilized: ₹${utilizedCr} Cr (${utilizedPct}%)`}
          />
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${Math.max(0, sanctionedPct - utilizedPct)}%` }}
            title={`Sanctioned (Under Execution): ₹${(sanctionedCr - utilizedCr).toFixed(1)} Cr`}
          />
          <div
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${remainingPct}%` }}
            title={`Unspent Balance: ₹${remainingCr} Cr (${remainingPct}%)`}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-slate-600">
              Utilized: <strong className="text-slate-900">₹{utilizedCr} Cr</strong> ({utilizedPct}%)
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-slate-600">
              Under Execution: <strong className="text-slate-900">₹{Math.max(0, sanctionedCr - utilizedCr).toFixed(1)} Cr</strong>
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-slate-600">
              Uncommitted Balance: <strong className="text-slate-900">₹{remainingCr} Cr</strong> ({remainingPct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
