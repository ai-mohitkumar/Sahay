import React from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Moon, BookOpen, Clock } from 'lucide-react';

interface ScheduleLightenDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const ScheduleLightenDiffModal: React.FC<ScheduleLightenDiffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-white relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Negotiated Schedule Diff Preview</h3>
              <p className="text-xs text-purple-300">Review changes before locking in tomorrow's rebalanced flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* The Rebalance Diff Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Current Planned Load</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
            <span className="text-emerald-400">Proposed 4.0h Cap</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3">
              <span className="text-xs text-rose-400 font-semibold">Over-queued</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">6.5 hrs</div>
              <span className="text-[10px] text-slate-400">High Burnout Risk (64% retention)</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-xl p-3">
              <span className="text-xs text-emerald-400 font-semibold">High-Retention Flow</span>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">4.0 hrs</div>
              <span className="text-[10px] text-emerald-400/90 font-semibold">Sustainable Peak (91% retention)</span>
            </div>
          </div>
        </div>

        {/* Granular Block Level Changes */}
        <div className="space-y-2 text-xs">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Proposed Block Adjustments:
          </label>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-200 font-medium">Algorithms & Data Structures</span>
            </div>
            <span className="text-emerald-400 font-bold font-mono">Kept (90m Peak)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-200 font-medium">Operating Systems</span>
            </div>
            <span className="text-emerald-400 font-bold font-mono">Kept (90m Core)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Low-Yield Review Drills</span>
            </div>
            <span className="text-purple-300 font-bold font-mono">Deferred to Weekend (-90m)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-emerald-300 font-semibold">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>Circadian Sleep Buffer</span>
            </div>
            <span className="font-bold">+45m Recovery</span>
          </div>
        </div>

        {/* Transparency note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong>Negotiation Contract:</strong> Applying this cap guarantees you protect your highest-yield GATE topics while avoiding the 3rd consecutive night of sleep debt.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Keep Current 6.5h
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Applying Flow...' : 'Confirm & Apply 4h Cap'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
