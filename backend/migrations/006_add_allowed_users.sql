-- Migration: Add allowed_users table for access control
-- Purpose: Restrict app usage to the owner and users who have redeemed an invite code.
--          Only the backend service role accesses this table (no RLS needed).

CREATE TABLE IF NOT EXISTS allowed_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seed the owner
INSERT INTO allowed_users (email)
VALUES ('ngoctruonggia@gmail.com')
ON CONFLICT (email) DO NOTHING;
