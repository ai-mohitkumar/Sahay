from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.exam import Exam
from app.models.subject import Subject
from app.models.task import Task
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse
from app.services.scheduler_engine import SchedulerEngine

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("", response_model=OnboardingResponse)
def submit_onboarding(payload: OnboardingRequest, db: Session = Depends(get_db)):
    """
    Step 3 in roadmap:
    Captures circadian times (wake/sleep), fixed commitments, exam details, subjects,
    and automatically synthesizes the first 24-hour timeline.
    """
    # 1. Create or retrieve User
    user = None
    if payload.email:
        user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        user = User(
            name=payload.name,
            email=payload.email,
            wake_time=payload.wake_time,
            sleep_time=payload.sleep_time,
            daily_capacity_hours=payload.daily_capacity_hours,
            burnout_risk_score=0.15
        )
        db.add(user)
        db.flush()
    else:
        user.name = payload.name
        user.wake_time = payload.wake_time
        user.sleep_time = payload.sleep_time
        user.daily_capacity_hours = payload.daily_capacity_hours
        db.flush()

    exam_id = None

    # 2. Create Exam and Subjects if provided
    if payload.exam:
        exam = Exam(
            user_id=user.id,
            name=payload.exam.name,
            target_date=payload.exam.target_date,
            target_score=payload.exam.target_score,
            current_readiness_pct=50.0
        )
        db.add(exam)
        db.flush()
        exam_id = exam.id

        # Add Subjects and bootstrap sample tasks
        for subj_in in payload.exam.subjects:
            subject = Subject(
                exam_id=exam.id,
                name=subj_in.name,
                total_hours_needed=subj_in.total_hours_needed,
                hours_completed=0.0,
                readiness_pct=subj_in.current_readiness_pct,
                weight=subj_in.weight,
                color_code=subj_in.color_code or "#3b82f6"
            )
            db.add(subject)
            db.flush()

            # Seed 2 realistic foundational tasks per subject
            t1 = Task(
                user_id=user.id,
                subject_id=subject.id,
                title=f"{subject.name}: Core Concepts & Problem Sets",
                description=f"Deep practice on high-yield {subject.name} problems",
                estimated_duration_mins=90,
                difficulty="medium",
                priority=1,
                status="todo",
                scheduled_date=date.today()
            )
            t2 = Task(
                user_id=user.id,
                subject_id=subject.id,
                title=f"{subject.name}: Previous Year Questions (PYQs)",
                description=f"Timed practice with real exam questions",
                estimated_duration_mins=90,
                difficulty="hard",
                priority=2,
                status="todo"
            )
            db.add_all([t1, t2])

    db.commit()
    db.refresh(user)

    # 3. Generate Day 1 Schedule using SchedulerEngine
    today = date.today()
    generated_schedule = SchedulerEngine.generate_daily_schedule(
        db=db,
        user_id=user.id,
        schedule_date=today,
        fixed_commitments=payload.fixed_commitments
    )

    sample_blocks = [
        {
            "id": b.id,
            "title": b.title,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "block_type": b.block_type,
            "is_fixed": b.is_fixed,
            "status": b.status
        }
        for b in generated_schedule
    ]

    return OnboardingResponse(
        user_id=user.id,
        exam_id=exam_id,
        message=f"Welcome to Sahay, {user.name}! Your circadian 24-hour timeline is ready.",
        generated_blocks_count=len(generated_schedule),
        sample_first_day_schedule=sample_blocks
    )

