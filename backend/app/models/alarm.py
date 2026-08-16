from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Alarm(Base):
    """
    Context-Aware Smart Alarm model.
    Can be:
    - 'fixed': Wake-up or sleep alarms from user profile.
    - 'task_linked': Auto-generated 5 mins prior to a scheduled study block.
    - 'recurring': Daily recurring routine alarms (e.g. college prep, workout).
    - 'smart': Adaptive alarms dynamically suggested by Sahay AI.
    """
    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"), nullable=True)
    
    type = Column(String, default="task_linked") # 'fixed', 'task_linked', 'recurring', 'smart'
    trigger_time = Column(String, nullable=False) # e.g. '07:00' or '13:55'
    days_of_week = Column(String, default="mon,tue,wed,thu,fri,sat,sun") # Comma-separated
    
    label = Column(String, nullable=False) # e.g. "GATE Prep — Operating Systems"
    sound = Column(String, default="gentle_chime") # 'gentle_chime', 'energetic_pulse', 'zen_bell'
    
    snooze_allowed = Column(Boolean, default=True)
    snooze_count_limit = Column(Integer, default=3)
    current_snooze_count = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    task = relationship("Task")
    schedule = relationship("Schedule")
    logs = relationship("AlarmLog", back_populates="alarm", cascade="all, delete-orphan")


class AlarmLog(Base):
    """
    Logs every trigger, dismissal, snooze, and negotiation to feed behavior and adaptive alarm models.
    """
    __tablename__ = "alarm_logs"

    id = Column(Integer, primary_key=True, index=True)
    alarm_id = Column(Integer, ForeignKey("alarms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    triggered_at = Column(DateTime, default=datetime.utcnow)
    action = Column(String, nullable=False) # 'dismissed', 'snoozed', 'ignored', 'negotiated', 'started'
    snooze_count = Column(Integer, default=0)
    actual_response_time = Column(DateTime, default=datetime.utcnow)
    consequence_shown = Column(Text, nullable=True) # Text shown on 2nd+ snooze

    alarm = relationship("Alarm", back_populates="logs")
    user = relationship("User")
