-- Migration: Add duration_seconds column to blocks table
-- Purpose: Store actual elapsed time from timer (excludes pauses) separate from wall-clock time span
-- Date: 2024-01-08

-- Add duration_seconds column (nullable for backward compatibility)
ALTER TABLE blocks
ADD COLUMN duration_seconds INTEGER;

-- Backfill existing records with calculated duration from start_time and end_time
-- This ensures existing analytics continue to work correctly
UPDATE blocks
SET duration_seconds = EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER
WHERE duration_seconds IS NULL AND deleted_at IS NULL;

-- Add documentation
COMMENT ON COLUMN blocks.duration_seconds IS 'Actual elapsed time in seconds from timer (excludes pauses). May be less than (end_time - start_time) if user paused.';
