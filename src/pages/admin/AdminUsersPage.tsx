import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  ShieldCheck,
  Building,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  Eye,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, Role } from '../../types';
import { api } from '../../services/api';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminUsersPage: React.FC<Props> = ({ onNavigate }) => {
  const { switchDemoRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.designation && u.designation.toLowerCase().includes(search.toLowerCase()));
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>National Central Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              User Directory &amp; Role Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage authorized representatives, District Collectors, implementing agencies, and statutory audit officers.
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by official name, email, or designation..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="">All Roles ({users.length})</option>
              <option value="MP">Members of Parliament (MP)</option>
              <option value="DISTRICT_OFFICER">District Officers (DM / DC)</option>
              <option value="IMPLEMENTING_AGENCY">Implementing Agencies (DRDA / PWD)</option>
              <option value="AUDITOR">Auditors / Monitors (CAG)</option>
              <option value="CITIZEN">Citizens</option>
              <option value="ADMIN">National Admins</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Registered Stakeholders &amp; Official Profiles ({filtered.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Status: All Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-6 py-3">Official Name</th>
                  <th className="px-6 py-3">Role Tier</th>
                  <th className="px-6 py-3">Jurisdiction</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Last Active</th>
                  <th className="px-6 py-3 text-right">Quick Login Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.designation || 'Stakeholder'}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'MP'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'DISTRICT_OFFICER'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'AUDITOR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {u.district || 'National'} {u.state ? `(${u.state})` : ''}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(u.lastLogin || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={async () => {
                          await switchDemoRole(u.role);
                          onNavigate(getDashboardPath(u.role));
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Switch Role →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
