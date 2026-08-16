import React, { useState } from 'react';
import { api } from '../../api/client';

interface FailureForensicModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  scheduleId?: number | null;
  taskTitle?: string;
  onRecorded?: (reason: string) => void;
}

const ROOT_CAUSES = [
  { tag: 'sleep_debt', label: 'Sleep Debt (<6h)', icon: '😴', desc: 'Too fatigued from poor or short sleep' },
  { tag: 'phone_distraction', label: 'Phone / Social Distraction', icon: '📱', desc: 'Lost momentum to notifications/apps' },
  { tag: 'unrealistic_time', label: 'Unrealistic Duration', icon: '⏳', desc: 'Block was set too long for available energy' },
  { tag: 'concept_too_hard', label: 'Concept Friction', icon: '🧩', desc: 'Hit a wall on difficult theory or problem sets' },
  { tag: 'financial_anxiety', label: 'Money / Life Stress', icon: '💸', desc: 'Distracted by finances or personal logistics' },
  { tag: 'low_energy', label: 'Low Cognitive Energy', icon: '⚡', desc: 'Brain fog or burnout after a long day' },
];

export const FailureForensicModal: React.FC<FailureForensicModalProps> = ({
  isOpen,
  onClose,
  userId,
  scheduleId,
  taskTitle = 'Study Session',
  onRecorded,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectCause = async (tag: string, label: string) => {
    setSelectedTag(tag);
    setSubmitting(true);
    try {
      await api.logFailureForensic(
        {
          schedule_id: scheduleId,
          failure_type: 'skipped_task',
          root_cause_tag: tag,
          root_cause_label: label,
          notes: notes || undefined,
        },
        userId
      );
      setSubmitted(true);
      if (onRecorded) onRecorded(label);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to log forensic:', err);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-slate-100">Failure Forensic Logged</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your honest feedback calibrates future schedule difficulty and adjusts circadian buffers!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📊</span>
                <h3 className="text-lg font-bold text-slate-100">Friction Forensic: What stopped you?</h3>
              </div>
              <p className="text-xs text-slate-400">
                1-tap reason for skipping <strong className="text-indigo-300">"{taskTitle}"</strong>.
                Sahay uses failure data to protect your schedule, not judge you.
              </p>
            </div>

            {/* Root Causes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROOT_CAUSES.map((rc) => (
                <button
                  key={rc.tag}
                  disabled={submitting}
                  onClick={() => handleSelectCause(rc.tag, rc.label)}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 group ${
                    selectedTag === rc.tag
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition">{rc.icon}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">{rc.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{rc.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Optional note input */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional quick note (e.g. Chapter 4 problem set was brutal)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
