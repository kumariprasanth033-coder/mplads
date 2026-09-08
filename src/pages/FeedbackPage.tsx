import React, { useState } from 'react';
import {
  Star,
  Send,
  MessageSquare,
  ThumbsUp,
  Award,
  CheckCircle2,
  Sparkles,
  MapPin,
  Building,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

interface FeedbackItem {
  id: string;
  name: string;
  village: string;
  projectCategory: string;
  rating: number;
  comment: string;
  date: string;
  verifiedCitizen: boolean;
}

export const FeedbackPage: React.FC<Props> = ({ onNavigate }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      name: 'R. Kaliappan',
      village: 'Pennagaram',
      projectCategory: 'Drinking Water',
      rating: 5,
      comment: 'The 20,000 LPH RO plant has completely eliminated fluoride TDS problems in our ward. Water is now crystal clean.',
      date: '2025-02-28',
      verifiedCitizen: true,
    },
    {
      id: 'fb-2',
      name: 'M. Selvi',
      village: 'Sitheri Hills',
      projectCategory: 'Road Construction',
      rating: 4,
      comment: 'The tribal link road has made ambulance access possible up the hill slopes. High quality bitumen work.',
      date: '2025-02-20',
      verifiedCitizen: true,
    },
    {
      id: 'fb-3',
      name: 'P. Arumugam',
      village: 'Morappur',
      projectCategory: 'School Building',
      rating: 5,
      comment: 'Smart classroom block in Panchayat Union Middle School completed ahead of schedule with solar backup.',
      date: '2025-02-14',
      verifiedCitizen: true,
    },
  ]);

  const [authorName, setAuthorName] = useState('');
  const [village, setVillage] = useState('Dharmapuri');
  const [category, setCategory] = useState('Drinking Water');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      name: authorName || 'Citizen Resident',
      village,
      projectCategory: category,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verifiedCitizen: true,
    };

    setFeedbacks([newItem, ...feedbacks]);
    setIsSuccess(true);
    setComment('');
    setAuthorName('');
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-full border border-slate-700 mb-3">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Citizen Satisfaction &amp; Social Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Asset Feedback &amp; Community Suggestions
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Share your direct experience with MPLADS infrastructure in your Panchayat or recommend new public amenities to your Member of Parliament.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-slate-400 text-xs block font-medium">Average Public Rating</span>
            <div className="text-3xl font-extrabold text-amber-500 mt-1 flex items-center justify-center gap-1">
              <span>{avgRating}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Based on verified reviews</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-slate-400 text-xs block font-medium">Citizen Submissions</span>
            <div className="text-3xl font-extrabold text-blue-900 mt-1">{feedbacks.length}</div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">100% Synced to Nodal DRDA</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-xs">
            <span className="text-slate-400 text-xs block font-medium">Highest Rated Sector</span>
            <div className="text-xl font-extrabold text-slate-800 mt-2">Drinking Water Plants</div>
            <span className="text-[11px] text-slate-500 mt-1 block">4.9 / 5.0 satisfaction</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Submit Your Experience</h3>
              <p className="text-xs text-slate-500 mb-4">
                Your feedback directly informs the District Social Audit Committee and the MP Local Office.
              </p>

              {isSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you! Your feedback has been recorded in the public registry.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. R. Subramanian"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Panchayat / Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Infrastructure Sector</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Drinking Water">Drinking Water Facility</option>
                    <option value="Road Construction">Road &amp; Bridge Infrastructure</option>
                    <option value="School Building">School &amp; Education Facility</option>
                    <option value="Sanitation & Public Health">Sanitation &amp; Health Center</option>
                    <option value="Community Infrastructure">Community Hall / Solar Lighting</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Overall Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Community Comments</label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Describe how this infrastructure has served your community or what improvements are required..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Feedback</span>
                </button>
              </form>
            </div>
          </div>

          {/* List Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Recent Public Experiences ({feedbacks.length})</h3>

            <div className="space-y-3">
              {feedbacks.map(f => (
                <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{f.name}</span>
                        {f.verifiedCitizen && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified Resident
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{f.village} • {f.projectCategory}</span>
                      </span>
                    </div>

                    <div className="flex items-center">
                      {[...Array(f.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &ldquo;{f.comment}&rdquo;
                  </p>

                  <div className="text-[10px] text-slate-400 text-right mt-2">
                    Submitted on {f.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
