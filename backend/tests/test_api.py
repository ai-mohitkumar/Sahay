from datetime import date
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import init_db
from app.db.session import SessionLocal
from app.models.study_content import Topic, Question, Material
from app.models.subject import Subject

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()
    db = SessionLocal()
    sub = db.query(Subject).first()
    if sub and not sub.topics:
        t = Topic(
            subject_id=sub.id,
            name="Process Synchronization & Semaphores",
            importance_weight=2.5,
            difficulty="hard",
            readiness_pct=58.0
        )
        db.add(t)
        db.flush()
        q = Question(
            topic_id=t.id,
            question_text="Consider 3 processes sharing a counting semaphore S initialized to 2...",
            question_type="mcq",
            options_json='["0 processes", "1 process", "2 processes", "3 processes"]',
            correct_answer="1 process",
            explanation="Detailed explanation here.",
            difficulty="medium",
            source="previous_year"
        )
        db.add(q)
        db.commit()
    db.close()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "Sahay AI Negotiator"
    assert "pitch" in data

def test_onboarding_and_timeline_generation():
    payload = {
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "wake_time": "06:30",
        "sleep_time": "23:00",
        "daily_capacity_hours": 6.5,
        "fixed_commitments": [
            {
                "title": "College Classes",
                "start_time": "09:00",
                "end_time": "14:00"
            }
        ],
        "exam": {
            "name": "GATE CSE 2027",
            "target_date": "2027-02-15",
            "target_score": 85.0,
            "subjects": [
                {
                    "name": "Operating Systems",
                    "total_hours_needed": 45.0,
                    "current_readiness_pct": 61.0,
                    "weight": 1.2,
                    "color_code": "#3b82f6"
                },
                {
                    "name": "Algorithms & Data Structures",
                    "total_hours_needed": 60.0,
                    "current_readiness_pct": 55.0,
                    "weight": 1.5,
                    "color_code": "#10b981"
                }
            ]
        }
    }

    res = client.post("/api/v1/onboarding", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] is not None
    assert data["generated_blocks_count"] > 0
    user_id = data["user_id"]

    # 2. Get 24-hour vertical timeline
    res_timeline = client.get(f"/api/v1/schedules/timeline?user_id={user_id}")
    assert res_timeline.status_code == 200
    timeline_data = res_timeline.json()
    assert len(timeline_data["blocks"]) > 0

    # 3. Find a study session block
    study_block = next((b for b in timeline_data["blocks"] if b["block_type"] == "study_session"), None)
    assert study_block is not None

    # 4. Evaluate Trade-Off for skipping
    eval_res = client.post("/api/v1/negotiation/evaluate", json={
        "user_id": user_id,
        "schedule_id": study_block["id"],
        "proposed_action": "skip",
        "reason": "tired"
    })
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "Operating Systems" in eval_data["consequence_narrative"] or "readiness" in eval_data["consequence_narrative"]
    assert len(eval_data["proposals"]) >= 3

    # 5. Accept proposal (Shift to tonight)
    accept_res = client.post("/api/v1/negotiation/accept", json={
        "user_id": user_id,
        "schedule_id": study_block["id"],
        "proposal_id": "shift_tonight"
    })
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "success"

    # 6. Future Self Simulation
    future_res = client.get(f"/api/v1/simulation/future-self?user_id={user_id}")
    assert future_res.status_code == 200
    sim_data = future_res.json()
    assert len(sim_data["simulation_points"]) == 30
    assert sim_data["projected_30d_readiness_pct"] > 0

    # 7. Check Activity History
    history_res = client.get(f"/api/v1/analytics/history?user_id={user_id}")
    assert history_res.status_code == 200
    assert history_res.json()["total_events"] >= 1

