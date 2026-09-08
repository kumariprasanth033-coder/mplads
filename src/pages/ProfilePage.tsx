import React from 'react';
import {
  User,
  Building,
  Mail,
  ShieldCheck,
  MapPin,
  Calendar,
  LogOut,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<Props> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();

  const getDashboardPath = (role: Role): string => {
    switch (role) {
      case 'MP':
        return '/dashboard/mp';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'DISTRICT_OFFICER':
        return '/dashboard/district';
      case 'IMPLEMENTING_AGENCY':
        return '/dashboard/agency';
      case 'AUDITOR':
        return '/dashboard/auditor';
      case 'CITIZEN':
        return '/dashboard/citizen';
      default:
        return '/';
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-slate-700">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 uppercase">
                  {user?.role?.replace('_', ' ') || 'GUEST'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-700 text-white">
                  SIH PROTOTYPE IDENTITY
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
                {user?.name || 'Guest User'}
              </h1>
              <p className="text-xs text-slate-400">
                {user?.designation || 'Public Stakeholder'} • {user?.email || 'guest@mplads.gov.in'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => onNavigate(getDashboardPath(user.role))}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Open My Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-900" />
            <span>Official Identity &amp; Statutory Authorization</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Unique Profile UID</span>
              <strong className="text-slate-900 font-mono mt-0.5 block">{user?.uid || 'uid-guest-session'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Assigned Jurisdiction</span>
              <strong className="text-slate-900 mt-0.5 block">
                {user?.district || 'Dharmapuri'}, {user?.state || 'Tamil Nadu'}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Account Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active &amp; Authenticated</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Constituency</span>
              <strong className="text-slate-900 mt-0.5 block">{user?.constituency || 'Dharmapuri (Lok Sabha)'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Last Active Session</span>
              <strong className="text-slate-900 font-mono mt-0.5 block">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Security Tier</span>
              <strong className="text-blue-900 mt-0.5 block">NIC Government e-Auth Level 2</strong>
            </div>
          </div>
        </div>

        {/* Quick Demo Role Switcher Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">SIH Hackathon Role Switcher</h2>
              <p className="text-xs text-slate-400">
                Instantly switch persona to test distinct permissions, action queues, and dashboards.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              Open Full Login Page →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {(['MP', 'DISTRICT_OFFICER', 'IMPLEMENTING_AGENCY', 'AUDITOR', 'CITIZEN', 'ADMIN'] as Role[]).map(r => (
              <button
                key={r}
                onClick={async () => {
                  await switchDemoRole(r);
                  onNavigate(getDashboardPath(r));
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  user?.role === r
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-[10px] text-slate-400 block">ROLE</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{r.replace('_', ' ')}</strong>
                <span className="text-[10px] text-blue-700 font-medium mt-1 block">
                  Switch &amp; Open Workspace →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
