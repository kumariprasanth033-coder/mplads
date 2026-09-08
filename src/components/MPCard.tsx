import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserX,
  Layers,
  Award,
} from 'lucide-react';
import { MPRecord } from '../types';

interface MPCardProps {
  mp: MPRecord;
  onSelect: (id: string) => void;
}

export const MPCard: React.FC<MPCardProps> = ({ mp, onSelect }) => {
  const [photoError, setPhotoError] = useState(false);

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

  const utilizationPercent = Math.min(
    100,
    Math.round(((fund.utilizedAmountLakhs || 0) / (fund.allocatedAmountLakhs || 500)) * 100)
  );

  return (
    <div
      onClick={() => onSelect(mp.id)}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden group p-5 relative"
    >
      <div>
        {/* Top Badges & Source Verification */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold border border-blue-100">
              {mp.house}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
              {mp.party}
            </span>
            {mp.membershipStatus && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {mp.membershipStatus}
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono font-medium text-blue-900 bg-blue-50/70 border border-blue-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-700" />
            <span>Digital Sansad</span>
          </span>
        </div>

        {/* Member Profile Row */}
        <div className="flex items-start gap-3.5">
          {/* Photo or Verified Placeholder */}
          <div className="shrink-0 relative">
            {isVerifiedPhoto ? (
              <img
                src={photoUrl}
                alt={mp.name}
                onError={() => setPhotoError(true)}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 group-hover:scale-105 transition-transform bg-slate-100"
              />
            ) : (
              <div
                title="Official photo unavailable"
                className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-center p-1 group-hover:bg-slate-200/70 transition-colors"
              >
                <Building2 className="w-5 h-5 text-slate-400 mb-0.5" />
                <span className="text-[8px] font-medium text-slate-500 leading-tight">
                  Official photo unavailable
                </span>
              </div>
            )}
          </div>

          {/* Member Name and Constituency */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors truncate">
              {mp.displayName || mp.name}
            </h3>

            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{mp.constituency}</span>
              <span className="text-slate-400">•</span>
              <span className="truncate text-slate-500">{mp.state}</span>
            </div>

            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Term: {mp.lokSabhaTerms || mp.term}
            </div>
          </div>
        </div>

        {/* MPLADS Financial & Works Summary */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <span>Fund Utilization</span>
              {mp.isFinancialDemo && (
                <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1 rounded">
                  Demo
                </span>
              )}
            </span>
            <strong className="text-slate-900 font-mono">
              ₹{fund.utilizedAmountLakhs} L / ₹{fund.allocatedAmountLakhs} L
            </strong>
          </div>

          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              Recommended: <strong className="text-slate-700">{fund.recommendedWorksCount}</strong>
            </span>
            <span>
              Completed: <strong className="text-emerald-700">{fund.completedWorksCount}</strong>
            </span>
            <span>
              Ongoing: <strong className="text-blue-700">{fund.ongoingWorksCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {mp.officialProfileUrl ? (
          <a
            href={mp.officialProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[11px] text-slate-500 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Sansad Profile</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">18th Lok Sabha</span>
        )}

        <button
          type="button"
          onClick={() => onSelect(mp.id)}
          className="font-bold text-blue-900 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
        >
          <span>Constituency Projects</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
