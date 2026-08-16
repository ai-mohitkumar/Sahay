from fastapi import APIRouter
from app.api.routes import onboarding, schedules, tasks, negotiation, simulation, analytics, pods, study, student_life, agent, alarms, cross_domain, email

api_router = APIRouter()

api_router.include_router(onboarding.router)
api_router.include_router(schedules.router)
api_router.include_router(tasks.router)
api_router.include_router(negotiation.router)
api_router.include_router(simulation.router)
api_router.include_router(analytics.router)
api_router.include_router(pods.router)
api_router.include_router(study.router)
api_router.include_router(student_life.router)
api_router.include_router(agent.router)
api_router.include_router(alarms.router)
api_router.include_router(cross_domain.router)
api_router.include_router(email.router)

