from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SimulationPoint(BaseModel):
    day: int
    date: str
    readiness_current_pace: float
    readiness_disciplined: float
    readiness_slacking: float
    burnout_risk: float
    cumulative_hours: float

class FutureSelfResponse(BaseModel):
    user_id: int
    exam_name: str
    days_to_exam: int
    current_readiness_pct: float
    projected_30d_readiness_pct: float
    projected_score_range: str
    burnout_status: str # 'Low / Sustainable', 'Moderate Caution', 'High Burnout Warning'
    burnout_score: float
    historical_compliance_rate_pct: float
    simulation_points: List[SimulationPoint]
    shareable_summary: str
