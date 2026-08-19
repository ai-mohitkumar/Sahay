from typing import Dict, Any, Optional, List
import re
from sqlalchemy.orm import Session
from app.models.study_content import Question, Topic, QuestionAttempt, Doubt
from app.schemas.study import AskAIResponse, DrillSummaryOut
from app.services.knowledge_engine import KnowledgeEngine

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
        full_query = f"{question_text} Doubt: {doubt_query}"

        # 1. Try real LLM first (Gemini / OpenAI)
        llm_prompt = (
            f"Question / Concept: {question_text}\n"
            f"Student Attempted Answer: {user_attempt or 'None'}\n"
            f"Student's Specific Doubt: {doubt_query}\n"
            f"Topic: {topic_name}\n"
            f"Socratic Mode: {socratic_mode}\n\n"
            f"Provide:\n"
            f"1. AI Guidance (intuitive breakdown)\n"
            f"2. Socratic Question (a targeted question to make them think, or None if direct mode)\n"
            f"3. Misconception Diagnosed\n"
            f"4. Key Formula or Rule\n"
            f"5. Encouragement"
        )
        llm_res = KnowledgeEngine.call_llm(
            prompt=llm_prompt,
            system_prompt=(
                "You are Sahay's Socratic Academic Tutor. Format your response cleanly. "
                "Be encouraging, highly technical, and concise."
            )
        )
        if llm_res:
            # Parse or format LLM response
            return AskAIResponse(
                ai_guidance=llm_res,
                socratic_question="What step or boundary condition in your reasoning might change when this rule is applied?" if socratic_mode else None,
                misconception_diagnosed=f"Key gap diagnosed in {topic_name}",
                key_formula_or_rule=f"Core principle of {topic_name}",
                encouragement="You are thinking in the right direction! Let's lock this concept in."
            )

        # 2. Topic Specific Misconception Diagnosis
        misconception = None
        key_rule = None

        if "semaphore" in question_lower or "synchronization" in question_lower or "semaphore" in doubt_lower:
            key_rule = "Wait(S) decrements and blocks if S <= 0; Signal(S) increments and unblocks."
            if "deadlock" in doubt_lower or "order" in doubt_lower:
                misconception = "Inverted wait order across multiple semaphores causes circular wait."
            else:
                misconception = "Confusing counting semaphores (resource counting) with binary mutex."

        elif "schedule" in question_lower or "sjf" in question_lower or "round robin" in question_lower or "preemptive" in doubt_lower:
            key_rule = "Turnaround Time = Completion Time - Arrival Time; Waiting Time = Turnaround Time - Burst Time."
            if "preemptive" in doubt_lower or "srtf" in doubt_lower or "race" in doubt_lower:
                misconception = "Preemption interrupts execution midway, exposing unprotected shared state to race conditions."
            else:
                misconception = "Context switch overhead and time quantum threshold confusion."

        elif "page" in question_lower or "paging" in question_lower or "tlb" in question_lower:
            key_rule = "Effective Access Time (EAT) = TLB_hit*(tlb_time + mem_time) + (1-TLB_hit)*(tlb_time + 2*mem_time)."
            misconception = "Forgetting that memory is accessed twice during a TLB miss in standard paging."

        else:
            # Dynamically query Wikipedia or extract subject essence
            wiki = KnowledgeEngine.fetch_wikipedia_summary(doubt_query or question_text)
            if wiki:
                key_rule = f"{wiki['title']}: {wiki['summary'][:160]}..."
                misconception = f"Boundary assumption or property conflict in {wiki['title']}."
            else:
                clean_doubt = re.sub(r"^(why|how|what|is|does)\s+", "", doubt_query, flags=re.IGNORECASE).strip(" ?.")
                key_rule = f"Core invariant for {topic_name}: Verify state transitions for '{clean_doubt}'."
                misconception = f"Discrepancy in handling '{clean_doubt}' during evaluation."

        # 3. Socratic vs Direct Guidance
        if socratic_mode:
            guidance = (
                f"🧠 **Socratic Reasoning for '{topic_name}':**\n\n"
                f"Your doubt focuses on: *'{doubt_query}'*.\n\n"
                f"To build strong mental intuition, consider the governing mechanism:\n"
                f"• {key_rule}\n"
                f"• Look at what happens right at the moment of state transition."
            )
            socratic_q = (
                f"If you apply the rule ({key_rule.split(';')[0] if ';' in key_rule else key_rule[:80]}), "
                f"what exact condition triggers the unexpected behavior you observed?"
            )
            encouragement = "You're very close to cracking this! Trace that single intermediate step."
        else:
            guidance = (
                f"💡 **Direct Conceptual Resolution:**\n\n"
                f"• **Doubt Addressed**: {doubt_query}\n"
                f"• **Key Diagnostic**: {misconception}\n"
                f"• **Governing Rule**: {key_rule}\n\n"
                f"Applying this rule directly resolves your doubt and aligns with exam scoring keys."
            )
            socratic_q = None
            encouragement = "Keep this core insight pinned in your notes for practice drills!"

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
                f"Solid progress on {topic_name}. You scored {correct_count}/{total_questions} ({accuracy}%). "
                f"Focus on tightening boundary-case calculations to push this into the 80%+ mastery zone."
            )
            weak_spot = f"Boundary condition verification in {topic_name} PYQs."
        else:
            readiness_gain = 0.5
            debrief = (
                f"High-friction topic detected ({accuracy}% accuracy on {topic_name}). "
                f"Don't worry — finding gaps during practice is the entire goal. We have added targeted revision to your schedule."
            )
            weak_spot = f"Fundamental formula synthesis for {topic_name}."

        recommended_focus = (
            f"Review 1-page formula summary for {topic_name} and solve 3 previous year questions tomorrow."
        )

        return DrillSummaryOut(
            total_questions=total_questions,
            correct_count=correct_count,
            accuracy_pct=accuracy,
            time_spent_mins=mins,
            subject_readiness_gain=readiness_gain,
            debrief_summary=debrief,
            weak_spot_diagnosed=weak_spot,
            recommended_next_focus=recommended_focus
        )
