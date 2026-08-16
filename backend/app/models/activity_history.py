from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class ActivityHistory(Base):
    """
    Core data foundation: records every single completion, skip, delay, or negotiation outcome.
    This enables the Trade-Off Engine to accurately model student friction points and predict future readiness.
    """
    __tablename__ = "activity_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"), nullable=True)
    planned_start = Column(String, nullable=True)
    planned_end = Column(String, nullable=True)
    actual_start = Column(String, nullable=True)
    actual_end = Column(String, nullable=True)
    planned_duration_mins = Column(Integer, default=90)
    actual_duration_mins = Column(Integer, default=0)
    action = Column(String, nullable=False) # 'done', 'skipped', 'postponed', 'negotiated_reschedule'
    reason = Column(String, nullable=True)  # 'tired', 'emergency', 'procrastination', 'exam_load', 'social'
    readiness_delta = Column(Float, default=0.0) # change in subject/exam readiness score (+/- %)
    burnout_impact = Column(Float, default=0.0)  # incremental impact on burnout score
    ai_negotiation_accepted = Column(String, nullable=True) # which counter-proposal was chosen, if any
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="activity_history")
    task = relationship("Task", back_populates="activity_history")
    schedule = relationship("Schedule", back_populates="activity_history")
