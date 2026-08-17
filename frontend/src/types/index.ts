export type BlockType = 'fixed_commitment' | 'study_session' | 'break' | 'sleep' | 'buffer';
export type BlockStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'postponed';

export interface ScheduleBlock {
  id: number;
  user_id: number;
  task_id?: number | null;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  block_type: BlockType;
  is_fixed: boolean;
  status: BlockStatus;
  notes?: string | null;
  created_at: string;
  subject_name?: string | null;
  subject_color?: string | null;
  why_now_reason?: string | null;
  focus_intensity?: string;
  is_two_minute_task?: boolean;
  focus_rating?: number | null;
}

export interface SubTaskItem {
  id: string;
  title: string;
  duration_mins: number;
  focus_intensity: string;
  is_completed: boolean;
}

export interface TaskBreakdownResponse {
  original_title: string;
  activation_strategy: string;
  total_duration_mins: number;
  subtasks: SubTaskItem[];
}

export interface FocusSessionLogResponse {
  status: string;
  message: string;
  readiness_gain: number;
  focus_quality_rating: number;
  ai_quality_feedback: string;
}

export interface ScheduleTimelineDay {
  date: string;
  blocks: ScheduleBlock[];
  total_study_minutes: number;
  total_fixed_minutes: number;
  free_minutes_remaining: number;
}

export interface CounterProposal {
  id: string;
  title: string;
  description: string;
  action_type: string;
  target_start_time?: string | null;
  target_date?: string | null;
  custom_duration_mins?: number | null;
  readiness_impact_mitigated: number;
}

export interface NegotiationEvaluation {
  schedule_id: number;
  task_title: string;
  subject_name?: string | null;
  
  // 1. Cost of the conversation (Transparency)
  interruption_rationale: string;
  
  // 2. Confidence-Calibrated Voice
  ai_confidence_level: string;
  confidence_voice_note: string;
  
  // 3. Regret Ledger & Habit Loop
  times_previously_postponed: number;
  regret_ledger_insight?: string | null;
  
  // 4. Stress / Humane Mode
  is_stress_mode_active: boolean;
  
  consequence_narrative: string;
  readiness_before_pct: number;
  readiness_after_pct: number;
  readiness_delta_pct: number;
  catchup_debt_minutes: number;
  burnout_risk_delta: number;
  proposals: CounterProposal[];
}

export interface StateOfYouReport {
  user_name: string;
  exam_name: string;
  report_period: string;
  coach_letter: string;
  top_win: string;
  friction_pattern: string;
  sleep_health_note: string;
  readiness_summary: string;
  recommended_focus_next_week: string;
  shareable_quote: string;
}

export interface SimulationPoint {
  day: number;
  date: string;
  readiness_current_pace: number;
  readiness_disciplined: number;
  readiness_slacking: number;
  burnout_risk: number;
  cumulative_hours: number;
}

export interface FutureSelfData {
  user_id: number;
  exam_name: string;
  days_to_exam: number;
  current_readiness_pct: number;
  projected_30d_readiness_pct: number;
  projected_score_range: string;
  burnout_status: string;
  burnout_score: number;
  historical_compliance_rate_pct: number;
  simulation_points: SimulationPoint[];
  shareable_summary: string;
}

export interface ActivityEvent {
  id: number;
  user_id: number;
  task_id?: number | null;
  schedule_id?: number | null;
  action: string;
  reason?: string | null;
  readiness_delta: number;
  burnout_impact: number;
  ai_negotiation_accepted?: string | null;
  timestamp: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email?: string | null;
  wake_time: string;
  sleep_time: string;
  daily_capacity_hours: number;
  exam_name?: string | null;
}

export interface PodMember {
  id: number;
  display_name: string;
  weekly_hours_logged: number;
  completion_rate_pct: number;
  streak_days: number;
  last_active_session: string;
  is_current_user: boolean;
}

export interface PodDetail {
  id: number;
  name: string;
  exam_target: string;
  weekly_target_hours: number;
  pod_average_completion_pct: number;
  user_completion_pct: number;
  total_members: number;
  nudge_message: string;
  members: PodMember[];
}

