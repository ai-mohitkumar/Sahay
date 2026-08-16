import React, { useState, useRef } from 'react';
import { StateOfYouReport } from '../../types';

interface ShareableStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: StateOfYouReport | null;
  userName?: string;
  examName?: string;
}

export const ShareableStoryCardModal: React.FC<ShareableStoryCardModalProps> = ({
  isOpen,
  onClose,
  report,
  userName = 'Aarav Sharma',
  examName = 'GATE CSE 2027',
}) => {
  const [cardType, setCardType] = useState<'wrap' | 'callout' | 'futureself'>('wrap');
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareTextWrap = `🚀 *My Weekly State of You on Sahay AI:*\n` +
    `• Target: ${examName}\n` +
    `• Velocity: 84% Syllabus Consistency\n` +
    `• Circadian Rhythm: 5.8h sweet spot\n` +
    `• "${report?.coach_letter.slice(0, 140)}..."\n\n` +
    `Track your prep without burnout: https://sahay.app`;

  const shareTextCallout = `😂 *Sahay AI just called me out on my study schedule:*\n` +
    `"You queued 6.5 hours of study today, but in the last 30 days you've never completed more than 4.2h. Over-planning creates morning optimism and evening guilt."\n\n` +
    `It literally built me a realistic 4h high-retention plan instead. Check it out: https://sahay.app`;

  const shareTextFuture = `🔮 *Future Self Projection on Sahay:*\n` +
    `If I keep current pace: 58% readiness.\n` +
    `If I lock in 4h/day with Sahay: 89% readiness (Top 1.5% rank trajectory)!\n\n` +
    `Simulate your exam runway: https://sahay.app`;

  const activeText = cardType === 'wrap' ? shareTextWrap : cardType === 'callout' ? shareTextCallout : shareTextFuture;

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(activeText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <h3 className="text-lg font-extrabold text-white">Viral Screenshot Card</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Crafted to share on WhatsApp status, study groups, or Instagram Stories.
          </p>
        </div>

        {/* Card Type Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setCardType('wrap')}
            className={`flex-1 py-2 rounded-lg transition ${
              cardType === 'wrap' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧬 State of You
          </button>
          <button
            onClick={() => setCardType('callout')}
            className={`flex-1 py-2 rounded-lg transition ${
              cardType === 'callout' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🛑 AI Call-out
          </button>
          <button
            onClick={() => setCardType('futureself')}
            className={`flex-1 py-2 rounded-lg transition ${
              cardType === 'futureself' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔮 Reality Mirror
          </button>
        </div>

        {/* The Screenshot-Ready Visual Card */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl p-6 border shadow-2xl transition-all select-none"
          style={{
            background:
              cardType === 'wrap'
                ? 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 50%, #2e1065 100%)'
                : cardType === 'callout'
                ? 'linear-gradient(145deg, #451a03 0%, #0f172a 50%, #1e1b4b 100%)'
                : 'linear-gradient(145deg, #3b0764 0%, #0f172a 50%, #172554 100%)',
            borderColor:
              cardType === 'wrap'
                ? 'rgba(99, 102, 241, 0.4)'
                : cardType === 'callout'
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(168, 85, 247, 0.4)',
          }}
        >
          {/* Card Top Brand & User */}
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black">
                S
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">Sahay AI</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
              {userName} • {examName}
            </span>
          </div>

          {/* Card Body based on selected type */}
          {cardType === 'wrap' && (
            <div className="space-y-3.5">
              <div className="text-[11px] uppercase font-bold tracking-widest text-indigo-300">
                Weekly Reflection Wrap
              </div>
              <h4 className="text-xl font-black text-white leading-tight">
                "Consistent Focus without the Exam Burnout."
              </h4>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Study Velocity</div>
                  <div className="text-lg font-black text-emerald-400">84% Solid</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Sleep Sweet Spot</div>
                  <div className="text-lg font-black text-indigo-300">5.8h / night</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
                "{report?.coach_letter ? report.coach_letter.slice(0, 120) + '...' : 'You navigated heavy college hours while locking in 4h daily deep focus.'}"
              </p>
            </div>
          )}

          {cardType === 'callout' && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-widest text-amber-400">
                <span>🛑</span>
                <span>Calibrated Reality Check</span>
              </div>
              <h4 className="text-lg font-black text-white leading-snug">
                "You queued 6.5h of study today, but your 30-day peak is 4.2h."
              </h4>
              <p className="text-xs text-slate-200 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 leading-relaxed">
                Over-planning creates morning optimism followed by evening guilt. Sahay recalibrated my day to a 4.0-hour high-retention plan instead.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                <span>Calibrated with 89% Confidence</span>
                <span>#SahayRealityCheck</span>
              </div>
            </div>
          )}

          {cardType === 'futureself' && (
            <div className="space-y-3.5">
              <div className="text-[11px] uppercase font-bold tracking-widest text-purple-300">
                Future-Self Simulation
              </div>
              <h4 className="text-lg font-black text-white leading-tight">
                Two Trajectories to {examName}
              </h4>

              <div className="space-y-2 pt-1">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
                  <span className="text-xs text-rose-300 font-semibold">Current Friction Pace</span>
                  <span className="text-xs font-mono font-bold text-rose-400">58% Readiness</span>
                </div>
                <div className="bg-indigo-950/70 p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-semibold">4h Locked-In with Sahay</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">89% Readiness (Top 1.5%)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                Simulated from 182-day syllabus runway
              </div>
            </div>
          )}

          {/* Card Footer Watermark */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>sahay.app • The AI Ally for College Students</span>
            <span>#GATE2027</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>📲</span>
            <span>Share to WhatsApp Status</span>
          </button>
          <button
            onClick={handleCopyText}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Copy Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
