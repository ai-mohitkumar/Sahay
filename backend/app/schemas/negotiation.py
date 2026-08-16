from typing import List, Optional
from pydantic import BaseModel

class CounterProposal(BaseModel):
    id: str # e.g. 'shift_tonight', 'split_tomorrow', 'micro_session', 'weekend_swap', 'accept_penalty'
    title: str
    description: str
    action_type: str # 'reschedule_today', 'split_next_day', 'micro_duration', 'weekend_swap', 'drop'
    target_start_time: Optional[str] = None
    target_date: Optional[str] = None
    custom_duration_mins: Optional[int] = None
    readiness_impact_mitigated: float # % points saved

class NegotiationEvaluateRequest(BaseModel):
    user_id: int
    schedule_id: int
    proposed_action: str # 'skip', 'postpone', 'shorten'
    reason: Optional[str] = None # 'tired', 'emergency', 'procrastination', 'exam_load', 'social'
    custom_minutes: Optional[int] = None # for dynamic micro-negotiation slider

class NegotiationEvaluateResponse(BaseModel):
    schedule_id: int
    task_title: str
    subject_name: Optional[str] = None
    
    # 1. Cost of the conversation (Transparency)
    interruption_rationale: str
    
    # 2. Confidence-Calibrated Voice
    ai_confidence_level: str # e.g., 'Calibrating (4 days data)', 'High Confidence (89%)'
    confidence_voice_note: str
    
    # 3. Regret Ledger / Habit breaker
    times_previously_postponed: int
    regret_ledger_insight: Optional[str] = None
    
    # 4. Stress / Humane Mode
    is_stress_mode_active: bool = False
    
    # Standard consequence & trades
    consequence_narrative: str
    readiness_before_pct: float
    readiness_after_pct: float
    readiness_delta_pct: float
    catchup_debt_minutes: int
    burnout_risk_delta: float
    proposals: List[CounterProposal]

class NegotiationAcceptRequest(BaseModel):
    user_id: int
    schedule_id: int
    proposal_id: str
    custom_duration_mins: Optional[int] = None
    reason: Optional[str] = None

class NegotiationAcceptResponse(BaseModel):
    status: str
    message: str
    updated_schedule_block_id: Optional[int] = None
    readiness_delta: float
