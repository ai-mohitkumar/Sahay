from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.cross_domain import (
    HeadlineSynthesisResponse,
    HonestPushbackResponse,
    FailureForensicCreate,
    FailureForensicOut,
    FailureSummaryResponse,
    LongitudinalMemoryOut
)
from app.services.cross_domain_brain import CrossDomainBrain

router = APIRouter(prefix="/cross-domain", tags=["cross-domain"])

@router.get("/headline-synthesis", response_model=HeadlineSynthesisResponse)
def get_headline_synthesis(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Returns the headline cross-domain synthesis ('The sentence only Sahay can generate')
    along with full transparent deductive reasoning chain ('Show its work').
    """
    return CrossDomainBrain.generate_headline_synthesis(db, user_id)

@router.get("/honest-pushback", response_model=HonestPushbackResponse)
def get_honest_pushback(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Returns calibrated honest pushback evaluating today's planned study load vs 30-day capacity.
    """
    return CrossDomainBrain.evaluate_honest_pushback(db, user_id)

@router.get("/memories", response_model=List[LongitudinalMemoryOut])
def get_longitudinal_memories(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Returns compounding multi-month memories and longitudinal behavioral callbacks.
    """
    return CrossDomainBrain.get_longitudinal_memories(db, user_id)

@router.post("/failure-forensics", response_model=FailureForensicOut)
def log_failure_forensic(payload: FailureForensicCreate, user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Logs 1-tap failure forensics (root-cause data) when a student skips or delays a task.
    """
    return CrossDomainBrain.log_failure_forensic(db, user_id, payload)

@router.get("/failure-forensics/summary", response_model=FailureSummaryResponse)
def get_failure_forensics_summary(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Returns aggregated breakdown of failure reasons and primary friction drivers.
    """
    return CrossDomainBrain.get_failure_summary(db, user_id)

@router.post("/apply-action")
def apply_cross_domain_action(action: str = Query("lighten_schedule"), user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Executes proactive cross-domain schedule calibration (e.g. 4h High-Retention Cap, Circadian Stabilization).
    """
    return CrossDomainBrain.apply_synthesis_action(db, user_id, action)
