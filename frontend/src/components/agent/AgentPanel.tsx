import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  X,
  Send
} from 'lucide-react';
import { AgentMessage as AgentMessageType } from '../../types';
import { AgentMessage } from './AgentMessage';
import { AgentSuggestions } from './AgentSuggestions';
import { api } from '../../api/client';

interface AgentPanelProps {
  userId: number;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<AgentMessageType[]>([
    {
      role: 'assistant',
      content: "Hey Aarav! I'm your Sahay AI Companion. I'm connected to your live syllabus, 24h timeline, wallet, and goals. How can I help right now?",
      grounding_source: 'Context-Aware AI Brain',
      intent_type: 'general_knowledge',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(() => Math.random().toString(36).substring(2, 10));
  const [socraticMode, setSocraticMode] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's my free time today?",
    "Explain Semaphore invariants",
    "Should I skip gym today?",
    "I feel stressed about GATE",
    "How much money can I spend today?"
  ]);
  const [contextSummary, setContextSummary] = useState<string>('GATE CS 2027 • OS 61%');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: AgentMessageType = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.queryAgent(userId, text, sessionId, socraticMode);
      setSessionId(res.session_id);
      if (res.context_used_summary) {
        setContextSummary(res.context_used_summary);
      }
      if (res.quick_suggestions && res.quick_suggestions.length > 0) {
        setSuggestions(res.quick_suggestions);
      }

      const aiMsg: AgentMessageType = {
        role: 'assistant',
        content: res.reply,
        intent_type: res.intent_type,
        grounding_source: res.grounding_source,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Agent query failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I had trouble processing that request. Please try again!",
          grounding_source: 'Error Handler',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button (Always visible on all screens) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 text-white rounded-2xl shadow-2xl shadow-indigo-600/40 border border-indigo-400/40 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight">Ask Sahay AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Floating Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-navy-950/95 backdrop-blur-2xl border border-indigo-500/40 rounded-3xl shadow-2xl shadow-indigo-950/80 flex flex-col overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-extrabold text-white">Sahay AI Agent</h4>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  {contextSummary}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Socratic Mode Toggle */}
              <button
                type="button"
                onClick={() => setSocraticMode(!socraticMode)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                  socraticMode
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Toggle Socratic guided mode vs direct answer"
              >
                {socraticMode ? '🧠 Socratic' : '⚡ Direct'}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg, idx) => (
              <AgentMessage key={idx} message={msg} />
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 animate-pulse px-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Sahay is synthesizing timeline, readiness & syllabus...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-up Suggestions */}
          <div className="px-3 pt-2 bg-slate-900/50 border-t border-slate-800/80">
            <AgentSuggestions
              suggestions={suggestions}
              onSelect={(s) => handleSend(s)}
            />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900/90 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about schedule, doubts, trade-offs, stress..."
              className="flex-1 bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
