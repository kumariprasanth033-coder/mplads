import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Minimize2,
  Maximize2,
  CornerDownLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Props {
  onNavigate?: (path: string) => void;
}

export const RoleCopilotWidget: React.FC<Props> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'bot';
    text: string;
    time: string;
    source?: string;
    status?: 'LIVE' | 'CACHED' | 'DEMO';
    relevantRecords?: any[];
  }>>([
    {
      sender: 'bot',
      text: `Namaste! I am the official personalized AI Copilot for **${(role || 'CITIZEN').replace('_', ' ')}**.
I have live access to the 18th Lok Sabha Digital Sansad directory, official MPLADS project repositories, and administrative action queues. How can I assist you today?`,
      time: 'Just now',
      source: 'Official MPLADS Knowledge Core',
      status: 'LIVE',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for global custom events to open the copilot with preloaded prompt
  useEffect(() => {
    const handleOpenWithPrompt = (event: any) => {
      const promptText = event?.detail?.prompt;
      setIsOpen(true);
      setIsMinimized(false);
      if (promptText) {
        setQuery(promptText);
      }
    };
    window.addEventListener('open-role-copilot', handleOpenWithPrompt);
    return () => window.removeEventListener('open-role-copilot', handleOpenWithPrompt);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuery = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    setQuery('');
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setIsLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }));
      const res = await api.queryRoleCopilot(
        role,
        userText,
        {
          userId: user?.id,
          name: user?.name,
          role,
          constituency: user?.constituency || 'Dharmapuri',
          district: user?.district || 'Dharmapuri',
          state: user?.state || 'Tamil Nadu',
        },
        history
      );

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: res.source,
          status: res.status,
          relevantRecords: res.relevantRecords,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Unable to connect to AI engine at this moment. Showing cached governance directives.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Offline Cache',
          status: 'CACHED',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendQuery(query);
  };

  const samplePromptsByRole: Record<string, string[]> = {
    MP: [
      'Show my delayed projects in the constituency',
      'Which areas have lowest asset coverage?',
      'Draft a recommendation letter for a drinking water RO plant',
    ],
    DISTRICT_OFFICER: [
      'What is in my action queue today?',
      'Summarize projects flagged for convergence',
      'Which projects are missing utilization certificates?',
    ],
    IMPLEMENTING_AGENCY: [
      'Which milestones require fresh photographic evidence?',
      'How do I submit an interim UC?',
    ],
    AUDITOR: [
      'Highlight top high-risk projects in Dharmapuri',
      'Explain reasons for delay in Morappur Health Sub-Center',
    ],
    CITIZEN: [
      'Show ongoing drinking water projects near me',
      'How can I lodge a complaint about damaged school tiles?',
      'What is the total MPLADS fund allocated to my MP?',
    ],
    GUEST: [
      'How does the Project Intelligence Core prevent duplicate works?',
      'Show total national expenditure under MPLADS',
    ],
  };

  const quickPrompts = samplePromptsByRole[role] || samplePromptsByRole.CITIZEN;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl hover:scale-105 transition-all border border-blue-400/40 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            MPLADS AI Copilot
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      ) : (
        <div
          className={`w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col transition-all overflow-hidden ${
            isMinimized ? 'h-14' : 'h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>AI Copilot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-blue-900 text-blue-200 font-mono">
                    {role}
                  </span>
                </h4>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Human Decision Remains Final</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-xl px-3 py-2 leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-blue-900 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {m.text}
                      {m.sender === 'bot' && m.source && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'LIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-medium truncate max-w-[170px]">{m.source}</span>
                          </span>
                          <span className="text-slate-400">{m.time}</span>
                        </div>
                      )}
                      {m.sender === 'user' && (
                        <div className="text-[9px] mt-1 text-right text-blue-200">
                          {m.time}
                        </div>
                      )}
                    </div>
                    {m.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-400">Synthesizing intelligence...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sample Prompts Carousel */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(prompt);
                    }}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 text-slate-700 text-[10px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={handleSend}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask intelligence copilot..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="p-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
