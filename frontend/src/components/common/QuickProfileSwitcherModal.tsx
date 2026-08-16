import React, { useState } from 'react';
import { UserSummary } from '../../types';
import { api } from '../../api/client';

interface QuickProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserSummary[];
  currentUserId: number;
  onSelectUser: (userId: number) => void;
  onProfileCreated: (newUserId: number) => void;
  onOpenCustomOnboarding: () => void;
}

const PRESETS = [
  {
    key: 'gate_cse',
    title: 'GATE CSE 2027 Aspirant',
    avatar: '🎓',
    bg: 'from-blue-600 to-indigo-600',
    border: 'border-blue-500/40',
    desc: '4 Core Subjects (OS, DSA, CN, Maths) • 182d Runway',
    defaultName: 'Aarav Sharma',
  },
  {
    key: 'cat_mba',
    title: 'CAT 2026 / MBA Aspirant',
    avatar: '📈',
    bg: 'from-amber-600 to-orange-600',
    border: 'border-amber-500/40',
    desc: 'Quant, DILR, VARC • 90d Runway • 99.2% Target',
    defaultName: 'Priya Verma',
  },
  {
    key: 'upsc_civil',
    title: 'UPSC CSE Civil Services',
    avatar: '🏛️',
    bg: 'from-purple-600 to-pink-600',
    border: 'border-purple-500/40',
    desc: 'Polity, Modern History, Economy, CSAT • 240d Runway',
    defaultName: 'Vikramaditya',
  },
  {
    key: 'sem_dsa',
    title: 'Semester Finals + DSA Placement',
    avatar: '💻',
    bg: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-500/40',
    desc: 'LeetCode DSA, DBMS, Web Dev • 60d Runway',
    defaultName: 'Neha Patel',
  },
];

export const QuickProfileSwitcherModal: React.FC<QuickProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onSelectUser,
  onProfileCreated,
  onOpenCustomOnboarding,
}) => {
  const [creatingKey, setCreatingKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCreatePreset = async (presetKey: string, defaultName: string) => {
    setCreatingKey(presetKey);
    try {
      const res = await api.createPresetProfile(presetKey, defaultName);
      onProfileCreated(res.user_id);
      onClose();
    } catch (err: any) {
      console.error('Failed to create preset profile:', err);
    } finally {
      setCreatingKey(null);
    }
  };

  const handleDeleteProfile = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (users.length <= 1) {
      alert("Cannot delete the only profile. Create another profile first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete profile #${userId}?`)) return;

    setDeletingId(userId);
    try {
      await api.deleteUserProfile(userId);
      // Switch to first available other user
      const remaining = users.filter((u) => u.id !== userId);
      if (remaining.length > 0) {
        onSelectUser(remaining[0].id);
      }
    } catch (err: any) {
      console.error('Failed to delete user profile:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl text-white relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <h3 className="text-xl font-extrabold text-white">Unlimited Profile Vault</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {users.length} Active Profiles
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Switch seamlessly between student personas, exam targets, or study rhythms with isolated telemetry.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Existing Saved Profiles */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Student Personas (1-Click Switch)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((u) => {
              const isSelected = u.id === currentUserId;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{u.name}</h4>
                          {isSelected && (
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-indigo-300 font-medium">
                          {u.exam_name || 'General Prep'}
                        </span>
                      </div>
                    </div>

                    {/* Delete Profile button */}
                    {users.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteProfile(u.id, e)}
                        disabled={deletingId === u.id}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity text-xs"
                        title="Delete Profile"
                      >
                        {deletingId === u.id ? '...' : '🗑️'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                    <span>⏰ {u.wake_time || '06:30'} - {u.sleep_time || '23:30'}</span>
                    <span>⚡ {u.daily_capacity_hours || 6}h Cap</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1-Click Instant Profile Presets */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>1-Click Instant Profile Generators</span>
            </label>
            <span className="text-[11px] text-slate-500">Zero Typing • Instant Flow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESETS.map((p) => (
              <div
                key={p.key}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 transition group"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition">{p.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{p.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{p.desc}</div>
                  </div>
                </div>

                <button
                  disabled={creatingKey === p.key}
                  onClick={() => handleCreatePreset(p.key, p.defaultName)}
                  className={`w-full py-2 px-3 rounded-xl bg-gradient-to-r ${p.bg} hover:opacity-90 text-white font-bold text-xs shadow transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-98`}
                >
                  <span>{creatingKey === p.key ? 'Generating Flow...' : '+ Launch This Profile'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Custom Profile Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenCustomOnboarding();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Create Custom Profile via Wizard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
