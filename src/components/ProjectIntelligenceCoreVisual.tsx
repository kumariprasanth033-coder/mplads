import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Landmark,
  Layers,
  FileCheck2,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PrecheckRecommendation } from '../types';

interface IntelligenceNode {
  id: string;
  name: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  activeColor: string;
  angle: number; // degrees
}

const NODES: IntelligenceNode[] = [
  {
    id: 'duplicate',
    name: 'Duplicate Detection',
    short: 'Duplicate',
    icon: Copy,
    description: 'Semantic vector NLP & GPS proximity cross-matching with sanctioned repository',
    color: 'border-blue-300 text-blue-800 bg-blue-50/90',
    activeColor: 'border-blue-600 ring-4 ring-blue-100 bg-blue-600 text-white',
    angle: 300,
  },
  {
    id: 'funding',
    name: 'Funding Overlap',
    short: 'Funding',
    icon: Landmark,
    description: 'State treasury, Central grants & municipal co-funding non-duplication scan',
    color: 'border-amber-300 text-amber-800 bg-amber-50/90',
    activeColor: 'border-amber-600 ring-4 ring-amber-100 bg-amber-600 text-white',
    angle: 0,
  },
  {
    id: 'scope',
    name: 'Problem Scope',
    short: 'Scope',
    icon: Layers,
    description: 'Local vs District vs State asset jurisdiction & MPLADS guideline eligibility',
    color: 'border-purple-300 text-purple-800 bg-purple-50/90',
    activeColor: 'border-purple-600 ring-4 ring-purple-100 bg-purple-600 text-white',
    angle: 60,
  },
  {
    id: 'convergence',
    name: 'Scheme Convergence',
    short: 'Convergence',
    icon: ShieldCheck,
    description: 'Jal Jeevan Mission, PMGSY, Samagra Shiksha & SBM co-leveraging matrix',
    color: 'border-emerald-300 text-emerald-800 bg-emerald-50/90',
    activeColor: 'border-emerald-600 ring-4 ring-emerald-100 bg-emerald-600 text-white',
    angle: 120,
  },
  {
    id: 'documents',
    name: 'Document Intelligence',
    short: 'Documents',
    icon: FileCheck2,
    description: 'DPR, administrative sanction, title deed & technical estimates OCR validation',
    color: 'border-teal-300 text-teal-800 bg-teal-50/90',
    activeColor: 'border-teal-600 ring-4 ring-teal-100 bg-teal-600 text-white',
    angle: 180,
  },
  {
    id: 'risk',
    name: 'Risk & Predictives',
    short: 'Risk',
    icon: AlertTriangle,
    description: 'Schedule rate deviation, milestone anomaly & historical agency delay score',
    color: 'border-rose-300 text-rose-800 bg-rose-50/90',
    activeColor: 'border-rose-600 ring-4 ring-rose-100 bg-rose-600 text-white',
    angle: 240,
  },
];

interface Props {
  isScanning?: boolean;
  currentStep?: number;
  recommendation?: PrecheckRecommendation | null;
  onNodeSelect?: (nodeId: string) => void;
  interactive?: boolean;
}

