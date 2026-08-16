from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel

class MaterialOut(BaseModel):
    id: int
    topic_id: int
    title: str
    content_type: str # 'notes', 'formula_sheet', 'mindmap', 'key_concepts'
    content_body: str
    source: str

    class Config:
        from_attributes = True

class QuestionOut(BaseModel):
    id: int
    topic_id: int
    question_text: str
    question_type: str
    options: List[str] = []
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: str
    source: str
    year_tag: Optional[str] = None

class TopicDetailOut(BaseModel):
    id: int
    subject_id: int
    name: str
    importance_weight: float
    difficulty: str
    estimated_hours: float
    readiness_pct: float
    total_questions: int
    attempted_count: int
    accuracy_pct: float
    materials: List[MaterialOut] = []

class SubjectStudyTree(BaseModel):
    subject_id: int
    subject_name: str
    subject_color: str
    overall_readiness_pct: float
    total_topics: int
    topics: List[TopicDetailOut]

class QuestionAttemptCreate(BaseModel):
    user_id: int
    question_id: int
    selected_answer: str
    time_taken_sec: int = 45
    confidence_level: str = "medium"

class QuestionAttemptResult(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str
    subject_readiness_delta: float
    updated_topic_readiness_pct: float
    ai_quick_feedback: str

class AskAIRequest(BaseModel):
    user_id: int
    question_id: Optional[int] = None
    topic_id: Optional[int] = None
    question_text: str
    user_attempted_answer: Optional[str] = None
    student_doubt: str
    socratic_mode: bool = True # True = Guiding Socratic hint, False = Direct breakdown

class AskAIResponse(BaseModel):
    ai_guidance: str
    socratic_question: Optional[str] = None
    misconception_diagnosed: Optional[str] = None
    key_formula_or_rule: Optional[str] = None
    encouragement: str

class DrillSummaryOut(BaseModel):
    total_questions: int
    correct_count: int
    accuracy_pct: float
    time_spent_mins: float
    readiness_gain_pct: float
    post_mortem_debrief: str
    weak_subtopic_flagged: Optional[str] = None
