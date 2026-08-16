from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class ScheduleBlockBase(BaseModel):
    date: date
    start_time: str # "09:00"
    end_time: str   # "10:30"
    title: str
    block_type: str = "study_session" # fixed_commitment, study_session, break, sleep, buffer
    is_fixed: bool = False
    notes: Optional[str] = None

class ScheduleBlockCreate(ScheduleBlockBase):
    user_id: int
    task_id: Optional[int] = None

class ScheduleBlockOut(ScheduleBlockBase):
    id: int
    user_id: int
    task_id: Optional[int] = None
    status: str
    created_at: datetime
    subject_name: Optional[str] = None
    subject_color: Optional[str] = None
    why_now_reason: Optional[str] = None
    focus_intensity: str = "deep_focus" # deep_focus, active_practice, quick_review
    is_two_minute_task: bool = False
    focus_rating: Optional[int] = None

    class Config:
        from_attributes = True

class ScheduleTimelineDay(BaseModel):
    date: date
    blocks: list[ScheduleBlockOut]
    total_study_minutes: int
    total_fixed_minutes: int
    free_minutes_remaining: int
