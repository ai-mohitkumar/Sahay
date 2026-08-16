import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.subject import Subject
from app.models.study_content import Topic, Question, QuestionAttempt, Material, Doubt
from app.models.activity_history import ActivityHistory
from app.schemas.study import (
    SubjectStudyTree,
    TopicDetailOut,
    QuestionOut,
    QuestionAttemptCreate,
    QuestionAttemptResult,
    MaterialOut,
    AskAIRequest,
    AskAIResponse,
    DrillSummaryOut
)
from app.services.tutor_engine import TutorEngine

router = APIRouter(prefix="/study", tags=["Study Content & AI Tutor"])

@router.get("/tree", response_model=SubjectStudyTree)
def get_study_tree(subject_id: int = Query(...), user_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Returns full topic breakdown, questions, accuracy, and materials for a subject.
    """
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        # Fallback to first available subject
        subject = db.query(Subject).first()
        if not subject:
            raise HTTPException(status_code=404, detail="No subjects found")

    topics = db.query(Topic).filter(Topic.subject_id == subject.id).all()
    topic_outs = []

    for t in topics:
        q_count = len(t.questions)
        attempts = db.query(QuestionAttempt).filter(
            QuestionAttempt.user_id == user_id,
            QuestionAttempt.question_id.in_([q.id for q in t.questions])
        ).all() if q_count > 0 else []

        attempted_count = len(attempts)
        correct_count = sum(1 for a in attempts if a.is_correct)
        accuracy = round((correct_count / attempted_count) * 100.0, 1) if attempted_count > 0 else 0.0

        mat_outs = [
            MaterialOut(
                id=m.id,
                topic_id=m.topic_id,
                title=m.title,
                content_type=m.content_type,
                content_body=m.content_body,
                source=m.source
            )
            for m in t.materials
        ]

        topic_outs.append(
            TopicDetailOut(
                id=t.id,
                subject_id=t.subject_id,
                name=t.name,
                importance_weight=t.importance_weight,
                difficulty=t.difficulty,
                estimated_hours=t.estimated_hours,
                readiness_pct=t.readiness_pct,
                total_questions=q_count,
                attempted_count=attempted_count,
                accuracy_pct=accuracy,
                materials=mat_outs
            )
        )

    return SubjectStudyTree(
        subject_id=subject.id,
        subject_name=subject.name,
        subject_color=subject.color_code or "#3b82f6",
        overall_readiness_pct=subject.readiness_pct,
        total_topics=len(topic_outs),
        topics=topic_outs
    )

@router.get("/topics/{topic_id}/questions", response_model=List[QuestionOut])
def get_topic_questions(topic_id: int, db: Session = Depends(get_db)):
    """
    Returns curated practice drill questions for a topic.
    """
    questions = db.query(Question).filter(Question.topic_id == topic_id).all()
    results = []
    for q in questions:
        opts = []
        if q.options_json:
            try:
                opts = json.loads(q.options_json)
            except Exception:
                opts = []

        results.append(
            QuestionOut(
                id=q.id,
                topic_id=q.topic_id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=opts,
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                difficulty=q.difficulty,
                source=q.source,
                year_tag=q.year_tag
            )
        )
    return results

@router.post("/attempt", response_model=QuestionAttemptResult)
def submit_question_attempt(payload: QuestionAttemptCreate, db: Session = Depends(get_db)):
    """
    Evaluates student question answer, calculates genuine readiness impact, and updates progress.
    """
    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = (payload.selected_answer.strip().lower() == question.correct_answer.strip().lower())

    attempt = QuestionAttempt(
        user_id=payload.user_id,
        question_id=payload.question_id,
        selected_answer=payload.selected_answer,
        is_correct=is_correct,
        time_taken_sec=payload.time_taken_sec,
        confidence_level=payload.confidence_level,
        created_at=datetime.utcnow()
    )
    db.add(attempt)

    # Update topic & subject readiness based on genuine accuracy
    topic = db.query(Topic).filter(Topic.id == question.topic_id).first()
    readiness_delta = 1.2 if is_correct else -0.5

    if topic:
        topic.readiness_pct = min(100.0, max(10.0, topic.readiness_pct + readiness_delta))
        if topic.subject:
            topic.subject.readiness_pct = min(100.0, max(10.0, topic.subject.readiness_pct + (readiness_delta * 0.6)))

    # Log to activity history
    history = ActivityHistory(
        user_id=payload.user_id,
        action="practice_question_correct" if is_correct else "practice_question_incorrect",
        reason=f"Topic: {topic.name if topic else 'General'}",
        readiness_delta=readiness_delta,
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    if is_correct:
        feedback = "Spot on! Your conceptual model and numerical calculation were accurate."
    else:
        feedback = f"Not quite. You selected '{payload.selected_answer}', but the correct answer is '{question.correct_answer}'."

    return QuestionAttemptResult(
        is_correct=is_correct,
        correct_answer=question.correct_answer,
        explanation=question.explanation or "Apply the fundamental formula and check boundary conditions.",
        subject_readiness_delta=readiness_delta,
        updated_topic_readiness_pct=topic.readiness_pct if topic else 60.0,
        ai_quick_feedback=feedback
    )

@router.post("/ask-ai", response_model=AskAIResponse)
def ask_ai_doubt(payload: AskAIRequest, db: Session = Depends(get_db)):
    """
    Socratic AI Tutor assistant for solving doubts and diagnosing conceptual misconceptions.
    """
    topic_name = "Core Concept"
    if payload.topic_id:
        topic = db.query(Topic).filter(Topic.id == payload.topic_id).first()
        if topic:
            topic_name = topic.name

    response = TutorEngine.answer_doubt(
        question_text=payload.question_text,
        user_attempt=payload.user_attempted_answer,
        doubt_query=payload.student_doubt,
        topic_name=topic_name,
        socratic_mode=payload.socratic_mode
    )

    # Log doubt query
    doubt = Doubt(
        user_id=payload.user_id,
        question_id=payload.question_id,
        topic_id=payload.topic_id,
        doubt_text=payload.student_doubt,
        user_attempt=payload.user_attempted_answer,
        socratic_mode=payload.socratic_mode,
        ai_response=response.ai_guidance,
        is_resolved=True,
        created_at=datetime.utcnow()
    )
    db.add(doubt)
    db.commit()

    return response

@router.post("/finish-drill", response_model=DrillSummaryOut)
def finish_practice_drill(
    total: int = Query(...),
    correct: int = Query(...),
    time_spent: int = Query(...),
    topic_name: str = Query("Operating Systems"),
    db: Session = Depends(get_db)
):
    """
    Generates post-mortem debrief after completing a practice sprint.
    """
    return TutorEngine.generate_drill_post_mortem(
        total_questions=total,
        correct_count=correct,
        time_spent_secs=time_spent,
        topic_name=topic_name
    )
