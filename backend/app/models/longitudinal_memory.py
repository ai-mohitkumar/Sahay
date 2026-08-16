from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class LongitudinalMemory(Base):
    """
    Compounding Multi-Month Memory of student patterns, cycles, and behavioral habits.
    Prevents the stateless 'chatbot reset' problem.
    """
    __tablename__ = "longitudinal_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    category = Column(String, nullable=False) # 'sleep_cycle', 'overplanning_habit', 'financial_stress', 'subject_avoidance', 'exam_anxiety'
    observed_pattern = Column(Text, nullable=False) # e.g. "Stalls on Process Synchronization when scheduled before 2 PM"
    first_observed_date = Column(Date, default=date.today)
    last_observed_date = Column(Date, default=date.today)
    occurrence_count = Column(Integer, default=1)
    
    ai_callback_prompt = Column(Text, nullable=False) # e.g. "Every October you say you're going to fix your sleep schedule and don't — want to try something different this time?"
    confidence_pct = Column(Integer, default=85)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class FailureForensic(Base):
    """
    Captures the 'Why did this fail' root-cause data when a student skips a block,
    snoozes an alarm repeatedly, or abandons a daily plan.
    """
    __tablename__ = "failure_forensics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("schedules.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    alarm_id = Column(Integer, ForeignKey("alarms.id"), nullable=True)

    failure_type = Column(String, nullable=False) # 'skipped_task', 'snoozed_alarm_chronic', 'abandoned_plan', 'procrastination'
    root_cause_tag = Column(String, nullable=False) # 'sleep_debt', 'phone_distraction', 'unrealistic_time', 'concept_too_hard', 'financial_anxiety', 'low_energy'
    root_cause_label = Column(String, nullable=False) # "Sleep Debt (<6h)", "Phone / Social Distraction", etc.
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    schedule = relationship("Schedule")
    task = relationship("Task")
    alarm = relationship("Alarm")
