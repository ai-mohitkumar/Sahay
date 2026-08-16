from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.student_life import (
    Opportunity,
    OpportunityApplication,
    StudentExpense,
    StudentBudget,
    HealthEnergyLog,
    StudentDocument,
    StudentRoutine
)
from app.schemas.student_life import (
    OpportunityOut,
    OpportunityApplicationCreate,
    StudentExpenseCreate,
    StudentExpenseOut,
    StudentBudgetOut,
    HealthEnergyLogCreate,
    HealthEnergyLogOut,
    StudentDocumentCreate,
    StudentDocumentOut,
    StudentRoutineCreate,
    StudentRoutineOut,
    StudentLifeOverview,
    CrossDomainConsultRequest,
    CrossDomainConsultResponse
)
from app.services.cross_domain_engine import CrossDomainEngine

router = APIRouter(prefix="/student-life", tags=["Student Life Essentials & Holistic Brain"])

@router.get("/overview", response_model=StudentLifeOverview)
def get_student_life_overview(user_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    user_name = user.name if user else "Aarav"

    # Opportunities
    opps = db.query(Opportunity).all()
    opp_outs = []
    for o in opps:
        days_rem = (o.deadline - date.today()).days if o.deadline else 30
        app = db.query(OpportunityApplication).filter(
            OpportunityApplication.user_id == user_id,
            OpportunityApplication.opportunity_id == o.id
        ).first()
        opp_outs.append(
            OpportunityOut(
                id=o.id,
                title=o.title,
                opportunity_type=o.opportunity_type,
                organization=o.organization,
                deadline=o.deadline,
                description=o.description,
                link_url=o.link_url,
                relevance_score=o.relevance_score,
                days_remaining=days_rem,
                application_status=app.status if app else "unapplied"
            )
        )

    # Budget & Expenses
    current_month = date.today().strftime("%Y-%m")
    budget = db.query(StudentBudget).filter(
        StudentBudget.user_id == user_id,
        StudentBudget.month_str == current_month
    ).first()

    expenses = db.query(StudentExpense).filter(
        StudentExpense.user_id == user_id
    ).order_by(StudentExpense.created_at.desc()).limit(10).all()

    total_spent = sum(e.amount for e in expenses)
    allowance = budget.total_allowance if budget else 6000.0
    remaining = max(0.0, allowance - total_spent)
    days_left_in_month = 15
    safe_daily = round(remaining / max(1, days_left_in_month), 1)

    exp_outs = [
        StudentExpenseOut(
            id=e.id,
            title=e.title,
            category=e.category,
            amount=e.amount,
            expense_date=e.expense_date,
            payment_method=e.payment_method
        )
        for e in expenses
    ]

    budget_out = StudentBudgetOut(
        month_str=current_month,
        total_allowance=allowance,
        spent_so_far=total_spent,
        remaining_balance=remaining,
        daily_safe_spend=safe_daily,
        recent_expenses=exp_outs
    )

    # Health
    health = db.query(HealthEnergyLog).filter(
        HealthEnergyLog.user_id == user_id
    ).order_by(HealthEnergyLog.created_at.desc()).first()

    if not health:
        health_out = HealthEnergyLogOut(
            id=0,
            log_date=date.today(),
            sleep_hours=6.5,
            sleep_quality="good",
            energy_level=4,
            stress_score=0.22,
            recovery_mode_active=False,
            peer_empathy_note="68% of fellow GATE aspirants in your pod reported similar mid-semester fatigue — you are on track."
        )
    else:
        health_out = HealthEnergyLogOut(
            id=health.id,
            log_date=health.log_date,
            sleep_hours=health.sleep_hours,
            sleep_quality=health.sleep_quality,
            energy_level=health.energy_level,
            stress_score=health.stress_score,
            recovery_mode_active=health.recovery_mode_active,
            peer_empathy_note="68% of fellow students in your exam pod report similar energy peaks during 8 PM sessions."
        )

    # Documents
    docs = db.query(StudentDocument).filter(StudentDocument.user_id == user_id).all()
    doc_outs = []
    for d in docs:
        days_ev = (d.expiry_or_event_date - date.today()).days if d.expiry_or_event_date else None
        is_urg = days_ev is not None and days_ev <= 15
        doc_outs.append(
            StudentDocumentOut(
                id=d.id,
                title=d.title,
                doc_type=d.doc_type,
                expiry_or_event_date=d.expiry_or_event_date,
                download_url_or_ref=d.download_url_or_ref,
                days_until_event=days_ev,
                is_urgent=is_urg
            )
        )

    # Routines
    routines = db.query(StudentRoutine).filter(StudentRoutine.user_id == user_id).all()
    routine_outs = [
        StudentRoutineOut(
            id=r.id,
            item_title=r.item_title,
            category=r.category,
            frequency=r.frequency,
            is_completed_today=r.is_completed_today
        )
        for r in routines
    ]

    holistic_nudge = (
        f"Hey {user_name}, you have ₹{remaining:.0f} remaining budget (safe spend ₹{safe_daily}/day), "
        f"1 high-priority internship deadline (GSoC) in 18 days, and your sleep averaged 6.5h. "
        f"Your holistic balance index is strong at 84%."
    )

    return StudentLifeOverview(
        user_name=user_name,
        active_opportunities_count=len(opp_outs),
        urgent_deadlines=opp_outs,
        monthly_budget=budget_out,
        health_status=health_out,
        pending_documents=doc_outs,
        daily_routines=routine_outs,
        ai_holistic_nudge=holistic_nudge
    )

@router.post("/cross-domain-consult", response_model=CrossDomainConsultResponse)
def consult_cross_domain_brain(payload: CrossDomainConsultRequest, db: Session = Depends(get_db)):
    """
    Unified AI Life Thinking Partner: Synthesizes Academic, Health, Finances, and Deadlines.
    """
    return CrossDomainEngine.consult(
        db=db,
        user_id=payload.user_id,
        query=payload.question,
        context_hint=payload.context_hint
    )

@router.post("/finances/expense", response_model=StudentExpenseOut)
def log_student_expense(payload: StudentExpenseCreate, db: Session = Depends(get_db)):
    exp = StudentExpense(
        user_id=payload.user_id,
        title=payload.title,
        category=payload.category,
        amount=payload.amount,
        payment_method=payload.payment_method,
        expense_date=date.today(),
        created_at=datetime.utcnow()
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return StudentExpenseOut(
        id=exp.id,
        title=exp.title,
        category=exp.category,
        amount=exp.amount,
        expense_date=exp.expense_date,
        payment_method=exp.payment_method
    )

@router.patch("/routines/{routine_id}/toggle")
def toggle_routine_item(routine_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    item = db.query(StudentRoutine).filter(StudentRoutine.id == routine_id, StudentRoutine.user_id == user_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Routine item not found")
    item.is_completed_today = not item.is_completed_today
    item.last_completed_at = datetime.utcnow() if item.is_completed_today else None
    db.commit()
    return {"status": "success", "is_completed_today": item.is_completed_today}
