from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    pillar = Column(String, default="study") # study, health, personal, finance, career
    priority = Column(Integer, default=1) # 1 (high), 2 (medium), 3 (low)
    target_hours_per_week = Column(Float, default=10.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal")
