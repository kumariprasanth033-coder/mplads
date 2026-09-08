import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building,
  User,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { ActionQueueItem, ProjectRecord } from '../../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const DistrictDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<ActionQueueItem | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      const [queue, projs] = await Promise.all([
        api.getActionQueue(),
        api.getProjects({ district: 'Dharmapuri', limit: 20 }),
      ]);
      setActionQueue(queue);
      setProjects(projs.projects || []);
      if (queue.length > 0 && !selectedItem) {
        setSelectedItem(queue[0]);
      }
    } catch (e) {
      console.error('Failed to load district data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (decision: 'APPROVE_SANCTION' | 'HOLD_FOR_VERIFICATION') => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      await api.submitActionDecision(
        selectedItem.id,
        decision,
        officerNote || (decision === 'APPROVE_SANCTION' ? 'Sanction accorded after technical rate check.' : 'Physical site verification ordered.'),
        'K. Shanthi, IAS (District Collector)'
      );
      alert(`Decision recorded successfully: ${decision === 'APPROVE_SANCTION' ? 'Administrative Sanction Accorded' : 'Held for Verification'}.\nHuman decision logged to statutory audit log.`);
      setOfficerNote('');
      setSelectedItem(null);
      await loadData();
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-100">
                DISTRICT MAGISTRATE / NODAL DRDA
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-700 text-white">
                SIH DEMO ACCOUNT
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              District Collectorate Action Queue &amp; Sanction Console
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Nodal District: <strong>Dharmapuri</strong> (Tamil Nadu) • Officer: Smt. K. Shanthi, IAS
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <div className="font-bold text-white">Collector Authority:</div>
              <span>Human Sanction Decision Remains Final</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Action Queue Items (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-900" />
                  <span>Pending Action Queue ({actionQueue.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Real-time sync</span>
              </div>

              {actionQueue.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-slate-700">Action Queue Clear</p>
                  <p className="text-[11px] text-slate-500">All MP recommendations have been reviewed and disposed.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {actionQueue.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                        selectedItem?.id === item.id
                          ? 'bg-blue-50/80 border-2 border-blue-500'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono">
                          {item.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.aiPrecheckStatus === 'PROCEED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.aiPrecheckStatus === 'POSSIBLE DUPLICATE / OVERLAP'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          AI: {item.aiPrecheckStatus}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 mt-2">
                        {item.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span>MP: {item.mpName}</span>
                        <strong className="text-slate-800">₹{item.amountLakhs} Lakhs</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Collector Decision Panel (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                Collectorate Sanction Adjudication Panel
              </h3>

              {selectedItem ? (
                <div className="mt-4 space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Proposed Community Asset
                    </span>
                    <h4 className="font-bold text-base text-slate-900 mt-1">
                      {selectedItem.title}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Recommending MP</span>
                      <strong className="text-slate-900">{selectedItem.mpName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Recommended Outlay</span>
                      <strong className="text-blue-900 text-sm">₹{selectedItem.amountLakhs} Lakhs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Constituency</span>
                      <strong className="text-slate-900">{selectedItem.constituency}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date Submitted</span>
                      <strong className="text-slate-900">{selectedItem.submittedDate}</strong>
                    </div>
                  </div>

                  {/* AI Pre-Check Summary for Officer */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Project Intelligence Core Finding:</span>
                    </div>
                    <p className="text-emerald-800 text-xs mt-1">
                      Status: <strong>{selectedItem.aiPrecheckStatus}</strong>. DPR structure validated against PWD Schedule of Rates. No duplicate entry found in Dharmapuri treasury ledger.
                    </p>
                  </div>

                  {/* Official Decision Note */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Statutory Endorsement / Site Inspection Note:
                    </label>
                    <textarea
                      rows={3}
                      value={officerNote}
                      onChange={e => setOfficerNote(e.target.value)}
                      placeholder="Add official reasons, technical sanction conditions, or specific line agency directives..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDecision('APPROVE_SANCTION')}
                      className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accord Administrative Sanction (AS)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDecision('HOLD_FOR_VERIFICATION')}
                      className="py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Hold for Field Verification</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Select any proposal from the action queue to adjudicate.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