export interface Material {
  id: number;
  topic_id: number;
  title: string;
  content_type: string;
  content_body: string;
  source: string;
}

export interface Question {
  id: number;
  topic_id: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty: string;
  source: string;
  year_tag?: string;
}

export interface TopicDetail {
  id: number;
  subject_id: number;
  name: string;
  importance_weight: number;
  difficulty: string;
  estimated_hours: number;
  readiness_pct: number;
  total_questions: number;
  attempted_count: number;
  accuracy_pct: number;
  materials: Material[];
}

export interface SubjectStudyTree {
  subject_id: number;
  subject_name: string;
  subject_color: string;
  overall_readiness_pct: number;
  total_topics: number;
  topics: TopicDetail[];
}

export interface QuestionAttemptResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  subject_readiness_delta: number;
  updated_topic_readiness_pct: number;
  ai_quick_feedback: string;
}

export interface AskAIResponse {
  ai_guidance: string;
  socratic_question?: string | null;
  misconception_diagnosed?: string | null;
  key_formula_or_rule?: string | null;
  encouragement: string;
}

export interface DrillSummary {
  total_questions: number;
  correct_count: number;
  accuracy_pct: number;
  time_spent_mins: number;
  readiness_gain_pct: number;
  post_mortem_debrief: string;
  weak_subtopic_flagged?: string | null;
}

export interface Opportunity {
  id: number;
  title: string;
  opportunity_type: string;
  organization: string;
  deadline: string;
  description?: string | null;
  link_url?: string | null;
  relevance_score: number;
  days_remaining: number;
  application_status: string;
}

export interface StudentExpense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_method: string;
}

export interface StudentBudget {
  month_str: string;
  total_allowance: number;
  spent_so_far: number;
  remaining_balance: number;
  daily_safe_spend: number;
  recent_expenses: StudentExpense[];
}

export interface HealthEnergyLog {
  id: number;
  log_date: string;
  sleep_hours: number;
  sleep_quality: string;
  energy_level: number;
  stress_score: number;
  recovery_mode_active: boolean;
  peer_empathy_note: string;
}

export interface StudentDocument {
  id: number;
  title: string;
  doc_type: string;
  expiry_or_event_date?: string | null;
  download_url_or_ref?: string | null;
  days_until_event?: number | null;
  is_urgent: boolean;
}

export interface StudentRoutine {
  id: number;
  item_title: string;
  category: string;
  frequency: string;
  is_completed_today: boolean;
}

export interface StudentLifeOverview {
  user_name: string;
  active_opportunities_count: number;
  urgent_deadlines: Opportunity[];
  monthly_budget: StudentBudget;
  health_status: HealthEnergyLog;
  pending_documents: StudentDocument[];
  daily_routines: StudentRoutine[];
  ai_holistic_nudge: string;
}

export interface CrossDomainConsultResponse {
  domain_primary: string;
  verdict: string;
  recommendation: string;
  trade_breakdown: string[];
  compassionate_signoff: string;
}

export interface AgentMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  intent_type?: string;
  grounding_source?: string;
  timestamp?: string;
}

export interface AgentQueryResponse {
  session_id: string;
  reply: string;
  intent_type: string;
  grounding_source: string;
  quick_suggestions: string[];
  context_used_summary?: string | null;
}

export interface Alarm {
  id: number;
  user_id: number;
  task_id?: number | null;
  schedule_id?: number | null;
  type: 'fixed' | 'task_linked' | 'recurring' | 'smart';
  trigger_time: string;
  days_of_week: string;
  label: string;
  sound: string;
  snooze_allowed: boolean;
  snooze_count_limit: number;
  current_snooze_count: number;
  is_active: boolean;
  created_at?: string;
}

export interface AlarmLog {
  id: number;
  alarm_id: number;
  user_id: number;
  triggered_at: string;
  action: 'dismissed' | 'snoozed' | 'ignored' | 'negotiated' | 'started';
  snooze_count: number;
  actual_response_time: string;
  consequence_shown?: string | null;
}

