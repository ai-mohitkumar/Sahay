from app.db.session import Base
import app.models

def init_db():
    from app.db.session import engine
    Base.metadata.create_all(bind=engine)
