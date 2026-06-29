-- HourBloc Database Schema Migration
-- Run this in Supabase Dashboard: SQL Editor
-- This migration creates the initial schema for blocks and tags tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    block_type VARCHAR(10) NOT NULL CHECK (block_type IN ('planned', 'actual')),
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Ensure end_time is after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for performance
-- Tags indexes
-- Unique constraint: one active tag name per user (soft-deleted tags can reuse names)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_user_name_unique ON tags(user_id, name) WHERE deleted_at IS NULL;

-- Blocks indexes
-- Composite index optimized for most common query pattern: user + type + date range
CREATE INDEX IF NOT EXISTS idx_blocks_user_type_date_range ON blocks(user_id, block_type, start_time, end_time) WHERE deleted_at IS NULL;
-- Fallback index for queries that only filter by user_id and block_type (without date range)
CREATE INDEX IF NOT EXISTS idx_blocks_user_id_type ON blocks(user_id, block_type) WHERE deleted_at IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

