import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface DataFreshnessBadgeProps {
  status?: 'LIVE' | 'CACHED' | 'DEMO';
  lastUpdated?: string;
  source?: string;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  status = 'CACHED',
  lastUpdated,
  source = 'Digital Sansad (18th Lok Sabha)',
  onRefresh,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'LIVE':
        return {
          label: 'LIVE',
          dotClass: 'bg-emerald-500 animate-pulse',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
        };
      case 'CACHED':
        return {
          label: 'CACHED',
          dotClass: 'bg-amber-500',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-3 h-3 text-amber-600" />,
        };
      case 'DEMO':
      default:
        return {
          label: 'DEMO DATA',
          dotClass: 'bg-slate-400',
          badgeClass: 'bg-slate-800/80 text-slate-300 border-slate-700',
          icon: <AlertCircle className="w-3 h-3 text-slate-500" />,
        };
    }
  };

  const current = getStatusDisplay();
  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono shadow-2xs backdrop-blur-xs ${current.badgeClass} ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${current.dotClass}`} />
        <span className="font-extrabold uppercase tracking-wide">{current.label}</span>
      </div>

      <span className="text-slate-300 font-normal">|</span>

      <span className="text-[11px] font-sans font-medium text-slate-600">
        Source: <strong className="text-slate-100">{source}</strong>
      </span>

      <span className="text-slate-300 font-normal hidden sm:inline">|</span>

      <span className="text-[10px] text-slate-500 hidden sm:inline">
        Last updated: {formattedDate}
      </span>

      {onRefresh && (
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh member data from Digital Sansad"
          className="ml-1 p-1 hover:bg-slate-200/60 rounded-md text-slate-600 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-900' : ''}`} />
        </button>
      )}
    </div>
  );
};
