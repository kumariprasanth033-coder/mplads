import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintRecord } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const ComplaintsPage: React.FC<Props> = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);

  // New Grievance Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [problemTitle, setProblemTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Drinking Water');
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [village, setVillage] = useState('Pennagaram');
  const [district, setDistrict] = useState('Dharmapuri');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await api.getComplaints({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
      });
      setComplaints(data);
      if (data.length > 0 && !selectedComplaint) {
        setSelectedComplaint(data[0]);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadComplaints();
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await api.createComplaint({
        problemTitle,
        description,
        category,
        citizenName: citizenName || 'Public Citizen',
        citizenEmail: citizenEmail || 'citizen@example.com',
        location: { state: 'Tamil Nadu', district, village },
        severity: 'Medium',
      });
      alert(`Grievance submitted successfully!\nTracking ID: ${created.trackingId}\nDistrict Collector nodal office notified.`);
      setShowNewModal(false);
      setProblemTitle('');
      setDescription('');
      await loadComplaints();
      setSelectedComplaint(created);
    } catch (err) {
      console.error('Error submitting grievance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Social Audit &amp; Public Grievance Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Public Grievances &amp; Asset Quality Feedback
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Citizens can lodge grievances concerning non-functional assets, construction delays, or rate irregularities. Real-time tracking from Gram Panchayat to District Collectorate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Lodge New Grievance</span>
            </button>
            <button
              onClick={() => onNavigate('/dashboard/citizen')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Voice/Text Assistant</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xs p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Tracking ID (e.g. MPLADS-GRV-2025-4812), location, or problem keywords..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:bg-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 font-medium focus:outline-hidden"
              >
                <option value="">All Categories</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Road Construction">Road Construction</option>
                <option value="School Building">School Building</option>
                <option value="Sanitation & Public Health">Sanitation &amp; Public Health</option>
                <option value="Community Infrastructure">Community Infrastructure</option>
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 font-medium focus:outline-hidden"
              >
                <option value="">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Resolved">Resolved</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* 2-Column Grievance Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Grievance List (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            {isLoading ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs">Loading grievance registry...</span>
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center text-slate-500">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-200">No Grievances Match Criteria</h4>
                <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or search query.</p>
              </div>
            ) : (
              complaints.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-slate-800 ${
                    selectedComplaint?.id === c.id
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-100'
                      : 'border-slate-700 hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-blue-900 text-[11px]">{c.trackingId}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Action Taken'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100">{c.problemTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{c.location.village}, {c.location.district}</span>
                    </span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Selected Grievance Timeline Stepper (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xs p-6 sticky top-24">
              {selectedComplaint ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Tracking ID</span>
                      <strong className="text-base font-mono text-blue-900">{selectedComplaint.trackingId}</strong>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
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
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Issue Title</span>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedComplaint.problemTitle}</h3>
                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sector Category</span>
                      <strong className="text-slate-200">{selectedComplaint.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assessed Severity</span>
                      <strong className="text-amber-700">{selectedComplaint.severity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jurisdiction</span>
                      <strong className="text-slate-200">{selectedComplaint.location.district}, {selectedComplaint.location.state}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submitted Date</span>
                      <strong className="text-slate-200">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  {/* Resolution Stepper */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      District Collectorate Resolution Stepper
                    </span>
                    <div className="relative pl-5 border-l-2 border-slate-700 space-y-4">
                      {selectedComplaint.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full bg-blue-900 ring-4 ring-blue-100" />
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>{item.status}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{item.note}</p>
                          {item.officer && (
                            <span className="text-[10px] text-blue-800 font-medium block mt-0.5">
                              Action Officer: {item.officer}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Select a grievance from the left to view timeline &amp; resolution steps.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Grievance Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100">Lodge Citizen Grievance</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={problemTitle}
                  onChange={e => setProblemTitle(e.target.value)}
                  placeholder="e.g. RO Drinking Water Plant Motor Burnt Out"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden"
                >
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Road Construction">Road Construction</option>
                  <option value="School Building">School Building</option>
                  <option value="Sanitation & Public Health">Sanitation &amp; Public Health</option>
                  <option value="Community Infrastructure">Community Infrastructure</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Village / Ward</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide exact details of the defect, duration of issue, and impact on local residents..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-200 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