def test_study_content_and_socratic_tutor():
    db = SessionLocal()
    sub = db.query(Subject).filter(Subject.name == "Operating Systems").first()
    if not sub:
        sub = db.query(Subject).first()
    if sub and not sub.topics:
        t = Topic(
            subject_id=sub.id,
            name="Process Synchronization & Semaphores",
            importance_weight=2.5,
            difficulty="hard",
            readiness_pct=58.0
        )
        db.add(t)
        db.flush()
        q = Question(
            topic_id=t.id,
            question_text="Consider 3 processes sharing a counting semaphore S initialized to 2...",
            question_type="mcq",
            options_json='["0 processes", "1 process", "2 processes", "3 processes"]',
            correct_answer="1 process",
            explanation="Detailed explanation here.",
            difficulty="medium",
            source="previous_year"
        )
        db.add(q)
        db.commit()
    db.close()

    # 1. Get study tree for subject
    sub_id = sub.id if sub else 1
    tree_res = client.get(f"/api/v1/study/tree?subject_id={sub_id}&user_id=1")
    assert tree_res.status_code == 200
    tree_data = tree_res.json()
    assert len(tree_data["topics"]) >= 1
    
    topic = tree_data["topics"][0]
    
    # 2. Get questions for topic
    q_res = client.get(f"/api/v1/study/topics/{topic['id']}/questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) >= 1
    
    # 3. Submit question attempt
    q = questions[0]
    attempt_res = client.post("/api/v1/study/attempt", json={
        "user_id": 1,
        "question_id": q["id"],
        "selected_answer": q["correct_answer"] or "1 process",
        "time_taken_sec": 45,
        "confidence_level": "high"
    })
    assert attempt_res.status_code == 200
    attempt_data = attempt_res.json()
    assert attempt_data["is_correct"] is True
    assert attempt_data["subject_readiness_delta"] > 0
    
    # 4. Ask Socratic AI Tutor
    tutor_res = client.post("/api/v1/study/ask-ai", json={
        "user_id": 1,
        "question_id": q["id"],
        "topic_id": topic["id"],
        "question_text": q["question_text"],
        "user_attempted_answer": "1 process",
        "student_doubt": "Why does the 5th wait operation cause blocking?",
        "socratic_mode": True
    })
    assert tutor_res.status_code == 200
    tutor_data = tutor_res.json()
    assert tutor_data["socratic_question"] is not None
    assert "wait" in tutor_data["key_formula_or_rule"].lower() or "signal" in tutor_data["key_formula_or_rule"].lower() or "invariant" in tutor_data["key_formula_or_rule"].lower()
    
    # 5. Finish Drill & Get Post-Mortem
    finish_res = client.post("/api/v1/study/finish-drill?total=3&correct=3&time_spent=120&topic_name=Process+Synchronization")
    assert finish_res.status_code == 200
    finish_data = finish_res.json()
    assert finish_data["accuracy_pct"] == 100.0
    assert finish_data["readiness_gain_pct"] > 0

def test_student_life_and_cross_domain_brain():
    # 1. Overview for all 6 domains
    overview_res = client.get("/api/v1/student-life/overview?user_id=1")
    assert overview_res.status_code == 200
    overview_data = overview_res.json()
    assert "user_name" in overview_data
    assert "monthly_budget" in overview_data
    assert "health_status" in overview_data
    
    # 2. Log student expense
    exp_res = client.post("/api/v1/student-life/finances/expense", json={
        "user_id": 1,
        "title": "Semester Exam Printing & Photocopy",
        "category": "books_academics",
        "amount": 85.0,
        "payment_method": "upi"
    })
    assert exp_res.status_code == 200
    assert exp_res.json()["amount"] == 85.0
    
    # 3. Cross-Domain Life Reasoning
    consult_res = client.post("/api/v1/student-life/cross-domain-consult", json={
        "user_id": 1,
        "question": "Should I skip gym today to finish my OS assignment?"
    })
    assert consult_res.status_code == 200
    consult_data = consult_res.json()
    assert "gym" in consult_data["verdict"].lower() or "health" in consult_data["domain_primary"].lower() or "cross_domain" in consult_data["domain_primary"].lower()
    assert len(consult_data["trade_breakdown"]) >= 2

def test_productivity_features():
    # 1. Smart Task Breakdown
    breakdown_res = client.post("/api/v1/tasks/smart-breakdown", json={
        "task_title": "Study Operating Systems Semaphores and Scheduling",
        "subject_name": "Operating Systems",
        "target_duration_mins": 60
    })
    assert breakdown_res.status_code == 200
    b_data = breakdown_res.json()
    assert len(b_data["subtasks"]) >= 3
    assert b_data["total_duration_mins"] == 60
    assert "activation_strategy" in b_data

    # 2. Timeline Why-Now Reasoning
    timeline_res = client.get("/api/v1/schedules/timeline?user_id=1")
    assert timeline_res.status_code == 200
    t_data = timeline_res.json()
    assert len(t_data["blocks"]) > 0
    first_block = t_data["blocks"][0]
    assert first_block["why_now_reason"] is not None

    # 3. Log Focus Session Mode (5 Stars)
    focus_res = client.post("/api/v1/schedules/focus-session/log", json={
        "user_id": 1,
        "schedule_id": first_block["id"],
        "actual_duration_mins": 25,
        "focus_quality_rating": 5,
        "distraction_count": 0,
        "distraction_tags": []
    })
    assert focus_res.status_code == 200
    f_data = focus_res.json()
    assert f_data["status"] == "success"
    assert f_data["readiness_gain"] == 1.8

def test_general_purpose_context_aware_agent():
    session_id = "test_sess_99"

    # 1. Schedule Question -> Should route to schedule_planning & direct DB pull
    res1 = client.post("/api/v1/agent/query", json={
        "user_id": 1,
        "message": "What is my free time and schedule today?",
        "session_id": session_id
    })
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["intent_type"] == "schedule_planning"
    assert "Live Database Timeline" in d1["grounding_source"]
    assert len(d1["quick_suggestions"]) > 0

    # 2. Emotional/Stress Query -> Reassures with real exam numbers
    res2 = client.post("/api/v1/agent/query", json={
        "user_id": 1,
        "message": "I am feeling so stressed and overwhelmed about GATE exam",
        "session_id": session_id
    })
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["intent_type"] == "emotional_support"
    assert "Operating Systems" in d2["reply"] or "days" in d2["reply"]

    # 3. Study Doubt Query -> Grounded in Syllabus
    res3 = client.post("/api/v1/agent/query", json={
        "user_id": 1,
        "message": "Explain how counting semaphore wait and signal work",
        "session_id": session_id,
        "socratic_mode": True
    })
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["intent_type"] == "study_doubt"
    assert "Semaphore" in d3["reply"] or "invariant" in d3["reply"]

    # 4. Conversation History Retention
    hist_res = client.get(f"/api/v1/agent/history?user_id=1&session_id={session_id}")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert len(hist_data["messages"]) >= 6

def test_smart_alarm_system_and_negotiation():
    # 1. Sync Timeline Alarms
    sync_res = client.post("/api/v1/alarms/sync-timeline?user_id=1")
    assert sync_res.status_code == 200
    alarms = sync_res.json()
    assert len(alarms) >= 2 # Wake alarm, sleep alarm, plus study block alarms
    
    # Verify fixed wake alarm and task-linked alarm exist
    has_wake = any("wake" in a["label"].lower() for a in alarms)
    assert has_wake is True
    
    task_alarm = next((a for a in alarms if a["type"] == "task_linked"), alarms[0])
    alarm_id = task_alarm["id"]
    
    # Reset alarm to clean 0 snooze state
    client.post(f"/api/v1/alarms/{alarm_id}/dismiss?action=dismissed&user_id=1")
    
    # 2. First Snooze (Friendly warning / free)
    snooze1 = client.post(f"/api/v1/alarms/{alarm_id}/snooze?user_id=1", json={"minutes": 10})
    assert snooze1.status_code == 200
    d1 = snooze1.json()
    assert d1["snooze_count"] == 1
    assert d1["consequence_level"] == "none"
    
    # 3. Second Snooze (Consequence warning)
    snooze2 = client.post(f"/api/v1/alarms/{alarm_id}/snooze?user_id=1", json={"minutes": 10})
    assert snooze2.status_code == 200
    d2 = snooze2.json()
    assert d2["snooze_count"] == 2
    assert d2["consequence_level"] == "warning"
    assert "buffer" in d2["consequence_message"].lower() or "pushes" in d2["consequence_message"].lower()
    
    # 4. Negotiate with Sahay AI Engine
    neg_res = client.post(f"/api/v1/alarms/{alarm_id}/negotiate?user_id=1")
    assert neg_res.status_code == 200
    neg_data = neg_res.json()
    assert neg_data["alarm_id"] == alarm_id
    if neg_data["negotiation_evaluation"]:
        assert len(neg_data["negotiation_evaluation"]["proposals"]) >= 2
        
    # 5. Adaptive Suggestions
    sugg_res = client.get("/api/v1/alarms/adaptive-suggestions?user_id=1")
    assert sugg_res.status_code == 200
    assert isinstance(sugg_res.json(), list)
    
    # 6. Dismiss Alarm
    dismiss_res = client.post(f"/api/v1/alarms/{alarm_id}/dismiss?action=started&user_id=1")
    assert dismiss_res.status_code == 200
    assert dismiss_res.json()["current_snooze_count"] == 0

def test_cross_domain_moat_pillars():
    # 1. Pillar 1 & 3: Headline Synthesis ('The sentence only Sahay can generate') & 'Show Its Work'
    syn_res = client.get("/api/v1/cross-domain/headline-synthesis?user_id=1")
    assert syn_res.status_code == 200
    syn_data = syn_res.json()
    assert "headline_insight" in syn_data
    assert len(syn_data["domains_involved"]) >= 3
    assert syn_data["reasoning_chain"]["confidence_pct"] >= 80
    assert len(syn_data["reasoning_chain"]["data_points_used"]) >= 3
    assert len(syn_data["reasoning_chain"]["deductive_steps"]) >= 3

    # 2. Pillar 5: Calibrated Honest Pushback
    push_res = client.get("/api/v1/cross-domain/honest-pushback?user_id=1")
    assert push_res.status_code == 200
    push_data = push_res.json()
    assert "pushback_headline" in push_data
    assert "pushback_rationale" in push_data
    assert push_data["historical_30d_peak_hours"] > 0
    assert push_data["recommended_safe_hours"] > 0

    # 3. Pillar 4: 1-Tap Failure Forensics
    fail_res = client.post("/api/v1/cross-domain/failure-forensics?user_id=1", json={
        "failure_type": "skipped_task",
        "root_cause_tag": "sleep_debt",
        "root_cause_label": "Sleep Debt (<6h)",
        "notes": "Fell asleep during lecture, could not maintain focus."
    })
    assert fail_res.status_code == 200
    assert fail_res.json()["root_cause_tag"] == "sleep_debt"

    # Failure Forensics Summary
    summary_res = client.get("/api/v1/cross-domain/failure-forensics/summary?user_id=1")
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["total_failures_recorded"] >= 1
    assert "primary_failure_driver" in summary_data
    assert len(summary_data["breakdown"]) >= 1

    # 4. Pillar 2: Compounding Longitudinal Memory
    mem_res = client.get("/api/v1/cross-domain/memories?user_id=1")
    assert mem_res.status_code == 200
    memories = mem_res.json()
    assert len(memories) >= 2
    assert any("sleep" in m["category"].lower() or "avoidance" in m["category"].lower() for m in memories)
    assert any("October" in m["ai_callback_prompt"] or "8:00 PM" in m["ai_callback_prompt"] or "season" in m["ai_callback_prompt"] for m in memories)

    # 5. Proactive Action Application: Lighten Tomorrow's Plan (Apply 4h High-Retention Cap)
    action_res = client.post("/api/v1/cross-domain/apply-action?action=lighten_schedule&user_id=1")
    assert action_res.status_code == 200
    act_data = action_res.json()
    assert act_data["status"] == "applied"
    assert "lightened" in act_data["message"].lower() or "4.0-hour" in act_data["message"]
    assert act_data["capped_hours"] <= 4.0

def test_unlimited_profile_system():
    # 1. Create a CAT MBA preset profile
    res1 = client.post("/api/v1/onboarding/preset-profile?preset_key=cat_mba")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["user_id"] > 0
    cat_user_id = d1["user_id"]

    # 2. Create a UPSC preset profile
    res2 = client.post("/api/v1/onboarding/preset-profile?preset_key=upsc_civil")
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["user_id"] > 0
    upsc_user_id = d2["user_id"]

    # 3. List all users and verify multi-profile count
    users_res = client.get("/api/v1/analytics/users")
    assert users_res.status_code == 200
    all_users = users_res.json()
    assert len(all_users) >= 3
    user_ids = [u["id"] for u in all_users]
    assert cat_user_id in user_ids
    assert upsc_user_id in user_ids

    # 4. Verify data isolation: fetch CAT user timeline vs UPSC user timeline
    tl_cat = client.get(f"/api/v1/schedules/timeline?user_id={cat_user_id}")
    assert tl_cat.status_code == 200
    assert len(tl_cat.json()["blocks"]) > 0

    tl_upsc = client.get(f"/api/v1/schedules/timeline?user_id={upsc_user_id}")
    assert tl_upsc.status_code == 200
    assert len(tl_upsc.json()["blocks"]) > 0

    # 5. Delete one profile cleanly
    del_res = client.delete(f"/api/v1/onboarding/users/{cat_user_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

def test_email_engine_preferences_and_delivery():
    # 1. Fetch default email preferences for user 1
    pref_res = client.get("/api/v1/email/preferences?user_id=1")
    assert pref_res.status_code == 200
    pref_data = pref_res.json()
    assert pref_data["weekly_report"] is True
    assert pref_data["daily_digest"] is True

    # 2. Update preferences
    update_res = client.put("/api/v1/email/preferences?user_id=1", json={
        "send_time": "06:30",
        "trade_off_fallback": True
    })
    assert update_res.status_code == 200
    assert update_res.json()["send_time"] == "06:30"

    # 3. Test send weekly report email
    send_weekly_res = client.post("/api/v1/email/test-send", json={
        "user_id": 1,
        "email_type": "weekly_report"
    })
    assert send_weekly_res.status_code == 200
    w_data = send_weekly_res.json()
    assert w_data["status"] == "success"
    assert "weekly_report" in w_data["email_type"]
    assert "State of You" in w_data["subject"] or "readiness" in w_data["subject"]
    assert "<html>" in w_data["html_preview"].lower()

    # 4. Test send daily digest email
    send_daily_res = client.post("/api/v1/email/test-send", json={
        "user_id": 1,
        "email_type": "daily_digest"
    })
    assert send_daily_res.status_code == 200
    d_data = send_daily_res.json()
    assert d_data["status"] == "success"
    assert "Daily Digest" in d_data["subject"]

    # 5. Test send auth OTP email
    send_auth_res = client.post("/api/v1/email/test-send", json={
        "user_id": 1,
        "email_type": "auth_otp"
    })
    assert send_auth_res.status_code == 200
    a_data = send_auth_res.json()
    assert "passcode" in a_data["subject"].lower() or "verification" in a_data["subject"].lower()

    # 6. Audit trail query
    logs_res = client.get("/api/v1/email/logs?user_id=1")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 3
    email_types = [l["email_type"] for l in logs]
    assert "weekly_report" in email_types
    assert "daily_digest" in email_types
    assert "auth_otp" in email_types






