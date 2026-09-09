import React from 'react';
import {
  Building,
  ShieldCheck,
  Sparkles,
  Users,
  Award,
  Layers,
  CheckCircle2,
  Lock,
  Compass,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart India Hackathon Prototype Initiative</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            MPLADS Smart &amp; AI Powered Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium max-w-2xl mx-auto">
            &ldquo;Transparent • Intelligent • Accountable • Citizen Centric&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
            Modernizing the Members of Parliament Local Area Development Scheme through continuous multi-layer audit, geospatial tracking, and responsible AI pre-check intelligence.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/ai/precheck')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore AI Pre-Check Workflow</span>
            </button>
            <button
              onClick={() => onNavigate('/projects')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              View Public Projects Directory
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Core Objective & Governance Mission */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5 mb-4">
            <Building className="w-5 h-5 text-blue-900" />
            <span>Mission &amp; Regulatory Alignment</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Members of Parliament Local Area Development Scheme (MPLADS) empowers each MP to recommend community infrastructure development works of up to <strong>₹5 Crore annually</strong> in their respective constituencies. This portal solves the longstanding challenges of delayed administrative sanctions, duplicate sanctions across converging Central schemes, photographic verification gaps, and public opacity by introducing a synchronized six-stakeholder digital core.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-100 block mb-1">₹5.0 Crore Cap</span>
              <p className="text-xs text-slate-500">
                Statutory annual entitlement released in two tranches of ₹2.5 Crore upon receipt of provisional utilization certificates.
              </p>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-100 block mb-1">Priority Sector Quotas</span>
              <p className="text-xs text-slate-500">
                Mandatory minimum allocation of 15% for Scheduled Caste (SC) areas and 7.5% for Scheduled Tribe (ST) inhabited areas.
              </p>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-100 block mb-1">Physical QR Plaques</span>
              <p className="text-xs text-slate-500">
                Every sanctioned asset must feature a permanent foundation plaque with a unique QR code linked directly to the public registry.
              </p>
            </div>
          </div>
        </div>

        {/* The 6 Pillars of the Platform */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-slate-100">
              The Six-Stakeholder Governance Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end transparent workflows uniting constitutional representatives, district magistrates, engineers, auditors, and citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                role: 'Member of Parliament (MP)',
                icon: Users,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                desc: 'Recommends works, monitors constituency fund velocity, explores convergence with Central schemes, and views citizen grievance trends.',
                path: '/dashboard/mp',
              },
              {
                role: 'District Officer (DM / DC)',
                icon: Building,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                desc: 'Scrutinizes technical rate schedules, accords administrative sanctions, assigns implementing agencies, and conducts site inspections.',
                path: '/dashboard/district',
              },
              {
                role: 'Implementing Agency',
                icon: Layers,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
                desc: 'Submits real-time physical milestone progress, uploads geotagged before/during/after photographs, and logs contractor bills.',
                path: '/dashboard/agency',
              },
              {
                role: 'Auditor & Vigilance (CAG)',
                icon: ShieldCheck,
                color: 'text-rose-650 bg-rose-50 border-rose-200',
                desc: 'Monitors autonomous schedule rate variance anomalies, flags dormant sites, and enforces responsible human inspection priorities.',
                path: '/dashboard/auditor',
              },
              {
                role: 'Citizen & Social Audit',
                icon: Compass,
                color: 'text-teal-600 bg-teal-50 border-teal-200',
                desc: 'Reports ground issues via conversational AI in local languages, tracks grievance timelines, and scans on-site QR plaques.',
                path: '/dashboard/citizen',
              },
              {
                role: 'MoSPI National Admin',
                icon: Lock,
                color: 'text-purple-600 bg-purple-50 border-purple-200',
                desc: 'Oversees national sectoral caps, maintains statutory guidelines, manages official user roles, and maintains immutable event ledgers.',
                path: '/dashboard/admin',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-100">{item.role}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onNavigate(item.path)}
                      className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Ethics & Policy Guardrail */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900">
                Statutory AI Ethics Guardrail
              </span>
              <h3 className="text-lg font-bold text-amber-950 mt-0.5">
                Human Decision Remains Final — Zero Autonomous Financial Release
              </h3>
              <p className="text-xs text-amber-900 mt-2 leading-relaxed">
                In strict compliance with Indian administrative law and statutory public financial management procedures, artificial intelligence algorithms in this portal operate purely as decision-support instruments. The AI flags duplicate proposals, identifies convergence avenues with schemes like Jal Jeevan Mission and PMGSY, and computes risk triage priorities. <strong>No public funds may be released and no administrative sanctions may be accorded without the explicit, authenticated digital signature or decision of the authorized District Magistrate.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
