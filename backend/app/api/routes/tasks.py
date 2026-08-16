from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import Task
from app.models.subject import Subject
from app.schemas.task import TaskCreate, TaskOut, TaskStatusUpdate, TaskUpdate
from app.schemas.focus_productivity import TaskBreakdownRequest, TaskBreakdownResponse
from app.services.productivity_engine import ProductivityEngine

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/smart-breakdown", response_model=TaskBreakdownResponse)
def get_smart_task_breakdown(payload: TaskBreakdownRequest):
    """
    Decomposes vague tasks into concrete sub-tasks with low activation energy.
    Removes procrastination friction before you even start!
    """
    return ProductivityEngine.decompose_task(
        task_title=payload.task_title,
        subject_name=payload.subject_name,
        target_duration_mins=payload.target_duration_mins
    )

@router.get("", response_model=List[TaskOut])
def list_tasks(
    user_id: int = Query(...),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.user_id == user_id)
    if status:
        query = query.filter(Task.status == status)

    tasks = query.all()
    results = []
    for t in tasks:
        s_name = None
        s_color = None
        if t.subject_id:
            sub = db.query(Subject).filter(Subject.id == t.subject_id).first()
            if sub:
                s_name = sub.name
                s_color = sub.color_code

        results.append(
            TaskOut(
                id=t.id,
                user_id=t.user_id,
                subject_id=t.subject_id,
                goal_id=t.goal_id,
                title=t.title,
                description=t.description,
                estimated_duration_mins=t.estimated_duration_mins,
                difficulty=t.difficulty,
                priority=t.priority,
                status=t.status,
                scheduled_date=t.scheduled_date,
                created_at=t.created_at,
                subject_name=s_name,
                subject_color=s_color
            )
        )
    return results

@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        user_id=payload.user_id,
        subject_id=payload.subject_id,
        goal_id=payload.goal_id,
        title=payload.title,
        description=payload.description,
        estimated_duration_mins=payload.estimated_duration_mins,
        difficulty=payload.difficulty,
        priority=payload.priority,
        status="todo",
        scheduled_date=payload.scheduled_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    s_name = None
    s_color = None
    if task.subject_id:
        sub = db.query(Subject).filter(Subject.id == task.subject_id).first()
        if sub:
            s_name = sub.name
            s_color = sub.color_code

    return TaskOut(
        id=task.id,
        user_id=task.user_id,
        subject_id=task.subject_id,
        goal_id=task.goal_id,
        title=task.title,
        description=task.description,
        estimated_duration_mins=task.estimated_duration_mins,
        difficulty=task.difficulty,
        priority=task.priority,
        status=task.status,
        scheduled_date=task.scheduled_date,
        created_at=task.created_at,
        subject_name=s_name,
        subject_color=s_color
    )

@router.patch("/{task_id}/status", response_model=TaskOut)
def update_task_status(task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = payload.status
    db.commit()
    db.refresh(task)

    s_name = None
    s_color = None
    if task.subject_id:
        sub = db.query(Subject).filter(Subject.id == task.subject_id).first()
        if sub:
            s_name = sub.name
            s_color = sub.color_code

    return TaskOut(
        id=task.id,
        user_id=task.user_id,
        subject_id=task.subject_id,
        goal_id=task.goal_id,
        title=task.title,
        description=task.description,
        estimated_duration_mins=task.estimated_duration_mins,
        difficulty=task.difficulty,
        priority=task.priority,
        status=task.status,
        scheduled_date=task.scheduled_date,
        created_at=task.created_at,
        subject_name=s_name,
        subject_color=s_color
    )

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.estimated_duration_mins is not None:
        task.estimated_duration_mins = payload.estimated_duration_mins
    if payload.difficulty is not None:
        task.difficulty = payload.difficulty
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.subject_id is not None:
        task.subject_id = payload.subject_id
    if payload.status is not None:
        task.status = payload.status

    db.commit()
    db.refresh(task)

    s_name = None
    s_color = None
    if task.subject_id:
        sub = db.query(Subject).filter(Subject.id == task.subject_id).first()
        if sub:
            s_name = sub.name
            s_color = sub.color_code

    return TaskOut(
        id=task.id,
        user_id=task.user_id,
        subject_id=task.subject_id,
        goal_id=task.goal_id,
        title=task.title,
        description=task.description,
        estimated_duration_mins=task.estimated_duration_mins,
        difficulty=task.difficulty,
        priority=task.priority,
        status=task.status,
        scheduled_date=task.scheduled_date,
        created_at=task.created_at,
        subject_name=s_name,
        subject_color=s_color
    )

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"status": "deleted", "message": f"Task #{task_id} deleted successfully."}

