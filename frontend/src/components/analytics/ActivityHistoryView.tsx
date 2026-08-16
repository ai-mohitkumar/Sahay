import React from 'react';
import { History, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { ActivityEvent } from '../../types';

interface ActivityHistoryViewProps {
  events: ActivityEvent[];
  loading: boolean;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-3 animate-pulse">
        <div className="h-16 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
        <div className="h-16 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
        <div className="h-16 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              The AI Moat
            </span>
            <span className="text-xs text-slate-400 font-mono">• activity_history Ledger</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">
            Real Activity Log & Trade Outcomes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every completed block, skip reason, and accepted AI trade is logged here to power future negotiations.
          </p>
        </div>

        <div className="bg-navy-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Logged Events</p>
          <p className="text-xl font-black text-white">{events.length}</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Activity Events Logged Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete or negotiate tasks on the 24-hour timeline to start building your dataset.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const isDone = evt.action.includes('done');
            const isNegotiation = evt.action.includes('negotiation');

            return (
              <div
                key={evt.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isNegotiation
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isNegotiation ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-bold text-white capitalize">
                        {evt.action.replace('_', ' ')}
                      </span>
                      {evt.reason && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-md border border-slate-700">
                          Reason: {evt.reason}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(evt.timestamp).toLocaleString()}
                      {evt.ai_negotiation_accepted && (
                        <span className="text-indigo-400 font-mono ml-2">
                          Trade: {evt.ai_negotiation_accepted}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Readiness Delta Badge */}
                <div className="shrink-0 text-right">
                  <div
                    className={`inline-flex items-center space-x-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                      evt.readiness_delta >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {evt.readiness_delta >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {evt.readiness_delta >= 0 ? `+${evt.readiness_delta}` : evt.readiness_delta}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
