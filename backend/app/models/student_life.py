from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Opportunity(Base):
    """
    Career, internship, scholarship, and hackathon deadlines for students
    """
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    opportunity_type = Column(String, nullable=False) # 'internship', 'scholarship', 'hackathon', 'exam_registration'
    organization = Column(String, nullable=False) # e.g. 'Google / GSoC', 'ISRO / DRDO', 'National Scholarship'
    deadline = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    link_url = Column(String, nullable=True)
    relevance_score = Column(Float, default=0.9) # 0.0 - 1.0 match with student target
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("OpportunityApplication", back_populates="opportunity", cascade="all, delete-orphan")

class OpportunityApplication(Base):
    """
    Tracks a student's personal application status
    """
    __tablename__ = "opportunity_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status = Column(String, default="saved") # 'saved', 'applied', 'interviewing', 'accepted'
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    opportunity = relationship("Opportunity", back_populates="applications")

class StudentExpense(Base):
    """
    Daily micro-budget and expense tracking for college/hostel students
    """
    __tablename__ = "student_expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False) # e.g., 'Mess Bill', 'Book / Stationery', 'Hostel Canteen', 'Printouts'
    category = Column(String, default="food") # 'food', 'books_academics', 'rent_hostel', 'travel', 'entertainment'
    amount = Column(Float, nullable=False)
    expense_date = Column(Date, default=date.today)
    payment_method = Column(String, default="upi") # 'upi', 'cash', 'card'
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class StudentBudget(Base):
    """
    Monthly student allowance and budget caps
    """
    __tablename__ = "student_budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_str = Column(String, nullable=False) # e.g. '2026-08'
    total_allowance = Column(Float, default=6000.0) # Monthly budget
    spent_so_far = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class HealthEnergyLog(Base):
    """
    Circadian health, sleep, cognitive energy, and stress signals
    """
    __tablename__ = "health_energy_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, default=date.today)
    sleep_hours = Column(Float, default=7.0)
    sleep_quality = Column(String, default="good") # 'poor', 'fair', 'good', 'optimal'
    energy_level = Column(Integer, default=4) # 1-5 scale
    stress_score = Column(Float, default=0.2) # 0.0 - 1.0
    recovery_mode_active = Column(Boolean, default=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class StudentDocument(Base):
    """
    Critical document vault with expiry and exam deadlines (Admit Card, ID, Fee Receipt)
    """
    __tablename__ = "student_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False) # e.g. 'GATE 2027 Admit Card', 'College ID Card', 'Hostel Pass'
    doc_type = Column(String, default="exam_admit_card") # 'exam_admit_card', 'id_proof', 'fee_receipt', 'marksheet'
    expiry_or_event_date = Column(Date, nullable=True)
    download_url_or_ref = Column(String, nullable=True)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class StudentRoutine(Base):
    """
    Hostel / College daily essentials checklist (Laundry, Hydration, Mess timings, Library)
    """
    __tablename__ = "student_routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_title = Column(String, nullable=False) # e.g. 'Hostel Laundry Day', 'Refill 2L Water Bottle', 'Exam Printing'
    category = Column(String, default="routine") # 'hygiene', 'admin', 'nutrition', 'study_prep'
    frequency = Column(String, default="daily") # 'daily', 'weekly', 'as_needed'
    is_completed_today = Column(Boolean, default=False)
    last_completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
