import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Landmark,
  Layers,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Info,
  Building,
  MapPin,
  FileText,
  DollarSign,
  TrendingDown,
  Download,
  Printer,
  Check,
} from 'lucide-react';
import { ProjectIntelligenceCoreVisual } from '../components/ProjectIntelligenceCoreVisual';
import { api } from '../services/api';
import { PrecheckInput, PrecheckResult } from '../types';

interface Props {
  onNavigate: (path: string) => void;
}

export const AiPrecheckPage: React.FC<Props> = ({ onNavigate }) => {
  const [form, setForm] = useState<PrecheckInput>({
    projectName: 'Construction of 20,000 LPH RO Drinking Water Filtration Plant at Pennagaram Shandy',
    category: 'Drinking Water',
    estimatedCostLakhs: 22.5,
    location: 'Pennagaram Shandy Market Ground, Dharmapuri',
    district: 'Dharmapuri',
    state: 'Tamil Nadu',
    constituency: 'Dharmapuri',
    description: 'Establishment of community commercial grade reverse osmosis purification plant to resolve persistent high-fluoride ground water contamination for 4,200 rural households.',
    proposedBy: 'Dr. A. Senthilkumar (MP Dharmapuri)',
    department: 'Rural Development & Panchayat Raj',
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(-1);
  const [result, setResult] = useState<PrecheckResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'duplicate' | 'convergence' | 'funding' | 'documents' | 'risk'>('summary');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadReport = () => {
    if (!result) return;

    const reportContent = `================================================================================
GOVERNMENT OF INDIA - MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)
MPLADS E-SAKSHI 2.0 • AI PRE-CHECK & STATUTORY DUE DILIGENCE REPORT
================================================================================
Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
Report Reference: MPLADS-AIPC-${Date.now().toString().slice(-8)}
Status: STATUTORY PRE-SANCTION INTELLIGENCE ADVISORY (NON-BINDING)

--------------------------------------------------------------------------------
1. PROPOSED WORK PARAMETERS (DETAILED PROJECT REPORT)
--------------------------------------------------------------------------------
Project Title        : ${form.projectName}
Sector / Category    : ${form.category}
Estimated Outlay     : ₹${form.estimatedCostLakhs} Lakhs
Location / Site      : ${form.location}
Administrative Unit  : District ${form.district}, State: ${form.state}
Constituency         : ${form.constituency}
Recommended By       : ${form.proposedBy || 'Hon’ble Member of Parliament'}
Executing Department : ${form.department || 'District Rural Development Agency (DRDA)'}
Impact Description   : ${form.description}

--------------------------------------------------------------------------------
2. AI DECISION SUPPORT EVALUATION
--------------------------------------------------------------------------------
AI Recommendation    : ${result.recommendation}
Confidence Score     : ${result.overallConfidence}%
Executive Summary    : ${result.summary}

--------------------------------------------------------------------------------
3. PILLAR I: GEOSPATIAL PROXIMITY & DUPLICATION DETECTION
--------------------------------------------------------------------------------
Duplication Risk     : ${result.duplicateCheck.score}% (${result.duplicateCheck.hasFlag ? 'FLAGGED FOR ATTENTION' : 'CLEARED - NO OVERLAP'})
Semantic Match       : ${result.duplicateCheck.semanticSimilarity}%
Geographic Proximity : ${result.duplicateCheck.locationSimilarity}%
Category Match       : ${result.duplicateCheck.categorySimilarity}%
Nearby Works Checked : ${result.duplicateCheck.matchedProjects?.length || 0} existing sanctioned assets
${result.duplicateCheck.matchedProjects?.map((m: any, i: number) => `  ${i + 1}. ${m.title} [${m.similarity}% match] - ${m.reason}`).join('\n') || '  No conflicting projects detected within 5km radius.'}

--------------------------------------------------------------------------------
4. PILLAR II: SCHEME CONVERGENCE OPPORTUNITY
--------------------------------------------------------------------------------
Convergence Score    : ${result.convergenceCheck.convergenceScore}%
Savings Potential    : ₹${result.convergenceCheck.savingsPotentialLakhs} Lakhs
Eligible Schemes     : ${result.convergenceCheck.eligibleSchemes.join(', ')}
Convergence Advisory : ${result.convergenceCheck.suggestions}

--------------------------------------------------------------------------------
5. PILLAR III: TREASURY & FUNDING WINDOWS
--------------------------------------------------------------------------------
Treasury Analysis    : ${result.existingFundingCheck.notes}
Identified Windows   : ${result.existingFundingCheck.identifiedSources.join(', ')}

--------------------------------------------------------------------------------
6. PILLAR IV: DOCUMENTATION & STATUTORY AUDIT READINESS
--------------------------------------------------------------------------------
Completeness Score   : ${result.documentCheck.completenessScore}% (${result.documentCheck.status})
Audit Notes          : ${result.documentCheck.analysis}
Pending Documents    :
${result.documentCheck.missingDocuments.map((doc: string, idx: number) => `  [ ] ${idx + 1}. ${doc}`).join('\n')}

--------------------------------------------------------------------------------
7. PILLAR V: RISK INDEX & SCHEDULE SLIPPAGE ANALYSIS
--------------------------------------------------------------------------------
Risk Index           : ${result.riskAnalysis.score} / 100 (${result.riskAnalysis.level} RISK)
Identified Risk Factors:
${result.riskAnalysis.factors.map((f: string, idx: number) => `  • ${f}`).join('\n')}

================================================================================
STATUTORY GOVERNANCE DISCLAIMER:
This report represents automated algorithmic intelligence provided by the DRISHTI
AI Pre-Check engine. In strict accordance with Ministry guidelines, human authority
vests conclusively in the District Collector / Competent Financial Sanctioning Officer.
================================================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MPLADS_Precheck_Report_${form.district}_${Date.now().toString().slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleRunAnalysis = async (customInput?: PrecheckInput) => {
    const dataToSubmit = customInput || form;
    setIsScanning(true);
    setResult(null);
    setScanStep(0);

    // Sequential step simulation for presentation suspense
    const stepInterval = setInterval(() => {
      setScanStep(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const res = await api.runAiPrecheck(dataToSubmit);
      // Ensure scanner completes full cycle
      setTimeout(() => {
        clearInterval(stepInterval);
        setScanStep(6);
        setResult(res);
        setIsScanning(false);
      }, 3600);
    } catch (err) {
      console.error('Precheck error:', err);
      clearInterval(stepInterval);
      setIsScanning(false);
    }
  };

  const loadSampleDuplicate = () => {
    const duplicateData: PrecheckInput = {
      projectName: 'Solar Powered RO Drinking Water Purification Plant at Pennagaram Bus Stand',
      category: 'Drinking Water',
      estimatedCostLakhs: 18.0,
      location: 'Pennagaram Bus Stand Main Entrance, Dharmapuri',
      district: 'Dharmapuri',
      state: 'Tamil Nadu',
      constituency: 'Dharmapuri',
      description: 'Community RO water facility installation at the entrance of Pennagaram bus terminal.',
      proposedBy: 'MP Local Office',
      department: 'Town Panchayat & Water Supply',
    };
    setForm(duplicateData);
    handleRunAnalysis(duplicateData);
  };

  const loadSampleConvergence = () => {
    const convData: PrecheckInput = {
      projectName: 'BT Link Road from Sitheri Hill Foothills to Mottankurichi Hamlet',
      category: 'Road Construction',
      estimatedCostLakhs: 48.0,
      location: 'Sitheri Hills Tribal Area, Harur Block, Dharmapuri',
      district: 'Dharmapuri',
      state: 'Tamil Nadu',
      constituency: 'Dharmapuri',
      description: 'Construction of all-weather blacktopped road connecting remote tribal hamlets with healthcare center.',
      proposedBy: 'Panchayat Union Council',
      department: 'Highways & Rural Works',
    };
    setForm(convData);
    handleRunAnalysis(convData);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Flagship SIH Module • Operational Pre-Sanction Layer</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
              Before Fund Release — Project Intelligence Core
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              An explainable multi-pillar validation engine. Evaluates proposed works across duplicate repositories, treasury overlap, scheme convergence, jurisdictional scope, document completeness, and contractor risk before administrative sanction.
            </p>
          </div>

          <div className="bg-amber-950/70 border border-amber-800/80 p-3 rounded-xl flex items-center gap-3 shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <div className="font-bold text-white">Constitutional Boundary:</div>
              <span>Human Decision Remains Final</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Orbital Visualization Component */}
        <div className="shadow-2xl rounded-2xl">
          <ProjectIntelligenceCoreVisual
            isScanning={isScanning}
            currentStep={scanStep}
            recommendation={result?.recommendation}
          />
        </div>

        {/* Input Form & Demo Pre-sets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-slate-100">
                  Proposed Project Intelligence Parameters
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-indigo-950/80 text-indigo-300 font-mono font-medium border border-indigo-800/50">
                DPR Form
              </span>
            </div>

            {/* Quick Demo Pre-sets for Jury Showcase */}
            <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ⚡ Interactive SIH Jury Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadSampleDuplicate}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Test Duplicate Detection Flag</span>
                </button>
                <button
                  type="button"
                  onClick={loadSampleConvergence}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Scheme Convergence Flag</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleRunAnalysis();
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Proposed Project Title / Scope of Work *
                </label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={e => setForm({ ...form, projectName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Sector / Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-100"
                  >
                    <option value="Drinking Water">Drinking Water</option>
                    <option value="Road Construction">Road Construction</option>
                    <option value="School Building">School Building</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Community Hall">Community Hall</option>
                    <option value="Health & Family Welfare">Health & Family Welfare</option>
                    <option value="Non-Conventional Energy">Non-Conventional Energy</option>
                    <option value="Irrigation & Flood Control">Irrigation & Flood Control</option>
                    <option value="Other Public Utilities">Other Public Utilities</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Estimated Outlay (₹ Lakhs) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.estimatedCostLakhs}
                    onChange={e => setForm({ ...form, estimatedCostLakhs: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Specific Village / Site Landmark *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">District / State *</label>
                  <input
                    type="text"
                    value={`${form.district}, ${form.state}`}
                    disabled
                    className="w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950/60 text-slate-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Justification / Community Impact Description *
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full py-3 px-4 bg-linear-to-r from-blue-700 via-indigo-700 to-slate-800 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-500/30"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Scanning 6 Verification Pillars with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Execute Pre-Check Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: AI Analysis Result Output */}
          <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    AI DECISION SUPPORT ADVISORY
                  </span>
                  <h3 className="font-bold text-base text-slate-100">
                    Comprehensive Intelligence Report
                  </h3>
                </div>
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      title="Download Official Pre-Check Report"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer border border-indigo-400/40"
                    >
                      {downloadSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Downloaded!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-indigo-100" />
                          <span>Download Report</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 font-mono font-bold border border-emerald-700/60">
                      {result.overallConfidence}% Conf.
                    </span>
                  </div>
                )}
              </div>

              {!result && !isScanning && (
                <div className="py-16 text-center text-slate-500">
                  <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="font-semibold text-slate-300 text-sm">
                    No Analysis Run Yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Fill in the DPR parameters or click one of the interactive scenario buttons above to trigger the 6-pillar intelligence evaluation.
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      Executing Cross-Repository Verification...
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Querying geospatial proximity, central scheme convergence databases, and historical rate schedules.
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-4 space-y-4">
                  {/* Recommendation Card */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      result.recommendation === 'PROCEED'
                        ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200'
                        : result.recommendation === 'CONSIDER CONVERGENCE'
                        ? 'bg-blue-950/60 border-blue-600/70 text-blue-200'
                        : result.recommendation === 'HOLD FOR VERIFICATION'
                        ? 'bg-amber-950/60 border-amber-600/70 text-amber-200'
                        : 'bg-rose-950/60 border-rose-600/70 text-rose-200'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        AI Recommended Disposition:
                      </div>
                      <div className="text-xl font-extrabold tracking-tight mt-0.5 text-white">
                        {result.recommendation}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed text-slate-200 max-w-md">
                        {result.summary}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] block font-mono font-bold text-slate-400">STATUTORY NOTICE</span>
                      <span className="text-[11px] font-semibold text-slate-200 bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700">
                        Non-Binding Advisory
                      </span>
                    </div>
                  </div>

                  {/* Navigation Tabs for 6 Pillars */}
                  <div className="flex border-b border-slate-800 text-xs gap-1 overflow-x-auto">
                    {[
                      { id: 'summary', label: 'Overview' },
                      { id: 'duplicate', label: `Duplicate (${result.duplicateCheck.overallSimilarity}%)` },
                      { id: 'convergence', label: `Convergence (${result.convergenceCheck.convergenceScore}%)` },
                      { id: 'funding', label: 'Treasury' },
                      { id: 'documents', label: 'Documents' },
                      { id: 'risk', label: `Risk (${result.riskAnalysis.score}/100)` },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveResultTab(tab.id as any)}
                        className={`px-3 py-2 font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                          activeResultTab === tab.id
                            ? 'border-indigo-400 text-indigo-300'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="text-xs text-slate-300">
                    {activeResultTab === 'summary' && (
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Duplicate Risk Score</span>
                            <span className="text-base font-bold text-slate-100">
                              {result.duplicateCheck.score}%
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {result.duplicateCheck.hasFlag ? '⚠️ Flagged for proximity overlap' : '✓ No direct duplicate found'}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Convergence Potential</span>
                            <span className="text-base font-bold text-emerald-400">
                              ₹{result.convergenceCheck.savingsPotentialLakhs} Lakhs
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Eligible for co-funding schemes
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Jurisdiction &amp; Scope</span>
                          <p className="text-xs text-slate-200 mt-0.5 font-medium">
                            {result.problemScopeCheck.scopeLevel} Level — {result.problemScopeCheck.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeResultTab === 'duplicate' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Semantic Match: <strong className="text-slate-100">{result.duplicateCheck.semanticSimilarity}%</strong></span>
                          <span>Geographic Proximity: <strong className="text-slate-100">{result.duplicateCheck.locationSimilarity}%</strong></span>
                          <span>Category: <strong className="text-slate-100">{result.duplicateCheck.categorySimilarity}%</strong></span>
                        </div>

                        <div className="text-xs font-bold text-slate-200 mt-2">
                          Existing Nearby / Similar Projects in Repository:
                        </div>
                        {result.duplicateCheck.matchedProjects.map(m => (
                          <div key={m.id} className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-100">{m.title}</div>
                              <div className="text-[11px] text-slate-400">{m.reason}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              m.similarity > 60 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {m.similarity}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeResultTab === 'convergence' && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {result.convergenceCheck.suggestions}
                        </p>
                        <div className="text-xs font-bold text-slate-200">
                          Identified Central / State Convergence Schemes:
                        </div>
                        <div className="space-y-1.5">
                          {result.convergenceCheck.eligibleSchemes.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-950/40 rounded border border-emerald-800/60 text-emerald-200 text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeResultTab === 'funding' && (
                      <div className="space-y-3 pt-2">
                        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Treasury Status</span>
                          <span className="font-bold text-slate-200 block text-xs mt-0.5">
                            {result.existingFundingCheck.notes}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-200">Permitted Funding Windows:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.existingFundingCheck.identifiedSources.map((src, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-slate-300 text-xs font-mono">
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeResultTab === 'documents' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Document Completeness: <strong className="text-slate-100">{result.documentCheck.completenessScore}%</strong></span>
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[10px]">
                            {result.documentCheck.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{result.documentCheck.analysis}</p>
                        <div className="text-xs font-bold text-slate-200">Required Documents Pending Upload:</div>
                        <ul className="space-y-1">
                          {result.documentCheck.missingDocuments.map((doc, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-rose-400 text-xs">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeResultTab === 'risk' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Calculated Risk Level: <strong className="text-rose-400">{result.riskAnalysis.level}</strong></span>
                          <span className="font-mono font-bold text-xs text-slate-200">{result.riskAnalysis.score} / 100</span>
                        </div>
                        <div className="space-y-1">
                          {result.riskAnalysis.factors.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950/70 rounded border border-slate-800 text-xs text-slate-300">
                              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Human Decision Remains Final</span>
              </span>
              <div className="flex items-center gap-3">
                {result && (
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Report (.txt)</span>
                  </button>
                )}
                <span>MPLADS Guideline Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
