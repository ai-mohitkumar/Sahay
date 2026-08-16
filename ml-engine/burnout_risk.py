"""
Burnout Risk Modeling
Evaluates cognitive fatigue, back-to-back deep focus hours without recovery,
and sleep debt.
"""

class BurnoutModel:
    @staticmethod
    def estimate_burnout_index(
        daily_study_hours: float,
        sleep_hours: float,
        consecutive_heavy_days: int,
        break_compliance_ratio: float = 0.8
    ) -> float:
        """
        Returns a burnout index from 0.0 (fresh/energized) to 1.0 (severe burnout hazard).
        """
        # Optimal sleep is ~7.5 hours
        sleep_deficit = max(0.0, 7.5 - sleep_hours)
        sleep_penalty = sleep_deficit * 0.12
        
        # High study load penalty (> 8 hrs/day)
        load_penalty = max(0.0, daily_study_hours - 7.0) * 0.08
        
        # Streak fatigue
        streak_penalty = min(0.3, consecutive_heavy_days * 0.04)
        
        # Lack of breaks penalty
        break_penalty = max(0.0, 1.0 - break_compliance_ratio) * 0.15
        
        raw_score = 0.10 + sleep_penalty + load_penalty + streak_penalty + break_penalty
        return round(min(0.95, max(0.05, raw_score)), 2)
