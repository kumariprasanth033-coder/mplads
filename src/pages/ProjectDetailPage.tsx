import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  MapPin,
  Calendar,
  Building,
  User,
  ShieldCheck,
  QrCode,
  FileText,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Download,
  Share2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { ProjectRecord } from '../types';

interface Props {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<Props> = ({ projectId, onNavigate }) => {
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'documents' | 'financials'>('timeline');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const p = await api.getProject(projectId);
        setProject(p);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500 font-medium">Loading project dossier...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <button
          onClick={() => onNavigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold"
        >
          Return to Projects Directory
        </button>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://mplads.gov.in/verify/${encodeURIComponent(project.code)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('/projects')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects Directory</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {project.code}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                  {project.category}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    project.status === 'Completed'
                      ? 'bg-emerald-600 text-white'
                      : project.status === 'Delayed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white max-w-4xl">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.village || 'Panchayat'}, {project.district}, {project.state}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>MP: {project.mpName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Agency: {project.implementingAgency}</span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowQrModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-blue-900" />
                <span>Site QR Plaque</span>
              </button>
              <button
                onClick={() => onNavigate(`/dashboard/citizen?suggestProject=${encodeURIComponent(project.id)}`)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Citizen Feedback / Grievance</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Financial Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 mb-8">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Recommended Outlay</span>
            <span className="text-lg sm:text-xl font-bold text-slate-800">
              ₹{project.financial.recommendedAmountLakhs} L
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Sanctioned Budget (AS)</span>
            <span className="text-lg sm:text-xl font-bold text-blue-900">
              ₹{project.financial.sanctionedAmountLakhs} L
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Funds Released (DRDA)</span>
            <span className="text-lg sm:text-xl font-bold text-indigo-700">
              ₹{project.financial.releasedAmountLakhs} L
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Recorded Expenditure</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-700">
              ₹{project.financial.expenditureLakhs} L
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Physical Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {project.progressPercentage}%
              </span>
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 text-sm font-semibold mb-6 gap-2 overflow-x-auto">
          {[
            { id: 'timeline', label: `Milestone Timeline (${project.timeline.length})`, icon: Clock },
            { id: 'evidence', label: `Photographic Evidence (${project.evidence.length})`, icon: Camera },
            { id: 'documents', label: `Official Documents (${project.documents.length})`, icon: FileText },
            { id: 'financials', label: 'Financial & Risk Analysis', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: Milestone Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Statutory Project Lifecycle &amp; Milestone Audit Trail
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {project.timeline.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot icon */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-900 ring-4 ring-blue-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-sm text-slate-900">
                      {step.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{step.date}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">{step.note}</p>

                  <div className="mt-1 text-[11px] text-slate-400 font-medium">
                    Verified By: <strong className="text-slate-700">{step.updatedBy}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 2: Photographic Evidence */}
        {activeTab === 'evidence' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Geotagged Photographic Milestones
              </h3>
              <span className="text-xs text-slate-500">
                Lat: {project.coordinates.lat}, Lng: {project.coordinates.lng}
              </span>
            </div>

            {project.evidence.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Camera className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No photographic milestones uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.evidence.map(ev => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-200 overflow-hidden shadow-xs group"
                  >
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={ev.url}
                        alt={ev.description}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/80 text-white backdrop-blur-xs uppercase font-mono">
                        {ev.stage} Construction
                      </span>
                    </div>

                    <div className="p-3.5 text-xs space-y-1">
                      <p className="font-semibold text-slate-800">{ev.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Date: {ev.date}</span>
                        <span>By: {ev.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Official Documents */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Statutory Uploaded Documents &amp; Sanction Dossier
            </h3>

            <div className="divide-y divide-slate-100">
              {project.documents.map(doc => (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{doc.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Type: {doc.type} • Uploaded: {doc.uploadDate} {doc.fileSize && `• ${doc.fileSize}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                        doc.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading verified document: ${doc.name}`)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Financial & Risk Analysis */}
        {activeTab === 'financials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900">
                Auditor Risk &amp; Anomaly Assessment
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Calculated Risk Score</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {project.riskScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs ${
                    project.riskCategory === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : project.riskCategory === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {project.riskCategory} RISK
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Public Transparency Score</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                  {project.transparencyScore}%
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  High score due to availability of DPR, before/during photographic records, and verified geo-coordinates.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900">
                Administrative &amp; Entitlement Details
              </h3>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Financial Year</span>
                  <strong className="text-slate-800">{project.year}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Parliamentary Constituency</span>
                  <strong className="text-slate-800">{project.constituency}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Nodal District Collectorate</span>
                  <strong className="text-slate-800">{project.district} District DRDA</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Line Department</span>
                  <strong className="text-slate-800">{project.department}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Last Database Synchronization</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{project.lastUpdated}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center border-4 border-amber-500 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>

            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono mb-1">
              Government of India • MPLADS
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Statutory Physical Site Foundation Plaque
            </h3>

            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-inner">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <div className="text-xs font-mono font-bold text-slate-800">
              {project.code}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium max-w-xs mx-auto">
              {project.title}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Sanctioned: ₹{project.financial.sanctionedAmountLakhs} L</span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Site Plaque</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