export interface AlarmSnoozeResponse {
  alarm_id: number;
  new_trigger_time: string;
  snooze_count: number;
  max_snoozes: number;
  consequence_level: 'none' | 'warning' | 'critical';
  consequence_message: string;
  subsequent_impact?: string | null;
}

export interface AlarmNegotiateResponse {
  alarm_id: number;
  schedule_id?: number | null;
  label: string;
  negotiation_evaluation?: NegotiationEvaluation | null;
}

export interface AdaptiveAlarmSuggestion {
  alarm_id: number;
  current_time: string;
  suggested_time: string;
  label: string;
  confidence_pct: number;
  reason: string;
  action_type: string;
}

export interface DeductiveReasoningChain {
  data_points_used: string[];
  sample_size_description: string;
  confidence_pct: number;
  deductive_steps: string[];
}

export interface HeadlineSynthesisResponse {
  user_id: number;
  headline_insight: string;
  domains_involved: string[];
  severity_level: 'optimal' | 'caution' | 'critical_friction';
  suggested_action: string;
  suggested_action_label: string;
  reasoning_chain: DeductiveReasoningChain;
}

export interface HonestPushbackResponse {
  is_pushback_triggered: boolean;
  planned_hours_today: number;
  historical_30d_peak_hours: number;
  historical_30d_avg_hours: number;
  overplanning_delta_pct: number;
  pushback_headline: string;
  pushback_rationale: string;
  recommended_safe_hours: number;
  reasoning_chain: DeductiveReasoningChain;
}

export interface FailureForensic {
  id?: number;
  user_id?: number;
  schedule_id?: number | null;
  task_id?: number | null;
  alarm_id?: number | null;
  failure_type: string;
  root_cause_tag: string;
  root_cause_label: string;
  notes?: string | null;
  timestamp?: string;
}

export interface FailureCategorySummary {
  root_cause_tag: string;
  root_cause_label: string;
  count: number;
  percentage: number;
}

export interface FailureSummaryResponse {
  total_failures_recorded: number;
  primary_failure_driver: string;
  driver_percentage: number;
  actionable_remedy: string;
  breakdown: FailureCategorySummary[];
}

export interface LongitudinalMemory {
  id: number;
  user_id: number;
  category: string;
  observed_pattern: string;
  first_observed_date: string;
  last_observed_date: string;
  occurrence_count: number;
  ai_callback_prompt: string;
  confidence_pct: number;
  is_active: boolean;
}

export interface EmailPreference {
  id: number;
  user_id: number;
  weekly_report: boolean;
  daily_digest: boolean;
  deadline_alerts: boolean;
  trade_off_fallback: boolean;
  send_time: string;
  updated_at: string;
}

export interface EmailLog {
  id: number;
  user_id: number;
  email_type: string;
  recipient: string;
  subject: string;
  html_body: string;
  status: string;
  provider_message_id?: string;
  created_at: string;
}

export interface TestEmailSendResponse {
  status: string;
  message: string;
  email_type: string;
  recipient: string;
  subject: string;
  html_preview: string;
  sent_at: string;
}

export interface ParsedAdmitCard {
  exam_name: string;
  target_date: string;
  registration_number?: string;
  center_city?: string;
  shift_time?: string;
  confidence_pct: number;
}

export interface ParsedFeeReceipt {
  title: string;
  amount: number;
  category: string;
  transaction_id?: string;
  payment_method: string;
  date: string;
  confidence_pct: number;
}

export interface SyllabusModuleItem {
  title: string;
  estimated_hours: number;
  priority: number;
  difficulty: string;
}

export interface ParsedSyllabus {
  subject_name: string;
  total_estimated_hours: number;
  color_code: string;
  modules: SyllabusModuleItem[];
  confidence_pct: number;
}

export interface DocumentParseResponse {
  doc_type: 'admit_card' | 'fee_receipt' | 'syllabus';
  summary: string;
  admit_card?: ParsedAdmitCard;
  fee_receipt?: ParsedFeeReceipt;
  syllabus?: ParsedSyllabus;
}

export interface DocumentIngestResponse {
  status: string;
  message: string;
  entity_type: string;
  created_id: number;
  details: Record<string, any>;
}


