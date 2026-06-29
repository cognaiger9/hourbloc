-- Migration: Enable Row Level Security (RLS) policies
-- Purpose: Secure all tables to ensure users can only access their own data
--          Critical for security since frontend uses anon key for client-side access
-- Date: 2024-01-20

-- Enable RLS on all tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlog_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TAGS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can only view their own tags
CREATE POLICY "Users can view their own tags"
    ON tags
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Users can only create tags for themselves
CREATE POLICY "Users can insert their own tags"
    ON tags
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own tags
CREATE POLICY "Users can update their own tags"
    ON tags
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own tags
CREATE POLICY "Users can delete their own tags"
    ON tags
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- BLOCKS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can only view their own blocks
CREATE POLICY "Users can view their own blocks"
    ON blocks
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Users can only create blocks for themselves
CREATE POLICY "Users can insert their own blocks"
    ON blocks
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own blocks
CREATE POLICY "Users can update their own blocks"
    ON blocks
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own blocks
CREATE POLICY "Users can delete their own blocks"
    ON blocks
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- WEEKLY_GOALS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can only view their own weekly goals
CREATE POLICY "Users can view their own weekly goals"
    ON weekly_goals
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Users can only create weekly goals for themselves
CREATE POLICY "Users can insert their own weekly goals"
    ON weekly_goals
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own weekly goals
CREATE POLICY "Users can update their own weekly goals"
    ON weekly_goals
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own weekly goals
CREATE POLICY "Users can delete their own weekly goals"
    ON weekly_goals
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- TASK_BLUEPRINTS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can only view their own task blueprints
CREATE POLICY "Users can view their own task blueprints"
    ON task_blueprints
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Users can only create task blueprints for themselves
CREATE POLICY "Users can insert their own task blueprints"
    ON task_blueprints
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own task blueprints
CREATE POLICY "Users can update their own task blueprints"
    ON task_blueprints
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own task blueprints
CREATE POLICY "Users can delete their own task blueprints"
    ON task_blueprints
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- BACKLOG_TASKS TABLE POLICIES
-- ============================================================================

-- SELECT: Users can only view their own backlog tasks
CREATE POLICY "Users can view their own backlog tasks"
    ON backlog_tasks
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Users can only create backlog tasks for themselves
CREATE POLICY "Users can insert their own backlog tasks"
    ON backlog_tasks
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own backlog tasks
CREATE POLICY "Users can update their own backlog tasks"
    ON backlog_tasks
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own backlog tasks
CREATE POLICY "Users can delete their own backlog tasks"
    ON backlog_tasks
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Security Model:
-- - All policies use auth.uid() to get the current authenticated user's ID from the JWT token
-- - SELECT policies use USING clause to filter rows visible to the user
-- - INSERT policies use WITH CHECK to ensure users can only create records with their own user_id
-- - UPDATE policies use both USING (for row visibility) and WITH CHECK (to prevent changing user_id)
-- - DELETE policies use USING clause to restrict deletion to user's own records
-- 
-- Soft Deletes:
-- - Policies allow access to soft-deleted records (deleted_at IS NOT NULL)
-- - This is necessary for UPDATE operations that set deleted_at for soft deletion
-- - Application code filters out soft-deleted records in SELECT queries
-- 
-- Admin Operations:
-- - Backend uses SUPABASE_SERVICE_KEY (service role key) for admin operations
-- - Service role key bypasses RLS, allowing backend to perform admin tasks if needed
-- - Frontend uses NEXT_PUBLIC_SUPABASE_ANON_KEY_APP (anon key) which is protected by RLS
--