@router.post("/preset-profile", response_model=OnboardingResponse)
def create_preset_profile(preset_key: str = "gate_cse", custom_name: str = None, db: Session = Depends(get_db)):
    """
    1-Click Unlimited Profile Generator:
    Instantly provisions a complete pre-calibrated student profile (GATE, CAT, UPSC, Sem/DSA).
    """
    import random
    suffix = random.randint(100, 999)

    PRESETS = {
        "gate_cse": {
            "name": custom_name or f"Aarav Sharma ({suffix})",
            "email": f"aarav_{suffix}@sahay.app",
            "wake_time": "06:30",
            "sleep_time": "23:30",
            "daily_capacity_hours": 6.5,
            "commitments": [
                {"title": "College Classes & Labs", "start_time": "09:00", "end_time": "14:00"},
                {"title": "Gym & Health Anchor", "start_time": "18:00", "end_time": "19:00"}
            ],
            "exam_name": "GATE CSE 2027",
            "exam_date": date(2027, 2, 14),
            "target_score": 85.0,
            "subjects": [
                {"name": "Operating Systems", "hours": 45, "readiness": 62, "weight": 1.2, "color": "#3b82f6"},
                {"name": "Algorithms & Data Structures", "hours": 60, "readiness": 56, "weight": 1.5, "color": "#10b981"},
                {"name": "Computer Networks", "hours": 40, "readiness": 48, "weight": 1.0, "color": "#8b5cf6"},
                {"name": "Engineering Mathematics", "hours": 35, "readiness": 68, "weight": 1.1, "color": "#f59e0b"},
            ]
        },
        "cat_mba": {
            "name": custom_name or f"Priya Verma ({suffix})",
            "email": f"priya_{suffix}@sahay.app",
            "wake_time": "07:00",
            "sleep_time": "00:00",
            "daily_capacity_hours": 5.5,
            "commitments": [
                {"title": "Work / College Shift", "start_time": "09:30", "end_time": "17:00"},
                {"title": "Evening Walk & Decompress", "start_time": "19:30", "end_time": "20:15"}
            ],
            "exam_name": "CAT 2026 (IIM Prep)",
            "exam_date": date(2026, 11, 29),
            "target_score": 99.2,
            "subjects": [
                {"name": "Quantitative Aptitude (QA)", "hours": 50, "readiness": 58, "weight": 1.3, "color": "#f59e0b"},
                {"name": "Data Interpretation & LR (DILR)", "hours": 45, "readiness": 52, "weight": 1.4, "color": "#ec4899"},
                {"name": "Verbal Ability & RC (VARC)", "hours": 40, "readiness": 72, "weight": 1.1, "color": "#3b82f6"},
            ]
        },
        "upsc_civil": {
            "name": custom_name or f"Vikramaditya ({suffix})",
            "email": f"vikram_{suffix}@sahay.app",
            "wake_time": "05:30",
            "sleep_time": "22:30",
            "daily_capacity_hours": 7.5,
            "commitments": [
                {"title": "The Hindu Newspaper & Editorials", "start_time": "07:00", "end_time": "08:30"},
                {"title": "Daily Mains Answer Writing", "start_time": "16:00", "end_time": "17:30"}
            ],
            "exam_name": "UPSC CSE Prelims 2027",
            "exam_date": date(2027, 5, 23),
            "target_score": 125.0,
            "subjects": [
                {"name": "Indian Polity & Governance", "hours": 65, "readiness": 60, "weight": 1.4, "color": "#3b82f6"},
                {"name": "Modern Indian History", "hours": 55, "readiness": 54, "weight": 1.2, "color": "#f59e0b"},
                {"name": "Economy & Development", "hours": 50, "readiness": 48, "weight": 1.3, "color": "#10b981"},
                {"name": "CSAT & Aptitude", "hours": 30, "readiness": 75, "weight": 1.0, "color": "#8b5cf6"},
            ]
        },
        "sem_dsa": {
            "name": custom_name or f"Neha Patel ({suffix})",
            "email": f"neha_{suffix}@sahay.app",
            "wake_time": "07:30",
            "sleep_time": "00:30",
            "daily_capacity_hours": 5.0,
            "commitments": [
                {"title": "University Lectures & Labs", "start_time": "09:00", "end_time": "16:00"},
                {"title": "Coding Club & LeetCode Jam", "start_time": "17:30", "end_time": "18:30"}
            ],
            "exam_name": "Sem Finals & Placements",
            "exam_date": date(2026, 11, 15),
            "target_score": 9.2,
            "subjects": [
                {"name": "LeetCode DSA & System Design", "hours": 50, "readiness": 65, "weight": 1.5, "color": "#10b981"},
                {"name": "Database Management Systems", "hours": 35, "readiness": 58, "weight": 1.1, "color": "#3b82f6"},
                {"name": "Web Dev & Distributed Systems", "hours": 30, "readiness": 70, "weight": 1.0, "color": "#ec4899"},
            ]
        }
    }

    cfg = PRESETS.get(preset_key, PRESETS["gate_cse"])

    # 1. Create User
    user = User(
        name=cfg["name"],
        email=cfg["email"],
        wake_time=cfg["wake_time"],
        sleep_time=cfg["sleep_time"],
        daily_capacity_hours=cfg["daily_capacity_hours"],
        burnout_risk_score=0.12
    )
    db.add(user)
    db.flush()

    # 2. Create Exam & Subjects
    exam = Exam(
        user_id=user.id,
        name=cfg["exam_name"],
        target_date=cfg["exam_date"],
        target_score=cfg["target_score"],
        current_readiness_pct=58.0
    )
    db.add(exam)
    db.flush()

    for s in cfg["subjects"]:
        subj = Subject(
            exam_id=exam.id,
            name=s["name"],
            total_hours_needed=s["hours"],
            hours_completed=0.0,
            readiness_pct=s["readiness"],
            weight=s["weight"],
            color_code=s["color"]
        )
        db.add(subj)
        db.flush()

        t1 = Task(
            user_id=user.id,
            subject_id=subj.id,
            title=f"{subj.name}: Core Practice & Drills",
            description=f"High-yield problem solving and active recall for {subj.name}",
            estimated_duration_mins=90,
            difficulty="medium",
            priority=1,
            status="todo",
            scheduled_date=date.today()
        )
        db.add(t1)

    db.commit()
    db.refresh(user)

    # 3. Generate Day 1 Schedule
    from app.schemas.onboarding import FixedCommitmentInput
    fc_inputs = [FixedCommitmentInput(**c) for c in cfg["commitments"]]
    generated_schedule = SchedulerEngine.generate_daily_schedule(
        db=db,
        user_id=user.id,
        schedule_date=date.today(),
        fixed_commitments=fc_inputs
    )

    sample_blocks = [
        {
            "id": b.id,
            "title": b.title,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "block_type": b.block_type,
            "is_fixed": b.is_fixed,
            "status": b.status
        }
        for b in generated_schedule
    ]

    return OnboardingResponse(
        user_id=user.id,
        exam_id=exam.id,
        message=f"Preset profile '{user.name}' generated! Circadian 24-hour flow active.",
        generated_blocks_count=len(generated_schedule),
        sample_first_day_schedule=sample_blocks
    )

