import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Building,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetRef: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FLAGGED' | 'VERIFIED';
}

export const AdminAuditPage: React.FC<Props> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      id: 'audit-001',
      timestamp: '2025-02-28 14:32:10',
      actor: 'Smt. K. Shanthi, IAS',
      role: 'DISTRICT_OFFICER',
      action: 'APPROVE_ADMINISTRATIVE_SANCTION',
      targetRef: 'MPLADS/2024-25/TN-DHA/001',
      details: 'Accorded formal sanction for 20,000 LPH RO Drinking Water Plant (₹22.5 Lakhs). Rate schedule verified against PWD SoR 2024.',
      ipAddress: '10.14.82.11 (NIC DRDA Dharmapuri)',
      status: 'VERIFIED',
    },
    {
      id: 'audit-002',
      timestamp: '2025-02-28 11:15:40',
      actor: 'Er. V. Murugan',
      role: 'IMPLEMENTING_AGENCY',
      action: 'UPLOAD_MILESTONE_EVIDENCE',
      targetRef: 'MPLADS/2024-25/TN-DHA/002',
      details: 'Submitted 4 geotagged photographs with stage "During Construction". Coordinates: 11.9842° N, 78.4121° E.',
      ipAddress: '10.14.82.45 (PWD Field Office)',
      status: 'SUCCESS',
    },
    {
      id: 'audit-003',
      timestamp: '2025-02-27 16:50:22',
      actor: 'Sunita Sharma, IA&AS',
      role: 'AUDITOR',
      action: 'DISPATCH_SITE_INSPECTION',
      targetRef: 'MPLADS/2024-25/TN-DHA/004',
      details: 'Flagged rate variance and ordered physical site inspection for Primary Health Centre solar facility.',
      ipAddress: '164.100.4.12 (CAG HQ Delhi)',
      status: 'FLAGGED',
    },
    {
      id: 'audit-004',
      timestamp: '2025-02-27 09:20:15',
      actor: 'Dr. A. Senthilkumar, M.P.',
      role: 'MP',
      action: 'RECOMMEND_WORK_PROPOSAL',
      targetRef: 'PROPOSAL-2025-TN-0481',
      details: 'Submitted community recommendation for Community Hall & Knowledge Hub at Nallampalli. AI Pre-check passed with 0% collision.',
      ipAddress: '164.100.24.8 (Sansad Bhavan New Delhi)',
      status: 'SUCCESS',
    },
    {
      id: 'audit-005',
      timestamp: '2025-02-26 15:10:00',
      actor: 'Rajesh Kumar Verma, IAS',
      role: 'ADMIN',
      action: 'UPDATE_SCHEME_CONVERGENCE_RULE',
      targetRef: 'POLICY-CONV-JJM-01',
      details: 'Enabled automated co-financing check between MPLADS Drinking Water works and Jal Jeevan Mission grants.',
      ipAddress: '164.100.18.99 (MoSPI Central)',
      status: 'VERIFIED',
    },
  ]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = logs.filter(l => {
    const matchSearch =
      !search ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.targetRef.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || l.role === roleFilter;
    return matchSearch && matchRole;
  });

  const exportAuditLog = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Timestamp,Actor,Role,Action,TargetRef,Details,Status,IP']
        .concat(
          filtered.map(
            l =>
              `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.targetRef}","${l.details.replace(/"/g, '""')}","${l.status}","${l.ipAddress}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Statutory_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory Compliance &amp; Non-Repudiation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Statutory System Audit Log &amp; Immutable Event Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Every recommendation, sanction, inspection dispatch, and progress update is recorded with cryptographic timestamping.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportAuditLog}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Audit Log</span>
            </button>
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
              placeholder="Search by actor, action type, project reference, or keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="">All Actors ({logs.length})</option>
              <option value="DISTRICT_OFFICER">District Officer</option>
              <option value="MP">Member of Parliament</option>
              <option value="IMPLEMENTING_AGENCY">Implementing Agency</option>
              <option value="AUDITOR">Auditor (CAG)</option>
              <option value="ADMIN">National Admin</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Cryptographically Sequenced Event Ledger ({filtered.length})
            </h3>
            <span className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Audit Integrity: 100% Intact</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor &amp; Role</th>
                  <th className="px-6 py-3">Action Type</th>
                  <th className="px-6 py-3">Target Reference</th>
                  <th className="px-6 py-3">Action Details</th>
                  <th className="px-6 py-3">Audit Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-sans">{item.actor}</div>
                      <div className="text-[10px] text-blue-800 font-bold">{item.role}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 font-bold text-[11px]">
                      {item.action}
                    </td>
                    <td className="px-6 py-3.5 text-blue-900 font-bold text-[11px]">
                      {item.targetRef}
                    </td>
                    <td className="px-6 py-3.5 font-sans text-slate-600 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{item.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Origin: {item.ipAddress}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                        item.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'FLAGGED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
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
