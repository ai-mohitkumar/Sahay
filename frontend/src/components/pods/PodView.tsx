import React, { useState } from 'react';
import { Users, Flame, Sparkles, BookOpen, Share2, Check, Zap } from 'lucide-react';
import { PodDetail } from '../../types';

interface PodViewProps {
  pod: PodDetail | null;
  loading: boolean;
}

export const PodView: React.FC<PodViewProps> = ({ pod, loading }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [nudgedMemberId, setNudgedMemberId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        <div className="h-32 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
        <div className="h-48 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
      </div>
    );
  }

  if (!pod) return null;

  const inviteLink = `https://sahay.ai/join/pod-${pod.name.toLowerCase().replace(/\s+/g, '-') || 'gate'}?code=SAHAY2027`;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppInvite = () => {
    const text = `🔥 *Join my "${pod.name}" Study Pod on Sahay!*\n\n` +
      `We're tracking syllabus consistency and focus velocity together for ${pod.exam_target}. When we both study, our collective pod score boosts by +15%!\n\n` +
      `👉 Join the Pod here: ${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNudge = (memberId: number) => {
    setNudgedMemberId(memberId);
    setTimeout(() => setNudgedMemberId(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Pod Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Accountability Pod
            </span>
            <span className="text-xs text-slate-400 font-mono">• {pod.total_members} Members Active</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">
            {pod.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Peer support for <strong>{pod.exam_target}</strong> with collective milestones — zero toxic leaderboards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-navy-950 p-3.5 rounded-2xl border border-slate-800 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Pod Average</p>
            <p className="text-xl font-extrabold text-indigo-400">{pod.pod_average_completion_pct}%</p>
          </div>
          <div className="bg-navy-950 p-3.5 rounded-2xl border border-indigo-500/40 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-indigo-300">Your Pace</p>
            <p className="text-xl font-extrabold text-emerald-400">{pod.user_completion_pct}%</p>
          </div>
        </div>
      </div>

      {/* Baked-in Growth Loop: Invite Study Buddy to Pod Hero Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 text-xl">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wide">
                Built-in Growth Loop
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                🔥 +15% Pod Momentum Bonus Active
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Pods work 3x better when your real study buddy is here
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Invite a friend to lock in mutual accountability. When all members hit daily focus blocks, the pod unlocks streak bonuses!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={handleWhatsAppInvite}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5 active:scale-95"
          >
            <span>📲</span>
            <span>Invite on WhatsApp</span>
          </button>
          <button
            onClick={handleCopyInviteLink}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* AI Pod Nudge Box */}
      <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 shadow-md">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Sahay Pod Pulse & Nudge
          </h4>
          <p className="text-sm font-medium text-slate-200 mt-1 leading-relaxed">
            "{pod.nudge_message}"
          </p>
        </div>
      </div>

      {/* Members Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Pod Members Pace</span>
          </h3>
          <span className="text-xs text-slate-500">Collective Velocity Tracker</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {pod.members.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-2xl border transition-all ${
                member.is_current_user
                  ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">{member.display_name}</h4>
                    {member.is_current_user && (
                      <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{member.last_active_session}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{member.streak_days}d streak</span>
                  </div>

                  {!member.is_current_user && (
                    <button
                      onClick={() => handleNudge(member.id)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-800 transition flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-indigo-400" />
                      <span>{nudgedMemberId === member.id ? '⚡ Nudged!' : 'Nudge'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Weekly Pace ({member.weekly_hours_logged} hrs)</span>
                  <span className="text-white font-mono">{member.completion_rate_pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      member.completion_rate_pct >= 75
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, member.completion_rate_pct)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
