from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.document_parser import (
    DocumentParseRequest,
    DocumentParseResponse,
    DocumentIngestRequest,
    DocumentIngestResponse
)
from app.services.document_parser import DocumentParserService

router = APIRouter(prefix="/documents", tags=["Inbound Document & Receipt Capture"])

@router.post("/parse", response_model=DocumentParseResponse)
def parse_document(payload: DocumentParseRequest, db: Session = Depends(get_db)):
    """
    Parses unstructured text from an admit card, fee receipt, or syllabus PDF.
    Extracts structured entities with confidence scores before committing.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        return DocumentParserService.parse_document(payload.raw_text, payload.doc_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")

@router.post("/ingest", response_model=DocumentIngestResponse)
def ingest_parsed_document(payload: DocumentIngestRequest, db: Session = Depends(get_db)):
    """
    Commits parsed entity into the real database (Exams, StudentExpenses, or Subjects & Tasks).
    """
    try:
        return DocumentParserService.ingest_parsed_document(
            db=db,
            user_id=payload.user_id,
            doc_type=payload.doc_type,
            payload=payload.payload
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest document data: {str(e)}")

@router.get("/sample-templates")
def get_sample_document_templates():
    """
    Returns realistic sample texts for 1-click testing in the UI.
    """
    return {
        "admit_card": """NATIONAL TESTING AGENCY (NTA)
GRADUATE APTITUDE TEST IN ENGINEERING (GATE 2027)
E-ADMIT CARD FOR COMPUTER SCIENCE & INFORMATION TECHNOLOGY (CS)

Candidate Name: MOHIT KUMAR
Registration / Roll No: CS27S8492019
Examination Date: 2027-02-14
Examination Timing: 09:00 AM to 12:00 PM (Morning Shift)
Test Center: Delhi-NCR Examination Complex #402, Sector 62, Noida, UP""",

        "fee_receipt": """INDIAN INSTITUTE OF TECHNOLOGY / CAMPUS ACCOUNTS
FEE PAYMENT CONFIRMATION RECEIPT
Receipt No: REC-2026-889102
Student ID: 12419046 (Mohit Kumar)

Description: Semester Tuition & Laboratory Infrastructure Fee
Amount Paid: INR 22,500.00
Payment Method: UPI
Transaction UTR Ref: UPI-REF-90412849
Status: SUCCESS / VERIFIED""",

        "syllabus": """DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
COURSE SYLLABUS: COMPUTER NETWORKS & DISTRIBUTED SYSTEMS

Unit 1: OSI and TCP/IP Protocol Architectures, Framing and Error Detection
Unit 2: Routing Algorithms (OSPF, BGP, Distance Vector) & Subnetting
Unit 3: Transport Layer (TCP Flow & Congestion Control, UDP Sockets)
Unit 4: Application Layer Protocols (DNS, HTTP/3, TLS/SSL Cryptography)
Unit 5: Network Security & Firewall Packet Filtering"""
    }
