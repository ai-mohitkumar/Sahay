from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    date = Column(Date, default=date.today, nullable=False)
    start_time = Column(String, nullable=False) # e.g. "09:00"
    end_time = Column(String, nullable=False)   # e.g. "10:30"
    title = Column(String, nullable=False)
    block_type = Column(String, default="study_session") # fixed_commitment, study_session, break, sleep, buffer
    is_fixed = Column(Boolean, default=False)
    status = Column(String, default="scheduled") # scheduled, in_progress, completed, skipped, postponed
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="schedules")
    task = relationship("Task", back_populates="schedules")
    activity_history = relationship("ActivityHistory", back_populates="schedule")
