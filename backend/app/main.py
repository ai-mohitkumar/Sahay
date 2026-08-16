from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.db.base import init_db
from app.core.scheduler import background_scheduler

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Sahay API: An AI that negotiates your day with you, not just schedules it."
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    background_scheduler.start()

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "pitch": "An AI that negotiates your day with you, not just schedules it.",
        "docs_url": "/docs"
    }

app.include_router(api_router, prefix=settings.API_V1_STR)
