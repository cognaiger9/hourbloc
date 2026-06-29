-- Migration: Add task features tables
-- Purpose: Add support for task blueprints (calendar planning), weekly goals, and backlog tasks
-- Date: 2024-01-15

-- Create weekly_goals table (must be created before task_blueprints due to FK dependency)
CREATE TABLE IF NOT EXISTS weekly_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    week_start DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create task_blueprints table
CREATE TABLE IF NOT EXISTS task_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
    weekly_goal_id UUID REFERENCES weekly_goals(id) ON DELETE SET NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create backlog_tasks table
CREATE TABLE IF NOT EXISTS backlog_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes for performance
-- Weekly goals indexes
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week_start ON weekly_goals(user_id, week_start, deleted_at) WHERE deleted_at IS NULL;

-- Task blueprints indexes
CREATE INDEX IF NOT EXISTS idx_task_blueprints_user_date ON task_blueprints(user_id, date, deleted_at) WHERE deleted_at IS NULL;

-- Backlog tasks indexes
CREATE INDEX IF NOT EXISTS idx_backlog_tasks_user_status ON backlog_tasks(user_id, deleted_at, completed) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_backlog_tasks_user_order ON backlog_tasks(user_id, "order") WHERE deleted_at IS NULL;

-- Create unique constraints
-- Prevent duplicate active tasks per day for same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_blueprints_user_date_title_unique ON task_blueprints(user_id, date, title) WHERE deleted_at IS NULL;

-- Prevent duplicate active goals per week for same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_goals_user_week_text_unique ON weekly_goals(user_id, week_start, text) WHERE deleted_at IS NULL;

-- Create triggers for updated_at (reuse existing function)
CREATE TRIGGER update_weekly_goals_updated_at
    BEFORE UPDATE ON weekly_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_blueprints_updated_at
    BEFORE UPDATE ON task_blueprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backlog_tasks_updated_at
    BEFORE UPDATE ON backlog_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
