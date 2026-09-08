import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  Building,
  TrendingDown,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { AuditRiskItem } from '../../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const AuditorDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [risks, setRisks] = useState<AuditRiskItem[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<AuditRiskItem | null>(null);

  const loadRisks = async () => {
    try {
      const data = await api.getAuditRisks();
      setRisks(data);
      if (data.length > 0 && !selectedRisk) {
        setSelectedRisk(data[0]);
      }
    } catch (e) {
      console.error('Failed to load audit risks:', e);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const handleUpdateStatus = async (newStatus: 'Under Review' | 'Inspected' | 'Resolved') => {
    if (!selectedRisk) return;
    try {
      const updated = await api.updateAuditRisk(selectedRisk.id, { status: newStatus });
      setSelectedRisk(updated);
      await loadRisks();
      alert(`Audit risk status marked as: ${newStatus}`);
    } catch (err) {
      console.error('Error updating audit risk:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-800 text-rose-100">
                AUDITOR / CAG MONITORING WING
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-700 text-white">
                SIH DEMO ACCOUNT
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              Statutory Audit &amp; Risk Intelligence Console
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous schedule rate variance tracking, stagnant site detection, and fund utilization risk triage.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <div className="font-bold text-white">Responsible Audit Standard:</div>
              <span>Indicators flag inspection priorities; human audit is final</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Flagged Risks Table (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Flagged Projects &amp; Anomaly Triage ({risks.length})</span>
              </h3>

              <div className="divide-y divide-slate-100 mt-2">
                {risks.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRisk(r)}
                    className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                      selectedRisk?.id === r.id
                        ? 'bg-rose-50/80 border-2 border-rose-500'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.riskLevel} RISK ({r.riskScore}/100)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{r.status}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-2">
                      {r.projectTitle}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {r.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-1 border-t border-slate-100">
                      <span>{r.district}</span>
                      <strong className="text-slate-800">₹{r.amountLakhs} Lakhs</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Risk Deep Dive & Field Inspection Dispatch (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                Auditor Assessment &amp; Physical Inspection Order
              </h3>

              {selectedRisk ? (
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">PROJECT UNDER REVIEW</span>
                    <h4 className="font-bold text-base text-slate-900 mt-0.5">
                      {selectedRisk.projectTitle}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Calculated Anomaly Score</span>
                      <strong className="text-rose-700 text-base">{selectedRisk.riskScore} / 100</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sanctioned Value</span>
                      <strong className="text-slate-900 text-base">₹{selectedRisk.amountLakhs} Lakhs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">District</span>
                      <strong className="text-slate-900">{selectedRisk.district}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Flag Category</span>
                      <strong className="text-slate-900">{selectedRisk.category}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <span className="text-amber-900 font-bold block mb-1">Auditor Technical Finding:</span>
                    <p className="text-amber-800 leading-relaxed">{selectedRisk.description}</p>
                  </div>

                  {/* Actions for Auditor */}
                  <div className="space-y-2 pt-2">
                    <span className="text-slate-700 font-bold block">Adjudicate Audit Step:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Under Review')}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg cursor-pointer"
                      >
                        Keep Under Review
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Inspected')}
                        className="py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Order Site Inspection
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Resolved')}
                        className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate(`/projects/${selectedRisk.projectId}`)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Full Project Milestone History</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Select any risk indicator from the left to inspect anomalies.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
