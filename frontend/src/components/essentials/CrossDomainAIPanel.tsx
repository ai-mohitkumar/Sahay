import { useState } from 'react';
import { BrainCircuit, Send, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { CrossDomainConsultResponse } from '../../types';
import { api } from '../../api/client';

interface CrossDomainAIPanelProps {
  userId: number;
}

export const CrossDomainAIPanel: React.FC<CrossDomainAIPanelProps> = ({ userId }) => {
  const [question, setQuestion] = useState<string>('Should I skip gym today to finish my OS assignment?');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<CrossDomainConsultResponse | null>(null);

  const presetQuestions = [
    'Should I skip gym today to finish my OS assignment?',
    'Can I afford eating out with hostel friends this weekend?',
    'How should I balance GSoC application prep with daily GATE study?',
    'I feel exhausted and overwhelmed by exam pressure today'
  ];

  const handleConsult = async (qText?: string) => {
    const activeQ = qText || question;
    if (!activeQ.trim()) return;
    setLoading(true);
    try {
      const res = await api.consultCrossDomainBrain(userId, activeQ);
      setResponse(res);
    } catch (err) {
      console.error("Cross-domain consult error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex items-start space-x-3.5 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-white">Cross-Domain AI Life Reasoner</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
              Unified Brain
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            One intelligence that reasons across your Study + Health + Money + Deadlines simultaneously.
          </p>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Try a real-life cross-domain scenario:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(q);
                handleConsult(q);
              }}
              className="text-xs bg-navy-950/80 hover:bg-indigo-950/60 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask any holistic life trade question..."
          className="flex-1 bg-navy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none font-medium"
        />
        <button
          onClick={() => handleConsult()}
          disabled={loading}
          className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Reasoning...' : 'Consult'}</span>
        </button>
      </div>

      {/* Verdict & Trade Breakdown */}
      {response && (
        <div className="bg-navy-950 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verdict:</span>
              <span className="text-sm font-extrabold text-emerald-300">{response.verdict}</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
              Domain: {response.domain_primary}
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            "{response.recommendation}"
          </p>

          {/* Multi-Pillar Breakdown */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
              Multi-Pillar Evidence:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {response.trade_breakdown.map((item, i) => (
                <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start space-x-2">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs italic text-slate-400">
            "{response.compassionate_signoff}"
          </div>
        </div>
      )}
    </div>
  );
};
