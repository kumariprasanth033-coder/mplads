import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building,
  User,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

interface NotificationItem {
  id: string;
  type: 'sanction' | 'milestone' | 'grievance' | 'audit' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  targetId?: string;
}

export const NotificationsPage: React.FC<Props> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'sanction',
      title: 'Administrative Sanction Accorded',
      message: 'District Collector Dharmapuri has formally approved the 20,000 LPH RO Drinking Water Plant (Code: MPLADS/2024-25/TN-DHA/001) for ₹22.5 Lakhs.',
      timestamp: '15 minutes ago',
      read: false,
      link: '/projects/proj-001',
    },
    {
      id: 'notif-2',
      type: 'milestone',
      title: 'Photographic Milestone Evidence Uploaded',
      message: 'DRDA Executive Engineer uploaded 4 geotagged photographs for Sitheri Hills Tribal Link Road. Physical progress reached 68%.',
      timestamp: '2 hours ago',
      read: false,
      link: '/projects/proj-002',
    },
    {
      id: 'notif-3',
      type: 'audit',
      title: 'Audit Priority Inspection Dispatched',
      message: 'CAG Monitoring Wing flagged rate schedule variance for Primary Health Centre High-Tech Solar Power System (Score: 84/100).',
      timestamp: '5 hours ago',
      read: true,
      link: '/dashboard/auditor',
    },
    {
      id: 'notif-4',
      type: 'grievance',
      title: 'New Citizen Grievance Lodged',
      message: 'Tracking ID MPLADS-GRV-2025-4812 submitted regarding motor pump failure in Pennagaram Shandy RO facility.',
      timestamp: '1 day ago',
      read: true,
      link: '/complaints',
    },
    {
      id: 'notif-5',
      type: 'system',
      title: 'FY 2024-25 Quota Reconciliation Completed',
      message: 'MoSPI National Central System synchronized parliamentary entitlement records for Dr. A. Senthilkumar (Dharmapuri).',
      timestamp: '2 days ago',
      read: true,
      link: '/dashboard/mp',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              <span>Official Telemetry &amp; Alert Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Notifications &amp; Activity Dispatch
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized dispatch feed across Parliamentary offices, District Collectorates, Line Agencies, and Citizens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
              Unread: <strong>{unreadCount}</strong>
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200 mb-6 text-xs">
          {[
            { label: 'All Alerts', value: 'all' },
            { label: 'Sanctions (AS)', value: 'sanction' },
            { label: 'Field Milestones', value: 'milestone' },
            { label: 'Grievances', value: 'grievance' },
            { label: 'Audit Flags', value: 'audit' },
            { label: 'System & Policy', value: 'system' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setActiveFilter(btn.value)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeFilter === btn.value
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">No Notifications in this Category</h4>
              <p className="text-xs text-slate-400 mt-1">Check back later or select &ldquo;All Alerts&rdquo;.</p>
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  item.read
                    ? 'bg-white border-slate-200'
                    : 'bg-blue-50/50 border-blue-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'sanction'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.type === 'milestone'
                      ? 'bg-blue-100 text-blue-800'
                      : item.type === 'audit'
                      ? 'bg-rose-100 text-rose-800'
                      : item.type === 'grievance'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'sanction' && <CheckCircle2 className="w-5 h-5" />}
                    {item.type === 'milestone' && <FileCheck className="w-5 h-5" />}
                    {item.type === 'audit' && <AlertTriangle className="w-5 h-5" />}
                    {item.type === 'grievance' && <Bell className="w-5 h-5" />}
                    {item.type === 'system' && <Building className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${item.read ? 'text-slate-800' : 'text-blue-950 font-extrabold'}`}>
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {item.link && (
                    <button
                      onClick={() => onNavigate(item.link!)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleRead(item.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    {item.read ? 'Mark unread' : 'Mark read'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
