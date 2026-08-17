import React from 'react';
import { X, Sparkles, Brain, Calculator, ShieldCheck, Activity, Target } from 'lucide-react';

interface HowSahayThinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowSahayThinksModal: React.FC<HowSahayThinksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  How Sahay Thinks (Open Methodology)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero Black Box
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The exact formulas and deterministic logic running under your schedule.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Cards */}
        <div className="space-y-4">
          {/* Formula 1: Readiness Delta */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>1. Subject Readiness Pacing (Delta R)</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Activity & Mastery</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200">
              {'ΔR_done = +1.2% × FocusQuality Multiplier  vs  ΔR_skipped = -(Duration / 90m) × 4.0%'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Where focus multiplier ranges from 0.2x (1-star distracted) to 1.8x (5-star deep flow). Skipped sessions penalize subject readiness proportionally to session length.
            </p>
          </div>

          {/* Formula 2: Calibrated Honest Pushback */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber-400" />
                <span>2. Calibrated Capacity Reality Check</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">30-Day Peak Grounding</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-200">
              {'Trigger Pushback if: Planned Today > 1.15 × Max_30d(Completed Daily Hours) and Planned >= 5.0h'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If your 30-day peak completed study is 4.2h and you attempt to schedule 13.5h, Sahay flags a +221% over-planning gap and offers a 4.0h safe focus cap.
            </p>
          </div>

          {/* Formula 3: Circadian Sleep Debt Multiplier */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>3. Circadian Sleep Velocity & Fatigue</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Biological Telemetry</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-purple-200">
              {'Nights (< 6.0h) >= 2 in last 3 days => Focus Capacity Drops ~25%'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When sleep debt accumulates, Sahay prevents schedule collapse by widening recharge buffers and shifting heavy numerical sessions out of sluggish afternoon slots.
            </p>
          </div>

          {/* Formula 4: Why-Now Priority Calculus */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>4. "Why Now" Priority Calculus</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Contextual Engine</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-200">
              {'Priority Score = ExamWeight × (100 - CurrentReadinessPct) × CircadianPeakFactor'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              High-weight exam topics with low current readiness are preferentially slotted into your morning peak focus windows, while review drills fill evening buffer slots.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Local SQLite • Deterministic • Zero Hallucinations</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
