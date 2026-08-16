from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse, AgentConversationOut
from app.services.ai_agent import AIAgentOrchestrator

router = APIRouter(prefix="/agent", tags=["AI Agent"])

@router.post("/query", response_model=AgentQueryResponse)
def query_agent(payload: AgentQueryRequest, db: Session = Depends(get_db)):
    """
    Core General-Purpose AI Agent endpoint:
    - Automatically injects multi-pillar student context (readiness, timeline, wallet, deadlines).
    - Classifies query intent (Study doubt, Schedule, Trade-off, Mental health, Admin, General).
    - Returns grounded answer with sources and dynamic quick-tap suggestions.
    - Persists memory across conversations.
    """
    try:
        res = AIAgentOrchestrator.process_query(
            db=db,
            user_id=payload.user_id,
            query=payload.message,
            session_id=payload.session_id,
            socratic_mode=payload.socratic_mode
        )
        return AgentQueryResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=AgentConversationOut)
def get_agent_history(
    user_id: int = Query(...),
    session_id: str = Query(...),
    db: Session = Depends(get_db)
):
    conv = AIAgentOrchestrator.get_conversation_history(db=db, user_id=user_id, session_id=session_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    return conv
