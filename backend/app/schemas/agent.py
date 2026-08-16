from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AgentQueryRequest(BaseModel):
    user_id: int
    message: str
    session_id: Optional[str] = None
    socratic_mode: bool = False

class AgentMessageOut(BaseModel):
    id: int
    role: str
    content: str
    intent_type: str
    grounding_source: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AgentQueryResponse(BaseModel):
    session_id: str
    reply: str
    intent_type: str
    grounding_source: str
    quick_suggestions: List[str] = []
    context_used_summary: Optional[str] = None

class AgentConversationOut(BaseModel):
    id: int
    session_id: str
    title: str
    started_at: datetime
    messages: List[AgentMessageOut] = []

    class Config:
        from_attributes = True
