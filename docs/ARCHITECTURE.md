# Sahay Architecture Overview

```mermaid
graph TD
    subgraph Frontend [React 18 + TypeScript + Vite + Tailwind]
        OB[Onboarding Flow]
        TL[24-Hour Vertical Timeline]
        NM[Trade-Off Negotiation Modal]
        FS[Future Self Simulator]
        AH[Activity History Stream]
    end

    subgraph Backend [FastAPI Application]
        API[API Gateway /api/v1]
        SCHED[Scheduler Engine]
        NEG[Trade-Off Negotiation Engine]
        SIM[Simulation Engine]
    end

    subgraph Database [SQLite / PostgreSQL]
        U[(Users)]
        E[(Exams)]
        S[(Subjects)]
        T[(Tasks)]
        SC[(Schedules)]
        AH_DB[(Activity History)]
    end

    OB -->|Submit Rhythm & Goals| API
    TL -->|Fetch 24h Blocks| API
    TL -->|Trigger Skip / Postpone| NM
    NM -->|Request Impact Analysis| NEG
    NEG -->|Evaluate Consequence & Trades| NM
    NM -->|Accept Counter-Offer| NEG
    NEG -->|Atomic Reschedule & Log History| SC
    NEG -->|Log Event| AH_DB
    FS -->|Fetch 30d Trajectory| SIM
    SIM -->|Read Compliance History| AH_DB
    API --> SCHED
    SCHED --> SC
```

## System Components

1. **Frontend Client**:
   - Single-page application using modern React 18, Tailwind CSS, Lucide icons, and Recharts.
   - Core interactive components: Onboarding Wizard, 24-hour vertical timeline with live hour indicator, Trade-Off Negotiator dialog, and Future Self trajectory visualizer.

2. **FastAPI Engine**:
   - High performance, asynchronous backend serving REST endpoints.
   - Dependency-injected SQLAlchemy sessions with clean Pydantic schema validation.

3. **Trade-Off Engine**:
   - Detects friction when user skips or delays.
   - Calculates numerical readiness impact and catch-up debt.
   - Emits natural human-feeling counter proposals instead of robotic schedule errors.

4. **Activity History Ledger**:
   - Immutable log of every action (done, skipped, postponed, trade accepted) providing the ground-truth data for future AI fine-tuning and predictive personalization.
