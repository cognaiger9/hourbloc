-- Migration: Remove unique task title constraint
-- Purpose: Allow users to have multiple tasks with the same name on the same date
-- Date: 2026-01-15

-- Drop the unique index that prevents duplicate task names per date
DROP INDEX IF EXISTS idx_task_blueprints_user_date_title_unique;
