import {
  ScheduleTimelineDay,
  NegotiationEvaluation,
  FutureSelfData,
  ActivityEvent,
  UserSummary,
  PodDetail,
} from '../types';

const API_BASE = '/api/v1';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Onboarding & Multi-Profile System
  submitOnboarding: (data: any) =>
    fetchApi<{ user_id: number; exam_id?: number; message: string; generated_blocks_count: number; sample_first_day_schedule: any[] }>(
      '/onboarding',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  createPresetProfile: (presetKey: string, customName?: string) => {
    const query = customName ? `?preset_key=${presetKey}&custom_name=${encodeURIComponent(customName)}` : `?preset_key=${presetKey}`;
    return fetchApi<{ user_id: number; exam_id?: number; message: string; generated_blocks_count: number }>(
      `/onboarding/preset-profile${query}`,
      { method: 'POST' }
    );
  },

  deleteUserProfile: (userId: number) =>
    fetchApi<{ status: string; message: string }>(`/onboarding/users/${userId}`, { method: 'DELETE' }),

  // Timeline & Schedules
  getTimeline: (userId: number, dateStr?: string) => {
    const query = dateStr ? `?user_id=${userId}&target_date=${dateStr}` : `?user_id=${userId}`;
    return fetchApi<ScheduleTimelineDay>(`/schedules/timeline${query}`);
  },

  regenerateSchedule: (userId: number, dateStr?: string) => {
    const query = dateStr ? `?user_id=${userId}&target_date=${dateStr}` : `?user_id=${userId}`;
    return fetchApi<any[]>(`/schedules/regenerate${query}`, { method: 'POST' });
  },

  completeBlock: (scheduleId: number, userId: number) =>
    fetchApi<{ status: string; message: string; readiness_gain: number }>(
      `/schedules/${scheduleId}/complete?user_id=${userId}`,
      { method: 'PATCH' }
    ),

  // Trade-off Negotiation Engine
  evaluateNegotiation: (userId: number, scheduleId: number, proposedAction: string, reason?: string, customMinutes?: number) =>
    fetchApi<NegotiationEvaluation>('/negotiation/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        schedule_id: scheduleId,
        proposed_action: proposedAction,
        reason: reason || 'tired',
        custom_minutes: customMinutes,
      }),
    }),

  acceptNegotiation: (userId: number, scheduleId: number, proposalId: string, customDurationMins?: number, reason?: string) =>
    fetchApi<{ status: string; message: string; readiness_delta: number }>('/negotiation/accept', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        schedule_id: scheduleId,
        proposal_id: proposalId,
        custom_duration_mins: customDurationMins,
        reason: reason,
      }),
    }),

  // Future Self Simulation
  getFutureSelf: (userId: number) =>
    fetchApi<FutureSelfData>(`/simulation/future-self?user_id=${userId}`),

  // State of You Coach Report
  getStateOfYou: (userId: number) =>
    fetchApi<import('../types').StateOfYouReport>(`/analytics/state-of-you?user_id=${userId}`),

  // Activity History & Analytics
  getActivityHistory: (userId: number) =>
    fetchApi<{ total_events: number; events: ActivityEvent[] }>(`/analytics/history?user_id=${userId}`),

  getUsers: () =>
    fetchApi<UserSummary[]>('/analytics/users'),

  // Social Accountability Pods
  getPod: (userId: number) =>
    fetchApi<PodDetail>(`/pods/my-pod?user_id=${userId}`),

  // Study Content & AI Tutor
  getStudyTree: (subjectId: number, userId: number) =>
    fetchApi<import('../types').SubjectStudyTree>(`/study/tree?subject_id=${subjectId}&user_id=${userId}`),

  getTopicQuestions: (topicId: number) =>
    fetchApi<import('../types').Question[]>(`/study/topics/${topicId}/questions`),

  submitQuestionAttempt: (userId: number, questionId: number, answer: string, timeSec: number) =>
    fetchApi<import('../types').QuestionAttemptResult>('/study/attempt', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        question_id: questionId,
        selected_answer: answer,
        time_taken_sec: timeSec,
        confidence_level: 'medium',
      }),
    }),

  askAITutor: (userId: number, questionText: string, doubt: string, topicId?: number, userAttempt?: string, socraticMode = true) =>
    fetchApi<import('../types').AskAIResponse>('/study/ask-ai', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        question_text: questionText,
        student_doubt: doubt,
        topic_id: topicId,
        user_attempted_answer: userAttempt,
        socratic_mode: socraticMode,
      }),
    }),

  finishPracticeDrill: (total: number, correct: number, timeSpentSecs: number, topicName: string) =>
    fetchApi<import('../types').DrillSummary>(
      `/study/finish-drill?total=${total}&correct=${correct}&time_spent=${timeSpentSecs}&topic_name=${encodeURIComponent(topicName)}`,
      { method: 'POST' }
    ),

  // Student Life Essentials (6 Domains) & Cross-Domain Brain
  getStudentLifeOverview: (userId: number) =>
    fetchApi<import('../types').StudentLifeOverview>(`/student-life/overview?user_id=${userId}`),

  logExpense: (userId: number, title: string, amount: number, category: string, paymentMethod = 'upi') =>
    fetchApi<import('../types').StudentExpense>('/student-life/finances/expense', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        title: title,
        amount: amount,
        category: category,
        payment_method: paymentMethod,
      }),
    }),

  toggleRoutine: (routineId: number, userId: number) =>
    fetchApi<{ status: string; is_completed_today: boolean }>(
      `/student-life/routines/${routineId}/toggle?user_id=${userId}`,
      { method: 'PATCH' }
    ),

  consultCrossDomainBrain: (userId: number, question: string) =>
    fetchApi<import('../types').CrossDomainConsultResponse>('/student-life/cross-domain-consult', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        question: question,
      }),
    }),

  // High-Impact Productivity: Smart Task Breakdown & Focus Mode
  createTask: (data: { user_id: number; title: string; description?: string; estimated_duration_mins?: number; difficulty?: string; priority?: number; subject_id?: number }) =>
    fetchApi<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),

  updateTask: (taskId: number, data: any) =>
    fetchApi<any>(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTask: (taskId: number) =>
    fetchApi<{ status: string; message: string }>(`/tasks/${taskId}`, { method: 'DELETE' }),

  getTasks: (userId: number, status?: string) => {
    const q = status ? `?user_id=${userId}&status=${status}` : `?user_id=${userId}`;
    return fetchApi<any[]>(`/tasks${q}`);
  },

  getSmartTaskBreakdown: (taskTitle: string, subjectName?: string, durationMins = 60) =>
    fetchApi<import('../types').TaskBreakdownResponse>('/tasks/smart-breakdown', {
      method: 'POST',
      body: JSON.stringify({
        task_title: taskTitle,
        subject_name: subjectName,
        target_duration_mins: durationMins,
      }),
    }),

  logFocusSession: (userId: number, scheduleId: number, durationMins: number, qualityRating: number, distractionCount = 0, tags: string[] = []) =>
    fetchApi<import('../types').FocusSessionLogResponse>('/schedules/focus-session/log', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        schedule_id: scheduleId,
        actual_duration_mins: durationMins,
        focus_quality_rating: qualityRating,
        distraction_count: distractionCount,
        distraction_tags: tags,
      }),
    }),

  // General-Purpose Context-Aware AI Agent
  queryAgent: (userId: number, message: string, sessionId?: string, socraticMode = false) =>
    fetchApi<import('../types').AgentQueryResponse>('/agent/query', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        message: message,
        session_id: sessionId,
        socratic_mode: socraticMode,
      }),
    }),

  // Smart Alarm System & Trade-off Negotiation
  getTodayAlarms: (userId: number) =>
    fetchApi<import('../types').Alarm[]>(`/alarms/today?user_id=${userId}`),

  syncTimelineAlarms: (userId: number) =>
    fetchApi<import('../types').Alarm[]>(`/alarms/sync-timeline?user_id=${userId}`, {
      method: 'POST',
    }),

  createAlarm: (data: Partial<import('../types').Alarm>, userId: number) =>
    fetchApi<import('../types').Alarm>(`/alarms?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  dismissAlarm: (alarmId: number, action = 'dismissed', userId: number) =>
    fetchApi<import('../types').Alarm>(`/alarms/${alarmId}/dismiss?action=${action}&user_id=${userId}`, {
      method: 'POST',
    }),

  snoozeAlarm: (alarmId: number, minutes = 10, userId: number) =>
    fetchApi<import('../types').AlarmSnoozeResponse>(`/alarms/${alarmId}/snooze?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    }),

  negotiateAlarm: (alarmId: number, userId: number) =>
    fetchApi<import('../types').AlarmNegotiateResponse>(`/alarms/${alarmId}/negotiate?user_id=${userId}`, {
      method: 'POST',
    }),

  getAdaptiveAlarmSuggestions: (userId: number) =>
    fetchApi<import('../types').AdaptiveAlarmSuggestion[]>(`/alarms/adaptive-suggestions?user_id=${userId}`),

  applyAdaptiveAlarmShift: (alarmId: number, suggestedTime: string, userId: number) =>
    fetchApi<{ status: string; message: string; alarm_id: number; new_trigger_time: string }>(
      `/alarms/apply-adaptive-shift?alarm_id=${alarmId}&suggested_time=${encodeURIComponent(suggestedTime)}&user_id=${userId}`,
      { method: 'POST' }
    ),

  deleteAlarm: (alarmId: number, userId: number) =>
    fetchApi<{ status: string; id: number }>(`/alarms/${alarmId}?user_id=${userId}`, {
      method: 'DELETE',
    }),

  // The 5 'Alag from Market' Core Moat Pillars
  getHeadlineSynthesis: (userId: number) =>
    fetchApi<import('../types').HeadlineSynthesisResponse>(`/cross-domain/headline-synthesis?user_id=${userId}`),

  getHonestPushback: (userId: number) =>
    fetchApi<import('../types').HonestPushbackResponse>(`/cross-domain/honest-pushback?user_id=${userId}`),

  getLongitudinalMemories: (userId: number) =>
    fetchApi<import('../types').LongitudinalMemory[]>(`/cross-domain/memories?user_id=${userId}`),

  logFailureForensic: (data: Partial<import('../types').FailureForensic>, userId: number) =>
    fetchApi<import('../types').FailureForensic>(`/cross-domain/failure-forensics?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getFailureForensicsSummary: (userId: number) =>
    fetchApi<import('../types').FailureSummaryResponse>(`/cross-domain/failure-forensics/summary?user_id=${userId}`),

  applyCrossDomainAction: (action: string, userId: number) =>
    fetchApi<{ status: string; action: string; message: string; capped_hours?: number; target_date?: string }>(
      `/cross-domain/apply-action?action=${encodeURIComponent(action)}&user_id=${userId}`,
      { method: 'POST' }
    ),

  // Email Engine & Scheduled Reports
  getEmailPreferences: (userId: number) =>
    fetchApi<import('../types').EmailPreference>(`/email/preferences?user_id=${userId}`),

  updateEmailPreferences: (userId: number, preferences: Partial<import('../types').EmailPreference>) =>
    fetchApi<import('../types').EmailPreference>(`/email/preferences?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),

  testSendEmail: (userId: number, emailType: string, customRecipient?: string) =>
    fetchApi<import('../types').TestEmailSendResponse>('/email/test-send', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        email_type: emailType,
        custom_recipient: customRecipient,
      }),
    }),

  getEmailLogs: (userId: number) =>
    fetchApi<import('../types').EmailLog[]>(`/email/logs?user_id=${userId}`),

  // Inbound Document & Receipt Capture
  parseDocument: (userId: number, rawText: string, docType: string = 'auto') =>
    fetchApi<import('../types').DocumentParseResponse>('/documents/parse', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        raw_text: rawText,
        doc_type: docType,
      }),
    }),

  ingestDocument: (userId: number, docType: string, payload: Record<string, any>) =>
    fetchApi<import('../types').DocumentIngestResponse>('/documents/ingest', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        doc_type: docType,
        payload,
      }),
    }),

  getDocumentSampleTemplates: () =>
    fetchApi<{ admit_card: string; fee_receipt: string; syllabus: string }>('/documents/sample-templates'),
};

