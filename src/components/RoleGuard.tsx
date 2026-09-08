import React from 'react';
import { ShieldAlert, ArrowRight, Lock, UserCheck, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface Props {
  allowedRoles: Role[];
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  pageTitle?: string;
}

export const RoleGuard: React.FC<Props> = ({ allowedRoles, children, onNavigate, pageTitle = 'Protected Workspace' }) => {
  const { user, isAuthenticated, switchDemoRole } = useAuth();

  const userRole = user?.role || 'GUEST';
  // ADMIN role has administrative clearance across all dashboards
  const hasAccess = isAuthenticated && (allowedRoles.includes(userRole) || userRole === 'ADMIN');

  if (hasAccess) {
    return <>{children}</>;
  }

  const primaryAllowedRole = allowedRoles[0];

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

  const roleReadableName = (r: Role): string => {
    switch (r) {
      case 'MP':
        return 'Member of Parliament (MP)';
      case 'DISTRICT_OFFICER':
        return 'District Magistrate / Collector';
      case 'IMPLEMENTING_AGENCY':
        return 'Implementing Agency Engineer';
      case 'AUDITOR':
        return 'Auditor / CAG Inspection Wing';
      case 'CITIZEN':
        return 'Citizen / Public User';
      case 'ADMIN':
        return 'National MoSPI Administrator';
      case 'GUEST':
        return 'Guest / Unauthenticated User';
      default:
        return r;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
          Statutory Access Control (403 Forbidden)
        </span>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-3">
          Role Authorization Required
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          The <strong className="text-white">{pageTitle}</strong> is restricted to officials holding{' '}
          <strong className="text-emerald-400">
            {allowedRoles.map(r => roleReadableName(r)).join(' or ')}
          </strong>{' '}
          credentials under statutory MPLADS governance rules.
        </p>

        <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 text-left text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Your Active Identity:</span>
            <strong className="text-slate-200">{user?.name || 'Guest User'}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Your Current Role:</span>
            <span className="font-mono text-rose-400 font-bold">[{userRole}]</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Required Role:</span>
            <span className="font-mono text-emerald-400 font-bold">
              [{allowedRoles.join(', ')}]
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={async () => {
              await switchDemoRole(primaryAllowedRole);
              onNavigate(getDashboardPath(primaryAllowedRole));
            }}
            className="w-full py-2.5 px-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {roleReadableName(primaryAllowedRole)} Demo Account</span>
          </button>

          {isAuthenticated && userRole !== 'GUEST' && (
            <button
              type="button"
              onClick={() => onNavigate(getDashboardPath(userRole))}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-650 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to My Active [{userRole}] Workspace</span>
            </button>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>All Role Logins</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
