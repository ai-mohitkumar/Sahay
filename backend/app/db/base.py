from app.db.session import Base, SessionLocal
import app.models
from app.models.user import User

def init_db():
    from app.db.session import engine
    Base.metadata.create_all(bind=engine)

    # Auto-seed initial demo profiles if fresh deployment (0 users)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            from app.api.routes.onboarding import create_preset_profile
            create_preset_profile(db, "gate_cse", "Rohan Kumar (GATE CSE)")
            create_preset_profile(db, "cat_mba", "Ananya Sharma (CAT 2026)")
            create_preset_profile(db, "upsc_civil", "Vikramaditya (UPSC 2027)")
            create_preset_profile(db, "sem_dsa", "Neha Patel (DSA Sprint)")
            db.commit()
    except Exception as e:
        print(f"Initial DB seeding notice: {e}")
        db.rollback()
    finally:
        db.close()
