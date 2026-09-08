import React from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Lock,
  ExternalLink,
  Activity,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { user, switchDemoRole } = useAuth();

  const roleProfiles: { role: UserRole; name: string; designation: string; path: string; desc: string }[] = [
    {
      role: 'CITIZEN',
      name: 'Ramesh Kumar',
      designation: 'Resident of Dharmapuri',
      path: '/dashboard/citizen',
      desc: 'Natural language grievance lodgement, social audit, public asset verification.',
    },
    {
      role: 'MP',
      name: 'Dr. A. Senthilkumar',
      designation: 'Member of Parliament (Lok Sabha)',
      path: '/dashboard/mp',
      desc: '₹5 Cr annual entitlement tracking, AI project pre-checking, portfolio monitoring.',
    },
    {
      role: 'DISTRICT_OFFICER',
      name: 'Smt. K. Shanthi, IAS',
      designation: 'District Collector & DM, Dharmapuri',
      path: '/dashboard/collector',
      desc: 'Adjudication queue, statutory Administrative Sanctions (AS), line agency assignment.',
    },
    {
      role: 'IMPLEMENTING_AGENCY',
      name: 'Er. R. Murugan',
      designation: 'Executive Engineer, DRDA / PWD',
      path: '/dashboard/agency',
      desc: 'Physical milestone progress updates, geotagged photo evidence upload, UC submission.',
    },
    {
      role: 'AUDITOR',
      name: 'Shri V. Ramakrishnan',
      designation: 'Principal Accountant General (Audit)',
      path: '/dashboard/auditor',
      desc: 'Schedule rate variance detection, dormant/delayed site alerts, statutory audit trails.',
    },
    {
      role: 'ADMIN',
      name: 'MoSPI National Admin',
      designation: 'Ministry Technical Directorate',
      path: '/dashboard/admin',
      desc: 'Platform telemetry, security policies, role-based access control, system health.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-700 text-white">
                MINISTRY SUPERADMIN &amp; RBAC CONSOLE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-slate-950">
                SIH HACKATHON EVALUATOR MODE
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              Platform Administration &amp; Multi-Role Switcher
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly test and demonstrate the exact role-based view, permissions, and AI copilot across all governance stakeholders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
              Active Session: <strong>{user?.role}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Role Switcher Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-900" />
                <span>One-Click Role Switcher for SIH Evaluators</span>
              </h3>
              <p className="text-xs text-slate-500">
                Select any persona below to immediately log in and explore their custom view and AI Copilot assistant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {roleProfiles.map(item => {
              const isCurrent = user?.role === item.role;
              return (
                <div
                  key={item.role}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-md'
                      : 'border-slate-200 hover:border-blue-400 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.role}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Role</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-slate-900 mt-2">
                      {item.name}
                    </h4>
                    <div className="text-xs text-blue-900 font-medium">{item.designation}</div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        switchDemoRole(item.role);
                        onNavigate(item.path);
                      }}
                      className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      Login as {item.role.replace('_', ' ')}
                    </button>
                    <button
                      onClick={() => onNavigate(item.path)}
                      className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Direct Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-700" />
            <span>National Administrative Modules</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <button
              onClick={() => onNavigate('/admin/users')}
              className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <Users className="w-5 h-5 text-purple-700 group-hover:scale-110 transition-transform mb-2" />
              <div className="font-bold text-slate-900 text-xs">User &amp; Role Directory</div>
              <p className="text-[11px] text-slate-500 mt-1">Manage nodal collectors, line agencies, MPs, and auditors.</p>
            </button>

            <button
              onClick={() => onNavigate('/admin/projects')}
              className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <Server className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform mb-2" />
              <div className="font-bold text-slate-900 text-xs">National Works Registry</div>
              <p className="text-[11px] text-slate-500 mt-1">Full nationwide project table with filter and risk monitoring.</p>
            </button>

            <button
              onClick={() => onNavigate('/admin/schemes')}
              className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform mb-2" />
              <div className="font-bold text-slate-900 text-xs">Scheme Guidelines</div>
              <p className="text-[11px] text-slate-500 mt-1">Statutory quotas (15% SC / 7.5% ST) &amp; convergence directory.</p>
            </button>

            <button
              onClick={() => onNavigate('/admin/audit')}
              className="p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <ShieldAlert className="w-5 h-5 text-rose-700 group-hover:scale-110 transition-transform mb-2" />
              <div className="font-bold text-slate-900 text-xs">Statutory Audit Log</div>
              <p className="text-[11px] text-slate-500 mt-1">Cryptographically sequenced events with CSV export.</p>
            </button>
          </div>
        </div>

        {/* System Telemetry & AI Core Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Project Intelligence Core Telemetry</span>
            </h3>

            <div className="space-y-3 text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Model Engine:</span>
                <strong className="text-slate-900 font-mono">gemini-2.5-flash (Google GenAI)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>6-Pillar Validation Rule Engine:</span>
                <strong className="text-emerald-700 font-bold">100% Active &amp; Guardrailed</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Autonomous Fund Release Guard:</span>
                <strong className="text-rose-700 font-bold">STRICTLY PROHIBITED (Zero AI Release)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Citizen Natural Language Parser:</span>
                <strong className="text-emerald-700">Online (Latency ~720ms)</strong>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-900" />
              <span>Database &amp; Data Pipeline Status</span>
            </h3>

            <div className="space-y-3 text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Server API:</span>
                <strong className="text-emerald-700 font-mono">Port 3000 /api/* (Healthy)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Data Mode:</span>
                <strong className="text-amber-800 font-mono">SIH DEMO DATASET (Cached)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>QR Verification Service:</span>
                <strong className="text-emerald-700">Online (SVG + QRServer v1)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Parliamentary MPs Adapter:</span>
                <strong className="text-emerald-700">Lok Sabha &amp; Rajya Sabha Seeded</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
