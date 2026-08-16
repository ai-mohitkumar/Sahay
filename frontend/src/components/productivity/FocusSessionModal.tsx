import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Sparkles,
  AlertCircle,
  Star,
  CheckCircle2
} from 'lucide-react';
import { ScheduleBlock } from '../../types';
import { api } from '../../api/client';

interface FocusSessionModalProps {
  isOpen: boolean;
  block: ScheduleBlock | null;
  userId: number;
  onClose: () => void;
  onSessionLogged: () => void;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  isOpen,
  block,
  userId,
  onClose,
  onSessionLogged,
}) => {
  const [timerSecs, setTimerSecs] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [distractionTags, setDistractionTags] = useState<string[]>([]);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timerSecs > 0) {
      interval = setInterval(() => setTimerSecs((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timerSecs]);

  if (!isOpen || !block) return null;

  const handlePreset = (mins: number) => {
    setIsActive(false);
    setTimerSecs(mins * 60);
  };

  const handleLogDistraction = (tag: string) => {
    setDistractionCount((prev) => prev + 1);
    if (!distractionTags.includes(tag)) {
      setDistractionTags((prev) => [...prev, tag]);
    }
  };

  const handleCompleteSession = async () => {
    setSubmitting(true);
    try {
      const elapsedMins = Math.max(1, Math.round((25 * 60 - timerSecs) / 60));
      await api.logFocusSession(
        userId,
        block.id,
        elapsedMins,
        qualityRating,
        distractionCount,
        distractionTags
      );
      setShowRatingModal(false);
      onSessionLogged();
      onClose();
    } catch (err) {
      console.error("Log focus session failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formattedMins = Math.floor(timerSecs / 60).toString().padStart(2, '0');
  const formattedSecs = (timerSecs % 60).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/95 backdrop-blur-xl animate-fadeIn">
      {/* Distraction Rating Pop-up at End */}
      {showRatingModal ? (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-scaleUp">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 mx-auto flex items-center justify-center text-indigo-300">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-extrabold text-white">How was your focus quality?</h3>
            <p className="text-xs text-slate-400">
              Honest ratings feed genuine quality into your readiness trajectory.
            </p>
          </div>

          {/* Star Selector */}
          <div className="flex justify-center space-x-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setQualityRating(star)}
                className="p-1.5 transition-transform hover:scale-125"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= qualityRating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="text-center text-xs text-slate-300 font-semibold">
            {qualityRating === 5 && '🔥 In the Zone (100% uninterrupted flow)'}
            {qualityRating === 4 && '⚡ High Focus (1 minor interruption)'}
            {qualityRating === 3 && '👍 Moderate Focus (Got back on track)'}
            {qualityRating <= 2 && '⚠️ Distracted (Felt resistance / heavy fatigue)'}
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowRatingModal(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Back to Timer
            </button>
            <button
              onClick={handleCompleteSession}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              {submitting ? 'Saving...' : 'Save & Boost Readiness'}
            </button>
          </div>
        </div>
      ) : (
        /* Main Distraction-Free Deep Work Screen */
        <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pinned Focus Task */}
          <div className="text-center space-y-1.5 max-w-lg">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Deep Work Mode
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {block.subject_name || 'Focused Study'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {block.title}
            </h2>
            {block.why_now_reason && (
              <p className="text-xs text-indigo-300/80 italic">
                "{block.why_now_reason}"
              </p>
            )}
          </div>

          {/* Large Countdown Display */}
          <div className="relative">
            <div className="w-56 h-56 rounded-full bg-navy-950 border-4 border-indigo-500/30 flex flex-col items-center justify-center shadow-2xl shadow-indigo-950">
              <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {formattedMins}:{formattedSecs}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                {isActive ? '⚡ Flow Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls: Play/Pause/Presets */}
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all active:scale-95 ${
                  isActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white'
                }`}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isActive ? 'Pause Flow' : 'Start Focus Flow'}</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreset(25)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors"
                title="Reset 25m"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="flex space-x-2">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handlePreset(m)}
                  className="text-xs font-mono font-bold bg-navy-950 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1 rounded-xl border border-slate-800 transition-all"
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Distraction Logger (4) */}
          <div className="w-full bg-navy-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Got Distracted? Tap reason to log:</span>
              </span>
              <span className="font-mono text-slate-400 font-bold">
                {distractionCount} interruptions logged
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { tag: 'Phone / Social', icon: '📱' },
                { tag: 'Brain Fatigue', icon: '🥱' },
                { tag: 'Noise / Talk', icon: '🔊' },
                { tag: 'Mind Wandering', icon: '💭' },
              ].map((d) => (
                <button
                  key={d.tag}
                  type="button"
                  onClick={() => handleLogDistraction(d.tag)}
                  className="text-xs bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-rose-500/40 transition-all flex items-center space-x-1 active:scale-95"
                >
                  <span>{d.icon}</span>
                  <span>{d.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Finish & Mark Quality */}
          <div className="w-full flex justify-end">
            <button
              onClick={() => setShowRatingModal(true)}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Session & Rate Quality</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
