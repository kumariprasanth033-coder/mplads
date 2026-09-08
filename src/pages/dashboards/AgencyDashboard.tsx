import React, { useState, useEffect } from 'react';
import {
  Layers,
  Camera,
  FileCheck,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { ProjectRecord } from '../../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const AgencyDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [evidenceStage, setEvidenceStage] = useState<'Before' | 'During' | 'Completed'>('During');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects({ limit: 10 });
      setProjects(res.projects || []);
      if (res.projects && res.projects.length > 0 && !selectedProject) {
        setSelectedProject(res.projects[0]);
        setProgressVal(res.projects[0].progressPercentage);
      }
    } catch (e) {
      console.error('Failed to load agency projects:', e);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleUpdateProgress = async () => {
    if (!selectedProject) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateProject(selectedProject.id, {
        progressPercentage: progressVal,
        timelineNote: `Physical progress updated to ${progressVal}% by Agency Field Engineer`,
        updatedBy: 'R. Murugan (Executive Engineer, DRDA)',
      });
      setSelectedProject(updated);
      alert(`Progress updated to ${progressVal}% successfully!`);
      await loadProjects();
    } catch (e) {
      console.error('Progress update error:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !evidenceDesc.trim()) return;

    try {
      await api.uploadEvidence(selectedProject.id, {
        stage: evidenceStage,
        description: evidenceDesc,
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
        uploadedBy: 'R. Murugan (Executive Engineer, DRDA)',
      });
      alert('Geotagged photographic milestone uploaded successfully!');
      setEvidenceDesc('');
      const refreshed = await api.getProject(selectedProject.id);
      setSelectedProject(refreshed);
      await loadProjects();
    } catch (err) {
      console.error('Evidence upload error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-700 text-white">
                IMPLEMENTING AGENCY / FIELD ENGG
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-700 text-white">
                SIH DEMO ACCOUNT
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              Field Execution &amp; Milestone Reporting Workspace
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Agency: <strong>DRDA / PWD Engineering Division</strong> • Executive Engineer: Er. R. Murugan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Assigned Works (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Assigned Construction Packages ({projects.length})</span>
              </h3>

              <div className="divide-y divide-slate-100 mt-2">
                {projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p);
                      setProgressVal(p.progressPercentage);
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer ${
                      selectedProject?.id === p.id
                        ? 'bg-amber-50/80 border-2 border-amber-500'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{p.code}</span>
                      <span className="font-bold text-slate-700">{p.status}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {p.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span>Sanctioned: ₹{p.financial.sanctionedAmountLakhs} L</span>
                      <strong className="text-emerald-700">{p.progressPercentage}% Complete</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Update Milestone & Upload Photographic Evidence (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedProject ? (
              <>
                {/* Physical Progress Update Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedProject.code}</span>
                      <h3 className="font-bold text-base text-slate-900">{selectedProject.title}</h3>
                    </div>
                    <span className="text-sm font-extrabold text-blue-900">{progressVal}%</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-2">
                      Adjust Physical Site Progress Percentage:
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressVal}
                      onChange={e => setProgressVal(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0% (Foundation)</span>
                      <span>50% (Lintel/Roof)</span>
                      <span>100% (Handover Complete)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdateProgress}
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    {isUpdating ? 'Recording Progress...' : 'Submit Physical Progress Record'}
                  </button>
                </div>

                {/* Upload Photographic Evidence Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
                  <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Upload Geotagged Milestone Photograph</span>
                  </h3>

                  <form onSubmit={handleUploadPhoto} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Construction Stage:</label>
                        <select
                          value={evidenceStage}
                          onChange={e => setEvidenceStage(e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Before">Before Construction</option>
                          <option value="During">During Construction</option>
                          <option value="Completed">Post Completion / Commissioned</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">GPS Coordinates:</label>
                        <input
                          type="text"
                          disabled
                          value={`${selectedProject.coordinates.lat}° N, ${selectedProject.coordinates.lng}° E`}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Milestone Description:</label>
                      <input
                        type="text"
                        value={evidenceDesc}
                        onChange={e => setEvidenceDesc(e.target.value)}
                        placeholder="E.g., Foundation RCC slab completed and cured for 14 days"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Geotagged Milestone &amp; Notify DRDA</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select any assigned construction package to report milestones.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
