from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    name = Column(String, nullable=False) # e.g. "Operating Systems", "Algorithms", "Computer Networks"
    total_hours_needed = Column(Float, default=50.0)
    hours_completed = Column(Float, default=0.0)
    readiness_pct = Column(Float, default=60.0) # 0.0 to 100.0
    weight = Column(Float, default=1.0) # importance multiplier in exam
    color_code = Column(String, default="#3b82f6") # Hex for UI rendering
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    exam = relationship("Exam", back_populates="subjects")
    tasks = relationship("Task", back_populates="subject", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
