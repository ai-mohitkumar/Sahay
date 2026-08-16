-- ============================================================================
-- Sahay Database Schema (SQLite / PostgreSQL compatible)
-- Step 2 in Roadmap: 7 Normalized Core Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    wake_time VARCHAR(10) NOT NULL DEFAULT '07:00',
    sleep_time VARCHAR(10) NOT NULL DEFAULT '23:00',
    daily_capacity_hours REAL NOT NULL DEFAULT 6.0,
    burnout_risk_score REAL DEFAULT 0.15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    target_score REAL,
    current_readiness_pct REAL DEFAULT 50.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    pillar VARCHAR(50) DEFAULT 'study', -- 'study', 'health', 'personal', 'career'
    priority INTEGER DEFAULT 1,
    target_hours_per_week REAL DEFAULT 10.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_hours_needed REAL DEFAULT 50.0,
    hours_completed REAL DEFAULT 0.0,
    readiness_pct REAL DEFAULT 60.0,
    weight REAL DEFAULT 1.0,
    color_code VARCHAR(50) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_mins INTEGER DEFAULT 90,
    difficulty VARCHAR(50) DEFAULT 'medium',
    priority INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'skipped', 'postponed'
    scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL, -- 'HH:MM'
    end_time VARCHAR(10) NOT NULL,   -- 'HH:MM'
    title VARCHAR(255) NOT NULL,
    block_type VARCHAR(50) DEFAULT 'study_session', -- 'fixed_commitment', 'study_session', 'break', 'sleep', 'buffer'
    is_fixed BOOLEAN DEFAULT 0,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'skipped', 'postponed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    schedule_id INTEGER REFERENCES schedules(id) ON DELETE SET NULL,
    planned_start VARCHAR(10),
    planned_end VARCHAR(10),
    actual_start VARCHAR(10),
    actual_end VARCHAR(10),
    planned_duration_mins INTEGER DEFAULT 90,
    actual_duration_mins INTEGER DEFAULT 0,
    action VARCHAR(100) NOT NULL, -- 'done', 'skipped', 'postponed', 'negotiation_accepted'
    reason VARCHAR(255),
    readiness_delta REAL DEFAULT 0.0,
    burnout_impact REAL DEFAULT 0.0,
    ai_negotiation_accepted VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_history(user_id);
