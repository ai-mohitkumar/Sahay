from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False) # e.g. "GATE CSE 2027", "UPSC 2026", "Semester Finals"
    target_date = Column(Date, nullable=False)
    target_score = Column(Float, nullable=True)
    current_readiness_pct = Column(Float, default=50.0) # 0.0 to 100.0
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="exams")
    subjects = relationship("Subject", back_populates="exam", cascade="all, delete-orphan")
