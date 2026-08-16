import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Clock,
  Plus,
  Trash2,
  Award,
  ArrowRight,
  Zap
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  loading: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, loading }) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('Aarav Sharma');
  const [email, setEmail] = useState('aarav@example.com');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('23:30');
  const [capacityHours, setCapacityHours] = useState(6.5);

  const [fixedCommitments, setFixedCommitments] = useState([
    { title: 'College Classes & Labs', start_time: '09:00', end_time: '14:00' },
    { title: 'Gym & Physical Health', start_time: '18:00', end_time: '19:00' },
  ]);

  const [examName, setExamName] = useState('GATE CSE 2027');
  const [examDate, setExamDate] = useState('2027-02-15');
  const [targetScore, setTargetScore] = useState(85.0);

  const [subjects, setSubjects] = useState([
    { name: 'Operating Systems', total_hours_needed: 45, current_readiness_pct: 61, weight: 1.2, color_code: '#3b82f6' },
    { name: 'Algorithms & Data Structures', total_hours_needed: 60, current_readiness_pct: 55, weight: 1.5, color_code: '#10b981' },
    { name: 'Computer Networks', total_hours_needed: 40, current_readiness_pct: 48, weight: 1.0, color_code: '#8b5cf6' },
    { name: 'Engineering Mathematics', total_hours_needed: 35, current_readiness_pct: 68, weight: 1.1, color_code: '#f59e0b' },
  ]);

  const addCommitment = () => {
    setFixedCommitments([...fixedCommitments, { title: 'New Fixed Block', start_time: '17:00', end_time: '18:00' }]);
  };

  const removeCommitment = (idx: number) => {
    setFixedCommitments(fixedCommitments.filter((_, i) => i !== idx));
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { name: 'New Subject', total_hours_needed: 30, current_readiness_pct: 50, weight: 1.0, color_code: '#ec4899' },
    ]);
  };

  const removeSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      wake_time: wakeTime,
      sleep_time: sleepTime,
      daily_capacity_hours: capacityHours,
      fixed_commitments: fixedCommitments,
      exam: {
        name: examName,
        target_date: examDate,
        target_score: targetScore,
        subjects: subjects,
      },
    };
    onComplete(payload);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Stepper Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Setup Your Circadian Flow</h2>
              <p className="text-xs text-slate-400">Step {step} of 3</p>
            </div>
          </div>

          <div className="flex space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full transition-all ${
                  s === step ? 'bg-indigo-500 w-10' : s < step ? 'bg-indigo-700' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Circadian Rhythm */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Your Natural Sleep & Wake Schedule</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Sahay plans around your biological energy peaks instead of forcing impossible schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800/80">
                  <label className="flex items-center space-x-2 text-xs font-bold text-amber-300 mb-2">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Wake Up Time</span>
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800/80">
                  <label className="flex items-center space-x-2 text-xs font-bold text-indigo-300 mb-2">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Sleep Time</span>
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800/80">
                  <label className="flex items-center space-x-2 text-xs font-bold text-emerald-300 mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Max Study Capacity</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="14"
                      value={capacityHours}
                      onChange={(e) => setCapacityHours(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">hrs/day</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <span>Next: Fixed Commitments</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Fixed Commitments */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Fixed Commitments (College, Coaching, Commute)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Sahay locks these blocks on your timeline and automatically slots study sessions in your free gaps.
                </p>
              </div>

              <div className="space-y-3">
                {fixedCommitments.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-navy-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...fixedCommitments];
                        updated[idx].title = e.target.value;
                        setFixedCommitments(updated);
                      }}
                      placeholder="Commitment title (e.g. College, Labs)"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white flex-1 focus:border-indigo-500 focus:outline-none w-full"
                    />

                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={item.start_time}
                        onChange={(e) => {
                          const updated = [...fixedCommitments];
                          updated[idx].start_time = e.target.value;
                          setFixedCommitments(updated);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="text-slate-500 text-xs">to</span>
                      <input
                        type="time"
                        value={item.end_time}
                        onChange={(e) => {
                          const updated = [...fixedCommitments];
                          updated[idx].end_time = e.target.value;
                          setFixedCommitments(updated);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => removeCommitment(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCommitment}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fixed Block</span>
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <span>Next: Exam & Subjects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Exam Target & Subjects */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Target Exam & Subject Weightings</span>
                </h3>
                <p className="text-xs text-slate-400">
                  The Trade-Off Engine uses these weights to calculate consequences when you negotiate your day.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exam / Goal Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    required
                    placeholder="e.g. GATE CSE 2027, UPSC 2026, Semester Finals"
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Marks (%)</label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subjects List */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Subjects & Starting Readiness
                </label>

                {subjects.map((subj, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-navy-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-2.5 flex-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: subj.color_code }}
                      />
                      <input
                        type="text"
                        value={subj.name}
                        onChange={(e) => {
                          const updated = [...subjects];
                          updated[idx].name = e.target.value;
                          setSubjects(updated);
                        }}
                        className="bg-transparent text-sm font-semibold text-white focus:outline-none flex-1"
                      />
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">Readiness:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subj.current_readiness_pct}
                          onChange={(e) => {
                            const updated = [...subjects];
                            updated[idx].current_readiness_pct = Number(e.target.value);
                            setSubjects(updated);
                          }}
                          className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center"
                        />
                        <span className="text-slate-400">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSubject(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>

              {/* 60-Second Magic: Instant AI Neural Reasoning Payoff */}
              <div className="bg-gradient-to-br from-indigo-950/80 via-slate-950 to-purple-950/80 border border-indigo-500/40 rounded-2xl p-4.5 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Sahay Brain • Live Calibration Telemetry
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">100% Calibrated</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span>⚡</span>
                    <span><strong>Exam Runway:</strong> Ingested 182-day runway to {examName} (Target: {targetScore}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span>😴</span>
                    <span><strong>Circadian Anchors:</strong> {wakeTime} wake rhythm + {fixedCommitments.length} fixed daily anchors</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span>🎯</span>
                    <span><strong>Prime Focus Peak:</strong> 19:30 - 21:30 allocated to '{subjects[0]?.name || "Core Theory"}'</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30 font-semibold">
                    <span>🛡️</span>
                    <span><strong>Burnout Shield:</strong> Applied sustainable 4.0h high-retention cap with 30m buffers</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Synthesizing Flow...' : '🚀 Lock In My Circadian Flow'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
