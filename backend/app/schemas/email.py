from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class EmailPreferenceBase(BaseModel):
    weekly_report: bool = True
    daily_digest: bool = True
    deadline_alerts: bool = True
    trade_off_fallback: bool = True
    send_time: str = "07:00"

class EmailPreferenceUpdate(BaseModel):
    weekly_report: Optional[bool] = None
    daily_digest: Optional[bool] = None
    deadline_alerts: Optional[bool] = None
    trade_off_fallback: Optional[bool] = None
    send_time: Optional[str] = None

class EmailPreferenceOut(EmailPreferenceBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class EmailLogOut(BaseModel):
    id: int
    user_id: int
    email_type: str
    recipient: str
    subject: str
    html_body: str
    status: str
    provider_message_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TestEmailSendRequest(BaseModel):
    user_id: int
    email_type: str # 'weekly_report', 'daily_digest', 'auth_otp'
    custom_recipient: Optional[str] = None

class TestEmailSendResponse(BaseModel):
    status: str
    message: str
    email_type: str
    recipient: str
    subject: str
    html_preview: str
    sent_at: datetime
