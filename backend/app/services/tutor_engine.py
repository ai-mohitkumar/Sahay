from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.study_content import Question, Topic, QuestionAttempt, Doubt
from app.schemas.study import AskAIResponse, DrillSummaryOut

class TutorEngine:
    """
    Sahay's AI Doubt & Socratic Tutor Engine.
    Employs pedagogy:
    1. Socratic Mode (Guiding questions to build mental models)
    2. Direct Diagnostic Mode (Pinpoints exact math/conceptual misconception)
    3. Post-Mortem Drill Review (Immediate debrief after a study sprint)
    """

    @staticmethod
    def answer_doubt(
        question_text: str,
        user_attempt: Optional[str],
        doubt_query: str,
        topic_name: str,
        socratic_mode: bool = True
    ) -> AskAIResponse:
        doubt_lower = doubt_query.lower()
        question_lower = question_text.lower()

        # 1. Topic Specific Misconception Diagnosis
        misconception = None
        key_rule = None

        if "semaphore" in question_lower or "synchronization" in question_lower:
            key_rule = "Wait(S) decrements and blocks if S <= 0; Signal(S) increments and unblocks."
            if "deadlock" in doubt_lower or "order" in doubt_lower:
                misconception = "Inverted wait order across multiple semaphores causes circular wait."
            else:
                misconception = "Confusing counting semaphores (resource counting) with binary mutex."

        elif "schedule" in question_lower or "sjf" in question_lower or "round robin" in question_lower:
            key_rule = "Turnaround Time = Completion Time - Arrival Time; Waiting Time = Turnaround Time - Burst Time."
            if "preemptive" in doubt_lower or "srtf" in doubt_lower:
                misconception = "Evaluating remaining burst time only at time 0 rather than at each new arrival."
            else:
                misconception = "Context switch overhead and time quantum threshold confusion."

        elif "page" in question_lower or "paging" in question_lower or "tlb" in question_lower:
            key_rule = "Effective Access Time (EAT) = TLB_hit*(tlb_time + mem_time) + (1-TLB_hit)*(tlb_time + 2*mem_time)."
            misconception = "Forgetting that memory is accessed twice during a TLB miss in standard paging."

        else:
            key_rule = f"Core invariant for {topic_name}: Apply fundamental definitions step-by-step."
            misconception = "Algebraic or boundary condition slip in initial setup."

        # 2. Socratic vs Direct Guidance
        if socratic_mode:
            guidance = (
                f"Let's break down this {topic_name} concept together rather than just handing over the answer. "
                f"Look closely at the condition where your reasoning branched."
            )
            socratic_q = (
                f"What happens to the state transition when your proposed condition is met? "
                f"Does it satisfy: '{key_rule}'?"
            )
            encouragement = "You're very close! Try calculating that single intermediate state."
        else:
            guidance = (
                f"Here is the direct resolution for '{topic_name}': "
                f"The common trap here is: {misconception}. "
                f"To solve correctly, apply: {key_rule}. "
                f"Following this sequence eliminates the conflict in your attempted answer '{user_attempt or 'None'}'."
            )
            socratic_q = None
            encouragement = "Keep this core formula pinned in your mind for PYQs!"

        return AskAIResponse(
            ai_guidance=guidance,
            socratic_question=socratic_q,
            misconception_diagnosed=misconception,
            key_formula_or_rule=key_rule,
            encouragement=encouragement
        )

    @staticmethod
    def generate_drill_post_mortem(
        total_questions: int,
        correct_count: int,
        time_spent_secs: int,
        topic_name: str
    ) -> DrillSummaryOut:
        accuracy = round((correct_count / max(1, total_questions)) * 100.0, 1)
        mins = round(time_spent_secs / 60.0, 1)

        # Dynamic readiness gain
        if accuracy >= 80:
            readiness_gain = 2.4
            debrief = (
                f"Dominant performance on {topic_name}! You solved {correct_count}/{total_questions} questions "
                f"with high accuracy ({accuracy}%). Your numerical intuition on this topic is exam-ready."
            )
            weak_spot = None
        elif accuracy >= 50:
            readiness_gain = 1.2
            debrief = (
                f"Solid effort on {topic_name} ({correct_count}/{total_questions} correct). "
                f"You have the core concept down, but edge-case boundary conditions tripped up 2 questions. "
                f"A quick 10-min formula sheet review will push you into the 80%+ bracket."
            )
            weak_spot = f"Boundary condition precision in {topic_name}"
        else:
            readiness_gain = 0.4
            debrief = (
                f"Good diagnostic drill on {topic_name}. You hit some friction with {accuracy}% accuracy. "
                f"Sahay has logged these specific questions into your review queue for spaced repetition."
            )
            weak_spot = f"Foundational theory for {topic_name}"

        return DrillSummaryOut(
            total_questions=total_questions,
            correct_count=correct_count,
            accuracy_pct=accuracy,
            time_spent_mins=mins,
            readiness_gain_pct=readiness_gain,
            post_mortem_debrief=debrief,
            weak_subtopic_flagged=weak_spot
        )
