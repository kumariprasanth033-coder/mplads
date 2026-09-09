import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { DistrictSummaryMetric } from '../../services/dashboardIntelligenceEngine';

interface Props {
  districts: DistrictSummaryMetric[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  stateName: string;
}

export const DistrictIntelligenceSection: React.FC<Props> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  stateName,
}) => {
  const [districtSearch, setDistrictSearch] = useState('');
  const [sortBy, setSortBy] = useState<'works' | 'utilization' | 'completion' | 'delayed'>('works');

  const filtered = districts.filter(d =>
    d.districtName.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'utilization') return b.utilizationRate - a.utilizationRate;
    if (sortBy === 'completion') return b.completionRate - a.completionRate;
    if (sortBy === 'delayed') return b.delayedWorks - a.delayedWorks;
    return b.totalWorks - a.totalWorks;
  });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              District Administration Matrix
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {districts.length} Official Districts in {stateName}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight mt-1">
            District-Wise Works, Utilization &amp; Milestone Completion
          </h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={districtSearch}
              onChange={e => setDistrictSearch(e.target.value)}
              placeholder="Search district..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 max-w-[160px]"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-800 text-slate-300 focus:outline-hidden"
          >
            <option value="works">Sort by Works</option>
            <option value="utilization">Sort by Utilization %</option>
            <option value="completion">Sort by Completion %</option>
            <option value="delayed">Sort by Delayed Works</option>
          </select>
        </div>
      </div>

      {/* Grid of District Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {sorted.map(d => {
          const isSelected = selectedDistrict.toLowerCase() === d.districtName.toLowerCase();
          return (
            <div
              key={d.districtName}
              onClick={() => onSelectDistrict(isSelected ? '' : d.districtName)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-700 hover:border-blue-300 bg-slate-800 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-100 text-sm">{d.districtName}</div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      d.completionRate >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d.completionRate}% Done
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  HQ: {d.headquarters || d.districtName}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Works</span>
                    <span className="font-bold text-slate-100">{d.totalWorks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                    <span className="font-bold text-blue-700">₹{d.sanctionedLakhs} L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Utilization</span>
                    <span className="font-bold text-emerald-700">{d.utilizationRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Delayed</span>
                    <span
                      className={`font-bold ${
                        d.delayedWorks > 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {d.delayedWorks} Works
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-900">
                <span>{isSelected ? 'Active District' : 'Drill into District'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
