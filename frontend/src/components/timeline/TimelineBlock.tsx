import React from 'react';
import { Check, X, Clock, Lock, Coffee, Moon, BookOpen, Sparkles, Zap } from 'lucide-react';
import { ScheduleBlock } from '../../types';

interface TimelineBlockProps {
  block: ScheduleBlock;
  onComplete: (id: number) => void;
  onNegotiate: (block: ScheduleBlock, action: 'skip' | 'postpone') => void;
  onLaunchFocus?: (block: ScheduleBlock) => void;
}

export const TimelineBlockCard: React.FC<TimelineBlockProps> = ({
  block,
  onComplete,
  onNegotiate,
  onLaunchFocus,
}) => {
  const isStudy = block.block_type === 'study_session';
  const isFixed = block.block_type === 'fixed_commitment';
  const isBreak = block.block_type === 'break';
  const isSleep = block.block_type === 'sleep';

  const isCompleted = block.status === 'completed';
  const isSkipped = block.status === 'skipped';
  const isPostponed = block.status === 'postponed';

  // Calculate duration in minutes
  const [sh, sm] = block.start_time.split(':').map(Number);
  const [eh, em] = block.end_time.split(':').map(Number);
  const durationMins = eh * 60 + em - (sh * 60 + sm);

  const getCardStyles = () => {
    if (isCompleted) {
      return 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100 opacity-90';
    }
    if (isSkipped) {
      return 'bg-rose-950/20 border-rose-500/30 text-slate-400 opacity-60 line-through';
    }
    if (isPostponed) {
      return 'bg-slate-900/90 border-purple-500/40 text-purple-200';
    }
    if (isStudy) {
      return 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 shadow-md transition';
    }
    if (isFixed) {
      return 'bg-slate-950/60 border-slate-800/80 text-slate-400';
    }
    if (isBreak) {
      return 'bg-slate-950/40 border-slate-800 border-dashed text-slate-400';
    }
    if (isSleep) {
      return 'bg-slate-950/80 border-slate-800/40 text-slate-500';
    }
    return 'bg-slate-900 border-slate-800 text-slate-200';
  };

  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all duration-200 group ${getCardStyles()}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left icon & details */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="mt-0.5 shrink-0">
            {isStudy && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: block.subject_color || '#4f46e5' }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
            )}
            {isFixed && (
              <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            )}
            {isBreak && (
              <div className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
                <Coffee className="w-4 h-4" />
              </div>
            )}
            {isSleep && (
              <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500">
                <Moon className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-xs font-semibold text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {block.start_time} - {block.end_time} ({durationMins}m)
              </span>

              {block.subject_name && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${block.subject_color || '#6366f1'}15`,
                    borderColor: `${block.subject_color || '#6366f1'}40`,
                    color: block.subject_color || '#818cf8',
                  }}
                >
                  {block.subject_name}
                </span>
              )}

              {isFixed && (
                <span className="text-[10px] bg-slate-800/80 text-slate-400 font-semibold px-2 py-0.5 rounded-md border border-slate-700">
                  Fixed Commitment
                </span>
              )}

              {isCompleted && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Done (+1.2% readiness)</span>
                </span>
              )}

              {isSkipped && (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-md border border-rose-500/30">
                  Skipped (-4.0% readiness)
                </span>
              )}

              {isPostponed && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-md border border-purple-500/30">
                  Negotiated
                </span>
              )}
            </div>

            <h3
              className={`text-sm sm:text-base font-bold mt-1 tracking-tight text-white ${
                isCompleted ? 'text-emerald-300' : ''
              }`}
            >
              {block.title}
            </h3>

            {/* Distinct Purple "Why Now" AI Priority Rationale */}
            {block.why_now_reason && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-bold text-[11px] text-purple-300">Why now:</span>
                <span className="text-[11px] text-purple-200 leading-snug">{block.why_now_reason}</span>
              </div>
            )}

            {block.notes && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{block.notes}</p>
            )}
          </div>
        </div>

        {/* Action Buttons for Study Sessions */}
        {isStudy && !isCompleted && !isSkipped && (
          <div className="flex items-center space-x-1.5 self-center flex-wrap gap-y-1">
            {/* Complete Button (Green) */}
            <button
              onClick={() => onComplete(block.id)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Mark completed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>

            {/* Deep Work Focus Mode */}
            {onLaunchFocus && (
              <button
                onClick={() => onLaunchFocus(block)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
                title="Launch Deep Work screen"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Focus</span>
              </button>
            )}

            {/* Negotiate Button (Purple AI Surface) */}
            <button
              onClick={() => onNegotiate(block, 'postpone')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 text-purple-300 hover:text-purple-100 border border-purple-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Postpone / Negotiate new slot"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Negotiate</span>
            </button>

            {/* Skip Button (Muted Slate / Hover Red) */}
            <button
              onClick={() => onNegotiate(block, 'skip')}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-all active:scale-95"
              title="Skip this session (AI will negotiate consequences)"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
