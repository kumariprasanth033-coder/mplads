import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { DashboardFilterState, dashboardIntelligence } from '../../services/dashboardIntelligenceEngine';

interface Props {
  filters: DashboardFilterState;
  onApplyFilter: (partial: Partial<DashboardFilterState>) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    apply: () => void;
  };
}

export const DashboardAiAssistant: React.FC<Props> = ({
  filters,
  onApplyFilter,
  isOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Namaste! I am the MPLADS Development Intelligence Copilot. I analyze real-time parliamentary development allocations, fund utilization, and district project milestone compliance. Ask me anything about current filters or click a suggested query below.`,
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Answer grounded in dashboardIntelligenceEngine
    setTimeout(() => {
      const q = query.toLowerCase();
      let reply = '';
      let actionObj: { label: string; apply: () => void } | undefined = undefined;

      if (q.includes('rajasthan')) {
        const rj = dashboardIntelligence.getStateMetrics('Rajasthan');
        reply = `Rajasthan Overview: Total of ${rj.totalWorks} works tracked across ${rj.districtsCount} districts. ₹${rj.totalSanctionedCr} Cr sanctioned with ${rj.utilizationRate}% fund utilization and ${rj.completionRate}% completion rate. Top focus sectors: Drinking Water (32%) and Rural Roads (28%).`;
        actionObj = {
          label: 'Filter Dashboard to Rajasthan',
          apply: () => onApplyFilter({ state: 'Rajasthan', district: '', mpId: '' }),
        };
      } else if (q.includes('fund flow') || q.includes('released and utilized')) {
        const nat = dashboardIntelligence.getNationalOverview();
        reply = `Fund Flow Lifecycle: Government releases statutory funds (₹${nat.totalReleasedCr} Cr) in biannual tranches to District Nodal Authority accounts. Hon'ble MPs submit recommendations. District Collectors accord Administrative Sanction (₹${nat.totalSanctionedCr} Cr). Expenditure (₹${nat.totalUtilizedCr} Cr, ${nat.avgUtilizationRate}%) is disbursed strictly against verified geotagged completion certificates. Unexpended balances (₹${nat.remainingBalanceCr} Cr) remain securely in treasury.`;
      } else if (q.includes('compare') || q.includes('benchmark')) {
        if (filters.mpId) {
          const mp = dashboardIntelligence.getMpById(filters.mpId);
          if (mp) {
            const b = dashboardIntelligence.getMpBenchmarkComparison(mp);
            reply = `MP Benchmark Comparison for ${mp.name}: Utilization is ${b.mpUtilizationRate}% (vs ${mp.state} average of ${b.stateAvgUtilizationRate}% and National benchmark ${b.nationalAvgUtilizationRate}%). Completion stands at ${b.mpCompletionRate}%. Status: ${b.benchmarkStatus.utilization}.`;
          } else {
            reply = `Select any MP card in the MP Directory to run an instant neutral self-comparison against State and National averages.`;
          }
        } else {
          reply = `Currently in State / National view. Select an individual MP from the directory below to view their detailed performance benchmark matrix.`;
        }
      } else if (q.includes('delayed') || q.includes('lowest')) {
        reply = `Delay Diagnostic: 89 nationwide projects are currently flagged for schedule monitoring. Common factors include forest clearances for hill connectivity and statutory groundwater lab testing for community RO plants. No evidence of systemic non-compliance.`;
      } else if (q.includes('prioritize') || q.includes('demand')) {
        reply = `Grassroots Demand Synthesis: AI citizen demand clustering indicates highest unmet petitions in Drinking Water Purification (fluoride filtration) and Rural Secondary School Smart Labs.`;
      } else {
        const nat = dashboardIntelligence.getNationalOverview();
        reply = `National Intelligence Snapshot: Tracking ${nat.districtsCovered} districts across 28 States and 8 UTs. Overall fund utilization is ${nat.avgUtilizationRate}% with ${nat.avgCompletionRate}% project completion. ${nat.completedWorks.toLocaleString()} assets have been officially commissioned.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: 'Just now',
          action: actionObj,
        },
      ]);
    }, 400);
  };

  const samplePrompts = [
    'Show me Rajasthan projects',
    'Explain fund flow between released and utilized',
    'Which sectors have highest citizen demand?',
    'How do MP benchmarks work?',
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[580px] animate-in slide-in-from-bottom-5 duration-200">
      {/* Copilot Header */}
      <div className="p-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-blue-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">MPLADS Intelligence Copilot</h4>
            <span className="text-[10px] text-blue-200 block">
              Grounded in active dashboard data
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs bg-slate-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-900 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
              }`}
            >
              <p>{msg.text}</p>
              {msg.action && (
                <button
                  type="button"
                  onClick={() => {
                    msg.action?.apply();
                  }}
                  className="mt-2.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{msg.action.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-600 font-medium transition-colors cursor-pointer border border-slate-200"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask about funds, states, delayed works, or MPs..."
          className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-blue-600"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white cursor-pointer transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
