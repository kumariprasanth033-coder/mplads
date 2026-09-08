import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Building,
  HardHat,
  Eye,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogIn,
  KeyRound,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

interface RoleCardInfo {
  role: Role;
  title: string;
  subtitle: string;
  officialName: string;
  designation: string;
  email: string;
  targetDashboard: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  keyResponsibilities: string[];
}

export const LoginPage: React.FC<Props> = ({ onNavigate }) => {
  const { loginAsRole, login, user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');
  const [selectedRole, setSelectedRole] = useState<Role>('MP');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleCards: RoleCardInfo[] = [
    {
      role: 'MP',
      title: 'Member of Parliament',
      subtitle: 'Lok Sabha / Rajya Sabha',
      officialName: 'Dr. A. Senthilkumar, M.P.',
      designation: 'Elected Representative (Dharmapuri)',
      email: 'mp.dharmapuri@sansad.nic.in',
      targetDashboard: '/dashboard/mp',
      badgeColor: 'bg-blue-800 text-blue-100 border-blue-700',
      icon: User,
      description: 'Recommend works, view annual ₹5 Crore entitlement utilization, check convergence with Central schemes, and track sanctioned works.',
      keyResponsibilities: ['Recommend Works with AI Pre-Check', 'Annual Quota Tracking (₹500 L)', 'Constituency Milestone Oversight'],
    },
    {
      role: 'DISTRICT_OFFICER',
      title: 'District Officer',
      subtitle: 'District Magistrate / Collectorate',
      officialName: 'Smt. K. Shanthi, IAS',
      designation: 'District Collector & Nodal Authority',
      email: 'dm.dharmapuri@tn.gov.in',
      targetDashboard: '/dashboard/district',
      badgeColor: 'bg-emerald-800 text-emerald-100 border-emerald-700',
      icon: Building,
      description: 'Scrutinize technical estimates, accord administrative sanctions, assign implementing agencies, and adjudicate action queues.',
      keyResponsibilities: ['Accord Administrative Sanction (AS)', 'Rate & Schedule Scrutiny', 'Action Queue Adjudication'],
    },
    {
      role: 'IMPLEMENTING_AGENCY',
      title: 'Implementing Agency',
      subtitle: 'DRDA / PWD / Line Department',
      officialName: 'Er. V. Murugan',
      designation: 'Executive Engineer (DRDA)',
      email: 'ee.pwd.dharmapuri@tn.gov.in',
      targetDashboard: '/dashboard/agency',
      badgeColor: 'bg-amber-800 text-amber-100 border-amber-700',
      icon: HardHat,
      description: 'Report field execution progress, upload geotagged photographic milestone evidence, and submit completion certificates.',
      keyResponsibilities: ['Upload Photographic Evidence', 'Progress Percentage Reporting', 'Fund Disbursement Ledger'],
    },
    {
      role: 'AUDITOR',
      title: 'Auditor / Monitor',
      subtitle: 'CAG / MoSPI Inspection Wing',
      officialName: 'Sunita Sharma, IA&AS',
      designation: 'Principal Director of Audit (CAG)',
      email: 'auditor.cag@cag.gov.in',
      targetDashboard: '/dashboard/auditor',
      badgeColor: 'bg-rose-800 text-rose-100 border-rose-700',
      icon: Eye,
      description: 'Monitor schedule rate variance anomalies, identify stagnant sites, track delayed deliverables, and dispatch inspection priorities.',
      keyResponsibilities: ['Autonomous Anomaly Triage', 'Stagnant Site Flagging', 'Order Physical Site Inspection'],
    },
    {
      role: 'CITIZEN',
      title: 'Citizen',
      subtitle: 'Public / Social Audit & Grievance',
      officialName: 'P. Arumugam',
      designation: 'Resident & Gram Sabha Representative',
      email: 'citizen.dharmapuri@gmail.com',
      targetDashboard: '/dashboard/citizen',
      badgeColor: 'bg-teal-800 text-teal-100 border-teal-700',
      icon: Users,
      description: 'Lodge local grievances via Natural Language AI Assistant, track live resolution status, verify foundation plaque QRs, and give feedback.',
      keyResponsibilities: ['Natural Language Grievance Assistant', 'Real-time Tracking ID Stepper', 'Physical Plaque QR Verification'],
    },
    {
      role: 'ADMIN',
      title: 'Admin',
      subtitle: 'MoSPI National Central Administration',
      officialName: 'Rajesh Kumar Verma, IAS',
      designation: 'Mission Director (MPLADS Division)',
      email: 'admin.mplads@nic.in',
      targetDashboard: '/dashboard/admin',
      badgeColor: 'bg-purple-900 text-purple-100 border-purple-700',
      icon: ShieldCheck,
      description: 'System policy supervision, multi-role user directory control, scheme convergence rules, and immutable statutory audit trail.',
      keyResponsibilities: ['User & Role Management', 'National Scheme Policy & Quotas', 'Statutory Event Audit Log'],
    },
  ];

  const handleDemoLogin = async (card: RoleCardInfo) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginAsRole(card.role);
      onNavigate(card.targetDashboard);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Failed to login as demo role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your email or username');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const userProfile = await login(emailInput.trim(), passwordInput, selectedRole);
      const matched = roleCards.find(r => r.role === userProfile.role);
      onNavigate(matched?.targetDashboard || '/');
    } catch (err: any) {
      console.error('Credentials login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setIsLoading(true);
    try {
      await loginAsRole('GUEST');
      onNavigate('/');
    } catch {
      onNavigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white preserve-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart India Hackathon • SIH Prototype Evaluation System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Role Authentication &amp; Governance Portal
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Select an official role below to launch the dedicated workspace. Each demo role comes pre-loaded with simulated statutory records, entitlements, and audit lifecycles.
          </p>

          {/* Quick Tab Switcher & Guest Option */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'demo'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                One-Click SIH Demo Roles (6)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('credentials')}
                className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Credentials Login
              </button>
            </div>

            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Continue as Guest / Public Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'demo' ? (
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                Select from 6 Official Governance Roles
              </span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero credentials required in hackathon mode
              </span>
            </div>

            {/* 6 Clearly Visible Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleCards.map(card => {
                const IconComponent = card.icon;
                const isCurrentActive = isAuthenticated && user?.role === card.role;
                return (
                  <div
                    key={card.role}
                    className={`bg-slate-800/90 rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-2xl hover:border-blue-500/60 group relative overflow-hidden ${
                      isCurrentActive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-slate-700'
                    }`}
                  >
                    {/* Role header */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${card.badgeColor}`}>
                            {card.subtitle}
                          </span>
                          {isCurrentActive && (
                            <span className="block text-[10px] text-emerald-400 font-bold mt-1">
                              ● CURRENTLY ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                          {card.title}
                        </h2>
                        <div className="text-xs font-semibold text-amber-300 mt-0.5">
                          {card.officialName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {card.designation}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {card.email}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mt-3 leading-relaxed border-t border-slate-700/60 pt-3">
                        {card.description}
                      </p>

                      <div className="mt-3 space-y-1">
                        {card.keyResponsibilities.map((resp, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button: Clearly labelled SIH DEMO LOGIN button */}
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDemoLogin(card)}
                        className="w-full py-2.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-blue-500/20"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Demo {card.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <div className="text-[10px] font-mono text-slate-400 text-center mt-2">
                        Redirects to: <span className="text-blue-400">{card.targetDashboard}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Credentials Login Form Tab */
          <div className="max-w-xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
              <div className="p-3 bg-blue-900/50 rounded-xl border border-blue-700 text-blue-300">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manual Credentials Sign-In</h3>
                <p className="text-xs text-slate-400">
                  Log in using your government official NIC email or simulated department credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Governance Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MP">Member of Parliament (MP)</option>
                  <option value="DISTRICT_OFFICER">District Officer (DM / DC)</option>
                  <option value="IMPLEMENTING_AGENCY">Implementing Agency (DRDA / PWD)</option>
                  <option value="AUDITOR">Auditor / Monitor (CAG)</option>
                  <option value="CITIZEN">Citizen / Public</option>
                  <option value="ADMIN">Administrator (MoSPI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email / Username
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="e.g. mp.dharmapuri@sansad.nic.in"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password / PIN
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tip: In demo mode, any test password will authenticate with the selected role.
                </span>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate &amp; Enter Workspace</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
