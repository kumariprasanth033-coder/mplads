import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building,
  User,
  ExternalLink,
  MessageSquare,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { ProjectRecord } from '../types';

interface Props {
  initialCode?: string;
  onNavigate: (path: string) => void;
}

export const QrVerificationPage: React.FC<Props> = ({ initialCode = 'MPLADS-2024-TN-0481', onNavigate }) => {
  const [code, setCode] = useState(initialCode);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (searchCode: string) => {
    const trimmed = searchCode.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      // First try direct lookup (matches both id and code in server)
      try {
        const direct = await api.getProject(trimmed);
        if (direct && direct.id) {
          setProject(direct);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback to query search
      }

      const res = await api.getProjects({ query: trimmed, limit: 1 });
      if (res.projects && res.projects.length > 0) {
        setProject(res.projects[0]);
      } else {
        setProject(null);
      }
    } catch (e) {
      console.error('Verification error:', e);
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-full border border-slate-700 mb-3">
            <QrCode className="w-4 h-4" />
            <span>On-Site Citizen Verification &amp; Social Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Physical Plaque QR Verification
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">
            Scan or enter the unique identifier displayed on any MPLADS marble or stainless steel foundation plaque to authenticate government sanctions in real time.
          </p>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleVerify(code);
            }}
            className="mt-6 flex max-w-md mx-auto gap-2"
          >
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="E.g. MPLADS-2024-TN-0481"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-mono border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
            >
              Verify Asset
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Authenticating against Central Public Works Repository...</span>
          </div>
        ) : project ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in duration-200">
            {/* Authenticity Certificate Banner */}
            <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 shrink-0 text-emerald-200" />
                <div>
                  <div className="font-extrabold text-sm sm:text-base tracking-wide">
                    AUTHENTICATED GOVERNMENT COMMUNITY ASSET
                  </div>
                  <span className="text-[11px] text-emerald-100 font-mono">
                    Statutory Sanction Code: {project.code}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-800 px-3 py-1 rounded-full text-white">
                ✓ VERIFIED
              </span>
            </div>

            {/* Details Body */}
            <div className="p-6 space-y-6 text-xs">
              <div>
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded">
                  {project.category}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                  {project.title}
                </h2>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Photo Evidence if available */}
              {project.evidence.length > 0 && (
                <div className="h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={project.evidence[project.evidence.length - 1].url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Verified Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Recommending MP</span>
                  <strong className="text-slate-900">{project.mpName}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Sanctioned Budget</span>
                  <strong className="text-blue-900 text-sm">₹{project.financial.sanctionedAmountLakhs} Lakhs</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Recorded Progress</span>
                  <strong className="text-emerald-700 text-sm">{project.progressPercentage}%</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <strong className="text-slate-900">{project.village || 'Panchayat'}, {project.district}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Implementing Agency</span>
                  <strong className="text-slate-900">{project.implementingAgency}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">GPS Geotag</span>
                  <strong className="text-slate-900 font-mono text-[11px]">
                    {project.coordinates.lat}° N, {project.coordinates.lng}° E
                  </strong>
                </div>
              </div>

              {/* Social Audit Action Bar */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-amber-900">
                  <strong>Does this asset physically exist on ground?</strong>
                  <p className="text-[11px] text-amber-800">
                    If you observe poor construction quality, abandoned work, or missing structure, report immediately.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(`/dashboard/citizen?suggestProject=${encodeURIComponent(project.id)}`)}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Report Discrepancy / Feedback
                </button>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400">Data source: SIH Demo &amp; District DRDA</span>
                <button
                  onClick={() => onNavigate(`/projects/${project.id}`)}
                  className="text-blue-900 font-bold hover:underline flex items-center gap-1"
                >
                  <span>View Complete Financial Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="p-8 bg-white rounded-2xl border-2 border-rose-300 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-900">Asset Record Not Found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              No government sanctioned project matches identifier &ldquo;{code}&rdquo;. Ensure the QR code was scanned accurately, or notify the District Collector.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
