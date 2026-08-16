from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.negotiation import (
    NegotiationEvaluateRequest,
    NegotiationEvaluateResponse,
    NegotiationAcceptRequest,
    NegotiationAcceptResponse
)
from app.services.tradeoff_engine import TradeOffEngine

router = APIRouter(prefix="/negotiation", tags=["Trade-Off Negotiation Engine"])

@router.post("/evaluate", response_model=NegotiationEvaluateResponse)
def evaluate_consequence(payload: NegotiationEvaluateRequest, db: Session = Depends(get_db)):
    """
    Evaluates the real consequence of a proposed skip/postpone action.
    Returns impact metrics, calibrated confidence, stakes rationale, regret ledger, and smart counter-proposals.
    """
    try:
        response = TradeOffEngine.evaluate_tradeoff(
            db=db,
            user_id=payload.user_id,
            schedule_id=payload.schedule_id,
            proposed_action=payload.proposed_action,
            reason=payload.reason,
            custom_minutes=payload.custom_minutes
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/accept", response_model=NegotiationAcceptResponse)
def accept_trade_proposal(payload: NegotiationAcceptRequest, db: Session = Depends(get_db)):
    """
    Executes the agreed-upon negotiation trade (e.g. shift to evening, split tomorrow, micro-session),
    updates schedules, and logs an entry into the activity_history table.
    """
    try:
        response = TradeOffEngine.accept_proposal(
            db=db,
            user_id=payload.user_id,
            schedule_id=payload.schedule_id,
            proposal_id=payload.proposal_id,
            custom_duration_mins=payload.custom_duration_mins,
            reason=payload.reason
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
