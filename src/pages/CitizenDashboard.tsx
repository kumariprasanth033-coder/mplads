import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  FileText,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintRecord } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const CitizenDashboard: React.FC<Props> = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [rawText, setRawText] = useState('');
  const [userLocation, setUserLocation] = useState('Pennagaram Village, Dharmapuri');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const [trackingIdSearch, setTrackingIdSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);

  // Load complaints
  const loadComplaints = async () => {
    try {
      const list = await api.getComplaints();
      setComplaints(list);
      if (list.length > 0 && !selectedComplaint) {
        setSelectedComplaint(list[0]);
      }
    } catch (e) {
      console.error('Failed to load complaints:', e);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || isParsing) return;

    setIsParsing(true);
    try {
      const parsed = await api.parseCitizenComplaint(rawText, userLocation);
      setParsedPreview(parsed);
    } catch (err) {
      console.error('AI Parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!parsedPreview) return;
    try {
      const created = await api.createComplaint({
        problemTitle: parsedPreview.problemTitle,
        description: parsedPreview.structuredSummary,
        category: parsedPreview.category,
        severity: parsedPreview.severity,
        location: {
          state: 'Tamil Nadu',
          district: 'Dharmapuri',
          village: parsedPreview.extractedLocation,
        },
        possibleLevel: parsedPreview.possibleLevel,
        matchedProjectIds: parsedPreview.matchedExistingProjects?.map((m: any) => m.id) || [],
      });
      alert(`Grievance submitted successfully!\nTracking ID: ${created.trackingId}\nDistrict Collector nodal office notified.`);
      setRawText('');
      setParsedPreview(null);
      await loadComplaints();
      setSelectedComplaint(created);
    } catch (err) {
      console.error('Complaint submit error:', err);
    }
  };

  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdSearch.trim()) return;
    const found = complaints.find(c =>
      c.trackingId.toLowerCase().includes(trackingIdSearch.toLowerCase().trim())
    );
    if (found) {
      setSelectedComplaint(found);
    } else {
      alert(`No grievance found matching ID: ${trackingIdSearch}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Page Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Citizen Empowerment &amp; Social Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Citizen Grievance &amp; AI Assistant Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Lodge public infrastructure issues in plain words. Our AI categorizes your problem, checks ongoing works, and routes it to the District Collector.
            </p>
          </div>

          <form onSubmit={handleSearchTracking} className="flex items-center gap-2">
            <input
              type="text"
              value={trackingIdSearch}
              onChange={e => setTrackingIdSearch(e.target.value)}
              placeholder="Track Grievance ID (e.g. MPLADS-GRV-...)"
              className="px-3 py-1.5 bg-slate-800 text-xs text-white border border-slate-700 rounded-lg placeholder:text-slate-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Natural-Language Complaint Lodgement (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Describe Your Community Issue in Natural Words
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      No bureaucratic jargon needed. Speak or type freely.
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                  Gemini AI 3.8
                </span>
              </div>

              {/* Sample Prompts */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase block mb-1.5">
                  Try Sample Citizen Grievance:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'The RO drinking water plant at Pennagaram bus stand has stopped dispensing clean water for 2 weeks. The taps are leaking.',
                    'The newly constructed concrete link road to Sitheri tribal school developed major cracks after heavy monsoon rains.',
                    'Solar streetlights installed near Harur community center are not turning on at night.',
                  ].map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRawText(example)}
                      className="text-left text-[11px] p-2 bg-white hover:bg-blue-50 hover:text-blue-900 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                    >
                      &ldquo;{example.slice(0, 65)}...&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAiParse} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Your Location / Landmark:
                  </label>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={e => setUserLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Describe Problem / Issue:
                  </label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder="E.g., The RO drinking water purifier near our village school has broken filters. Around 400 children have no clean drinking water..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-800 text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!rawText.trim() || isParsing}
                  className="w-full py-3 bg-linear-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AI Parsing &amp; Duplicate Work Matching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Analyze Issue with AI Assistant</span>
                    </>
                  )}
                </button>
              </form>

              {/* Structured AI Output Review Card */}
              {parsedPreview && (
                <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Structured Citizen Dossier Prepared by AI</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-emerald-900 font-bold border border-emerald-200">
                      Ready for Citizen Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                      <span className="text-slate-400 block text-[10px]">Identified Category</span>
                      <strong className="text-slate-900">{parsedPreview.category}</strong>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                      <span className="text-slate-400 block text-[10px]">Assessed Severity</span>
                      <strong className={
                        parsedPreview.severity === 'Critical' || parsedPreview.severity === 'High'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }>
                        {parsedPreview.severity}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                      <span className="text-slate-400 block text-[10px]">Responsible Governance Level</span>
                      <strong className="text-slate-900">{parsedPreview.possibleLevel} Level</strong>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                      <span className="text-slate-400 block text-[10px]">Target Location</span>
                      <strong className="text-slate-900 truncate block">{parsedPreview.extractedLocation}</strong>
                    </div>
                  </div>

                  {parsedPreview.matchedExistingProjects?.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Existing Sanctioned Asset Found Nearby:</span>
                      </div>
                      {parsedPreview.matchedExistingProjects.map((m: any) => (
                        <div key={m.id} className="text-[11px] text-amber-800">
                          • {m.title} ({m.distanceOrReason})
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs">
                    <span className="text-slate-400 block text-[10px]">Formal Summary Note for District Collector</span>
                    <p className="text-slate-800 mt-1 leading-relaxed">
                      {parsedPreview.structuredSummary}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Human citizen confirms before final submission.
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmSubmit}
                      className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                    >
                      Confirm &amp; Lodge Official Grievance
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tracked Citizen Complaints & Lifecycles (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                My Grievance Tracking Lifecycle
              </h3>

              {selectedComplaint ? (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">TRACKING ID</span>
                      <strong className="text-sm font-mono text-blue-900">{selectedComplaint.trackingId}</strong>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                      selectedComplaint.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedComplaint.status === 'Action Taken'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedComplaint.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{selectedComplaint.problemTitle}</h4>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{selectedComplaint.description}</p>
                  </div>

                  {/* Grievance Timeline Stepper */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Resolution Stepper:
                    </span>
                    <div className="relative pl-5 border-l-2 border-slate-200 space-y-4">
                      {selectedComplaint.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full bg-blue-900 ring-4 ring-blue-100" />
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{item.status}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No grievance selected.
                </div>
              )}
            </div>

            {/* List of Other Public Grievances */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">
                Recent Public Grievances in Dharmapuri
              </h4>
              <div className="space-y-2 text-xs">
                {complaints.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      selectedComplaint?.id === c.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{c.trackingId}</span>
                      <span className="font-bold text-slate-700">{c.category}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs mt-1 truncate">
                      {c.problemTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