export const ProjectIntelligenceCoreVisual: React.FC<Props> = ({
  isScanning = false,
  currentStep = -1,
  recommendation = null,
  onNodeSelect,
  interactive = true,
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('duplicate');
  const [activeStep, setActiveStep] = useState<number>(currentStep);

  useEffect(() => {
    if (currentStep >= 0) {
      setActiveStep(currentStep);
    }
  }, [currentStep]);

  // Demo auto scan cycle if not driven by props
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % (NODES.length + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [isScanning]);

  const radius = 150; // px
  const center = 210; // px

  const activeNode = NODES.find(n => n.id === selectedNode) || NODES[0];

  return (
    <div className="w-full bg-linear-to-b from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      {/* Background Indian Emblem & Geometry Motif */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full border-8 border-dashed border-white animate-spin-slow" />
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase font-mono">
              FLAGSHIP SIH INNOVATION
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Before Fund Release — Project Intelligence Core
          </h3>
          <p className="text-sm text-slate-300">
            Explainable multi-pillar validation engine. Assisting human officers prior to sanction.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs text-amber-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Human Decision Remains Final</span>
        </div>
      </div>

      {/* Orbital Diagram + Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        {/* SVG Orbital Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-[340px] h-[340px] sm:w-[420px] h-[420px] flex items-center justify-center">
            {/* SVG Connecting Web Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 420 420"
            >
              {/* Concentric orbital rings */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(148, 163, 184, 0.18)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={center}
                cy={center}
                r={radius * 0.55}
                fill="none"
                stroke="rgba(59, 130, 246, 0.15)"
                strokeWidth="1"
              />

              {/* Connecting spokes */}
              {NODES.map((node, i) => {
                const rad = (node.angle * Math.PI) / 180;
                const x = center + radius * Math.cos(rad);
                const y = center + radius * Math.sin(rad);
                const isNodeActive = activeStep === i || selectedNode === node.id;
                return (
                  <g key={node.id}>
                    <line
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke={isNodeActive ? 'rgba(52, 211, 153, 0.8)' : 'rgba(148, 163, 184, 0.25)'}
                      strokeWidth={isNodeActive ? 2.5 : 1.2}
                      strokeDasharray={isScanning && activeStep === i ? '6 3' : 'none'}
                      className={isScanning && activeStep === i ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central AI Nucleus */}
            <div
              className={`absolute z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-500 ${
                isScanning
                  ? 'bg-linear-to-tr from-emerald-600 to-teal-500 ring-8 ring-emerald-500/30 animate-pulse'
                  : 'bg-linear-to-tr from-blue-700 via-indigo-700 to-slate-900 ring-4 ring-blue-500/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-widest text-white">AI CORE</span>
              <span className="text-[10px] text-emerald-200 font-mono">
                {isScanning ? 'SCANNING...' : 'READY'}
              </span>
            </div>

            {/* Orbiting Satellite Nodes */}
            {NODES.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              // Scale coordinates based on 420px view
              const x = center + radius * Math.cos(rad);
              const y = center + radius * Math.sin(rad);
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              const isStepActive = activeStep === i;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setSelectedNode(node.id);
                    onNodeSelect?.(node.id);
                  }}
                  style={{
                    left: `${(x / 420) * 100}%`,
                    top: `${(y / 420) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-30 transition-all duration-300 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-lg cursor-pointer ${
                    isStepActive
                      ? node.activeColor + ' scale-110 shadow-emerald-500/30 ring-4 ring-white/50'
                      : isSelected
                      ? 'bg-white text-slate-900 ring-2 ring-emerald-400 font-semibold scale-105'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white'
                  }`}
                  aria-label={node.name}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isStepActive || isSelected ? 'bg-black/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium pr-1 whitespace-nowrap hidden sm:inline">
                    {node.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scanner legend status */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Real-time Cross-Verification Active
            </span>
            <span className="text-slate-400">•</span>
            <span>6 Verification Pillars</span>
          </div>
        </div>

        {/* Pillar Details Card */}
        <div className="lg:col-span-5 bg-slate-850/80 border border-slate-700 rounded-xl p-5 sm:p-6 backdrop-blur-xs flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Pillar Details
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                {activeNode.id.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <activeNode.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {activeNode.name}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">MPLADS Operational Layer</p>
              </div>
            </div>

            <p className="text-sm text-slate-200 mt-4 leading-relaxed">
              {activeNode.description}
            </p>

            {/* Checklist of what this node verifies */}
            <div className="mt-5 space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Automated Verification Scope:
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Deterministic database index lookup against all 543 constituencies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Deep semantic NLP similarity evaluation using Gemini 3.8</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>GPS radius proximity check (&lt; 200 meters alert threshold)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Recommendation Banner if provided */}
          {recommendation ? (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-300 mb-1">AI Recommendation Output:</div>
              <div
                className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-between ${
                  recommendation === 'PROCEED'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    : recommendation === 'CONSIDER CONVERGENCE'
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                    : recommendation === 'HOLD FOR VERIFICATION'
                    ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                    : 'bg-rose-900/60 text-rose-300 border border-rose-700'
                }`}
              >
                <span>{recommendation}</span>
                <Info className="w-4 h-4 opacity-80" />
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
              <span>Select any node to inspect criteria</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                Active Scanner <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
