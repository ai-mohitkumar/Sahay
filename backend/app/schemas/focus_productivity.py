from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime

class SubTaskItem(BaseModel):
    id: str
    title: str
    duration_mins: int
    focus_intensity: str # 'deep_work', 'quick_scan', 'active_recall'
    is_completed: bool = False

class TaskBreakdownRequest(BaseModel):
    task_title: str
    subject_name: Optional[str] = None
    target_duration_mins: int = 60

class TaskBreakdownResponse(BaseModel):
    original_title: str
    activation_strategy: str # e.g. 'Low-friction start with 5m review before hard numericals'
    total_duration_mins: int
    subtasks: List[SubTaskItem]

class FocusSessionLogRequest(BaseModel):
    user_id: int
    schedule_id: int
    actual_duration_mins: int
    focus_quality_rating: int # 1 to 5 stars
    distraction_count: int = 0
    distraction_tags: List[str] = [] # 'phone', 'tired', 'noise', 'procrastination'
    notes: Optional[str] = None

class FocusSessionLogResponse(BaseModel):
    status: str
    message: str
    readiness_gain: float
    focus_quality_rating: int
    ai_quality_feedback: str

class DistractionLogRequest(BaseModel):
    user_id: int
    schedule_id: int
    reason_tag: str # 'phone_notification', 'mental_fatigue', 'noise', 'wandering'
