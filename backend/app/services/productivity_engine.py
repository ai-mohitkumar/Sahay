from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.schedule import Schedule
from app.models.task import Task
from app.models.subject import Subject
from app.models.exam import Exam
from app.models.activity_history import ActivityHistory
from app.schemas.focus_productivity import (
    SubTaskItem,
    TaskBreakdownResponse,
    FocusSessionLogResponse
)

class ProductivityEngine:
    """
    Sahay High-Impact Productivity Engine:
    1. Smart Task Breakdown (AI Sub-task Decomposer)
    2. 'Why Now' Priority Reasoning Generator
    3. Focus Quality & Distraction Tracker
    """

    @staticmethod
    def decompose_task(
        task_title: str,
        subject_name: Optional[str] = None,
        target_duration_mins: int = 60
    ) -> TaskBreakdownResponse:
        t_lower = task_title.lower()
        sub = subject_name or "Target Subject"

        # Specialized decomposition for common student tasks
        if "os" in t_lower or "operating system" in t_lower or "scheduling" in t_lower:
            subtasks = [
                SubTaskItem(
                    id="step_1",
                    title="Scan core formula sheet & invariants",
                    duration_mins=10,
                    focus_intensity="quick_scan"
                ),
                SubTaskItem(
                    id="step_2",
                    title="Solve 4 high-yield SRTF & Semaphore PYQs",
                    duration_mins=25,
                    focus_intensity="deep_work"
                ),
                SubTaskItem(
                    id="step_3",
                    title="Work out 2 Multi-Level Paging EMAT numericals",
                    duration_mins=20,
                    focus_intensity="active_recall"
                ),
                SubTaskItem(
                    id="step_4",
                    title="Review wrong steps & log concept notes",
                    duration_mins=5,
                    focus_intensity="quick_scan"
                )
            ]
            strategy = "Low activation energy start: 10m formula scan warms up the brain before heavy numericals."

        elif "algo" in t_lower or "dsa" in t_lower or "tree" in t_lower or "graph" in t_lower:
            subtasks = [
                SubTaskItem(
                    id="step_1",
                    title="Trace 1 example on paper (BFS/DFS / DP recurrence)",
                    duration_mins=15,
                    focus_intensity="active_recall"
                ),
                SubTaskItem(
                    id="step_2",
                    title="Implement core algorithm without looking at notes",
                    duration_mins=25,
                    focus_intensity="deep_work"
                ),
                SubTaskItem(
                    id="step_3",
                    title="Analyze Time & Space complexity edge cases",
                    duration_mins=15,
                    focus_intensity="deep_work"
                ),
                SubTaskItem(
                    id="step_4",
                    title="Quick self-check on 2 standard traps",
                    duration_mins=5,
                    focus_intensity="quick_scan"
                )
            ]
            strategy = "Hands-on paper trace first eliminates the blank-page syndrome."

        elif "math" in t_lower or "linear algebra" in t_lower or "calculus" in t_lower:
            subtasks = [
                SubTaskItem(
                    id="step_1",
                    title="Write down key theorems & matrix identities",
                    duration_mins=10,
                    focus_intensity="quick_scan"
                ),
                SubTaskItem(
                    id="step_2",
                    title="Solve 6 standard previous year problems",
                    duration_mins=35,
                    focus_intensity="deep_work"
                ),
                SubTaskItem(
                    id="step_3",
                    title="Cross-check algebraic boundary slips",
                    duration_mins=15,
                    focus_intensity="active_recall"
                )
            ]
            strategy = "Immediate problem-solving prevents passive formula staring."

        else:
            # Universal 4-step Pomodoro structure
            part1 = max(5, int(target_duration_mins * 0.15))
            part2 = max(15, int(target_duration_mins * 0.50))
            part3 = max(10, int(target_duration_mins * 0.25))
            part4 = max(5, target_duration_mins - (part1 + part2 + part3))

            subtasks = [
                SubTaskItem(
                    id="step_1",
                    title=f"Set up materials & review previous summary for {sub}",
                    duration_mins=part1,
                    focus_intensity="quick_scan"
                ),
                SubTaskItem(
                    id="step_2",
                    title=f"Deep work sprint: Core concepts of {task_title}",
                    duration_mins=part2,
                    focus_intensity="deep_work"
                ),
                SubTaskItem(
                    id="step_3",
                    title="Practice active recall test without looking at notes",
                    duration_mins=part3,
                    focus_intensity="active_recall"
                ),
                SubTaskItem(
                    id="step_4",
                    title="Synthesize 1-page summary & flag doubts",
                    duration_mins=part4,
                    focus_intensity="quick_scan"
                )
            ]
            strategy = "Structured micro-sprints prevent cognitive fatigue and overwhelm."

        return TaskBreakdownResponse(
            original_title=task_title,
            activation_strategy=strategy,
            total_duration_mins=sum(s.duration_mins for s in subtasks),
            subtasks=subtasks
        )

    @staticmethod
    def generate_why_now_reason(
        block: Schedule,
        subject: Optional[Subject],
        exam: Optional[Exam]
    ) -> str:
        title_lower = (block.title or "").lower()

        if block.block_type == "sleep" or "sleep" in title_lower:
            return "Circadian Anchor — Essential restorative window to prevent tomorrow's focus collapse."

        if block.block_type == "break" or "break" in title_lower or "recharge" in title_lower:
            return "Prefrontal Reset — 15m dopamine & cognitive rest before the next focus block."

        if "lunch" in title_lower or "dinner" in title_lower or "breakfast" in title_lower or "meal" in title_lower:
            return "Metabolic Fuel — Timed nutrition buffer to stabilize glucose and mental alertness."

        if block.is_fixed or "college" in title_lower or "class" in title_lower or "lab" in title_lower or "lecture" in title_lower:
            return "Academic Anchor — Fixed university lecture/lab commitment."

        if "exercise" in title_lower or "gym" in title_lower or "walk" in title_lower:
            return "Circadian Boost — Physical activity to lower evening cortisol and deepen sleep quality."

        if subject:
            weight = subject.weight or 1.0
            ready = subject.readiness_pct or 50.0
            if ready < 55.0:
                return f"High-Yield Gap — {subject.name} readiness is currently {ready:.0f}% ({weight:.1f}x exam weight)."
            elif ready < 75.0:
                return f"Active Mastery — Core topic sprint in your peak circadian focus window."
            else:
                return f"Retention Drill — Quick spaced repetition to keep {subject.name} above 75% pacing."

        return "Circadian Flow — Optimal energy window tailored to your daily schedule."

    @staticmethod
    def log_focus_session(
        db: Session,
        user_id: int,
        schedule_id: int,
        duration_mins: int,
        quality_rating: int,
        distraction_count: int,
        tags: List[str]
    ) -> FocusSessionLogResponse:
        block = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.user_id == user_id).first()
        if not block:
            raise ValueError("Schedule block not found")

        # Quality multiplier: 5 stars = 1.8%, 4 stars = 1.4%, 3 stars = 0.9%, 1-2 stars = 0.3%
        quality_multipliers = {5: 1.8, 4: 1.4, 3: 0.9, 2: 0.5, 1: 0.2}
        base_gain = quality_multipliers.get(quality_rating, 1.2)

        # Distraction penalty
        if distraction_count > 3:
            base_gain = max(0.2, base_gain - 0.4)

        block.status = "completed"
        task = db.query(Task).filter(Task.id == block.task_id).first() if block.task_id else None
        subject = db.query(Subject).filter(Subject.id == task.subject_id).first() if (task and task.subject_id) else None

        if subject:
            subject.readiness_pct = min(100.0, subject.readiness_pct + base_gain)
            subject.hours_completed += round(duration_mins / 60.0, 1)

        # Activity history log
        h = ActivityHistory(
            user_id=user_id,
            schedule_id=block.id,
            task_id=task.id if task else None,
            planned_start=block.start_time,
            planned_end=block.end_time,
            action=f"focus_session_{quality_rating}_stars",
            reason=f"Distractions: {distraction_count} ({', '.join(tags) if tags else 'none'})",
            readiness_delta=base_gain,
            created_at=datetime.utcnow()
        )
        db.add(h)
        db.commit()

        if quality_rating >= 4:
            feedback = f"Outstanding deep work! {quality_rating}★ quality with {duration_mins}m logged. Subject readiness boosted by +{base_gain}%."
        else:
            feedback = f"Session recorded with {quality_rating}★ focus. Sahay noted the {distraction_count} distraction(s) to optimize future session durations."

        return FocusSessionLogResponse(
            status="success",
            message=f"Deep work logged ({quality_rating}★ focus)!",
            readiness_gain=base_gain,
            focus_quality_rating=quality_rating,
            ai_quality_feedback=feedback
        )
