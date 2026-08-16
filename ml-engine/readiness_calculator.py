"""
Readiness Calculator
Computes subjective and objective exam readiness using exponential mastery curves
and decay rates over time for unrevised topics.
"""
from typing import List, Dict

class ReadinessCalculator:
    @staticmethod
    def calculate_subject_readiness(
        completed_hours: float,
        total_hours_needed: float,
        pyq_accuracy_pct: float = 70.0,
        days_since_last_revision: int = 0
    ) -> float:
        # Pacing completion ratio
        completion_ratio = min(1.0, completed_hours / max(1.0, total_hours_needed))
        
        # Base readiness weighted by syllabus coverage (60%) and practice accuracy (40%)
        base_readiness = (completion_ratio * 60.0) + (pyq_accuracy_pct * 0.40)
        
        # Ebbinghaus forgetting curve decay: topics drop 0.5% per unrevised week
        decay = min(15.0, (days_since_last_revision / 7.0) * 0.5)
        
        final_readiness = max(10.0, min(100.0, base_readiness - decay))
        return round(final_readiness, 1)

    @staticmethod
    def calculate_composite_exam_readiness(subjects: List[Dict]) -> float:
        if not subjects:
            return 50.0
        total_weighted_readiness = sum(s.get("readiness_pct", 50.0) * s.get("weight", 1.0) for s in subjects)
        total_weight = sum(s.get("weight", 1.0) for s in subjects)
        return round(total_weighted_readiness / max(0.1, total_weight), 1)
