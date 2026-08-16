from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from app.db.session import Base

class EmailPreference(Base):
    __tablename__ = "email_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    weekly_report = Column(Boolean, default=True, nullable=False)
    daily_digest = Column(Boolean, default=True, nullable=False)
    deadline_alerts = Column(Boolean, default=True, nullable=False)
    trade_off_fallback = Column(Boolean, default=True, nullable=False)
    send_time = Column(String, default="07:00", nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    email_type = Column(String, nullable=False) # 'weekly_report', 'daily_digest', 'deadline_alert', 'auth_otp', 'tradeoff_alert'
    recipient = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    html_body = Column(Text, nullable=False)
    status = Column(String, default="sent") # 'sent', 'delivered', 'failed', 'simulated'
    provider_message_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
