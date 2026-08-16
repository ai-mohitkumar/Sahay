from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pod import Pod, PodMember
from app.models.user import User

router = APIRouter(prefix="/pods", tags=["Social Accountability Pods"])

class PodMemberOut(BaseModel):
    id: int
    display_name: str
    weekly_hours_logged: float
    completion_rate_pct: float
    streak_days: int
    last_active_session: str
    is_current_user: bool = False

class PodDetailOut(BaseModel):
    id: int
    name: str
    exam_target: str
    weekly_target_hours: float
    pod_average_completion_pct: float
    user_completion_pct: float
    total_members: int
    nudge_message: str
    members: List[PodMemberOut]

@router.get("/my-pod", response_model=PodDetailOut)
def get_user_pod(user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Returns the user's accountability pod details and non-toxic aggregate benchmarks.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find pod or create default demo pod
    pod = db.query(Pod).first()
    if not pod:
        exam_name = user.exams[0].name if user.exams else "GATE CSE 2027"
        pod = Pod(
            name=f"{exam_name} Focus Pod #1",
            exam_target=exam_name,
            weekly_target_hours=32.0
        )
        db.add(pod)
        db.flush()

        # Seed 4 pod members
        m1 = PodMember(
            pod_id=pod.id,
            user_id=user.id,
            display_name=f"{user.name} (You)",
            weekly_hours_logged=24.5,
            completion_rate_pct=78.0,
            streak_days=6,
            last_active_session="Operating Systems: Process Synchronization"
        )
        m2 = PodMember(
            pod_id=pod.id,
            display_name="Priya K.",
            weekly_hours_logged=22.0,
            completion_rate_pct=75.0,
            streak_days=5,
            last_active_session="Algorithms: Dynamic Programming"
        )
        m3 = PodMember(
            pod_id=pod.id,
            display_name="Rohan V.",
            weekly_hours_logged=19.5,
            completion_rate_pct=68.0,
            streak_days=3,
            last_active_session="Computer Networks: Subnetting"
        )
        m4 = PodMember(
            pod_id=pod.id,
            display_name="Sneha M.",
            weekly_hours_logged=27.0,
            completion_rate_pct=84.0,
            streak_days=7,
            last_active_session="Discrete Math: Graph Theory PYQs"
        )
        db.add_all([m1, m2, m3, m4])
        db.commit()
        db.refresh(pod)

    members = db.query(PodMember).filter(PodMember.pod_id == pod.id).all()
    avg_completion = sum(m.completion_rate_pct for m in members) / max(1, len(members))

    user_member = next((m for m in members if m.user_id == user.id), None)
    user_completion = user_member.completion_rate_pct if user_member else 78.0

    member_outs = [
        PodMemberOut(
            id=m.id,
            display_name=m.display_name,
            weekly_hours_logged=m.weekly_hours_logged,
            completion_rate_pct=m.completion_rate_pct,
            streak_days=m.streak_days,
            last_active_session=m.last_active_session,
            is_current_user=(m.user_id == user.id)
        )
        for m in members
    ]

    delta = round(user_completion - avg_completion, 1)
    if delta >= 0:
        nudge = f"Your pod is averaging {avg_completion:.0f}% completion this week. You are at {user_completion:.0f}% (+{delta}% ahead of pod average). Great momentum!"
    else:
        nudge = f"Your pod's average study completion this week: {avg_completion:.0f}%. Yours: {user_completion:.0f}%. A 45m focused block tonight puts you right on track with the pod!"

    return PodDetailOut(
        id=pod.id,
        name=pod.name,
        exam_target=pod.exam_target,
        weekly_target_hours=pod.weekly_target_hours,
        pod_average_completion_pct=round(avg_completion, 1),
        user_completion_pct=round(user_completion, 1),
        total_members=len(members),
        nudge_message=nudge,
        members=member_outs
    )
