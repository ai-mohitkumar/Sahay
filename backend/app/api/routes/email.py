from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.email_log import EmailPreference, EmailLog
from app.schemas.email import (
    EmailPreferenceUpdate,
    EmailPreferenceOut,
    EmailLogOut,
    TestEmailSendRequest,
    TestEmailSendResponse,
)
from app.services.email_engine import EmailEngine

router = APIRouter(prefix="/email", tags=["Email Engine & Scheduled Reports"])

@router.get("/preferences", response_model=EmailPreferenceOut)
def get_email_preferences(user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Returns email notification preferences for the user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return EmailEngine.get_or_create_preferences(db, user_id)

@router.put("/preferences", response_model=EmailPreferenceOut)
def update_email_preferences(
    user_id: int = Query(...),
    payload: EmailPreferenceUpdate = None,
    db: Session = Depends(get_db)
):
    """
    Updates email preferences (Weekly Report, Daily Digest, Deadline Alerts, Send Time).
    """
    pref = EmailEngine.get_or_create_preferences(db, user_id)
    if payload.weekly_report is not None:
        pref.weekly_report = payload.weekly_report
    if payload.daily_digest is not None:
        pref.daily_digest = payload.daily_digest
    if payload.deadline_alerts is not None:
        pref.deadline_alerts = payload.deadline_alerts
    if payload.trade_off_fallback is not None:
        pref.trade_off_fallback = payload.trade_off_fallback
    if payload.send_time is not None:
        pref.send_time = payload.send_time

    db.commit()
    db.refresh(pref)
    return pref

@router.post("/test-send", response_model=TestEmailSendResponse)
def test_send_email(payload: TestEmailSendRequest, db: Session = Depends(get_db)):
    """
    Instant test-send / preview endpoint for Web v1.
    Delivers a rendered HTML email (Weekly Report, Daily Digest, or Auth Passcode) and returns live preview.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    recipient = payload.custom_recipient or user.email or f"{user.name.lower().replace(' ', '')}@sahay.app"

    if payload.email_type == "weekly_report":
        log = EmailEngine.send_weekly_report(db, user.id)
    elif payload.email_type == "daily_digest":
        log = EmailEngine.send_daily_digest(db, user.id)
    elif payload.email_type == "auth_otp":
        log = EmailEngine.send_auth_otp(db, user.id, recipient, code="749216")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported email type: {payload.email_type}")

    return TestEmailSendResponse(
        status="success",
        message=f"'{payload.email_type}' email dispatched to {recipient}!",
        email_type=log.email_type,
        recipient=log.recipient,
        subject=log.subject,
        html_preview=log.html_body,
        sent_at=log.created_at
    )

@router.get("/logs", response_model=List[EmailLogOut])
def get_email_logs(user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Returns audit trail of delivered emails.
    """
    logs = db.query(EmailLog).filter(EmailLog.user_id == user_id).order_by(EmailLog.created_at.desc()).limit(20).all()
    return logs
