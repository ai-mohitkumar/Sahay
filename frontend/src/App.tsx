import { useState, useEffect } from 'react';
import { api } from './api/client';
import {
  ScheduleTimelineDay,
  ScheduleBlock,
  NegotiationEvaluation,
  FutureSelfData,
  ActivityEvent,
  UserSummary,
  PodDetail,
  StateOfYouReport,
  Alarm,
} from './types';
import { Navbar } from './components/layout/Navbar';
import { MetricHeader } from './components/layout/MetricHeader';
import { TimelineView } from './components/timeline/TimelineView';
import { TradeOffModal } from './components/negotiation/TradeOffModal';
import { FutureSelfView } from './components/simulation/FutureSelfView';
import { ActivityHistoryView } from './components/analytics/ActivityHistoryView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { PodView } from './components/pods/PodView';
import { StateOfYouView } from './components/coach/StateOfYouView';
import { StudyHub } from './components/study/StudyHub';
import { StudentLifeHub } from './components/essentials/StudentLifeHub';
import { AlarmManager } from './components/alarms/AlarmManager';
import { AlarmRingScreen } from './components/alarms/AlarmRingScreen';
import { FailureForensicModal } from './components/negotiation/FailureForensicModal';
import { ScheduleLightenDiffModal } from './components/negotiation/ScheduleLightenDiffModal';
import { QuickProfileSwitcherModal } from './components/common/QuickProfileSwitcherModal';
import { EmailSettingsModal } from './components/settings/EmailSettingsModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { AgentPanel } from './components/agent/AgentPanel';

