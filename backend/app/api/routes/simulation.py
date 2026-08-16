from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.simulation import FutureSelfResponse
from app.services.simulation_engine import SimulationEngine

router = APIRouter(prefix="/simulation", tags=["Future Self Simulation"])

@router.get("/future-self", response_model=FutureSelfResponse)
def get_future_self_projection(user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Simulates 30 days ahead based on actual activity history,
    calculating readiness trajectories and burnout risk.
    """
    try:
        projection = SimulationEngine.project_future_self(db=db, user_id=user_id)
        return projection
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
