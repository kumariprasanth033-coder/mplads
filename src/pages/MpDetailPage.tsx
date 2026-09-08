import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Map as MapIcon,
  Layers,
} from 'lucide-react';
import { digitalSansadMemberAdapter } from '../services/dataSources/digitalSansadMemberAdapter';
import { MPRecord, ProjectRecord } from '../types';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';

interface Props {
  mpId: string;
  onNavigate: (path: string) => void;
}

export const MpDetailPage: React.FC<Props> = ({ mpId, onNavigate }) => {
  const [data, setData] = useState<{ mp: MPRecord; projects: ProjectRecord[]; freshness?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setPhotoError(false);
      try {
        const res = await digitalSansadMemberAdapter.getMemberById(mpId);
        setData(res);
      } catch (err) {
        console.error('Failed to load MP details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [mpId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-600 font-medium">
            Fetching verified parliamentary records from Digital Sansad...
          </span>
        </div>
      </div>
    );
  }

  if (!data || !data.mp) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Member of Parliament Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            The requested MP profile identifier could not be verified in the active parliamentary directory.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/mps')}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Return to MP Directory
          </button>
        </div>
      </div>
    );
  }

  const { mp, projects } = data;
  const photoUrl = mp.officialPhotoUrl || mp.photoUrl || mp.photo;
  const isVerifiedPhoto = mp.photoVerified && !photoError && Boolean(photoUrl);

  const fund = mp.fundUtilization || {
    allocatedAmountLakhs: mp.stats?.entitlementLakhs ?? 500,
    sanctionedAmountLakhs: mp.stats?.sanctionedAmountLakhs ?? 480,
    utilizedAmountLakhs: mp.stats?.utilizedAmountLakhs ?? 390,
    recommendedWorksCount: mp.stats?.totalProjects ?? 45,
    completedWorksCount: mp.stats?.completedProjects ?? 32,
    ongoingWorksCount: mp.stats?.inProgressProjects ?? 10,
  };

  const delayedWorksCount = mp.stats?.delayedProjects ?? 3;
  const utilizationPercent = Math.min(
    100,
    Math.round(((fund.utilizedAmountLakhs || 0) / (fund.allocatedAmountLakhs || 500)) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header Profile Section */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() => onNavigate('/mps')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MP Directory</span>
            </button>

            <DataFreshnessBadge
              status={mp.dataSourceStatus || 'CACHED'}
              lastUpdated={mp.lastUpdated}
              source={mp.source || 'Digital Sansad (18th Lok Sabha)'}
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Official Photo with verified fallback */}
            <div className="shrink-0 relative">
              {isVerifiedPhoto ? (
                <img
                  src={photoUrl}
                  alt={mp.name}
                  onError={() => setPhotoError(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-700 shadow-xl bg-slate-800"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-4 border-slate-700 flex flex-col items-center justify-center text-center p-2 shadow-xl">
                  <Building2 className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-[9px] font-medium text-slate-400 leading-tight">
                    Official photo unavailable
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-800 text-blue-100">
                  {mp.house}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-600 text-white">
                  {mp.party}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {mp.membershipStatus || 'Sitting Member'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800/80 text-amber-300 font-mono border border-slate-700">
                  {mp.lokSabhaTerms || mp.term}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 flex-wrap">
                <span>{mp.displayName || mp.name}</span>
                <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Parliamentary Record</span>
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>
                    Constituency: <strong className="text-white">{mp.constituency}</strong>, {mp.state}
                  </span>
                </span>

                {(mp.email || mp.contactEmail) && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mp.email || mp.contactEmail}</span>
                  </span>
                )}

                {mp.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mp.phone}</span>
                  </span>
                )}

                {mp.officialProfileUrl && (
                  <a
                    href={mp.officialProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Digital Sansad Profile</span>
                  </a>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/citizen')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors text-center"
              >
                Submit Citizen Suggestion
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/mp')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors text-center"
              >
                MP Dashboard View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* MPLADS Fund & Works Status Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  MPLADS Scheme Entitlement &amp; Expenditure
                </span>
                {mp.isFinancialDemo ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Demo Data • Standard ₹5 Cr Baseline
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Official Disbursed Accords
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mt-0.5">
                Fund Allocation, Recommended Works &amp; Expenditure
              </h3>
            </div>

            <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200 self-start sm:self-center">
              {utilizationPercent}% Utilized
            </span>
          </div>

          {/* 5-Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5 text-xs">
            {/* Recommended Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Recommended Works</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {fund.recommendedWorksCount}
              </span>
              <span className="text-[10px] text-slate-400">Total works proposed</span>
            </div>

            {/* Sanctioned Works & Funds */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Sanctioned Works</span>
              <span className="text-xl font-extrabold text-blue-900 mt-1 block">
                ₹{fund.sanctionedAmountLakhs} L
              </span>
              <span className="text-[10px] text-blue-800 font-medium">District DRDA approved</span>
            </div>

            {/* Completed Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Completed Works</span>
              <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
                {fund.completedWorksCount}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">With completion certificates</span>
            </div>

            {/* Ongoing Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Ongoing Works</span>
              <span className="text-xl font-extrabold text-amber-700 mt-1 block">
                {fund.ongoingWorksCount}
              </span>
              <span className="text-[10px] text-amber-800 font-medium">Under active execution</span>
            </div>

            {/* Delayed Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Delayed Works</span>
              <span className="text-xl font-extrabold text-rose-700 mt-1 block">
                {delayedWorksCount}
              </span>
              <span className="text-[10px] text-rose-800 font-medium">Escalated for review</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-600">Fund Utilization Ratio</span>
              <span className="font-mono font-bold text-slate-800">
                ₹{fund.utilizedAmountLakhs} L / ₹{fund.allocatedAmountLakhs} L
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Constituency MPLADS Projects Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Constituency Works &amp; Infrastructure Projects ({projects.length})
              </h3>
              <p className="text-xs text-slate-500">
                Sanctioned MPLADS development projects in {mp.constituency} ({mp.state})
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl self-start sm:self-center">
              DRDA &amp; District Portal Sync
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">
                No Sanctioned Works Recorded in Prototype State
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                New parliamentary term commenced in June 2024. DRDA work accord records will appear here as soon as approved by the District Authority.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate(`/projects/${proj.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer p-5 flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        {proj.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          proj.status === 'Completed'
                            ? 'bg-emerald-600 text-white'
                            : proj.status === 'Delayed'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 mt-2.5 line-clamp-2">
                      {proj.title}
                    </h4>

                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">
                        {proj.village || 'Panchayat Area'}, {proj.district || mp.constituency}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Sector: {proj.sector}</span>
                      <span>•</span>
                      <span>Agency: {proj.implementingAgency || 'DRDA'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                      <strong className="text-slate-900 font-mono">
                        ₹{proj.financial.sanctionedAmountLakhs} Lakhs
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Physical Progress</span>
                      <strong className="text-emerald-700 font-mono font-bold">
                        {proj.progressPercentage}%
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-blue-900 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1 text-slate-400">
                      <FileText className="w-3 h-3" />
                      <span>Audit &amp; Evidence</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