@router.delete("/users/{user_id}")
def delete_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Deletes a user profile and cascades related schedules/tasks.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    # Clean up related records
    from app.models.schedule import Schedule
    from app.models.student_life import StudentExpense, HealthEnergyLog
    from app.models.alarm import Alarm, AlarmLog
    from app.models.longitudinal_memory import LongitudinalMemory, FailureForensic

    db.query(Schedule).filter(Schedule.user_id == user_id).delete()
    db.query(Task).filter(Task.user_id == user_id).delete()
    db.query(StudentExpense).filter(StudentExpense.user_id == user_id).delete()
    db.query(HealthEnergyLog).filter(HealthEnergyLog.user_id == user_id).delete()
    db.query(AlarmLog).filter(AlarmLog.user_id == user_id).delete()
    db.query(Alarm).filter(Alarm.user_id == user_id).delete()
    db.query(FailureForensic).filter(FailureForensic.user_id == user_id).delete()
    db.query(LongitudinalMemory).filter(LongitudinalMemory.user_id == user_id).delete()

    exams = db.query(Exam).filter(Exam.user_id == user_id).all()
    for e in exams:
        db.query(Subject).filter(Subject.exam_id == e.id).delete()
        db.delete(e)

    db.delete(user)
    db.commit()

    return {"status": "deleted", "message": f"Profile #{user_id} deleted successfully."}

