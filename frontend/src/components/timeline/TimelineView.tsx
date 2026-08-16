import { useState } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { ScheduleBlock, ScheduleTimelineDay } from '../../types';
import { TimelineBlockCard } from './TimelineBlock';
import { CurrentTimeCursor } from './CurrentTimeCursor';
import { FocusSessionModal } from '../productivity/FocusSessionModal';
import { TaskManageModal } from './TaskManageModal';
import { CrossDomainMoatBanner } from '../common/CrossDomainMoatBanner';

interface TimelineViewProps {
  timeline: ScheduleTimelineDay | null;
  loading: boolean;
  userId: number;
  onComplete: (id: number) => void;
  onNegotiate: (block: ScheduleBlock, action: 'skip' | 'postpone') => void;
  onRefreshTimeline?: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  timeline,
  loading,
  userId,
  onComplete,
  onNegotiate,
  onRefreshTimeline,
}) => {
  const [activeFocusBlock, setActiveFocusBlock] = useState<ScheduleBlock | null>(null);
  const [showTaskManageModal, setShowTaskManageModal] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        <div className="h-20 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
        <div className="h-24 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
        <div className="h-20 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
      </div>
    );
  }

  if (!timeline || timeline.blocks.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">No Schedule for this Date</h3>
        <p className="text-sm text-slate-400 mt-1">
          Generate an intelligent circadian plan for this day based on your college and sleep rhythm.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
      {/* The 5 Moat Pillars: Headline Cross-Domain Reasoning & Honest Pushback */}
      <CrossDomainMoatBanner
        userId={userId}
        onApplyAction={() => {
          if (onRefreshTimeline) onRefreshTimeline();
        }}
      />
      {/* Top Banner with Manage Tasks action */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/50 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Intentional Circadian 24h Timeline
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Each block negotiates trade-offs. Mark done, skip, or negotiate to protect your sleep & focus.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTaskManageModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <span>📝</span>
          <span>Add / Edit Tasks</span>
        </button>
      </div>

      {/* Vertical 24-Hour Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-950/80 space-y-4">
        {/* Live Current Time Cursor */}
        <CurrentTimeCursor />

        {timeline.blocks.map((block) => (
          <div key={block.id} className="relative">
            {/* Hour node bullet on timeline vertical axis */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-indigo-500/80 shadow-md"></div>

            <TimelineBlockCard
              block={block}
              onComplete={onComplete}
              onNegotiate={onNegotiate}
              onLaunchFocus={(b) => setActiveFocusBlock(b)}
            />
          </div>
        ))}
      </div>

      {/* Focus Session Modal */}
      {activeFocusBlock && (
        <FocusSessionModal
          isOpen={!!activeFocusBlock}
          block={activeFocusBlock}
          userId={userId}
          onClose={() => setActiveFocusBlock(null)}
          onSessionLogged={() => {
            if (onRefreshTimeline) onRefreshTimeline();
          }}
        />
      )}

      {/* Task Management Modal (Add/Edit/Delete Tasks) */}
      <TaskManageModal
        isOpen={showTaskManageModal}
        onClose={() => setShowTaskManageModal(false)}
        userId={userId}
        onTasksChanged={() => {
          if (onRefreshTimeline) onRefreshTimeline();
        }}
      />
    </div>
  );
};
