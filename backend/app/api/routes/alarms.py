from typing import List, Dict, Any, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.alarm import Alarm, AlarmLog
from app.schemas.alarm import (
    AlarmCreate,
    AlarmOut,
    AlarmLogOut,
    AlarmSnoozeRequest,
    AlarmSnoozeResponse,
    AlarmNegotiateResponse,
    AdaptiveAlarmSuggestion
)
from app.services.alarm_engine import AlarmEngine

router = APIRouter(prefix="/alarms", tags=["alarms"])

@router.post("", response_model=AlarmOut)
def create_alarm(alarm_in: AlarmCreate, user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Create a manual or fixed alarm.
    """
    alarm = Alarm(
        user_id=user_id,
        task_id=alarm_in.task_id,
        schedule_id=alarm_in.schedule_id,
        type=alarm_in.type,
        trigger_time=alarm_in.trigger_time,
        days_of_week=alarm_in.days_of_week,
        label=alarm_in.label,
        sound=alarm_in.sound,
        snooze_allowed=alarm_in.snooze_allowed,
        snooze_count_limit=alarm_in.snooze_count_limit,
        is_active=alarm_in.is_active
    )
    db.add(alarm)
    db.commit()
    db.refresh(alarm)
    return alarm

@router.get("/today", response_model=List[AlarmOut])
def get_today_alarms(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Get all active alarms for today. Automatically syncs with today's timeline if needed.
    """
    alarms = db.query(Alarm).filter(
        Alarm.user_id == user_id,
        Alarm.is_active == True
    ).all()

    if not alarms:
        alarms = AlarmEngine.sync_schedule_alarms(db, user_id)

    return alarms

@router.post("/sync-timeline", response_model=List[AlarmOut])
def sync_timeline_alarms(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Explicitly synchronizes task-linked alarms with today's schedule blocks.
    """
    return AlarmEngine.sync_schedule_alarms(db, user_id)

@router.post("/{alarm_id}/dismiss", response_model=AlarmOut)
def dismiss_alarm(alarm_id: int, action: str = Query("dismissed"), user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Dismiss or start alarm. Resets snooze count.
    """
    try:
        alarm = AlarmEngine.dismiss_alarm(db, user_id, alarm_id, action=action)
        return alarm
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{alarm_id}/snooze", response_model=AlarmSnoozeResponse)
def snooze_alarm(alarm_id: int, snooze_in: AlarmSnoozeRequest, user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Snoozes alarm by X minutes with progressive consequence warnings.
    """
    try:
        res = AlarmEngine.snooze_alarm(db, user_id, alarm_id, minutes=snooze_in.minutes)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{alarm_id}/negotiate", response_model=AlarmNegotiateResponse)
def negotiate_alarm(alarm_id: int, user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Routes alarm trigger into Sahay's Trade-Off Engine to bargain with AI.
    """
    try:
        res = AlarmEngine.negotiate_alarm(db, user_id, alarm_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/adaptive-suggestions", response_model=List[AdaptiveAlarmSuggestion])
def get_adaptive_suggestions(user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Returns AI-suggested alarm adjustments based on chronic snooze history.
    """
    return AlarmEngine.get_adaptive_suggestions(db, user_id)

@router.post("/apply-adaptive-shift")
def apply_adaptive_shift(alarm_id: int = Query(...), suggested_time: str = Query(...), user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Applies the AI-suggested time shift to the target alarm and updates user circadian wake settings.
    """
    try:
        return AlarmEngine.apply_adaptive_shift(db, user_id, alarm_id, suggested_time)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{alarm_id}")
def delete_alarm(alarm_id: int, user_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Delete an alarm.
    """
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == user_id).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    db.delete(alarm)
    db.commit()
    return {"status": "deleted", "id": alarm_id}
