import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { api } from '../../api/client';

interface ConfessionCardProps {
  userId: number;
  onConfessionLogged?: () => void;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({ userId, onConfessionLogged }) => {
  const [tag, setTag] = useState<string>('overplanning');
  const [confessionText, setConfessionText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [response, setResponse] = useState<{
    acknowledgment: string;
    adjusted_plan_summary: string;
  } | null>(null);

  const presets = [
    { id: 'overplanning', label: 'Over-scheduled after college' },
    { id: 'unrealistic_wakeup', label: 'Forced 5:30 AM wakeup late' },
    { id: 'break_doomscroll', label: 'Doomscrolled during break' },
    { id: 'avoiding_hard_topic', label: 'Avoided high-friction topic' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confessionText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.recordConfession(userId, tag, confessionText);
      setResponse({
        acknowledgment: res.acknowledgment,
        adjusted_plan_summary: res.adjusted_plan_summary,
      });
      setConfessionText('');
      if (onConfessionLogged) onConfessionLogged();
    } catch (err) {
      console.error('Failed to log confession:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-purple-950/40 border border-rose-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
          <MessageSquareHeart className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Confession Mode (Zero Judgment)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Weekly Self-Awareness
            </span>
          </div>
          <p className="text-xs text-slate-400">
            What did you lie to yourself about this week? Sahay logs it quietly to make next week's schedule more honest.
          </p>
        </div>
      </div>

      {response ? (
        <div className="mt-4 bg-slate-950/80 border border-rose-500/40 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-rose-200">{response.acknowledgment}</div>
              <div className="text-slate-400 flex items-center gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span><strong className="text-slate-300">Automatic Schedule Adjustment:</strong> {response.adjusted_plan_summary}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setResponse(null)}
            className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline font-medium"
          >
            Log another observation
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          {/* Quick Preset Tags */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setTag(p.id);
                  if (!confessionText) {
                    if (p.id === 'overplanning') setConfessionText('I scheduled 4 hours on Thursday knowing I had college lab until 5 PM.');
                    if (p.id === 'unrealistic_wakeup') setConfessionText('I set alarm for 5:30 AM knowing I went to bed at 1:30 AM.');
                    if (p.id === 'break_doomscroll') setConfessionText('A 15-minute break turned into 50 minutes of Instagram Reels.');
                    if (p.id === 'avoiding_hard_topic') setConfessionText('I skipped Dynamic Programming because the problem set looked intimidating.');
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-medium border transition ${
                  tag === p.id
                    ? 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={confessionText}
              onChange={(e) => setConfessionText(e.target.value)}
              placeholder="e.g., I planned 6 hours on Friday knowing I'd be exhausted after college..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500/60 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500/40 pr-12 shadow-inner"
            />
            <button
              type="submit"
              disabled={submitting || !confessionText.trim()}
              className="absolute right-2 top-2 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
              title="Submit confession"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
