import React from 'react';
import { Target, Zap, Clock, ShieldAlert, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { ScheduleTimelineDay, FutureSelfData } from '../../types';

interface MetricHeaderProps {
  timeline: ScheduleTimelineDay | null;
  futureSelf: FutureSelfData | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onRegenerate: () => void;
  loading: boolean;
}

export const MetricHeader: React.FC<MetricHeaderProps> = ({
  timeline,
  futureSelf,
  selectedDate,
  setSelectedDate,
  onRegenerate,
  loading,
}) => {
  const studyHours = ((timeline?.total_study_minutes || 0) / 60).toFixed(1);
  const fixedHours = ((timeline?.total_fixed_minutes || 0) / 60).toFixed(1);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate || new Date());
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-950/40 border-b border-slate-800/50 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center bg-slate-900/70 border border-slate-800/70 rounded-xl p-0.5">
            <button
              onClick={() => changeDate(-1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="px-2.5 text-xs font-bold text-slate-200 flex items-center space-x-1.5 font-mono">
              <span>{formattedDate}</span>
              {isToday && (
                <span className="text-[9px] bg-slate-800 text-slate-300 font-semibold px-1.5 py-0.2 rounded-md border border-slate-700">
                  Today
                </span>
              )}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onRegenerate}
            disabled={loading}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium rounded-xl border border-slate-800/70 transition-all active:scale-95 disabled:opacity-50"
            title="Auto-rebalance and regenerate schedule from circadian baseline"
          >
            <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Rebalance</span>
          </button>
        </div>

        {/* Muted Telemetry Bar with High Scannability */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs py-0.5">
          {/* Readiness Score */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/30 border border-slate-800/40">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Readiness:</span>
            <span className="font-bold text-slate-200 font-mono">
              {futureSelf?.current_readiness_pct ? futureSelf.current_readiness_pct.toFixed(0) : 61}%
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
              ↑ 1.2%
            </span>
          </div>

          {/* Deep Study Hours */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/30 border border-slate-800/40">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Focus:</span>
            <span className="font-bold text-slate-200 font-mono">{studyHours}h</span>
            <span className="text-[10px] text-slate-500">planned</span>
          </div>

          {/* Fixed Commitments */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/30 border border-slate-800/40">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Fixed:</span>
            <span className="font-bold text-slate-200 font-mono">{fixedHours}h</span>
          </div>

          {/* Burnout Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/30 border border-slate-800/40">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Rhythm:</span>
            <span className="font-semibold text-emerald-400 text-[11px]">
              {futureSelf?.burnout_status || 'Sustainable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
