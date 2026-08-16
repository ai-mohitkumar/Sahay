from datetime import date, datetime, timedelta
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.schedule import Schedule
from app.models.task import Task
from app.models.subject import Subject
from app.schemas.onboarding import FixedCommitmentInput

def time_to_minutes(time_str: str) -> int:
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(minutes: int) -> str:
    minutes = minutes % (24 * 60)
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

class SchedulerEngine:
    """
    Deterministic schedule generator:
    Takes circadian rhythm (wake/sleep) + fixed commitments (college/work),
    finds optimal focus windows, and slots 60-90min study blocks, breaks, and buffers.
    """

    @staticmethod
    def generate_daily_schedule(
        db: Session,
        user_id: int,
        schedule_date: date,
        fixed_commitments: List[FixedCommitmentInput] = None
    ) -> List[Schedule]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Clear existing non-completed schedule for this date
        db.query(Schedule).filter(
            Schedule.user_id == user_id,
            Schedule.date == schedule_date,
            Schedule.status == "scheduled"
        ).delete()
        db.flush()

        wake_mins = time_to_minutes(user.wake_time)
        sleep_mins = time_to_minutes(user.sleep_time)

        # Build busy intervals
        busy_intervals: List[Tuple[int, int, str, str]] = [] # (start, end, title, type)

        # Sleep block (before wake and after sleep)
        if sleep_mins > wake_mins:
            # e.g., wake at 07:00 (420), sleep at 23:00 (1380)
            busy_intervals.append((0, wake_mins, "Sleep & Morning Routine", "sleep"))
            busy_intervals.append((sleep_mins, 24 * 60, "Sleep & Rest", "sleep"))
        else:
            # overnight shift
            busy_intervals.append((sleep_mins, wake_mins, "Sleep & Rest", "sleep"))

        # Add fixed commitments
        if fixed_commitments:
            for item in fixed_commitments:
                start_m = time_to_minutes(item.start_time)
                end_m = time_to_minutes(item.end_time)
                busy_intervals.append((start_m, end_m, item.title, "fixed_commitment"))

        # Sort busy intervals by start time
        busy_intervals.sort(key=lambda x: x[0])

        # Create schedule blocks for busy intervals
        generated_blocks = []
        for start_m, end_m, title, b_type in busy_intervals:
            block = Schedule(
                user_id=user_id,
                date=schedule_date,
                start_time=minutes_to_time(start_m),
                end_time=minutes_to_time(end_m),
                title=title,
                block_type=b_type,
                is_fixed=True,
                status="scheduled"
            )
            db.add(block)
            generated_blocks.append(block)

        # Find free time gaps
        free_gaps: List[Tuple[int, int]] = []
        current_time = wake_mins + 30 # 30 min morning buffer after wake

        # Filter intervals within wake and sleep
        day_intervals = [
            (max(wake_mins, start), min(sleep_mins, end))
            for start, end, _, _ in busy_intervals
            if end > wake_mins and start < sleep_mins
        ]
        day_intervals.sort(key=lambda x: x[0])

        prev_end = wake_mins + 30
        for start, end in day_intervals:
            if start > prev_end + 30: # at least 30 mins free
                free_gaps.append((prev_end, start))
            prev_end = max(prev_end, end)

        if sleep_mins - 30 > prev_end: # gap before wind-down
            free_gaps.append((prev_end, sleep_mins - 30))

        # Fetch available tasks for this user (or create sample subject tasks)
        available_tasks = db.query(Task).filter(
            Task.user_id == user_id,
            Task.status.in_(["todo", "postponed"])
        ).order_by(Task.priority.asc()).all()

        task_idx = 0
        for gap_start, gap_end in free_gaps:
            gap_duration = gap_end - gap_start
            curr_pos = gap_start

            while curr_pos + 45 <= gap_end:
                session_len = 90 if (curr_pos + 90 <= gap_end) else (gap_end - curr_pos)
                if session_len < 45:
                    break

                assigned_task = None
                task_title = "Focused Study Session"
                task_id = None

                if task_idx < len(available_tasks):
                    assigned_task = available_tasks[task_idx]
                    task_title = f"{assigned_task.title}"
                    task_id = assigned_task.id
                    task_idx += 1
                else:
                    # Generic Deep Focus block
                    task_title = "Deep Focus / Problem Solving"

                study_block = Schedule(
                    user_id=user_id,
                    task_id=task_id,
                    date=schedule_date,
                    start_time=minutes_to_time(curr_pos),
                    end_time=minutes_to_time(curr_pos + session_len),
                    title=task_title,
                    block_type="study_session",
                    is_fixed=False,
                    status="scheduled"
                )
                db.add(study_block)
                generated_blocks.append(study_block)

                curr_pos += session_len

                # Insert 15m break if time permits
                if curr_pos + 15 < gap_end:
                    break_block = Schedule(
                        user_id=user_id,
                        date=schedule_date,
                        start_time=minutes_to_time(curr_pos),
                        end_time=minutes_to_time(curr_pos + 15),
                        title="Recharge / Active Break",
                        block_type="break",
                        is_fixed=False,
                        status="scheduled"
                    )
                    db.add(break_block)
                    generated_blocks.append(break_block)
                    curr_pos += 15

        db.commit()
        for b in generated_blocks:
            db.refresh(b)

        return sorted(generated_blocks, key=lambda b: time_to_minutes(b.start_time))
