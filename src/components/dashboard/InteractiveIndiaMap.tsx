import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Layers,
  BarChart3,
  Grid,
  CircleDot,
  Trophy,
  Table as TableIcon,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ALL_INDIAN_STATES, ALL_UNION_TERRITORIES, ALL_INDIA_JURISDICTIONS } from '../../data/indiaStates';
import { dashboardIntelligence, StateSummaryMetric } from '../../services/dashboardIntelligenceEngine';

export type GeoMetricType =
  | 'utilization'
  | 'completion'
  | 'delayed'
  | 'risk'
  | 'works'
  | 'sanctioned'
  | 'utilized'
  | 'remaining';

export type GeoViewMode = 'MAP' | 'BAR' | 'TREEMAP' | 'BUBBLE' | 'RANKING' | 'TABLE';

interface Props {
  selectedState: string;
  onSelectState: (state: string) => void;
  activeMetric?: GeoMetricType;
  onChangeMetric?: (metric: GeoMetricType) => void;
}

// Geometric centroids and layout nodes for all 28 States + 8 UTs on an India coordinate projection grid (viewBox 0 0 600 680)
const INDIA_STATE_COORDINATES: Record<string, { x: number; y: number; code: string; radius: number }> = {
  // Northern Region
  'Jammu and Kashmir': { x: 235, y: 80, code: 'JK', radius: 24 },
  'Ladakh': { x: 310, y: 70, code: 'LA', radius: 26 },
  'Himachal Pradesh': { x: 255, y: 130, code: 'HP', radius: 19 },
  'Punjab': { x: 215, y: 155, code: 'PB', radius: 20 },
  'Chandigarh': { x: 242, y: 150, code: 'CH', radius: 14 },
  'Uttarakhand': { x: 290, y: 165, code: 'UK', radius: 20 },
  'Haryana': { x: 230, y: 185, code: 'HR', radius: 20 },
  'Delhi': { x: 248, y: 195, code: 'DL', radius: 16 },

  // Western & Central Region
  'Rajasthan': { x: 175, y: 240, code: 'RJ', radius: 36 },
  'Uttar Pradesh': { x: 310, y: 235, code: 'UP', radius: 34 },
  'Gujarat': { x: 130, y: 320, code: 'GJ', radius: 32 },
  'Madhya Pradesh': { x: 275, y: 325, code: 'MP', radius: 38 },
  'Dadra and Nagar Haveli and Daman and Diu': { x: 152, y: 375, code: 'DN', radius: 14 },

  // Eastern Region
  'Bihar': { x: 405, y: 255, code: 'BR', radius: 28 },
  'Jharkhand': { x: 410, y: 320, code: 'JH', radius: 25 },
  'West Bengal': { x: 460, y: 335, code: 'WB', radius: 26 },
  'Sikkim': { x: 465, y: 215, code: 'SK', radius: 15 },
  'Odisha': { x: 395, y: 390, code: 'OD', radius: 30 },
  'Chhattisgarh': { x: 335, y: 375, code: 'CG', radius: 28 },

  // North Eastern Region
  'Assam': { x: 525, y: 245, code: 'AS', radius: 26 },
  'Arunachal Pradesh': { x: 565, y: 195, code: 'AR', radius: 24 },
  'Meghalaya': { x: 515, y: 275, code: 'ML', radius: 18 },
  'Nagaland': { x: 575, y: 250, code: 'NL', radius: 16 },
  'Manipur': { x: 570, y: 285, code: 'MN', radius: 16 },
  'Mizoram': { x: 555, y: 325, code: 'MZ', radius: 16 },
  'Tripura': { x: 520, y: 315, code: 'TR', radius: 16 },

  // Southern Region
  'Maharashtra': { x: 220, y: 410, code: 'MH', radius: 38 },
  'Goa': { x: 175, y: 495, code: 'GA', radius: 15 },
  'Telangana': { x: 295, y: 445, code: 'TG', radius: 27 },
  'Andhra Pradesh': { x: 305, y: 515, code: 'AP', radius: 32 },
  'Karnataka': { x: 225, y: 505, code: 'KA', radius: 34 },
  'Tamil Nadu': { x: 275, y: 595, code: 'TN', radius: 33 },
  'Kerala': { x: 225, y: 605, code: 'KL', radius: 25 },
  'Puducherry': { x: 298, y: 585, code: 'PY', radius: 14 },

  // Island UTs
  'Lakshadweep': { x: 160, y: 610, code: 'LD', radius: 15 },
  'Andaman and Nicobar Islands': { x: 535, y: 550, code: 'AN', radius: 20 },
};

