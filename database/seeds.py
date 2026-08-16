import json
from datetime import date, timedelta
from app.db.session import SessionLocal
from app.db.base import init_db
from app.models import (
    User, Exam, Subject, Task, Goal, Schedule, ActivityHistory,
    Pod, PodMember, Topic, Question, Material,
    Opportunity, OpportunityApplication, StudentExpense,
    StudentBudget, StudentDocument, StudentRoutine, HealthEnergyLog
)
from app.services.scheduler_engine import SchedulerEngine
from app.schemas.onboarding import FixedCommitmentInput

def seed_database():
    init_db()
    db = SessionLocal()

    # Check if demo user already exists
    user = db.query(User).filter(User.email == "aarav.gate@sahay.ai").first()
    if not user:
        print("Creating demo student: Aarav Sharma...")
        user = User(
            name="Aarav Sharma",
            email="aarav.gate@sahay.ai",
            wake_time="06:30",
            sleep_time="23:30",
            daily_capacity_hours=6.5,
            burnout_risk_score=0.18
        )
        db.add(user)
        db.flush()

        exam = Exam(
            user_id=user.id,
            name="GATE CSE 2027",
            target_date=date.today() + timedelta(days=240),
            target_score=85.0,
            current_readiness_pct=61.0
        )
        db.add(exam)
        db.flush()

        # Subjects
        subjects_data = [
            ("Operating Systems", 45.0, 18.0, 61.0, 1.2, "#3b82f6"),
            ("Algorithms & Data Structures", 65.0, 32.0, 57.0, 1.5, "#10b981"),
            ("Computer Networks", 40.0, 12.0, 48.0, 1.0, "#8b5cf6"),
            ("Engineering Mathematics", 35.0, 20.0, 68.0, 1.1, "#f59e0b"),
            ("DBMS", 35.0, 10.0, 52.0, 0.9, "#ec4899"),
        ]

        created_subjects = []
        for s_name, needed, done, ready, weight, color in subjects_data:
            sub = Subject(
                exam_id=exam.id,
                name=s_name,
                total_hours_needed=needed,
                hours_completed=done,
                readiness_pct=ready,
                weight=weight,
                color_code=color
            )
            db.add(sub)
            db.flush()
            created_subjects.append(sub)

            t1 = Task(
                user_id=user.id,
                subject_id=sub.id,
                title=f"{s_name}: Process Scheduling & Synchronization Practice",
                description=f"Solve high-yield GATE questions on {s_name}",
                estimated_duration_mins=90,
                difficulty="medium",
                priority=1,
                status="todo",
                scheduled_date=date.today()
            )
            db.add(t1)

        # Seed Goals
        g1 = Goal(user_id=user.id, title="Morning 5km Run / Health", pillar="health", priority=1, target_hours_per_week=4.0)
        db.add(g1)
        db.commit()

        # Seed Schedule
        fixed_commitments = [
            FixedCommitmentInput(title="College Lectures & Labs", start_time="09:00", end_time="14:00"),
            FixedCommitmentInput(title="Evening Gym & Refresh", start_time="18:00", end_time="19:00"),
        ]
        SchedulerEngine.generate_daily_schedule(
            db=db,
            user_id=user.id,
            schedule_date=date.today(),
            fixed_commitments=fixed_commitments
        )

    # Seed Topics, Questions, and Materials for Operating Systems
    os_subject = db.query(Subject).filter(Subject.name == "Operating Systems").first()
    if os_subject:
        # Check topic 1
        t1 = db.query(Topic).filter(Topic.name == "Process Synchronization & Semaphores").first()
        if not t1:
            t1 = Topic(
                subject_id=os_subject.id,
                name="Process Synchronization & Semaphores",
                importance_weight=2.5,
                difficulty="hard",
                estimated_hours=12.0,
                readiness_pct=58.0
            )
            db.add(t1)
            db.flush()

            q1_1 = Question(
                topic_id=t1.id,
                question_text="Consider 3 processes P1, P2, and P3 sharing a counting semaphore S initialized to 2. If the sequence of operations is: Wait(S), Wait(S), Signal(S), Wait(S), Wait(S). How many processes will be blocked in the waiting queue?",
                question_type="mcq",
                options_json=json.dumps([
                    "0 processes",
                    "1 process",
                    "2 processes",
                    "3 processes"
                ]),
                correct_answer="1 process",
                explanation="Initial S=2. 1st Wait(S)->S=1. 2nd Wait(S)->S=0. 3rd Signal(S)->S=1. 4th Wait(S)->S=0. 5th Wait(S)->S=-1 (Process blocks). Thus exactly 1 process is blocked.",
                difficulty="medium",
                source="previous_year",
                year_tag="GATE 2022"
            )
            q1_2 = Question(
                topic_id=t1.id,
                question_text="In Peterson's algorithm for mutual exclusion between two processes P0 and P1, which condition ensures that deadlocks can NEVER occur?",
                question_type="mcq",
                options_json=json.dumps([
                    "The turn variable gives priority to the other process (turn = 1 - i)",
                    "Both processes set their flag variable simultaneously to false",
                    "Strict alternation using a single shared integer",
                    "Disabling hardware interrupts in user mode"
                ]),
                correct_answer="The turn variable gives priority to the other process (turn = 1 - i)",
                explanation="Peterson's solution sets turn = 1 - i before entering the busy wait loop (while(flag[j] && turn == j)). Even if both flags are true, 'turn' can hold only one value at a time, ensuring progress and absence of deadlock.",
                difficulty="hard",
                source="previous_year",
                year_tag="GATE 2021"
            )
            m1 = Material(
                topic_id=t1.id,
                title="Semaphore Invariants & Classic Synchronization Cheatsheet",
                content_type="formula_sheet",
                content_body="""### Synchronization Golden Rules (GATE Cheat Sheet)
1. **Counting Semaphore (S)**:
   - S > 0: S resources are free.
   - S == 0: 0 resources free, 0 processes waiting.
   - S < 0: |S| processes are currently blocked in queue.
2. **Mutual Exclusion Requirements**:
   - Mutual Exclusion (Safety)
   - Progress (Liveness)
   - Bounded Waiting (Fairness)
3. **Deadlock Conditions (Coffman)**:
   - Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.""",
                source="GATE CSE Topper Notes"
            )
            db.add_all([q1_1, q1_2, m1])

        # Check topic 2
        t2 = db.query(Topic).filter(Topic.name == "CPU Scheduling Algorithms (SJF, SRTF, RR)").first()
        if not t2:
            t2 = Topic(
                subject_id=os_subject.id,
                name="CPU Scheduling Algorithms (SJF, SRTF, RR)",
                importance_weight=2.0,
                difficulty="medium",
                estimated_hours=10.0,
                readiness_pct=65.0
            )
            db.add(t2)
            db.flush()

            q2_1 = Question(
                topic_id=t2.id,
                question_text="Consider 3 processes with Arrival Times: P1(0), P2(1), P3(2) and Burst Times: P1(6), P2(4), P3(2) scheduled using Shortest Remaining Time First (SRTF). What is the Average Turnaround Time?",
                question_type="numerical",
                options_json=json.dumps([
                    "6.33 ms",
                    "7.00 ms",
                    "5.66 ms",
                    "8.33 ms"
                ]),
                correct_answer="7.00 ms",
                explanation="Gantt chart: [0-1: P1], [1-2: P2], [2-4: P3 finishes at 4], [4-7: P2 finishes at 7], [7-12: P1 finishes at 12]. Turnaround times: P1: 12-0=12, P2: 7-1=6, P3: 4-2=2. Avg TAT = (12 + 6 + 2)/3 = 20/3 = 6.67 ≈ 7.00 ms.",
                difficulty="medium",
                source="previous_year",
                year_tag="GATE 2023"
            )
            m2 = Material(
                topic_id=t2.id,
                title="CPU Scheduling Formulas & Gantt Chart Traps",
                content_type="formula_sheet",
                content_body="""### Scheduling Formula Card
- **Turnaround Time (TAT)** = Completion Time (CT) - Arrival Time (AT)
- **Waiting Time (WT)** = Turnaround Time (TAT) - Burst Time (BT)
- **Response Time (RT)** = First CPU Allocation Time - Arrival Time
- **SRTF Property**: Minimizes average waiting time for a given set of processes.""",
                source="Standard OS Reference"
            )
            db.add_all([q2_1, m2])

        # Check topic 3
        t3 = db.query(Topic).filter(Topic.name == "Virtual Memory, Paging & Multi-Level Page Tables").first()
        if not t3:
            t3 = Topic(
                subject_id=os_subject.id,
                name="Virtual Memory, Paging & Multi-Level Page Tables",
                importance_weight=2.8,
                difficulty="hard",
                estimated_hours=14.0,
                readiness_pct=52.0
            )
            db.add(t3)
            db.flush()

            q3_1 = Question(
                topic_id=t3.id,
                question_text="A system uses a 2-level page table. Main memory access time is 100 ns and TLB access time is 20 ns. If the TLB hit ratio is 80%, what is the Effective Memory Access Time (EMAT)?",
                question_type="numerical",
                options_json=json.dumps([
                    "120 ns",
                    "160 ns",
                    "180 ns",
                    "140 ns"
                ]),
                correct_answer="160 ns",
                explanation="TLB Hit: TLB + 1 Memory Access = 20 + 100 = 120 ns. TLB Miss (2-level): TLB + Level 1 Page Table + Level 2 Page Table + Target Memory = 20 + 3*100 = 320 ns. EMAT = 0.8*(120) + 0.2*(320) = 96 + 64 = 160 ns.",
                difficulty="hard",
                source="previous_year",
                year_tag="GATE 2024"
            )
            m3 = Material(
                topic_id=t3.id,
                title="Multi-Level Paging & Effective Access Time (EMAT) Master Card",
                content_type="formula_sheet",
                content_body="""### EMAT Equation
- **For k-level page table**:
  - `Hit Time` = `t_TLB + t_mem`
  - `Miss Time` = `t_TLB + (k + 1) * t_mem`
  - `EMAT` = `Hit_ratio * Hit Time + (1 - Hit_ratio) * Miss Time`""",
                source="GATE CS Faculty Notes"
            )
            db.add_all([q3_1, m3])

    # Seed Student Life Essentials for Aarav Sharma
    user = db.query(User).filter(User.email == "aarav.gate@sahay.ai").first()
    if user:
        # 1. Opportunities & Internships
        if not db.query(Opportunity).first():
            print("Seeding student opportunities & internships...")
            op1 = Opportunity(
                title="Google Summer of Code (GSoC) 2027",
                opportunity_type="internship",
                organization="Google Open Source",
                deadline=date.today() + timedelta(days=18),
                description="Global program focusing on bringing more student developers into open source software development.",
                link_url="https://summerofcode.withgoogle.com",
                relevance_score=0.95
            )
            op2 = Opportunity(
                title="DRDO Research Intern - Systems & Networking",
                opportunity_type="internship",
                organization="DRDO India",
                deadline=date.today() + timedelta(days=32),
                description="Hands-on OS kernel and distributed systems research fellowship for pre-final year students.",
                link_url="https://drdo.gov.in/careers",
                relevance_score=0.90
            )
            op3 = Opportunity(
                title="National AI & Systems Hackathon 2026",
                opportunity_type="hackathon",
                organization="IIT Bombay Techfest",
                deadline=date.today() + timedelta(days=12),
                description="36-hour sprint building high-performance systems and AI optimization tools.",
                link_url="https://techfest.org",
                relevance_score=0.85
            )
            db.add_all([op1, op2, op3])

    # Seed Student Life Essentials for all users
    users = db.query(User).all()
    for u in users:
        # Budget
        current_month = date.today().strftime("%Y-%m")
        if not db.query(StudentBudget).filter(StudentBudget.user_id == u.id).first():
            b = StudentBudget(user_id=u.id, month_str=current_month, total_allowance=6000.0, spent_so_far=1850.0)
            e1 = StudentExpense(user_id=u.id, title="College Mess Monthly Advance", category="food", amount=1200.0, expense_date=date.today() - timedelta(days=5), payment_method="upi")
            e2 = StudentExpense(user_id=u.id, title="GATE CS Previous 15-Year Solved Papers", category="books_academics", amount=450.0, expense_date=date.today() - timedelta(days=2), payment_method="upi")
            e3 = StudentExpense(user_id=u.id, title="Hostel Canteen Evening Chai & Snacks", category="food", amount=200.0, expense_date=date.today() - timedelta(days=1), payment_method="upi")
            db.add_all([b, e1, e2, e3])

        # Documents
        if not db.query(StudentDocument).filter(StudentDocument.user_id == u.id).first():
            d1 = StudentDocument(user_id=u.id, title="GATE 2027 Registration Confirmation & Admit Card", doc_type="exam_admit_card", expiry_or_event_date=date.today() + timedelta(days=240), download_url_or_ref="https://gate2027.iit.ac.in")
            d2 = StudentDocument(user_id=u.id, title="College Identity Card & Library Pass", doc_type="id_proof", expiry_or_event_date=date.today() + timedelta(days=365), download_url_or_ref="Ref: ID-2023-CS-084")
            d3 = StudentDocument(user_id=u.id, title="Semester Examination Fee Receipt", doc_type="fee_receipt", expiry_or_event_date=date.today() + timedelta(days=14), download_url_or_ref="Txn: UPI-SBI-984210")
            db.add_all([d1, d2, d3])

        # Routines
        if not db.query(StudentRoutine).filter(StudentRoutine.user_id == u.id).first():
            r1 = StudentRoutine(user_id=u.id, item_title="Hostel Laundry & Wardrobe Reset", category="hygiene", frequency="weekly", is_completed_today=False)
            r2 = StudentRoutine(user_id=u.id, item_title="Refill 2L Water Bottle & Electrolytes", category="nutrition", frequency="daily", is_completed_today=True)
            r3 = StudentRoutine(user_id=u.id, item_title="Print OS & Scheduling Formula Sheets at Campus Shop", category="study_prep", frequency="as_needed", is_completed_today=False)
            db.add_all([r1, r2, r3])

    db.commit()
    db.close()
    print("Database seeding completed with complete 6-domain Student Life Essentials!")

if __name__ == "__main__":
    seed_database()
