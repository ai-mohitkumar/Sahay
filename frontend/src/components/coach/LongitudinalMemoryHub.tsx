import React, { useState, useEffect } from 'react';
import { LongitudinalMemory, FailureSummaryResponse } from '../../types';
import { api } from '../../api/client';

interface LongitudinalMemoryHubProps {
  userId: number;
}

export const LongitudinalMemoryHub: React.FC<LongitudinalMemoryHubProps> = ({ userId }) => {
  const [memories, setMemories] = useState<LongitudinalMemory[]>([]);
  const [failureSummary, setFailureSummary] = useState<FailureSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getLongitudinalMemories(userId),
      api.getFailureForensicsSummary(userId),
    ])
      .then(([mems, fSummary]) => {
        if (isMounted) {
          setMemories(mems || []);
          setFailureSummary(fSummary);
        }
      })
      .catch((err) => console.error('Failed to load longitudinal memory hub:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return <div className="py-8 text-center text-slate-500 animate-pulse text-sm">Accessing compounding memory vault...</div>;
  }

  return (
    <div className="space-y-6 mt-6">
      {/* 1. Compounding Longitudinal Memories Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg">
              🧬
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Compounding Longitudinal Memory</h3>
              <p className="text-xs text-slate-400">
                Patterns Sahay remembers about you across months — not a chatbot that resets every session.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
            {memories.length} Compounding Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-slate-950/70 border border-purple-900/30 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/60">
                    {mem.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Observed {mem.occurrence_count}x
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 leading-snug mb-2">
                  {mem.observed_pattern}
                </p>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-200/90 italic leading-relaxed">
                "{mem.ai_callback_prompt}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Failure Forensics & Friction Drivers */}
      {failureSummary && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg">
                📊
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Friction & Failure Forensics</h3>
                <p className="text-xs text-slate-400">
                  Root-cause analysis of where momentum was lost, turning skipped tasks into actionable insulation.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {failureSummary.total_failures_recorded} Logs Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Driver Card */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
                  Primary Friction Driver
                </div>
                <div className="text-2xl font-black text-amber-200">
                  {failureSummary.primary_failure_driver} ({failureSummary.driver_percentage}%)
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                💡 <strong className="text-amber-300">Actionable Insulation:</strong> {failureSummary.actionable_remedy}
              </p>
            </div>

            {/* Root-Cause Breakdown Bars */}
            <div className="space-y-3 justify-center flex flex-col">
              {failureSummary.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.root_cause_label}</span>
                    <span className="font-mono text-slate-400">{item.count} skips ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-amber-500'
                          : idx === 1
                          ? 'bg-indigo-500'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
