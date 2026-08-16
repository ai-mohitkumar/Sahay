import { useState } from 'react';
import { Sparkles, BrainCircuit, Lightbulb, Send, X, Compass } from 'lucide-react';
import { AskAIResponse } from '../../types';
import { api } from '../../api/client';

interface AskAIPanelProps {
  userId: number;
  questionText: string;
  topicId?: number;
  userAttempt?: string;
  onClose: () => void;
}

export const AskAIPanel: React.FC<AskAIPanelProps> = ({
  userId,
  questionText,
  topicId,
  userAttempt,
  onClose,
}) => {
  const [doubtText, setDoubtText] = useState<string>('Why did my calculation differ from the standard approach?');
  const [socraticMode, setSocraticMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AskAIResponse | null>(null);

  const handleAsk = async () => {
    if (!doubtText.trim()) return;
    setLoading(true);
    try {
      const res = await api.askAITutor(userId, questionText, doubtText, topicId, userAttempt, socraticMode);
      setResponse(res);
    } catch (err) {
      console.error("AI Tutor error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <span>Sahay Socratic AI Tutor</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Exam Companion
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Guiding mental models rather than spoonfeeding answers</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Socratic vs Direct Toggle */}
      <div className="flex items-center justify-between bg-navy-950 p-2.5 rounded-2xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Teaching Style:</span>
        </span>

        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSocraticMode(true)}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              socraticMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Socratic (Guiding Questions)
          </button>
          <button
            type="button"
            onClick={() => setSocraticMode(false)}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              !socraticMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Breakdown
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          What specifically feels confusing or where did you get stuck?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={doubtText}
            onChange={(e) => setDoubtText(e.target.value)}
            placeholder="e.g., Why do we decrement semaphore before checking the condition?"
            className="flex-1 bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Thinking...' : 'Ask'}</span>
          </button>
        </div>
      </div>

      {/* Response Display */}
      {response && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-fadeIn">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {response.ai_guidance}
            </p>
          </div>

          {response.socratic_question && (
            <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-purple-200">
              <Compass className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-purple-300 block mb-0.5">
                  Guiding Step:
                </span>
                <p className="font-semibold">{response.socratic_question}</p>
              </div>
            </div>
          )}

          {response.misconception_diagnosed && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
              <strong className="text-amber-400">Diagnosis:</strong> {response.misconception_diagnosed}
            </div>
          )}

          {response.key_formula_or_rule && (
            <div className="bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300">
              ⚡ <strong>Core Invariant:</strong> {response.key_formula_or_rule}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
