from datetime import date
from typing import List, Optional
from pydantic import BaseModel

class FixedCommitmentInput(BaseModel):
    title: str # e.g. "College Lectures", "Coaching Class", "Gym / Workout"
    start_time: str # "09:00"
    end_time: str   # "13:00"
    days_of_week: Optional[List[int]] = [0, 1, 2, 3, 4] # Mon-Fri

class SubjectInput(BaseModel):
    name: str # e.g. "Operating Systems", "Data Structures"
    total_hours_needed: float = 45.0
    current_readiness_pct: float = 50.0
    weight: float = 1.0
    color_code: Optional[str] = "#3b82f6"

class ExamInput(BaseModel):
    name: str # "GATE CSE 2027"
    target_date: date
    target_score: Optional[float] = 80.0
    subjects: List[SubjectInput] = []

class OnboardingRequest(BaseModel):
    name: str
    email: Optional[str] = None
    wake_time: str = "07:00"
    sleep_time: str = "23:00"
    daily_capacity_hours: float = 6.0
    fixed_commitments: List[FixedCommitmentInput] = []
    exam: Optional[ExamInput] = None

class OnboardingResponse(BaseModel):
    user_id: int
    exam_id: Optional[int] = None
    message: str
    generated_blocks_count: int
    sample_first_day_schedule: List[dict]
