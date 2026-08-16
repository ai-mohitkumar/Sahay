from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Topic(Base):
    """
    Sub-topic within a subject (e.g., 'Process Synchronization & Semaphores' in 'Operating Systems')
    """
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String, nullable=False)
    importance_weight = Column(Float, default=1.0) # High yield multiplier (1.0 - 3.0)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    estimated_hours = Column(Float, default=8.0)
    readiness_pct = Column(Float, default=50.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="topic", cascade="all, delete-orphan")
    doubts = relationship("Doubt", back_populates="topic")

class Question(Base):
    """
    Practice / Exam question linked to a topic
    """
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="mcq") # mcq, numerical, short
    options_json = Column(Text, nullable=True) # JSON list for MCQ: ["A", "B", "C", "D"]
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="medium") # easy, medium, hard
    source = Column(String, default="previous_year") # previous_year, predicted, user_added
    year_tag = Column(String, nullable=True) # e.g. "GATE 2023", "GATE 2021"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    topic = relationship("Topic", back_populates="questions")
    attempts = relationship("QuestionAttempt", back_populates="question", cascade="all, delete-orphan")
    doubts = relationship("Doubt", back_populates="question")

class QuestionAttempt(Base):
    """
    Tracks every user answer attempt to compute genuine mastery and detect weak spots
    """
    __tablename__ = "question_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_sec = Column(Integer, default=60)
    confidence_level = Column(String, default="medium") # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    question = relationship("Question", back_populates="attempts")

class Material(Base):
    """
    High-yield revision notes, formula cheat sheets, and mindmaps per topic
    """
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    title = Column(String, nullable=False)
    content_type = Column(String, default="formula_sheet") # notes, formula_sheet, mindmap, key_concepts
    content_body = Column(Text, nullable=False)
    source = Column(String, default="Curated Faculty Notes")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    topic = relationship("Topic", back_populates="materials")

class Doubt(Base):
    """
    Log of student AI doubt inquiries with Socratic interaction trail
    """
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    doubt_text = Column(Text, nullable=False)
    user_attempt = Column(String, nullable=True)
    socratic_mode = Column(Boolean, default=True)
    ai_response = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    question = relationship("Question", back_populates="doubts")
    topic = relationship("Topic", back_populates="doubts")
