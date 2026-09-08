import React from 'react';
import { ShieldCheck, Info, ExternalLink, Building, Heart } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* SIH Transparency & Responsible AI Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>SIH DEMO DATA &amp; PROTOTYPE ENVIRONMENT</span>
          </div>
          <p className="text-[11px] text-slate-300 max-w-2xl">
            This platform is an AI-assisted governance prototype engineered for the Smart India Hackathon.
            All analytics and AI modules operate under the constitutional mandate: <strong className="text-white font-semibold">HUMAN DECISION REMAINS FINAL</strong>. AI never executes fund releases or replaces statutory collectorate sanctions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Portal Overview */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-base">MPLADS SMART PORTAL</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              An intelligent, transparent, and accountable digital infrastructure for India&apos;s Member of Parliament Local Area Development Scheme.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>SIH DEMO PLATFORM v2.4</span>
            </div>
          </div>

          {/* Col 2: Citizen & Public Services */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Citizen &amp; Public Discovery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/projects')}
                  className="hover:text-white transition-colors"
                >
                  Explore All Development Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/mps')}
                  className="hover:text-white transition-colors"
                >
                  Find My MP &amp; Fund Utilization
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/map')}
                  className="hover:text-white transition-colors"
                >
                  GIS Interactive Constituency Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard/citizen')}
                  className="hover:text-white transition-colors"
                >
                  Lodge Grievance with AI Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/reports')}
                  className="hover:text-white transition-colors"
                >
                  State &amp; Sectoral Progress Reports
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Role Portals & Workspaces */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Governance Workspaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/ai/precheck')}
                  className="hover:text-white transition-colors text-emerald-400 font-medium"
                >
                  ⚡ AI Pre-Check Intelligence Core
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard/mp')}
                  className="hover:text-white transition-colors"
                >
                  Member of Parliament (MP) Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard/district')}
                  className="hover:text-white transition-colors"
                >
                  District Collector / Nodal Officer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard/agency')}
                  className="hover:text-white transition-colors"
                >
                  Implementing Agency Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard/auditor')}
                  className="hover:text-white transition-colors"
                >
                  Independent Auditor &amp; CAG Monitor
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory & Government References */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Statutory References
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1">
                <span>Revised MPLADS Guidelines (2023)</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Ministry of Statistics &amp; Programme Implementation (MoSPI)</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Lok Sabha &amp; Rajya Sabha Secretariats</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Direct Benefit Transfer (DBT) &amp; PFMS</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
              Disclaimer: Synthetic demo records simulated for the Smart India Hackathon showcase.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-300 gap-3">
          <div>
            © {new Date().getFullYear()} MPLADS Smart &amp; AI Powered Portal. Smart India Hackathon Prototype.
          </div>
          <div className="flex items-center gap-4">
            <span>Built for Transparency &amp; Public Good</span>
            <span>•</span>
            <button onClick={() => onNavigate('/about')} className="hover:underline">
              System Architecture
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
