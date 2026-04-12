-- Migration 003: Add language_preference to users table
-- Run this in the Supabase SQL Editor before deploying the updated backend.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en-IN';
