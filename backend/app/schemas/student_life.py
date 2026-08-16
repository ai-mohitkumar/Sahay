from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel

class OpportunityOut(BaseModel):
    id: int
    title: str
    opportunity_type: str
    organization: str
    deadline: date
    description: Optional[str] = None
    link_url: Optional[str] = None
    relevance_score: float
    days_remaining: int
    application_status: str = "unapplied"

class OpportunityApplicationCreate(BaseModel):
    user_id: int
    opportunity_id: int
    status: str = "applied"
    notes: Optional[str] = None

class StudentExpenseCreate(BaseModel):
    user_id: int
    title: str
    category: str = "food" # food, books_academics, rent_hostel, travel, entertainment
    amount: float
    payment_method: str = "upi"

class StudentExpenseOut(BaseModel):
    id: int
    title: str
    category: str
    amount: float
    expense_date: date
    payment_method: str

class StudentBudgetOut(BaseModel):
    month_str: str
    total_allowance: float
    spent_so_far: float
    remaining_balance: float
    daily_safe_spend: float
    recent_expenses: List[StudentExpenseOut] = []

class HealthEnergyLogCreate(BaseModel):
    user_id: int
    sleep_hours: float
    sleep_quality: str = "good"
    energy_level: int = 4
    stress_score: float = 0.2
    notes: Optional[str] = None

class HealthEnergyLogOut(BaseModel):
    id: int
    log_date: date
    sleep_hours: float
    sleep_quality: str
    energy_level: int
    stress_score: float
    recovery_mode_active: bool
    peer_empathy_note: str

class StudentDocumentCreate(BaseModel):
    user_id: int
    title: str
    doc_type: str = "exam_admit_card"
    expiry_or_event_date: Optional[date] = None
    download_url_or_ref: Optional[str] = None

class StudentDocumentOut(BaseModel):
    id: int
    title: str
    doc_type: str
    expiry_or_event_date: Optional[date] = None
    download_url_or_ref: Optional[str] = None
    days_until_event: Optional[int] = None
    is_urgent: bool = False

class StudentRoutineCreate(BaseModel):
    user_id: int
    item_title: str
    category: str = "routine"
    frequency: str = "daily"

class StudentRoutineOut(BaseModel):
    id: int
    item_title: str
    category: str
    frequency: str
    is_completed_today: bool

class StudentLifeOverview(BaseModel):
    user_name: str
    active_opportunities_count: int
    urgent_deadlines: List[OpportunityOut]
    monthly_budget: StudentBudgetOut
    health_status: HealthEnergyLogOut
    pending_documents: List[StudentDocumentOut]
    daily_routines: List[StudentRoutineOut]
    ai_holistic_nudge: str

class CrossDomainConsultRequest(BaseModel):
    user_id: int
    question: str # e.g. "Should I skip gym today to finish my OS assignment?" or "Where should I get printing done before the exam?"
    context_hint: Optional[str] = None

class CrossDomainConsultResponse(BaseModel):
    domain_primary: str # 'cross_domain', 'academic', 'health', 'finance', 'career', 'life_admin'
    verdict: str # 'Keep Gym + Reschedule OS to Morning', 'Focus on Sleep First', 'Approved'
    recommendation: str
    trade_breakdown: List[str] # Detailed points synthesizing Academic + Health + Time
    compassionate_signoff: str
