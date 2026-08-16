from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    title = Column(String, nullable=False) # e.g. "Process Synchronization & Semaphores Practice"
    description = Column(String, nullable=True)
    estimated_duration_mins = Column(Integer, default=90) # default 90 min block
    difficulty = Column(String, default="medium") # easy, medium, hard
    priority = Column(Integer, default=1) # 1 (high), 2 (medium), 3 (low)
    status = Column(String, default="todo") # todo, in_progress, completed, skipped, postponed
    scheduled_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="tasks")
    subject = relationship("Subject", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")
    schedules = relationship("Schedule", back_populates="task")
    activity_history = relationship("ActivityHistory", back_populates="task")
