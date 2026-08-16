import { useState, useEffect } from 'react';
import { X, Check, Zap, Play } from 'lucide-react';
import { TaskBreakdownResponse, SubTaskItem } from '../../types';
import { api } from '../../api/client';

interface SmartBreakdownModalProps {
  isOpen: boolean;
  taskTitle: string;
  subjectName?: string;
  durationMins?: number;
  onClose: () => void;
  onStartFocusStep?: (step: SubTaskItem) => void;
}

export const SmartBreakdownModal: React.FC<SmartBreakdownModalProps> = ({
  isOpen,
  taskTitle,
  subjectName,
  durationMins = 60,
  onClose,
  onStartFocusStep,
}) => {
  const [breakdown, setBreakdown] = useState<TaskBreakdownResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && taskTitle) {
      setLoading(true);
      api.getSmartTaskBreakdown(taskTitle, subjectName, durationMins)
        .then((res) => setBreakdown(res))
        .catch((err) => console.error("Breakdown error:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, taskTitle, subjectName, durationMins]);

  if (!isOpen) return null;

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
              AI Micro-Decomposer
            </span>
            <span className="text-xs text-slate-400 font-mono">• Overcoming Procrastination</span>
          </div>
          <h3 className="text-lg font-black text-white">{taskTitle}</h3>
        </div>

        {loading ? (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-16 bg-slate-800/60 rounded-2xl"></div>
            <div className="h-12 bg-slate-800/60 rounded-2xl"></div>
            <div className="h-12 bg-slate-800/60 rounded-2xl"></div>
          </div>
        ) : breakdown ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Activation Strategy */}
            <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-indigo-200">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-300 block mb-0.5">
                  Activation Energy Strategy:
                </span>
                <p className="leading-relaxed">{breakdown.activation_strategy}</p>
              </div>
            </div>

            {/* Micro Sub-Tasks */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Micro-Steps ({breakdown.subtasks.length}):</span>
                <span className="font-mono">{breakdown.total_duration_mins} mins total</span>
              </div>

              {breakdown.subtasks.map((step, idx) => {
                const isDone = completedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-navy-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.id)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-semibold block truncate ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {idx + 1}. {step.title}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300 uppercase">
                          {step.focus_intensity.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-bold font-mono text-slate-300 bg-navy-950 px-2 py-1 rounded-lg border border-slate-800">
                        {step.duration_mins}m
                      </span>

                      {onStartFocusStep && !isDone && (
                        <button
                          type="button"
                          onClick={() => {
                            onStartFocusStep(step);
                            onClose();
                          }}
                          className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-all"
                          title="Launch deep work on this step"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
