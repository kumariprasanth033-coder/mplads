import React from 'react';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
  Percent,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminSchemesPage: React.FC<Props> = ({ onNavigate }) => {
  const sectoralGuidelines = [
    {
      sector: 'Drinking Water & Sanitation',
      statutoryPriority: 'High Priority (Tier 1)',
      maxCapLakhs: 50.0,
      convergenceScheme: 'Jal Jeevan Mission (JJM)',
      description: 'Community RO purification plants, piped distribution extensions to hamlets, borewells with submersible solar pumps.',
    },
    {
      sector: 'Roads, Pathways & Minor Bridges',
      statutoryPriority: 'Core Infrastructure (Tier 1)',
      maxCapLakhs: 100.0,
      convergenceScheme: 'PM Gram Sadak Yojana (PMGSY)',
      description: 'Bitumen and concrete approach roads connecting tribal/rural habitations to main highways, culverts, causeways.',
    },
    {
      sector: 'Education & Anganwadi Infrastructure',
      statutoryPriority: 'Social Welfare (Tier 1)',
      maxCapLakhs: 75.0,
      convergenceScheme: 'Samagra Shiksha Abhiyan',
      description: 'Smart classrooms, STEM laboratory blocks, school compound walls, student drinking water and sanitation facilities.',
    },
    {
      sector: 'Public Health & Family Welfare',
      statutoryPriority: 'Essential Services (Tier 1)',
      maxCapLakhs: 60.0,
      convergenceScheme: 'National Health Mission (NHM)',
      description: 'Primary Health Centre extensions, maternity ward amenities, diagnostic equipment, solar cold-chain vaccine storage.',
    },
    {
      sector: 'Non-Conventional Energy Sources',
      statutoryPriority: 'Sustainable Development (Tier 2)',
      maxCapLakhs: 30.0,
      convergenceScheme: 'PM-KUSUM / National Solar Mission',
      description: 'Solar LED street lights for un-electrified streets, rooftop solar plants on Panchayat community centers.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>MoSPI Statutory Policy Framework</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Scheme Guidelines &amp; Convergence Framework
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Statutory permissible works, sectoral allocation boundaries, priority quotas, and Central scheme convergence parameters.
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* Statutory Quotas Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase font-mono">
              <Percent className="w-4 h-4" />
              <span>SC Population Quota</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">15.0%</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Minimum ₹75 Lakhs per annum must be recommended for areas inhabited by Scheduled Caste populations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase font-mono">
              <Percent className="w-4 h-4" />
              <span>ST Population Quota</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">7.5%</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Minimum ₹37.5 Lakhs per annum dedicated to habitations with Scheduled Tribe populations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Trusts &amp; Societies Cap</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">₹1.00 Cr</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Lifetime ceiling for works recommended for registered non-profit educational/charitable societies.
            </p>
          </div>
        </div>

        {/* Permissible Sectors Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Statutory Eligible Infrastructure Categories &amp; Central Convergence Directory
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {sectoralGuidelines.map((g, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {g.statutoryPriority}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{g.sector}</h4>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block font-mono">Max Single Asset Ceiling</span>
                    <strong className="text-slate-900 text-sm">₹{g.maxCapLakhs} Lakhs</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-3xl">
                  {g.description}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">Pre-Check Convergence Partner:</span>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold">
                    {g.convergenceScheme}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
