"""
Trade-off heuristics used by Sahay's negotiation engine.
Translates calendar friction and student state into empathetic, logical counter-proposals.
"""

def generate_counter_options(task_title: str, subject_name: str, duration_mins: int, time_left_today_mins: int):
    options = []
    
    # 1. Evening recovery option if evening free time exists
    if time_left_today_mins >= duration_mins + 30:
        options.append({
            "id": "shift_tonight",
            "title": f"Shift {task_title} to 8:30 PM Tonight",
            "description": "Recharges your mental energy now, preserves today's momentum with zero syllabus debt.",
            "impact_saved": "100%"
        })
        
    # 2. Split option
    options.append({
        "id": "split_tomorrow",
        "title": f"Split {task_title} into two {duration_mins // 2}m sessions tomorrow",
        "description": "Lower friction per block tomorrow morning and evening.",
        "impact_saved": "95%"
    })
    
    # 3. Weekend anchor
    options.append({
        "id": "weekend_catchup",
        "title": "Transfer to Saturday Morning Power Session",
        "description": "Dedicate a quiet weekend block without mid-week college stress.",
        "impact_saved": "80%"
    })
    
    return options
