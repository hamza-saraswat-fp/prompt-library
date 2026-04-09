-- FieldPulse Prompt Library — User Data Migration
-- Adds favorites/recently_used to profiles, creates user_ratings + comments tables
-- Run this in the Supabase SQL Editor

-- 1. Add JSONB columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorites jsonb NOT NULL DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recently_used jsonb NOT NULL DEFAULT '[]';

-- 2. User Ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id text REFERENCES prompts(id) ON DELETE CASCADE,
  vote text NOT NULL CHECK (vote IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_prompt_id ON user_ratings(prompt_id);

-- Auto-update updated_at on ratings
CREATE TRIGGER user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id text NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_prompt_id ON comments(prompt_id, created_at);

-- 4. Ratings aggregation view
CREATE OR REPLACE VIEW prompt_ratings_summary AS
SELECT
  prompt_id,
  COUNT(*) FILTER (WHERE vote = 'up') AS up_count,
  COUNT(*) FILTER (WHERE vote = 'down') AS down_count,
  COUNT(*) FILTER (WHERE vote = 'up') - COUNT(*) FILTER (WHERE vote = 'down') AS net_score
FROM user_ratings
GROUP BY prompt_id;

-- 5. RLS on user_ratings
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read ratings (needed for aggregation)
CREATE POLICY "Authenticated read ratings" ON user_ratings
  FOR SELECT TO authenticated USING (true);

-- Users can insert their own ratings
CREATE POLICY "Insert own ratings" ON user_ratings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update their own ratings
CREATE POLICY "Update own ratings" ON user_ratings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "Delete own ratings" ON user_ratings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 6. RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read comments
CREATE POLICY "Authenticated read comments" ON comments
  FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert comments (must be own user_id)
CREATE POLICY "Insert own comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Author or admin can delete comments
CREATE POLICY "Delete own or admin comments" ON comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_admin());
