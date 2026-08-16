from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Pod(Base):
    """
    Social accountability pod (3-5 students prepping for the same exam).
    AI shares aggregate stats and positive momentum without toxic individual ranking.
    """
    __tablename__ = "pods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # e.g. "GATE CSE 2027 Alpha Pod"
    exam_target = Column(String, nullable=False)
    weekly_target_hours = Column(Float, default=30.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    members = relationship("PodMember", back_populates="pod", cascade="all, delete-orphan")

class PodMember(Base):
    __tablename__ = "pod_members"

    id = Column(Integer, primary_key=True, index=True)
    pod_id = Column(Integer, ForeignKey("pods.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    display_name = Column(String, nullable=False) # e.g. "Aarav S.", "Priya K."
    weekly_hours_logged = Column(Float, default=0.0)
    completion_rate_pct = Column(Float, default=70.0)
    streak_days = Column(Integer, default=5)
    last_active_session = Column(String, default="Operating Systems Practice")
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    pod = relationship("Pod", back_populates="members")
