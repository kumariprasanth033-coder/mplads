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
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Building,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardFilter } from '../context/DashboardFilterContext';
import { api } from '../services/api';
import { CopilotResponse, CopilotKpi, CopilotCard, CopilotAction } from '../types';

interface Props {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  source?: string;
  status?: 'LIVE' | 'CACHED' | 'DEMO';
  intent?: string;
  kpis?: CopilotKpi[];
  cards?: CopilotCard[];
  actions?: CopilotAction[];
  relevantRecords?: any[];
}

export const RoleCopilotWidget: React.FC<Props> = ({ currentPath = '/', onNavigate }) => {
  const { user, role } = useAuth();
  let filterContext: any = null;
  try {
    filterContext = useDashboardFilter();
  } catch (e) {
    // Gracefully handle if outside provider
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Extract contextual entities from current URL
  const activeProjectId = currentPath.startsWith('/projects/')
    ? currentPath.replace('/projects/', '').split('/')[0]
    : undefined;
  const activeMpId = currentPath.startsWith('/mps/')
    ? currentPath.replace('/mps/', '').split('/')[0]
    : undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Namaste! I am **Drishti AI**, your personalized intelligent assistant on the MPLADS Smart Portal.
I am directly connected to the 18th Lok Sabha Digital Sansad repository, real-time MoSPI public finance ledgers, and automated audit risk matrices.

What would you like to inspect today?`,
      time: 'Just now',
      source: 'MPLADS Intelligence Core & Digital Sansad',
      status: 'LIVE',
      actions: [
        { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
        { label: 'Which projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
        { label: 'How much money is utilized?', actionType: 'quick_reply', prompt: 'How much money is utilized?' },
        { label: 'Show Rajasthan projects', actionType: 'quick_reply', prompt: 'Show Rajasthan projects' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for custom events to trigger copilot from anywhere in the portal
  useEffect(() => {
    const handleOpenWithPrompt = (event: any) => {
      const promptText = event?.detail?.prompt;
      setIsOpen(true);
      setIsMinimized(false);
      if (promptText) {
        sendQuery(promptText);
      }
    };
    window.addEventListener('open-role-copilot', handleOpenWithPrompt);
    return () => window.removeEventListener('open-role-copilot', handleOpenWithPrompt);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const sendQuery = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    setQuery('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }));

      // Assemble rich context from route, auth user, and active dashboard filters
      const userContext = {
        userId: user?.id,
        name: user?.name,
        role: role || 'CITIZEN',
        constituency: filterContext?.filters?.constituency || user?.constituency || 'Dharmapuri',
        district: filterContext?.filters?.district || user?.district || 'Dharmapuri',
        state: filterContext?.filters?.state || user?.state || 'Tamil Nadu',
        activeProjectId,
        activeMpId: filterContext?.filters?.mpId || activeMpId,
        currentPath,
      };

      const res: CopilotResponse = await api.queryRoleCopilot(
        role || 'CITIZEN',
        userText,
        userContext,
        history
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
        status: res.status,
        intent: res.intent,
        kpis: res.kpis,
        cards: res.cards,
        actions: res.actions,
        relevantRecords: res.relevantRecords,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Unable to query the real-time repository at this moment. Showing cached governance directives.',
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

  const handleActionClick = (action: CopilotAction) => {
    if (action.actionType === 'quick_reply' && action.prompt) {
      sendQuery(action.prompt);
    } else if (action.actionType === 'navigate' && action.path) {
      if (onNavigate) {
        onNavigate(action.path);
      } else {
        window.location.href = action.path;
      }
    } else if (action.actionType === 'open_report') {
      if (onNavigate) {
        onNavigate('/reports');
      } else {
        window.location.href = '/reports';
      }
    }
  };

  // 8 Official Key Intents explicitly requested in requirements
  const promptPresets = [
    { label: 'Show delayed projects', prompt: 'Show delayed projects' },
    { label: 'Which projects are high risk?', prompt: 'Which projects are high risk?' },
    { label: 'How much money is utilized?', prompt: 'How much money is utilized?' },
    { label: 'Show Rajasthan projects', prompt: 'Show Rajasthan projects' },
    { label: 'Tell me about this MP', prompt: 'Tell me about this MP' },
    { label: 'Why is this project risky?', prompt: 'Why is this project risky?' },
    { label: 'What needs attention?', prompt: 'What needs attention?' },
    { label: 'How does MPLADS work?', prompt: 'How does MPLADS work?' },
  ];

  // Render text with bold and formatting
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          
          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const content = line.trim().substring(1).trim();
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-[11px] text-slate-200">
                <span className="text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{renderSpansWithBold(content)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.trim().match(/^(\d+)\.\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-[11px] text-slate-200">
                <span className="text-amber-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">{numMatch[1]}.</span>
                <span>{renderSpansWithBold(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-[11.5px] text-slate-200">
              {renderSpansWithBold(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderSpansWithBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-45 role-copilot-container select-none">
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-105 transition-all border border-blue-500/50 hover:border-blue-400 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
              <span>Drishti AI</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-300 font-mono">
                {role}
              </span>
            </span>
            <span className="text-[9px] text-slate-400">Intent &amp; Data Grounded</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      ) : (
        <div
          className={`bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 text-slate-100 flex flex-col transition-all overflow-hidden ${
            isMinimized
              ? 'w-[360px] h-14'
              : isExpanded
              ? 'w-[360px] sm:w-[620px] h-[640px]'
              : 'w-[360px] sm:w-[460px] h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-inner">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>Drishti AI Copilot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-blue-900 text-blue-200 font-mono">
                    {role}
                  </span>
                  {activeProjectId && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono truncate max-w-[90px]">
                      {activeProjectId}
                    </span>
                  )}
                </h4>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Official Grounded Repository</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Standard View' : 'Expand Width'}
                className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Restore' : 'Minimize'}
                className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 bg-slate-950 text-xs">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3.5 space-y-3 ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-900 text-slate-100 border border-slate-800 shadow-xl rounded-tl-none'
                      }`}
                    >
                      {/* Main Message Prose */}
                      {m.sender === 'bot' ? renderFormattedText(m.text) : <p className="text-[12px]">{m.text}</p>}

                      {/* Bot Answer Key Performance Indicators (KPIs) */}
                      {m.sender === 'bot' && m.kpis && m.kpis.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                          {m.kpis.map((kpi, kIdx) => (
                            <div
                              key={kIdx}
                              className={`p-2 rounded-xl border ${
                                kpi.highlight
                                  ? 'bg-blue-950/60 border-blue-700/60 text-blue-100'
                                  : 'bg-slate-950/80 border-slate-800 text-slate-200'
                              }`}
                            >
                              <div className="text-[9px] text-slate-400 uppercase tracking-wider truncate font-medium">
                                {kpi.label}
                              </div>
                              <div className="text-xs font-bold mt-0.5 text-white truncate">
                                {kpi.value}
                              </div>
                              {kpi.helper && (
                                <div className="text-[8.5px] text-slate-400 mt-0.5 truncate">
                                  {kpi.helper}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bot Answer Rich Result Cards */}
                      {m.sender === 'bot' && m.cards && m.cards.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {m.cards.map(card => (
                            <div
                              key={card.id}
                              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-bold text-[11.5px] text-white leading-tight">
                                    {card.title}
                                  </h5>
                                  {card.subtitle && (
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      {card.subtitle}
                                    </div>
                                  )}
                                </div>
                                {card.badge && (
                                  <span
                                    className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      card.badge.variant === 'danger'
                                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                        : card.badge.variant === 'warning'
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                        : card.badge.variant === 'success'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                                    }`}
                                  >
                                    {card.badge.text}
                                  </span>
                                )}
                              </div>

                              {/* Progress bar if project */}
                              {typeof card.progress === 'number' && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] text-slate-400">
                                    <span>Physical Progress</span>
                                    <span className="font-bold text-white">{card.progress}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        card.progress >= 90
                                          ? 'bg-emerald-500'
                                          : card.progress >= 50
                                          ? 'bg-blue-500'
                                          : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${card.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Metrics Grid */}
                              {card.metrics && card.metrics.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[9.5px] bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                                  {card.metrics.map((met, mIdx) => (
                                    <div key={mIdx} className="truncate">
                                      <span className="text-slate-400 block text-[8.5px]">{met.label}</span>
                                      <span className="font-semibold text-slate-200">{met.value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Risk specific details */}
                              {card.factors && card.factors.length > 0 && (
                                <div className="space-y-1 pt-0.5">
                                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block">
                                    Risk Drivers:
                                  </span>
                                  <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc list-inside">
                                    {card.factors.slice(0, 2).map((factor, fIdx) => (
                                      <li key={fIdx} className="truncate">{factor}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Card Action Link */}
                              {card.action && (
                                <div className="pt-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleActionClick(card.action!)}
                                    className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded bg-blue-950/70 border border-blue-800/60 hover:border-blue-600 transition-colors cursor-pointer"
                                  >
                                    <span>{card.action.label}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Follow-up Action Chips */}
                      {m.sender === 'bot' && m.actions && m.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800/80">
                          {m.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>{act.label}</span>
                              {act.actionType === 'navigate' ? (
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              ) : (
                                <ArrowRight className="w-2.5 h-2.5 text-blue-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Source & Timestamp metadata */}
                      {m.sender === 'bot' && m.source && (
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
                          <span className="flex items-center gap-1 truncate max-w-[240px]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                m.status === 'LIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            />
                            <span className="truncate">{m.source}</span>
                          </span>
                          <span className="shrink-0">{m.time}</span>
                        </div>
                      )}

                      {m.sender === 'user' && (
                        <div className="text-[9px] text-right text-blue-200">
                          {m.time}
                        </div>
                      )}
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-1.5 px-2 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-300 font-medium">
                      Querying verified portal repository...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sample Quick Intent Presets */}
              <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10.5px] scrollbar-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">
                  Quick:
                </span>
                {promptPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuery(preset.prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 text-[10px] cursor-pointer transition-colors shrink-0"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSend}
                className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Ask about delayed projects, risk analysis, MP funds..."
                    className="w-full text-xs pl-3 pr-8 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 text-slate-100 placeholder:text-slate-500 shadow-inner"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
