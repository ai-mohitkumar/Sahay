from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel

class DeductiveReasoningChain(BaseModel):
    """
    Shows the work for the AI deduction / insight ('Why did you suggest this?').
    """
    data_points_used: List[str]
    sample_size_description: str # e.g. "18 days of tracked sleep, wallet, and focus data"
    confidence_pct: int # e.g. 89
    deductive_steps: List[str]

class HeadlineSynthesisResponse(BaseModel):
    """
    The Sentence Only Sahay Can Generate (Cross-Domain Moat).
    """
    user_id: int
    headline_insight: str # e.g. "You've spent ₹2,400 this week and slept under 6 hours 3 nights — both usually mean your focus drops 25%. Want me to lighten tomorrow's plan?"
    domains_involved: List[str] # ['Finances', 'Circadian Sleep', 'Focus Capacity', 'Exam Readiness']
    severity_level: str # 'optimal', 'caution', 'critical_friction'
    suggested_action: str # 'lighten_schedule', 'focus_sprint', 'stabilize_circadian'
    suggested_action_label: str # e.g. "Lighten Tomorrow's Plan (Apply 4h Cap)"
    reasoning_chain: DeductiveReasoningChain

class HonestPushbackResponse(BaseModel):
    """
    Calibrated Honest Pushback against over-ambitious planning.
    """
    is_pushback_triggered: bool
    planned_hours_today: float
    historical_30d_peak_hours: float
    historical_30d_avg_hours: float
    overplanning_delta_pct: float
    pushback_headline: str # e.g. "Honest Reality Check: 6.5h study queued vs 4.2h historical completion peak."
    pushback_rationale: str
    recommended_safe_hours: float
    reasoning_chain: DeductiveReasoningChain

class FailureForensicCreate(BaseModel):
    schedule_id: Optional[int] = None
    task_id: Optional[int] = None
    alarm_id: Optional[int] = None
    failure_type: str = "skipped_task" # 'skipped_task', 'snoozed_alarm_chronic', 'abandoned_plan'
    root_cause_tag: str # 'sleep_debt', 'phone_distraction', 'unrealistic_time', 'concept_too_hard', 'financial_anxiety', 'low_energy'
    root_cause_label: str # "Sleep Debt (<6h)", "Phone Distraction", etc.
    notes: Optional[str] = None

class FailureForensicOut(BaseModel):
    id: int
    user_id: int
    failure_type: str
    root_cause_tag: str
    root_cause_label: str
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class FailureCategorySummary(BaseModel):
    root_cause_tag: str
    root_cause_label: str
    count: int
    percentage: float

class FailureSummaryResponse(BaseModel):
    total_failures_recorded: int
    primary_failure_driver: str
    driver_percentage: float
    actionable_remedy: str
    breakdown: List[FailureCategorySummary]

class LongitudinalMemoryOut(BaseModel):
    id: int
    user_id: int
    category: str
    observed_pattern: str
    first_observed_date: date
    last_observed_date: date
    occurrence_count: int
    ai_callback_prompt: str
    confidence_pct: int
    is_active: bool

    class Config:
        from_attributes = True
