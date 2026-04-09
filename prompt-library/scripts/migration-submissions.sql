-- Submission Queue — expand status options + add rejection feedback
-- Run this in the Supabase SQL Editor

-- 1. Expand the status CHECK constraint
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_status_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_status_check
  CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));

-- 2. Add rejection feedback column
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS rejection_feedback text;