export const InteractiveIndiaMap: React.FC<Props> = ({
  selectedState,
  onSelectState,
  activeMetric = 'utilization',
  onChangeMetric,
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [metricMode, setMetricMode] = useState<GeoMetricType>(activeMetric);
  const [viewMode, setViewMode] = useState<GeoViewMode>('MAP');
  const [regionFilter, setRegionFilter] = useState<'All' | 'States' | 'UTs'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableSortCol, setTableSortCol] = useState<'name' | 'utilization' | 'completion' | 'works' | 'sanctioned' | 'utilized'>('utilization');
  const [tableSortAsc, setTableSortAsc] = useState(false);

  const handleMetricChange = (m: GeoMetricType) => {
    setMetricMode(m);
    if (onChangeMetric) onChangeMetric(m);
  };

  // Load all state metrics from centralized consistency engine
  const allStateMetrics = useMemo(() => {
    return dashboardIntelligence.getAllStatesMetrics();
  }, []);

  const stateMetricsMap = useMemo(() => {
    const map = new Map<string, StateSummaryMetric>();
    allStateMetrics.forEach(m => map.set(m.name.toLowerCase(), m));
    return map;
  }, [allStateMetrics]);

  // Extract raw value for any state according to the active metric
  const getMetricValue = (m: StateSummaryMetric, type: GeoMetricType): number => {
    switch (type) {
      case 'utilization':
        return m.utilizationRate;
      case 'completion':
        return m.completionRate;
      case 'delayed':
        return Math.round((m.delayedWorks / Math.max(1, m.totalWorks)) * 100);
      case 'risk':
        return m.riskScore;
      case 'works':
        return m.totalWorks;
      case 'sanctioned':
        return m.totalSanctionedCr;
      case 'utilized':
        return m.totalUtilizedCr;
      case 'remaining':
        return m.remainingCr;
      default:
        return m.utilizationRate;
    }
  };

  const formatMetricValue = (val: number, type: GeoMetricType): string => {
    switch (type) {
      case 'utilization':
      case 'completion':
      case 'delayed':
        return `${val}%`;
      case 'risk':
        return `${val}/100`;
      case 'works':
        return val.toLocaleString();
      case 'sanctioned':
      case 'utilized':
      case 'remaining':
        return `₹${val.toFixed(1)} Cr`;
      default:
        return `${val}`;
    }
  };

  // Determine color for node based on active metric
  const getNodeColor = (stateName: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#1d4ed8'; // Royal Blue for selected
    const metric = stateMetricsMap.get(stateName.toLowerCase());
    if (!metric) return '#64748b';

    const val = getMetricValue(metric, metricMode);

    if (metricMode === 'utilization') {
      if (val >= 82) return isHovered ? '#047857' : '#059669'; // High emerald
      if (val >= 72) return isHovered ? '#0284c7' : '#0ea5e9'; // Good sky
      if (val >= 62) return isHovered ? '#d97706' : '#f59e0b'; // Medium amber
      return isHovered ? '#b91c1c' : '#ef4444'; // Attention red
    }

    if (metricMode === 'completion') {
      if (val >= 80) return isHovered ? '#047857' : '#10b981';
      if (val >= 70) return isHovered ? '#0369a1' : '#38bdf8';
      return isHovered ? '#d97706' : '#f59e0b';
    }

    if (metricMode === 'risk' || metricMode === 'delayed') {
      if (val >= 35) return isHovered ? '#991b1b' : '#dc2626';
      if (val >= 20) return isHovered ? '#b45309' : '#f59e0b';
      return isHovered ? '#065f46' : '#10b981';
    }

    if (metricMode === 'works') {
      if (val >= 300) return isHovered ? '#1e3a8a' : '#2563eb';
      if (val >= 150) return isHovered ? '#0284c7' : '#0ea5e9';
      return isHovered ? '#38bdf8' : '#7dd3fc';
    }

    // Financial amounts
    if (val >= 80) return isHovered ? '#047857' : '#059669';
    if (val >= 40) return isHovered ? '#0284c7' : '#0ea5e9';
    return isHovered ? '#38bdf8' : '#7dd3fc';
  };

  const hoveredMetrics = hoveredState ? stateMetricsMap.get(hoveredState.toLowerCase()) : null;

  // Filtered jurisdictions for the directory pills
  const filteredJurisdictions = useMemo(() => {
    let list = ALL_INDIA_JURISDICTIONS;
    if (regionFilter === 'States') list = list.filter(j => j.type === 'State');
    if (regionFilter === 'UTs') list = list.filter(j => j.type === 'Union Territory');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(j => j.name.toLowerCase().includes(q));
    }
    return list;
  }, [regionFilter, searchQuery]);

  // Ranked metrics for the Bar and Ranking views
  const sortedMetrics = useMemo(() => {
    return [...allStateMetrics].sort((a, b) => {
      const vA = getMetricValue(a, metricMode);
      const vB = getMetricValue(b, metricMode);
      return vB - vA;
    });
  }, [allStateMetrics, metricMode]);

  // Table sorted metrics
  const tableData = useMemo(() => {
    let list = [...allStateMetrics];
    if (regionFilter === 'States') list = list.filter(m => m.type === 'State');
    if (regionFilter === 'UTs') list = list.filter(m => m.type === 'Union Territory');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      let vA: any = a.name;
      let vB: any = b.name;
      if (tableSortCol === 'utilization') {
        vA = a.utilizationRate;
        vB = b.utilizationRate;
      } else if (tableSortCol === 'completion') {
        vA = a.completionRate;
        vB = b.completionRate;
      } else if (tableSortCol === 'works') {
        vA = a.totalWorks;
        vB = b.totalWorks;
      } else if (tableSortCol === 'sanctioned') {
        vA = a.totalSanctionedCr;
        vB = b.totalSanctionedCr;
      } else if (tableSortCol === 'utilized') {
        vA = a.totalUtilizedCr;
        vB = b.totalUtilizedCr;
      }

      if (vA < vB) return tableSortAsc ? -1 : 1;
      if (vA > vB) return tableSortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [allStateMetrics, regionFilter, searchQuery, tableSortCol, tableSortAsc]);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
      {/* Header with Metric & View Switchers */}
      <div className="p-4 sm:p-5 border-b border-slate-700 bg-slate-900/70 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                India Geographic Intelligence Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">
                All 28 States &amp; 8 Union Territories Synchronized
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
              Cross-Jurisdictional Performance &amp; Analytical Cartography
            </h3>
          </div>

          {/* View Selector Controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-xs self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'MAP'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>MAP</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('BAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'BAR'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>BAR</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('TREEMAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'TREEMAP'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>TREEMAP</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('BUBBLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'BUBBLE'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>BUBBLE</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('RANKING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'RANKING'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>RANKING</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'TABLE'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>TABLE</span>
            </button>
          </div>
        </div>

        {/* Metric Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-semibold">
          <span className="text-slate-500 text-[11px] uppercase tracking-wide font-bold mr-1 shrink-0">
            Active Metric:
          </span>

          <button
            type="button"
            onClick={() => handleMetricChange('utilization')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'utilization'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Fund Utilization %
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('completion')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'completion'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Completion %
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('delayed')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'delayed'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Delayed %
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('risk')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'risk'
                ? 'bg-rose-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Risk Index
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('works')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'works'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Total Works
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('sanctioned')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'sanctioned'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Sanctioned Amount
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('utilized')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'utilized'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Utilized Amount
          </button>

          <button
            type="button"
            onClick={() => handleMetricChange('remaining')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              metricMode === 'remaining'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            Remaining Balance
          </button>
        </div>
      </div>

      {/* VIEWPORT AREA: DYNAMICALLY SWITCHES AMONG 6 VIEWS */}
      <div className="relative p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white min-h-[500px] flex flex-col justify-center overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* 1. MAP VIEW */}
        {viewMode === 'MAP' && (
          <div className="relative w-full flex flex-col items-center justify-center">
            {/* Legend */}
            <div className="absolute top-0 left-0 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-lg max-w-[210px] text-xs">
              <div className="font-bold text-slate-200 uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Scale: {metricMode.toUpperCase()}</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span>High Benchmark</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-sky-500" />
                  <span>Average Pace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span>Under Execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-rose-500" />
                  <span>Attention Flagged</span>
                </div>
              </div>
            </div>

            {/* Dynamic Hover Tooltip */}
            {hoveredMetrics && (
              <div className="absolute top-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl max-w-xs text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
                  <div className="font-bold text-white text-sm">
                    {hoveredMetrics.name}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                    {hoveredMetrics.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Works</span>
                    <span className="font-bold text-white text-sm">{hoveredMetrics.totalWorks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">MPs Tracked</span>
                    <span className="font-bold text-white text-sm">{hoveredMetrics.mpCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                    <span className="font-bold text-emerald-400">₹{hoveredMetrics.totalSanctionedCr} Cr</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Utilized</span>
                    <span className="font-bold text-sky-400">₹{hoveredMetrics.totalUtilizedCr} Cr</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Utilization Rate</span>
                    <span className="font-bold text-amber-300">{hoveredMetrics.utilizationRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Completion Rate</span>
                    <span className="font-bold text-emerald-400">{hoveredMetrics.completionRate}%</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectState(hoveredMetrics.name)}
                  className="w-full mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-sky-400 font-bold hover:text-sky-300 cursor-pointer"
                >
                  <span>Open State Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* SVG Cartogram */}
            <div className="w-full max-w-2xl h-auto aspect-[600/680] relative z-10 flex items-center justify-center">
              <svg viewBox="0 0 600 680" className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                {/* National Outline Silhouette */}
                <path
                  d="M 235 60 L 310 60 L 340 100 L 320 150 L 370 180 L 450 200 L 480 200 L 520 220 L 570 200 L 590 240 L 570 320 L 520 340 L 470 340 L 430 380 L 400 420 L 330 520 L 290 620 L 240 640 L 220 580 L 200 480 L 150 400 L 120 340 L 130 280 L 160 220 L 210 150 Z"
                  fill="rgba(15, 23, 42, 0.6)"
                  stroke="rgba(56, 189, 248, 0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* State Centroid Bubbles */}
                {Object.entries(INDIA_STATE_COORDINATES).map(([stateName, coord]) => {
                  const isHovered = hoveredState === stateName;
                  const isSelected = selectedState.toLowerCase() === stateName.toLowerCase();
                  const fillColor = getNodeColor(stateName, isHovered, isSelected);
                  const metric = stateMetricsMap.get(stateName.toLowerCase());

                  return (
                    <g
                      key={stateName}
                      className="cursor-pointer transition-transform duration-150"
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => onSelectState(stateName)}
                    >
                      {isSelected && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={coord.radius + 8}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeDasharray="3 3"
                          className="animate-spin origin-center"
                          style={{ transformOrigin: `${coord.x}px ${coord.y}px` }}
                        />
                      )}

                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={coord.radius}
                        fill={fillColor}
                        stroke={isSelected ? '#ffffff' : isHovered ? '#38bdf8' : 'rgba(255,255,255,0.25)'}
                        strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                        className="transition-all duration-200"
                        filter={isHovered || isSelected ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : undefined}
                      />

                      <text
                        x={coord.x}
                        y={coord.y - 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize={coord.radius > 20 ? '11px' : '9px'}
                        fontWeight="bold"
                        className="select-none pointer-events-none"
                      >
                        {coord.code}
                      </text>

                      <text
                        x={coord.x}
                        y={coord.y + 9}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="rgba(255,255,255,0.85)"
                        fontSize="8px"
                        fontWeight="600"
                        className="select-none pointer-events-none"
                      >
                        {metric ? formatMetricValue(getMetricValue(metric, metricMode), metricMode) : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* 2. BAR CHART VIEW */}
        {viewMode === 'BAR' && (
          <div className="w-full max-w-5xl mx-auto space-y-3 py-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Jurisdiction (Ranked by {metricMode.toUpperCase()})</span>
              <span>Metric Value &amp; Comparison</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
              {sortedMetrics.map((m, idx) => {
                const val = getMetricValue(m, metricMode);
                const maxVal = getMetricValue(sortedMetrics[0], metricMode) || 100;
                const pctOfMax = Math.max(5, Math.min(100, Math.round((val / maxVal) * 100)));
                const isSelected = selectedState.toLowerCase() === m.name.toLowerCase();

                return (
                  <div
                    key={m.name}
                    onClick={() => onSelectState(m.name)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'bg-blue-900/60 border-blue-400 shadow-md'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60'
                    }`}
                  >
                    <span className="w-6 text-xs font-mono text-slate-400 font-bold text-right shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="w-40 sm:w-52 shrink-0 truncate">
                      <div className="text-xs font-bold text-white truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.type} • {m.districtsCount} Districts</div>
                    </div>

                    <div className="flex-1 bg-slate-950/60 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-500"
                        style={{ width: `${pctOfMax}%` }}
                      />
                    </div>

                    <div className="w-24 text-right shrink-0">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {formatMetricValue(val, metricMode)}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. TREEMAP VIEW */}
        {viewMode === 'TREEMAP' && (
          <div className="w-full max-w-5xl mx-auto py-4">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>Relative Jurisdiction Volume Breakdown ({metricMode.toUpperCase()})</span>
              <span>Click tile to open State Dashboard</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {sortedMetrics.map(m => {
                const val = getMetricValue(m, metricMode);
                const isSelected = selectedState.toLowerCase() === m.name.toLowerCase();

                return (
                  <div
                    key={m.name}
                    onClick={() => onSelectState(m.name)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                      isSelected
                        ? 'bg-blue-900 border-sky-400 shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/60 text-slate-300">
                          {m.type === 'State' ? 'ST' : 'UT'}
                        </span>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          {formatMetricValue(val, metricMode)}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-white mt-1.5 line-clamp-2">
                        {m.name}
                      </h5>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/50 mt-2">
                      <span>{m.totalWorks} Works</span>
                      <ArrowRight className="w-3 h-3 text-sky-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. BUBBLE SCATTER VIEW */}
        {viewMode === 'BUBBLE' && (
          <div className="w-full max-w-5xl mx-auto py-4">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>Sanctioned Funds vs Utilized Funds Dispersion (Bubble Size = Works Count)</span>
              <span>Click any jurisdiction bubble</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 min-h-[380px] relative flex flex-wrap items-center justify-center gap-3 overflow-y-auto max-h-[460px]">
              {sortedMetrics.map(m => {
                const val = getMetricValue(m, metricMode);
                const isSelected = selectedState.toLowerCase() === m.name.toLowerCase();
                const radiusSize = Math.max(50, Math.min(100, Math.round(Math.sqrt(m.totalWorks) * 5)));

                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => onSelectState(m.name)}
                    style={{ width: `${radiusSize}px`, height: `${radiusSize}px` }}
                    className={`rounded-full flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 border-white ring-4 ring-blue-400/50 scale-105 shadow-xl'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 hover:scale-110 shadow-md'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-white truncate max-w-full leading-tight">
                      {m.name.slice(0, 8)}..
                    </span>
                    <span className="text-[9px] font-mono text-amber-300 font-bold">
                      {formatMetricValue(val, metricMode)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. RANKING VIEW */}
        {viewMode === 'RANKING' && (
          <div className="w-full max-w-5xl mx-auto py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Benchmark Performers */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Top Benchmark Performers</h4>
                  <p className="text-[11px] text-emerald-300">Leading nationwide execution velocity</p>
                </div>
              </div>

              <div className="space-y-3">
                {sortedMetrics.slice(0, 5).map((m, idx) => (
                  <div
                    key={m.name}
                    onClick={() => onSelectState(m.name)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 font-bold font-mono text-xs flex items-center justify-center border border-emerald-700">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.totalWorks} Works • {m.districtsCount} Districts</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        {formatMetricValue(getMetricValue(m, metricMode), metricMode)}
                      </div>
                      <div className="text-[10px] text-slate-400">{m.utilizationRate}% Utilized</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attention Required Queue */}
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Attention Required Priority Queue</h4>
                  <p className="text-[11px] text-rose-300">Opportunities for milestone acceleration</p>
                </div>
              </div>

              <div className="space-y-3">
                {sortedMetrics.slice(-5).reverse().map((m, idx) => (
                  <div
                    key={m.name}
                    onClick={() => onSelectState(m.name)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-950 text-rose-300 font-bold font-mono text-xs flex items-center justify-center border border-rose-700">
                        !
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.delayedWorks} Delayed Works Flagged</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-400 font-mono">
                        {formatMetricValue(getMetricValue(m, metricMode), metricMode)}
                      </div>
                      <div className="text-[10px] text-slate-400">{m.completionRate}% Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. TABLE VIEW */}
        {viewMode === 'TABLE' && (
          <div className="w-full max-w-5xl mx-auto py-2">
            <div className="overflow-x-auto max-h-[460px] rounded-xl border border-slate-700">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] sticky top-0 z-10 border-b border-slate-700">
                  <tr>
                    <th className="p-3">Jurisdiction</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Works</th>
                    <th className="p-3">Sanctioned</th>
                    <th className="p-3">Utilized</th>
                    <th className="p-3">Utilization</th>
                    <th className="p-3">Completion</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {tableData.map(m => (
                    <tr
                      key={m.name}
                      onClick={() => onSelectState(m.name)}
                      className="hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-white">{m.name}</td>
                      <td className="p-3 text-slate-400">{m.type}</td>
                      <td className="p-3 font-mono">{m.totalWorks}</td>
                      <td className="p-3 font-mono text-emerald-400">₹{m.totalSanctionedCr} Cr</td>
                      <td className="p-3 font-mono text-sky-400">₹{m.totalUtilizedCr} Cr</td>
                      <td className="p-3 font-mono text-amber-300">{m.utilizationRate}%</td>
                      <td className="p-3 font-mono text-emerald-300">{m.completionRate}%</td>
                      <td className="p-3 text-right">
                        <span className="text-[11px] text-sky-400 font-bold hover:underline">
                          Inspect &rarr;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Selection Indicator */}
        <div className="mt-4 text-center z-10 flex items-center justify-center gap-3">
          {selectedState ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/90 border border-blue-500 text-white text-xs font-bold shadow-sm">
              <span>Active Drill-Down:</span>
              <span className="text-amber-300">{selectedState}</span>
              <button
                type="button"
                onClick={() => onSelectState('')}
                className="ml-2 text-slate-400 hover:text-white text-[11px] underline cursor-pointer"
              >
                Reset to India Overview
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Interactive View Mode: <strong className="text-white">{viewMode}</strong> • Click any jurisdiction to open its Intelligence Dashboard
            </div>
          )}
        </div>
      </div>

      {/* Quick State & UT Selection Directory Pills */}
      <div className="p-4 sm:p-5 border-t border-slate-700 bg-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Quick Jurisdiction Directory
            </span>
            <span className="text-[11px] text-slate-500">
              ({filteredJurisdictions.length} matching)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setRegionFilter('All')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  regionFilter === 'All' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-600'
                }`}
              >
                All (36)
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('States')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  regionFilter === 'States' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-600'
                }`}
              >
                28 States
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('UTs')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  regionFilter === 'UTs' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-600'
                }`}
              >
                8 UTs
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Find state/UT..."
              className="px-3 py-1 text-xs border border-slate-700 rounded-lg focus:outline-hidden focus:border-blue-500 max-w-[150px]"
            />
          </div>
        </div>

        {/* Directory Pills Grid */}
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {filteredJurisdictions.map(j => {
            const isSelected = selectedState.toLowerCase() === j.name.toLowerCase();
            const metric = stateMetricsMap.get(j.name.toLowerCase());

            return (
              <button
                key={j.name}
                type="button"
                onClick={() => onSelectState(isSelected ? '' : j.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                    : 'bg-slate-900 hover:bg-blue-50 text-slate-300 border-slate-700'
                }`}
              >
                <span>{j.name}</span>
                {metric && (
                  <span
                    className={`text-[10px] px-1 rounded font-bold ${
                      isSelected
                        ? 'bg-blue-800 text-blue-100'
                        : metric.utilizationRate >= 75
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-amber-700 bg-amber-50'
                    }`}
                  >
                    {metric.utilizationRate}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
