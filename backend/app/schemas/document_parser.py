from datetime import date, datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class DocumentParseRequest(BaseModel):
    user_id: int
    doc_type: Optional[str] = "auto"  # 'auto', 'admit_card', 'fee_receipt', 'syllabus'
    raw_text: str
    filename: Optional[str] = None

class ParsedAdmitCard(BaseModel):
    exam_name: str
    target_date: str # YYYY-MM-DD
    registration_number: Optional[str] = None
    center_city: Optional[str] = None
    shift_time: Optional[str] = None
    confidence_pct: int = 92

class ParsedFeeReceipt(BaseModel):
    title: str
    amount: float
    category: str # 'tuition_fee', 'hostel_rent', 'books_academics', 'mess_food', 'exam_registration', 'misc'
    transaction_id: Optional[str] = None
    payment_method: str = "upi"
    date: str
    confidence_pct: int = 95

class SyllabusModuleItem(BaseModel):
    title: str
    estimated_hours: float = 2.0
    priority: int = 1
    difficulty: str = "medium"

class ParsedSyllabus(BaseModel):
    subject_name: str
    total_estimated_hours: float
    color_code: str = "#6366f1"
    modules: List[SyllabusModuleItem]
    confidence_pct: int = 90

class DocumentParseResponse(BaseModel):
    doc_type: str  # 'admit_card', 'fee_receipt', 'syllabus'
    summary: str
    admit_card: Optional[ParsedAdmitCard] = None
    fee_receipt: Optional[ParsedFeeReceipt] = None
    syllabus: Optional[ParsedSyllabus] = None

class DocumentIngestRequest(BaseModel):
    user_id: int
    doc_type: str
    payload: Dict[str, Any]

class DocumentIngestResponse(BaseModel):
    status: str
    message: str
    entity_type: str
    created_id: int
    details: Dict[str, Any]
