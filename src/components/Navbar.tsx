import React, { useState } from 'react';
import {
  Search,
  LogIn,
  User,
  LogOut,
  Sparkles,
  MapPin,
  FolderGit2,
  Users,
  ShieldAlert,
  FileText,
  ChevronDown,
  Menu,
  X,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<Props> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { user, role, isAuthenticated, logout, switchDemoRole } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDashboardPath = (userRole: Role): string => {
    switch (userRole) {
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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Explore MPs', path: '/explore-mps' },
    { label: 'Constituency Map', path: '/map' },
    { label: 'AI Pre-Check', path: '/ai/precheck', highlight: true },
    { label: 'Grievances', path: '/complaints' },
    { label: 'Reports', path: '/reports' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-lg select-none">
      {/* Tricolor Ribbon on top for Indian Governance Identity */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white preserve-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Portal Identity */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* National Emblem / Ashoka Emblem Stylized Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-b from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform shrink-0">
              <Building className="w-6 h-6" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight font-sans">
                  MPLADS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 uppercase tracking-wider font-mono">
                  SMART &amp; AI
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium tracking-wide">
                Transparent • Intelligent • Accountable • Citizen Centric
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-800 text-white shadow-xs'
                      : link.highlight
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
              title="Global Search (MPs, projects, villages, schemes)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 rounded border border-slate-700">
                /
              </kbd>
            </button>

            {/* Role Quick Switcher & User Profile */}
            {isAuthenticated && user ? (
              <>
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-400">[{user.role.replace('_', ' ')}]</span>
                  <span className="hidden sm:inline max-w-[120px] truncate text-slate-300">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isRoleDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-900 py-2 z-50 animate-in fade-in duration-100"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                      <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                        Active Role: {user.role}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => onNavigate(getDashboardPath(user.role))}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Go to My Role Workspace
                      </button>
                      <button
                        onClick={() => onNavigate('/profile')}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-500" />
                        My Official Profile
                      </button>
                      <button
                        onClick={() => onNavigate('/notifications')}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Alerts &amp; Notifications
                      </button>
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => onNavigate('/dashboard/admin')}
                          className="w-full text-left px-4 py-1.5 text-xs text-purple-700 hover:bg-purple-50 font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Building className="w-4 h-4 text-purple-600" />
                          National Admin Center
                        </button>
                      )}
                    </div>

                    {/* Quick Demo Role Switcher for SIH Jury & Demonstrations */}
                    <div className="border-t border-slate-100 px-4 py-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          SIH Demo Role Switcher
                        </span>
                        <button
                          onClick={() => onNavigate('/login')}
                          className="text-[10px] font-bold text-blue-800 hover:underline cursor-pointer"
                        >
                          All Cards →
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {(['MP', 'DISTRICT_OFFICER', 'IMPLEMENTING_AGENCY', 'AUDITOR', 'CITIZEN', 'ADMIN'] as Role[]).map(r => (
                          <button
                            key={r}
                            onClick={async () => {
                              await switchDemoRole(r);
                              onNavigate(getDashboardPath(r));
                            }}
                            className={`text-[10px] px-2 py-1 rounded text-left truncate transition-colors cursor-pointer ${
                              user.role === r
                                ? 'bg-blue-900 text-white font-bold'
                                : 'bg-slate-100 text-slate-700 hover:bg-blue-100'
                            }`}
                          >
                            {r.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          onNavigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  logout();
                  onNavigate('/');
                }}
                title="Sign Out"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Demo Roles</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate(link.path);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentPath === link.path
                    ? 'bg-blue-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{link.label}</span>
                {link.highlight && <Sparkles className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
            {isAuthenticated && user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate(getDashboardPath(user.role));
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-emerald-400 bg-emerald-950/40 mt-2 border border-emerald-800"
              >
                Open {user.role.replace('_', ' ')} Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
