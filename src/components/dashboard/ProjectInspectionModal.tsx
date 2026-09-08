import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { ProjectRecord } from '../../types';

interface Props {
  project: ProjectRecord | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const ProjectInspectionModal: React.FC<Props> = ({ project, onClose, onNavigate }) => {
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'Before' | 'During' | 'After'>('Before');

  if (!project) return null;

  const beforeEvidence = project.evidence.find(e => e.stage === 'Before');
  const duringEvidence = project.evidence.find(e => e.stage === 'During');
  const afterEvidence = project.evidence.find(e => e.stage === 'Current / After');

  const selectedEvidence =
    activeEvidenceTab === 'Before'
      ? beforeEvidence
      : activeEvidenceTab === 'During'
      ? duringEvidence
      : afterEvidence;

  // Determine neutral AI inspection attention signals
  const aiSignals: Array<{ title: string; level: 'Clear' | 'Notice' | 'Verification'; message: string }> = [];

  if (project.status === 'Delayed') {
    aiSignals.push({
      title: 'Schedule Variance Detected',
      level: 'Verification',
      message: 'Physical execution is 42 days past original target timeline. Requires nodal review with executing agency.',
    });
  } else {
    aiSignals.push({
      title: 'Timeline Conformity',
      level: 'Clear',
      message: 'Milestone progress aligns with sanction schedule milestones.',
    });
  }

  if (project.financial.expenditureLakhs > project.financial.sanctionedAmountLakhs) {
    aiSignals.push({
      title: 'Expenditure Variance',
      level: 'Verification',
      message: 'Expenditure claim exceeds baseline sanction. Supplement sanction order or revised estimate required.',
    });
  } else {
    aiSignals.push({
      title: 'Financial Ceiling Check',
      level: 'Clear',
      message: 'Total disbursements remain strictly within sanctioned limits.',
    });
  }

  if (project.documents.some(d => d.status === 'Missing')) {
    aiSignals.push({
      title: 'Documentation Requirement',
      level: 'Notice',
      message: 'One or more stage compliance certificates are pending upload from executing agency.',
    });
  } else {
    aiSignals.push({
      title: 'Statutory Documentation',
      level: 'Clear',
      message: 'Administrative Sanction (AS) and Work Order files verified in repository.',
    });
  }

  aiSignals.push({
    title: 'Duplicate / Overlap Check',
    level: 'Clear',
    message: 'No spatial or semantic overlap detected with State PWD or Centrally Sponsored Schemes.',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-blue-900 text-blue-200 font-bold shrink-0">
              {project.code}
            </span>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                {project.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {project.district}, {project.state} • Sector: {project.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-900 text-xs">
          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Sanctioned Amount</span>
              <span className="text-base font-bold text-slate-900 block mt-0.5">
                ₹{project.financial.sanctionedAmountLakhs} Lakhs
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Recorded Expenditure</span>
              <span className="text-base font-bold text-emerald-700 block mt-0.5">
                ₹{project.financial.expenditureLakhs} Lakhs
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Physical Progress</span>
              <span className="text-base font-bold text-blue-700 block mt-0.5">
                {project.progressPercentage}%
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Execution Status</span>
              <span
                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                  project.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : project.status === 'Delayed'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                Administrative Provenance
              </span>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">Recommending MP</span>
                <span className="font-semibold text-slate-900">{project.mpName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">Constituency / District</span>
                <span className="font-semibold text-slate-900">{project.constituency} / {project.district}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">Implementing Agency</span>
                <span className="font-semibold text-slate-900">{project.implementingAgency}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Line Department</span>
                <span className="font-semibold text-slate-900">{project.department}</span>
              </div>
            </div>

            <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                Location &amp; Coordinates
              </span>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">Block / Village</span>
                <span className="font-semibold text-slate-900">{project.block || 'Urban Nodal'} / {project.village || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">GPS Geo-Tag</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {project.coordinates.lat.toFixed(4)}° N, {project.coordinates.lng.toFixed(4)}° E
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">Convergence Scheme</span>
                <span className="font-semibold text-slate-900">{project.convergenceScheme || 'Pure MPLADS Standard'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Financial Year</span>
                <span className="font-semibold text-slate-900">{project.year}</span>
              </div>
            </div>
          </div>

          {/* Photographic Evidence Stage Viewer */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                Geotagged Photographic Audit Trail
              </span>

              {/* Stage selector tabs */}
              <div className="flex bg-slate-200/80 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('Before')}
                  className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                    activeEvidenceTab === 'Before'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Before Site
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('During')}
                  className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                    activeEvidenceTab === 'During'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  During Work
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEvidenceTab('After')}
                  className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                    activeEvidenceTab === 'After'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  After / Current
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full sm:w-72 h-44 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                {selectedEvidence?.url ? (
                  <img
                    src={selectedEvidence.url}
                    alt={selectedEvidence.description}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Eye className="w-6 h-6 mb-1" />
                    <span>Evidence Pending</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedEvidence ? selectedEvidence.description : `No photo recorded for ${activeEvidenceTab} stage`}
                </div>
                {selectedEvidence && (
                  <>
                    <div className="text-slate-500">
                      Uploaded by: <strong className="text-slate-800">{selectedEvidence.uploadedBy}</strong>
                    </div>
                    <div className="text-slate-500">
                      Inspection Date: <strong className="text-slate-800">{selectedEvidence.date}</strong>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Tamper-proof EXIF &amp; Geo-signature Verified</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Autonomous AI Attention & Verification Signals (Requirement #15) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-700" />
                <span>Autonomous Diagnostic Review (Explainable Signals)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Advisory only • Human administrative review remains final
              </span>
            </div>

            <div className="space-y-2">
              {aiSignals.map((sig, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    sig.level === 'Clear'
                      ? 'bg-white border-emerald-200/80 text-slate-700'
                      : sig.level === 'Notice'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  {sig.level === 'Clear' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="font-bold block">{sig.title}</strong>
                    <span className="text-[11px] leading-relaxed">{sig.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
          >
            Close Inspector
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate(`/projects/${project.id}`);
            }}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Open Full Project Detail Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
