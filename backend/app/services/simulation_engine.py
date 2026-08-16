from datetime import date, datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.exam import Exam
from app.models.subject import Subject
from app.models.activity_history import ActivityHistory
from app.schemas.simulation import FutureSelfResponse, SimulationPoint

class SimulationEngine:
    """
    Simulates the user's trajectory over the next 30 days based on their actual activity history.
    Provides visual clarity on where their current habits lead vs disciplined or slacking scenarios.
    """

    @staticmethod
    def project_future_self(db: Session, user_id: int) -> FutureSelfResponse:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        exam = db.query(Exam).filter(Exam.id == user.exams[0].id).first() if user.exams else None
        subjects = db.query(Subject).filter(Subject.exam_id == exam.id).all() if exam else []

        exam_name = exam.name if exam else "Target Goal"
        days_to_exam = (exam.target_date - date.today()).days if (exam and exam.target_date) else 180

        # Calculate base readiness from subjects
        if subjects:
            total_weight = sum(s.weight for s in subjects) or 1.0
            avg_readiness = sum(s.readiness_pct * s.weight for s in subjects) / total_weight
        else:
            avg_readiness = 52.0

        # Calculate actual compliance rate from activity history
        history = db.query(ActivityHistory).filter(ActivityHistory.user_id == user_id).all()
        if history:
            completed_count = sum(1 for h in history if "done" in h.action or "shift" in h.action or "split" in h.action)
            compliance_rate = (completed_count / len(history)) * 100.0
        else:
            compliance_rate = 75.0 # default baseline for fresh users

        # Daily growth rates
        disciplined_daily_gain = 0.85 # +0.85% per day
        current_daily_gain = disciplined_daily_gain * (compliance_rate / 100.0)
        slacking_daily_gain = disciplined_daily_gain * 0.35

        simulation_points: List[SimulationPoint] = []

        curr_r = avg_readiness
        disc_r = avg_readiness
        slack_r = avg_readiness
        cum_hours = 0.0
        base_burnout = user.burnout_risk_score or 0.18

        today = date.today()

        for day in range(1, 31):
            point_date = today + timedelta(days=day)

            curr_r = min(98.0, curr_r + current_daily_gain * (1.0 - (curr_r / 150.0)))
            disc_r = min(99.0, disc_r + disciplined_daily_gain * (1.0 - (disc_r / 160.0)))
            slack_r = min(95.0, max(25.0, slack_r + (slacking_daily_gain - 0.2)))

            cum_hours += round(user.daily_capacity_hours * (compliance_rate / 100.0), 1)

            # Burnout risk curve
            burnout_day = min(0.95, base_burnout + (0.004 * day if compliance_rate > 90 else 0.001 * day))

            simulation_points.append(
                SimulationPoint(
                    day=day,
                    date=point_date.strftime("%b %d"),
                    readiness_current_pace=round(curr_r, 1),
                    readiness_disciplined=round(disc_r, 1),
                    readiness_slacking=round(slack_r, 1),
                    burnout_risk=round(burnout_day, 2),
                    cumulative_hours=round(cum_hours, 1)
                )
            )

        proj_30d = round(curr_r, 1)

        # Estimate score range
        score_min = int(proj_30d * 0.82)
        score_max = int(proj_30d * 0.94)
        score_range = f"{score_min}-{score_max} / 100"

        burnout_status = "Low / Sustainable"
        if base_burnout > 0.6:
            burnout_status = "High Burnout Warning"
        elif base_burnout > 0.35:
            burnout_status = "Moderate Caution"

        shareable = (
            f"At your current {compliance_rate:.0f}% pace, you reach {proj_30d}% {exam_name} readiness "
            f"in 30 days with ~{cum_hours:.0f} focused hours logged."
        )

        return FutureSelfResponse(
            user_id=user_id,
            exam_name=exam_name,
            days_to_exam=days_to_exam,
            current_readiness_pct=round(avg_readiness, 1),
            projected_30d_readiness_pct=proj_30d,
            projected_score_range=score_range,
            burnout_status=burnout_status,
            burnout_score=round(base_burnout, 2),
            historical_compliance_rate_pct=round(compliance_rate, 1),
            simulation_points=simulation_points,
            shareable_summary=shareable
        )
