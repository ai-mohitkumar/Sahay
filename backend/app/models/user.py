from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    wake_time = Column(String, default="07:00", nullable=False)  # HH:MM format
    sleep_time = Column(String, default="23:00", nullable=False) # HH:MM format
    daily_capacity_hours = Column(Float, default=6.0, nullable=False)
    burnout_risk_score = Column(Float, default=0.15) # 0.0 to 1.0
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    activity_history = relationship("ActivityHistory", back_populates="user", cascade="all, delete-orphan")
