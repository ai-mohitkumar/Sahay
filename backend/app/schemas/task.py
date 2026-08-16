from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    estimated_duration_mins: int = 90
    difficulty: str = "medium"
    priority: int = 1
    subject_id: Optional[int] = None
    goal_id: Optional[int] = None

class TaskCreate(TaskBase):
    user_id: int

class TaskOut(TaskBase):
    id: int
    user_id: int
    status: str
    scheduled_date: Optional[date] = None
    created_at: datetime
    subject_name: Optional[str] = None
    subject_color: Optional[str] = None

    class Config:
        from_attributes = True

class TaskStatusUpdate(BaseModel):
    status: str # 'completed', 'skipped', 'postponed', 'in_progress'
    reason: Optional[str] = None
    actual_duration_mins: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    estimated_duration_mins: Optional[int] = None
    difficulty: Optional[str] = None
    priority: Optional[int] = None
    subject_id: Optional[int] = None
    status: Optional[str] = None

