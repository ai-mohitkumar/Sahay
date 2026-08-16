# Sahay (सहाय)

> **"An AI that negotiates your day with you, not just schedules it."**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB?style=flat&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat&logo=sqlite)](https://sqlite.org)

---

## 💡 The Core Differentiator

Every other productivity app (Notion, Todoist, Motion) treats humans as passive recipients of a static schedule. When life happens and a session is missed, standard apps silently drop the task or reschedule blindly, causing a debt spiral.

**Sahay is your thinking partner and negotiation ally.**
1. **The Trade-Off Engine**: When you attempt to skip or postpone a task, Sahay explains the real consequences in plain language:
   > *"If you skip today's Operating Systems session, your predicted GATE readiness drops from 61% to 57%, and you'll need an extra 90 min tomorrow to catch up. Want me to move it to 9 PM instead of skipping it?"*
2. **Future Self Simulation**: Real-time 30-day projection of your readiness trajectory, burnout risk, and sleep debt based on actual compliance.
3. **24-Hour Vertical Flow**: A circadian timeline (wake, college/work, deep focus, breaks, sleep) tailored to your real day.

---

## 📁 Project Structure

```text
Sahay/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes/       # Onboarding, Schedules, Tasks, Negotiation, Simulation
│   │   ├── models/           # SQLAlchemy DB models (User, Goal, Exam, Subject, Task, Schedule, ActivityHistory)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Scheduler engine, Trade-off consequence engine, 30-day simulator
│   │   └── main.py           # Application entrypoint & CORS config
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Fast dev launcher
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Onboarding wizard, 24h Vertical Timeline, Trade-off Modal, Future Self widget
│   │   ├── api/client.ts     # Axios/Fetch API client
│   │   └── types/            # TypeScript interfaces matching backend schemas
│   └── package.json
├── ml-engine/                # Heuristics & ML Readiness / Burnout Models
├── database/                 # Raw SQL schemas, migration scripts & sample seeds
├── docs/                     # Architecture, Database schema & Negotiation logic docs
└── README.md
```

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend API will be running at `http://127.0.0.1:8000`. Interactive Swagger docs available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🧠 The Trade-Off Engine & Roadmap

- **Step 0**: Name & Pitch definition (Sahay - The AI Negotiator).
- **Step 1**: FastAPI + React + SQLite skeleton.
- **Step 2**: 7-table normalized database schema.
- **Step 3**: Dynamic Onboarding flow (Circadian + Commitments + Exams).
- **Step 4**: 24-hour vertical timeline view with automatic schedule drafting.
- **Step 5**: Task actions (`Done`, `Skip`, `Postpone`) logging into `activity_history`.
- **Step 7-8**: The **Trade-Off Engine** — AI counter-offers & impact analysis.
- **Step 9+**: 30-day "Future Self" projection & social accountability pods.
