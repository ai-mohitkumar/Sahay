from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class AgentConversation(Base):
    __tablename__ = "agent_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(64), index=True, nullable=False)
    title = Column(String(255), default="Chat Session")
    started_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    messages = relationship("AgentMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AgentMessage.id")

class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("agent_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False) # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    intent_type = Column(String(50), default="general_knowledge") # 'study_doubt', 'schedule_planning', 'tradeoff_negotiation', 'emotional_support', 'life_admin', 'general_knowledge'
    grounding_source = Column(String(100), default="Sahay AI Brain")
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("AgentConversation", back_populates="messages")
