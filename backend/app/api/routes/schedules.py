from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schedule import Schedule
from app.models.task import Task
from app.models.subject import Subject
from app.models.exam import Exam
from app.models.activity_history import ActivityHistory
from app.schemas.schedule import ScheduleBlockOut, ScheduleTimelineDay
from app.schemas.focus_productivity import FocusSessionLogRequest, FocusSessionLogResponse
from app.services.scheduler_engine import SchedulerEngine, time_to_minutes
from app.services.productivity_engine import ProductivityEngine

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.get("/timeline", response_model=ScheduleTimelineDay)
def get_timeline(
    user_id: int = Query(...),
    target_date: Optional[date] = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    """
    Returns the 24-hour vertical timeline blocks for the specified day with Why-Now reasoning.
    """
    blocks = db.query(Schedule).filter(
        Schedule.user_id == user_id,
        Schedule.date == target_date
    ).all()

    # If no schedule exists yet for today, auto-generate from user defaults
    if not blocks:
        blocks = SchedulerEngine.generate_daily_schedule(
            db=db,
            user_id=user_id,
            schedule_date=target_date
        )

    # Sort sequentially by start_time
    blocks = sorted(blocks, key=lambda b: time_to_minutes(b.start_time))

    total_study_mins = 0
    total_fixed_mins = 0

    block_outs = []
    for b in blocks:
        subj_name = None
        subj_color = None
        subj_obj = None
        exam_obj = None

        if b.task_id:
            t = db.query(Task).filter(Task.id == b.task_id).first()
            if t and t.subject_id:
                subj_obj = db.query(Subject).filter(Subject.id == t.subject_id).first()
                if subj_obj:
                    subj_name = subj_obj.name
                    subj_color = subj_obj.color_code
                    exam_obj = db.query(Exam).filter(Exam.id == subj_obj.exam_id).first() if subj_obj.exam_id else None

        start_m = time_to_minutes(b.start_time)
        end_m = time_to_minutes(b.end_time)
        dur = (end_m - start_m) if end_m >= start_m else (end_m + 24 * 60 - start_m)
        if b.block_type == "study_session":
            total_study_mins += dur
        elif b.block_type in ["fixed_commitment", "sleep"]:
            total_fixed_mins += dur

        why_now = ProductivityEngine.generate_why_now_reason(b, subj_obj, exam_obj)
        intensity = "deep_focus" if dur >= 60 else ("active_practice" if dur >= 30 else "quick_review")
        is_two_min = (dur <= 3)

        block_outs.append(
            ScheduleBlockOut(
                id=b.id,
                user_id=b.user_id,
                task_id=b.task_id,
                date=b.date,
                start_time=b.start_time,
                end_time=b.end_time,
                title=b.title,
                block_type=b.block_type,
                is_fixed=b.is_fixed,
                status=b.status,
                notes=b.notes,
                created_at=b.created_at,
                subject_name=subj_name,
                subject_color=subj_color,
                why_now_reason=why_now,
                focus_intensity=intensity,
                is_two_minute_task=is_two_min,
                focus_rating=5 if b.status == "completed" else None
            )
        )

    free_mins_remaining = max(0, (24 * 60) - (total_study_mins + total_fixed_mins))

    return ScheduleTimelineDay(
        date=target_date,
        blocks=block_outs,
        total_study_minutes=total_study_mins,
        total_fixed_minutes=total_fixed_mins,
        free_minutes_remaining=free_mins_remaining
    )

@router.post("/focus-session/log", response_model=FocusSessionLogResponse)
def log_focus_session(payload: FocusSessionLogRequest, db: Session = Depends(get_db)):
    """
    Logs completed deep work session with 1-5 star quality self-rating and distraction tags.
    Feeds genuine quality into the readiness model!
    """
    try:
        return ProductivityEngine.log_focus_session(
            db=db,
            user_id=payload.user_id,
            schedule_id=payload.schedule_id,
            duration_mins=payload.actual_duration_mins,
            quality_rating=payload.focus_quality_rating,
            distraction_count=payload.distraction_count,
            tags=payload.distraction_tags
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/regenerate", response_model=List[ScheduleBlockOut])
def regenerate_schedule(
    user_id: int = Query(...),
    target_date: Optional[date] = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    blocks = SchedulerEngine.generate_daily_schedule(
        db=db,
        user_id=user_id,
        schedule_date=target_date
    )
    return blocks

@router.patch("/{schedule_id}/complete")
def mark_schedule_completed(
    schedule_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    block = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.user_id == user_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Schedule block not found")

    block.status = "completed"
    task = db.query(Task).filter(Task.id == block.task_id).first() if block.task_id else None
    if task:
        task.status = "completed"

    subject = db.query(Subject).filter(Subject.id == task.subject_id).first() if (task and task.subject_id) else None
    if subject:
        subject.readiness_pct = min(100.0, subject.readiness_pct + 1.2)
        dur = (time_to_minutes(block.end_time) - time_to_minutes(block.start_time)) / 60.0
        subject.hours_completed += round(dur, 1)

    h = ActivityHistory(
        user_id=user_id,
        schedule_id=block.id,
        task_id=task.id if task else None,
        planned_start=block.start_time,
        planned_end=block.end_time,
        action="completed_block",
        readiness_delta=+1.2,
        created_at=datetime.utcnow()
    )
    db.add(h)
    db.commit()

    return {
        "status": "success",
        "message": f"Awesome! '{block.title}' marked done. Readiness increased by +1.2%.",
        "readiness_gain": 1.2
    }
