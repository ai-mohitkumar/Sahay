from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AlarmBase(BaseModel):
    trigger_time: str # '07:00', '13:55'
    label: str
    type: str = "task_linked" # 'fixed', 'task_linked', 'recurring', 'smart'
    sound: str = "gentle_chime"
    days_of_week: str = "mon,tue,wed,thu,fri,sat,sun"
    snooze_allowed: bool = True
    snooze_count_limit: int = 3
    is_active: bool = True

class AlarmCreate(AlarmBase):
    task_id: Optional[int] = None
    schedule_id: Optional[int] = None

class AlarmOut(AlarmBase):
    id: int
    user_id: int
    task_id: Optional[int] = None
    schedule_id: Optional[int] = None
    current_snooze_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class AlarmLogOut(BaseModel):
    id: int
    alarm_id: int
    user_id: int
    triggered_at: datetime
    action: str
    snooze_count: int
    actual_response_time: datetime
    consequence_shown: Optional[str] = None

    class Config:
        from_attributes = True

class AlarmSnoozeRequest(BaseModel):
    minutes: int = 10

class AlarmSnoozeResponse(BaseModel):
    alarm_id: int
    new_trigger_time: str
    snooze_count: int
    max_snoozes: int
    consequence_level: str # 'none', 'warning', 'critical'
    consequence_message: str
    subsequent_impact: Optional[str] = None

class AlarmNegotiateResponse(BaseModel):
    alarm_id: int
    schedule_id: Optional[int]
    label: str
    negotiation_evaluation: Optional[Dict[str, Any]] = None

class AdaptiveAlarmSuggestion(BaseModel):
    alarm_id: int
    current_time: str
    suggested_time: str
    label: str
    confidence_pct: int
    reason: str
    action_type: str = "shift_time"
