import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Bell,
  Globe,
  Database,
  CheckCircle2,
  ShieldCheck,
  Save,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<Props> = ({ onNavigate }) => {
  const [duplicateThreshold, setDuplicateThreshold] = useState(65);
  const [geoRadiusKm, setGeoRadiusKm] = useState(5);
  const [riskTriggerScore, setRiskTriggerScore] = useState(70);
  const [language, setLanguage] = useState('English');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsGateway, setSmsGateway] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>Platform Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              System Settings &amp; AI Thresholds
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Fine-tune automated pre-check sensitivity, notification channels, and localization preferences.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
              Environment: <strong>SIH PROTOTYPE</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {isSaved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Platform configuration saved successfully. AI sensitivity thresholds updated in session.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* AI Decision-Support Parameters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Pre-Check Sensitivity Parameters</span>
            </h2>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Semantic Duplicate Match Threshold</span>
                  <span className="font-mono text-blue-900 font-bold">{duplicateThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={duplicateThreshold}
                  onChange={e => setDuplicateThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Proposals matching above this similarity percentage trigger an automatic duplicate caution for the District Collector.
                </span>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Geographic Proximity Radius for Asset Collision</span>
                  <span className="font-mono text-blue-900 font-bold">{geoRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={geoRadiusKm}
                  onChange={e => setGeoRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Radial distance to scan for existing sanctioned assets of identical category.
                </span>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Statutory Audit Risk Score Trigger</span>
                  <span className="font-mono text-rose-700 font-bold">{riskTriggerScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={riskTriggerScore}
                  onChange={e => setRiskTriggerScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-700"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Threshold score to elevate a project into the CAG Auditor Anomaly Queue.
                </span>
              </div>
            </div>
          </div>

          {/* Localization & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-900" />
                <span>Language &amp; Region</span>
              </h2>

              <div className="mt-4 text-xs space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Display Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
                  >
                    <option value="English">English (Official Standard)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Tamil">தமிழ் (Tamil - Dharmapuri Focus)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                  </select>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Citizen complaint natural language processor auto-detects Tamil, Hindi, and English input text.
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Alert Channels</span>
              </h2>

              <div className="mt-4 text-xs space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={e => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="text-slate-700">Official NIC Email Notifications</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsGateway}
                    onChange={e => setSmsGateway(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="text-slate-700">SMS Gateway Sanction Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappUpdates}
                    onChange={e => setWhatsappUpdates(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="text-slate-700">Citizen WhatsApp Grievance Progress Updates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Database Mode Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-700" />
              <span>Data Persistence &amp; Prototype Mode</span>
            </h2>
            <div className="mt-3 text-xs text-slate-600 leading-relaxed flex items-center justify-between">
              <div>
                <strong>Active Data Layer:</strong> SIH DEMO DATA (In-Memory Session Database)
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All created projects, grievances, photos, and decisions remain persistent across views during the evaluation session.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                Active
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
