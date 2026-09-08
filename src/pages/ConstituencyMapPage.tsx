import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Filter,
  FolderGit2,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ProjectRecord } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const ConstituencyMapPage: React.FC<Props> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.getProjects({ limit: 40 });
        setProjects(res.projects || []);
        if (res.projects && res.projects.length > 0) {
          setSelectedProject(res.projects[0]);
        }
      } catch (err) {
        console.error('Failed to load map projects:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = projects.filter(p => {
    if (sectorFilter && p.category !== sectorFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  // Calculate normalized coordinate placement on an interactive canvas for Dharmapuri/Tamil Nadu/India coordinates
  // Typical Dharmapuri coordinates: Lat 12.0 - 12.3, Lng 77.8 - 78.4
  const minLat = 11.9;
  const maxLat = 12.4;
  const minLng = 77.7;
  const maxLng = 78.5;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>GIS Geospatial Asset Explorer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
            Constituency Geographic Mapping Layer
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden"
          >
            <option value="">All Sectors</option>
            <option value="Drinking Water">Drinking Water</option>
            <option value="Road Construction">Road Construction</option>
            <option value="School Building">School Building</option>
            <option value="Health & Family Welfare">Health &amp; Family Welfare</option>
            <option value="Non-Conventional Energy">Solar &amp; Energy</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Proposed">Proposed</option>
          </select>

          <span className="text-slate-400 font-mono text-xs">
            Showing {filtered.length} Works
          </span>
        </div>
      </div>

      {/* Main Map + Sidebar Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[600px]">
        {/* Interactive GIS Visual Stage (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 select-none">
          {/* Map Grid / Topo motif */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]" />

          {/* SVG Map Canvas with Interactive Geotagged Pins */}
          <div className="relative w-full max-w-2xl h-[480px] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-4 overflow-hidden">
            {/* Top Bar on Map */}
            <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dharmapuri &amp; Regional Cluster GIS (12.1332° N, 77.8872° E)</span>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] rounded font-bold">
                ✓ Completed
              </span>
              <span className="px-2 py-1 bg-blue-950/80 border border-blue-800 text-blue-300 text-[10px] rounded font-bold">
                ⚙ In Progress
              </span>
              <span className="px-2 py-1 bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] rounded font-bold">
                ⚠ Delayed
              </span>
            </div>

            {/* Simulated Geographic SVG Contour lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 500">
              <path
                d="M 50 150 Q 200 80 400 160 T 750 200"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 80 320 Q 300 240 500 350 T 780 300"
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <circle cx="380" cy="240" r="180" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </svg>

            {/* Interactive Pins */}
            {filtered.map((proj, idx) => {
              // Map lat/lng to percentage bounds
              const latNorm = (proj.coordinates.lat - minLat) / (maxLat - minLat);
              const lngNorm = (proj.coordinates.lng - minLng) / (maxLng - minLng);
              const topPercent = Math.min(85, Math.max(15, (1 - latNorm) * 100));
              const leftPercent = Math.min(85, Math.max(15, lngNorm * 100));

              const isSelected = selectedProject?.id === proj.id;

              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  title={`${proj.title} (${proj.category})`}
                >
                  <div
                    className={`p-2 rounded-full shadow-lg flex items-center justify-center border-2 ${
                      isSelected
                        ? 'bg-white text-slate-950 border-amber-400 ring-4 ring-amber-400/40'
                        : proj.status === 'Completed'
                        ? 'bg-emerald-600 text-white border-white'
                        : proj.status === 'Delayed'
                        ? 'bg-rose-600 text-white border-white'
                        : 'bg-blue-600 text-white border-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900 text-white text-[10px] rounded-md shadow-xl whitespace-nowrap border border-slate-700">
                    {proj.title} (₹{proj.financial.sanctionedAmountLakhs} L)
                  </div>
                </button>
              );
            })}

            {/* Bottom Coordinate Bar */}
            <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Projection: WGS 84 • Georeferenced to Survey of India standards</span>
              <span>Click any pin to inspect development dossier</span>
            </div>
          </div>
        </div>

        {/* Selected Project Dossier Sidebar (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
          {selectedProject ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedProject.code}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedProject.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedProject.status === 'Delayed'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedProject.status}
                </span>
              </div>

              {/* Photo Thumbnail */}
              {selectedProject.evidence.length > 0 && (
                <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedProject.evidence[selectedProject.evidence.length - 1].url}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedProject.category}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-2 leading-snug">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Village / Location</span>
                  <strong className="text-slate-800">
                    {selectedProject.village || 'Panchayat'}, {selectedProject.district}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">GPS Coordinates</span>
                  <strong className="font-mono text-slate-800">
                    {selectedProject.coordinates.lat}° N, {selectedProject.coordinates.lng}° E
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Sanctioned Outlay</span>
                  <strong className="text-slate-900">
                    ₹{selectedProject.financial.sanctionedAmountLakhs} Lakhs
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Disbursed Expenditure</span>
                  <strong className="text-emerald-700">
                    ₹{selectedProject.financial.expenditureLakhs} Lakhs
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Physical Progress</span>
                  <strong className="text-slate-900">{selectedProject.progressPercentage}%</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate(`/projects/${selectedProject.id}`)}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Project Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Select any marker on the map to view asset details.</p>
            </div>
          )}

          {/* Map Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SIH DEMO GEODATA</span>
            <button onClick={() => onNavigate('/reports')} className="text-blue-900 font-bold hover:underline">
              Sector Reports →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
