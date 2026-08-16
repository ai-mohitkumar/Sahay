import React, { useState, useEffect } from 'react';
import { Alarm, AdaptiveAlarmSuggestion } from '../../types';
import { api } from '../../api/client';

interface AlarmManagerProps {
  userId: number;
  onTriggerTestAlarm: (alarm: Alarm) => void;
}

export const AlarmManager: React.FC<AlarmManagerProps> = ({
  userId,
  onTriggerTestAlarm,
}) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [suggestions, setSuggestions] = useState<AdaptiveAlarmSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Alarm Form State
  const [newTime, setNewTime] = useState<string>('07:00');
  const [newLabel, setNewLabel] = useState<string>('Morning Focus Routine');
  const [newType, setNewType] = useState<string>('fixed');
  const [newSound, setNewSound] = useState<string>('gentle_chime');

  const loadAlarms = async () => {
    setLoading(true);
    try {
      const [todayAlarms, adaptives] = await Promise.all([
        api.getTodayAlarms(userId),
        api.getAdaptiveAlarmSuggestions(userId),
      ]);
      setAlarms(todayAlarms || []);
      setSuggestions(adaptives || []);
    } catch (err) {
      console.error('Failed to load alarms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
  }, [userId]);

  const handleSyncTimeline = async () => {
    setLoading(true);
    try {
      const synced = await api.syncTimelineAlarms(userId);
      setAlarms(synced);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAlarm(
        {
          trigger_time: newTime,
          label: newLabel,
          type: newType as 'fixed' | 'task_linked' | 'recurring' | 'smart',
          sound: newSound,
          snooze_allowed: true,
          snooze_count_limit: 3,
          is_active: true,
        },
        userId
      );
      setShowAddModal(false);
      loadAlarms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteAlarm(id, userId);
      setAlarms((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const handleApplySuggestion = async (sugg: AdaptiveAlarmSuggestion) => {
    try {
      const res = await api.applyAdaptiveAlarmShift(sugg.alarm_id, sugg.suggested_time, userId);
      setAppliedNotice(res.message || `Shifted ${sugg.label} to ${sugg.suggested_time}!`);
      setTimeout(() => setAppliedNotice(null), 4000);
      // Remove applied suggestion
      setSuggestions((prev) => prev.filter((s) => s.alarm_id !== sugg.alarm_id));
      loadAlarms();
    } catch (err) {
      console.error(err);
    }
  };

  const fixedAlarms = alarms.filter((a) => a.type === 'fixed' || a.type === 'recurring');
  const taskAlarms = alarms.filter((a) => a.type === 'task_linked' || a.type === 'smart');

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⏰</span>
            <h1 className="text-2xl font-bold text-white">Smart Alarm Hub & Trade-Offs</h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Alarms automatically synchronized with your daily syllabus timeline, circadian wake/sleep targets,
            and backed by the <strong className="text-indigo-300">Sahay Negotiation Engine</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSyncTimeline}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition flex items-center gap-2 shadow-sm"
          >
            <span>🔄</span>
            <span>Sync Today's Timeline</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <span>➕</span>
            <span>New Alarm</span>
          </button>
        </div>
      </div>

      {/* Success Confirmation Toast Banner */}
      {appliedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm font-semibold flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2">
          <span className="text-xl">✅</span>
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Adaptive AI Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <span>🧠</span>
            <h2>AI Adaptive Schedule Shifts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sugg, idx) => (
              <div
                key={idx}
                className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{sugg.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {sugg.confidence_pct}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sugg.reason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                  <div className="text-xs text-slate-400">
                    <span className="line-through text-slate-500 mr-2">{sugg.current_time}</span>
                    <span className="text-amber-300 font-bold text-sm font-mono">→ {sugg.suggested_time}</span>
                  </div>
                  <button
                    onClick={() => handleApplySuggestion(sugg)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                  >
                    Apply AI Shift
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Alarms Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading alarms...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Task-Linked Alarms (Timeline Synced) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h3 className="font-bold text-slate-100">Timeline Task Alarms (5m Prep)</h3>
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                {taskAlarms.length} Active
              </span>
            </div>

            {taskAlarms.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No study block alarms. Click "Sync Today's Timeline" to populate!
              </div>
            ) : (
              <div className="space-y-3">
                {taskAlarms.map((a) => (
                  <div
                    key={a.id}
                    className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-2xl font-black font-mono text-indigo-300 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-900/50">
                        {a.trigger_time}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200 leading-tight">{a.label}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>🔔 {a.sound}</span>
                          <span>•</span>
                          <span>Max {a.snooze_count_limit} snoozes</span>
                          {a.current_snooze_count > 0 && (
                            <span className="text-amber-400 font-semibold">
                              (Snoozed {a.current_snooze_count}x)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTriggerTestAlarm(a)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
                      >
                        🔔 Test Ring
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Alarm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Fixed Circadian & Routine Alarms */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌅</span>
                <h3 className="font-bold text-slate-100">Fixed Circadian & Routine Alarms</h3>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {fixedAlarms.length} Configured
              </span>
            </div>

            {fixedAlarms.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No fixed circadian alarms yet.
              </div>
            ) : (
              <div className="space-y-3">
                {fixedAlarms.map((a) => (
                  <div
                    key={a.id}
                    className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-2xl font-black font-mono text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-900/50">
                        {a.trigger_time}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200 leading-tight">{a.label}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>🔔 {a.sound}</span>
                          <span>•</span>
                          <span>Daily Circadian Marker</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTriggerTestAlarm(a)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition"
                      >
                        🔔 Test Ring
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Alarm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Alarm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>⏰</span>
                <span>Create New Smart Alarm</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlarm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Trigger Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Alarm Label / Purpose</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Algorithms Problem Set #4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="fixed">Fixed Wake / Sleep</option>
                    <option value="task_linked">Study / Task</option>
                    <option value="recurring">Daily Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sound Tone</label>
                  <select
                    value={newSound}
                    onChange={(e) => setNewSound(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gentle_chime">Gentle Chime</option>
                    <option value="energetic_pulse">Energetic Pulse</option>
                    <option value="zen_bell">Zen Bell</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