export function App() {
  const [currentTab, setCurrentTab] = useState<'timeline' | 'simulation' | 'history' | 'pods' | 'coach' | 'study' | 'essentials' | 'alarms' | 'onboarding'>('timeline');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Data states
  const [timeline, setTimeline] = useState<ScheduleTimelineDay | null>(null);
  const [futureSelf, setFutureSelf] = useState<FutureSelfData | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [pod, setPod] = useState<PodDetail | null>(null);
  const [coachReport, setCoachReport] = useState<StateOfYouReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Ringing Alarm State
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<Alarm | null>(null);

  // Failure Forensics Modal State
  const [forensicBlock, setForensicBlock] = useState<ScheduleBlock | null>(null);

  // Unlimited Profile Switcher Modal State
  const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState<boolean>(false);

  // Email Reports & Delivery Modal State
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState<boolean>(false);

  // Top Rebalance Diff Preview Modal State
  const [showRebalanceDiffModal, setShowRebalanceDiffModal] = useState<boolean>(false);

  // Negotiation Modal State
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [negotiationEval, setNegotiationEval] = useState<NegotiationEvaluation | null>(null);
  const [negotiationBlock, setNegotiationBlock] = useState<ScheduleBlock | null>(null);
  const [negotiationLoading, setNegotiationLoading] = useState<boolean>(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial users
  const refreshUsers = async () => {
    try {
      const res = await api.getUsers();
      if (res && res.length > 0) {
        setUsers(res);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    api.getUsers().then((res) => {
      if (res && res.length > 0) {
        setUsers(res);
        setCurrentUserId(res[0].id);
      } else {
        setCurrentTab('onboarding');
      }
    }).catch(() => {
      // Backend warming up
    });
  }, []);

  // Fetch data when currentUserId or selectedDate changes
  const refreshAllData = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const [tl, fs, hist, podData, coachData] = await Promise.all([
        api.getTimeline(currentUserId, selectedDate),
        api.getFutureSelf(currentUserId).catch(() => null),
        api.getActivityHistory(currentUserId).catch(() => ({ total_events: 0, events: [] })),
        api.getPod(currentUserId).catch(() => null),
        api.getStateOfYou(currentUserId).catch(() => null),
      ]);
      setTimeline(tl);
      setFutureSelf(fs);
      setActivityEvents(hist.events);
      setPod(podData);
      setCoachReport(coachData);
    } catch (err) {
      console.error("Failed to load user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUserId, selectedDate]);

  // Handle Mark Done (Step 5)
  const handleCompleteBlock = async (scheduleId: number) => {
    try {
      const res = await api.completeBlock(scheduleId, currentUserId);
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Handle Initiate Negotiation (Step 4)
  const handleNegotiateBlock = async (block: ScheduleBlock, action: 'skip' | 'postpone') => {
    setNegotiationBlock(block);
    setIsNegotiating(true);
    setNegotiationLoading(true);

    try {
      const evaluation = await api.evaluateNegotiation(currentUserId, block.id, action);
      setNegotiationEval(evaluation);
    } catch (err: any) {
      showToast(`Negotiation failed: ${err.message}`);
      setIsNegotiating(false);
    } finally {
      setNegotiationLoading(false);
    }
  };

  // Handle Accept Trade Proposal (with micro-negotiation custom mins)
  const handleAcceptProposal = async (proposalId: string, customDurationMins?: number, reason?: string) => {
    if (!negotiationBlock) return;
    const target = negotiationBlock;
    setNegotiationLoading(true);

    try {
      const res = await api.acceptNegotiation(currentUserId, target.id, proposalId, customDurationMins, reason);
      setIsNegotiating(false);
      setNegotiationBlock(null);
      setNegotiationEval(null);
      showToast(res.message);
      refreshAllData();

      // Trigger 1-tap Failure Forensic capture for skips/penalties to feed future models
      if (proposalId === 'accept_penalty' || proposalId === 'split_next_day' || proposalId === 'shift_tonight') {
        setForensicBlock(target);
      }
    } catch (err: any) {
      showToast(`Failed to accept trade: ${err.message}`);
    } finally {
      setNegotiationLoading(false);
    }
  };

  // Handle Regenerate Schedule
  const handleRegenerate = async () => {
    try {
      setLoading(true);
      await api.regenerateSchedule(currentUserId, selectedDate);
      showToast("Schedule rebalanced from circadian baseline!");
      refreshAllData();
    } catch (err: any) {
      showToast(`Failed to regenerate: ${err.message}`);
      setLoading(false);
    }
  };

  // Handle Onboarding Completion (Step 3)
  const handleOnboardingComplete = async (formData: any) => {
    setLoading(true);
    try {
      const res = await api.submitOnboarding(formData);
      showToast(res.message);
      const userList = await api.getUsers();
      setUsers(userList);
      setCurrentUserId(res.user_id);
      setCurrentTab('timeline');
    } catch (err: any) {
      showToast(`Onboarding failed: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        users={users}
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
        onOpenProfileSwitcher={() => setShowProfileSwitcherModal(true)}
        onOpenEmailSettings={() => setShowEmailSettingsModal(true)}
      />

      {/* Metric Header (visible on non-onboarding tabs) */}
      {currentTab !== 'onboarding' && (
        <MetricHeader
          timeline={timeline}
          futureSelf={futureSelf}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onRegenerate={handleRegenerate}
          onRebalanceClick={() => setShowRebalanceDiffModal(true)}
          loading={loading}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl border border-indigo-400 flex items-center space-x-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-16 sm:pb-0">
        {currentTab === 'timeline' && (
          <TimelineView
            timeline={timeline}
            loading={loading}
            userId={currentUserId}
            onComplete={handleCompleteBlock}
            onNegotiate={handleNegotiateBlock}
            onRefreshTimeline={refreshAllData}
          />
        )}

        {currentTab === 'simulation' && (
          <FutureSelfView data={futureSelf} loading={loading} />
        )}

        {currentTab === 'history' && (
          <ActivityHistoryView events={activityEvents} loading={loading} />
        )}

        {currentTab === 'pods' && (
          <PodView pod={pod} loading={loading} />
        )}

        {currentTab === 'coach' && (
          <StateOfYouView report={coachReport} loading={loading} userId={currentUserId} />
        )}

        {currentTab === 'study' && (
          <StudyHub userId={currentUserId} />
        )}

        {currentTab === 'essentials' && (
          <StudentLifeHub userId={currentUserId} />
        )}

        {currentTab === 'alarms' && (
          <AlarmManager
            userId={currentUserId}
            onTriggerTestAlarm={(alarm) => setActiveRingingAlarm(alarm)}
          />
        )}

        {currentTab === 'onboarding' && (
          <OnboardingWizard onComplete={handleOnboardingComplete} loading={loading} />
        )}
      </main>

      {/* Live Alarm Ring Screen Overlay */}
      {activeRingingAlarm && (
        <AlarmRingScreen
          alarm={activeRingingAlarm}
          userId={currentUserId}
          onDismiss={(action) => {
            const a = activeRingingAlarm;
            setActiveRingingAlarm(null);
            api.dismissAlarm(a.id, action, currentUserId);
            showToast(`Alarm ${action}.`);
          }}
          onStartNow={() => {
            const a = activeRingingAlarm;
            setActiveRingingAlarm(null);
            api.dismissAlarm(a.id, 'started', currentUserId);
            setCurrentTab('timeline');
            showToast('🚀 Focus session mode started! Let’s lock in.');
          }}
          onNegotiate={(schedId) => {
            setActiveRingingAlarm(null);
            if (schedId && timeline) {
              const b = timeline.blocks.find((x) => x.id === schedId);
              if (b) handleNegotiateBlock(b, 'postpone');
              else if (timeline.blocks.length > 0) handleNegotiateBlock(timeline.blocks[0], 'postpone');
            } else if (timeline && timeline.blocks.length > 0) {
              handleNegotiateBlock(timeline.blocks[0], 'postpone');
            }
          }}
        />
      )}

      {/* Flagship Trade-Off Engine Modal */}
      <TradeOffModal
        isOpen={isNegotiating}
        onClose={() => {
          setIsNegotiating(false);
          setNegotiationBlock(null);
          setNegotiationEval(null);
        }}
        evaluation={negotiationEval}
        loading={negotiationLoading}
        onAcceptProposal={handleAcceptProposal}
      />

      {/* 1-Tap Failure Forensics Root-Cause Modal */}
      <FailureForensicModal
        isOpen={!!forensicBlock}
        onClose={() => setForensicBlock(null)}
        userId={currentUserId}
        scheduleId={forensicBlock?.id}
        taskTitle={forensicBlock?.title}
        onRecorded={(lbl) => showToast(`🛡️ Friction root cause recorded: ${lbl}`)}
      />

      {/* Unlimited Profile Switcher & Generator Modal */}
      <QuickProfileSwitcherModal
        isOpen={showProfileSwitcherModal}
        onClose={() => setShowProfileSwitcherModal(false)}
        users={users}
        currentUserId={currentUserId}
        onSelectUser={(uid) => {
          setCurrentUserId(uid);
          showToast('Switched active profile persona!');
        }}
        onProfileCreated={(newUid) => {
          refreshUsers();
          setCurrentUserId(newUid);
          showToast('🚀 New student profile active & calibrated!');
        }}
        onOpenCustomOnboarding={() => setCurrentTab('onboarding')}
      />

      {/* Email Reports & Scheduled Digests Engine Modal */}
      <EmailSettingsModal
        isOpen={showEmailSettingsModal}
        onClose={() => setShowEmailSettingsModal(false)}
        userId={currentUserId}
      />

      {/* Top Rebalance Diff Preview Modal */}
      <ScheduleLightenDiffModal
        isOpen={showRebalanceDiffModal}
        onClose={() => setShowRebalanceDiffModal(false)}
        loading={loading}
        onConfirm={() => {
          handleRegenerate();
          setShowRebalanceDiffModal(false);
          showToast('⚡ Schedule rebalanced with 4.0h high-retention focus cap!');
        }}
      />

      {/* Persistent Floating AI Agent Companion */}
      <AgentPanel userId={currentUserId} />

      {/* Mobile-Native Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenProfileSwitcher={() => setShowProfileSwitcherModal(true)}
      />
    </div>
  );
}

export default App;
