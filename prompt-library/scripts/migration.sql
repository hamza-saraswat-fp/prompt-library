-- FieldPulse Prompt Library — Core Data Tables Migration
-- Run this in the Supabase SQL Editor

-- 1. Use Case Groups
CREATE TABLE IF NOT EXISTS use_case_groups (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  group_id text NOT NULL REFERENCES use_case_groups(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_categories_group_id ON categories(group_id);

-- 3. Tags (replaces DEPARTMENTS + TAGS constants)
CREATE TABLE IF NOT EXISTS tags (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('department', 'workflow'))
);

-- 4. Bundles
CREATE TABLE IF NOT EXISTS bundles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0
);

-- 5. Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id text PRIMARY KEY,
  title text NOT NULL,
  overview text NOT NULL,
  prompt_text text NOT NULL,
  departments jsonb NOT NULL DEFAULT '[]',
  category_id text NOT NULL REFERENCES categories(id),
  models jsonb NOT NULL DEFAULT '[]',
  variables jsonb NOT NULL DEFAULT '[]',
  tags jsonb NOT NULL DEFAULT '[]',
  version int NOT NULL DEFAULT 1,
  copy_count int NOT NULL DEFAULT 0,
  is_trending boolean NOT NULL DEFAULT false,
  bundle_id text REFERENCES bundles(id),
  author text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('private', 'public')),
  version_history jsonb NOT NULL DEFAULT '[]',
  use_cases jsonb NOT NULL DEFAULT '[]',
  comments jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_bundle_id ON prompts(bundle_id);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_prompts_departments ON prompts USING GIN (departments);

-- 6. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Enable RLS on all tables
ALTER TABLE use_case_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies — Read access for authenticated users
CREATE POLICY "Authenticated read" ON use_case_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read" ON bundles FOR SELECT TO authenticated USING (true);

-- Prompts: see public+published, OR your own (any status/visibility)
CREATE POLICY "Read public or own prompts" ON prompts FOR SELECT TO authenticated
  USING (
    (status = 'published' AND visibility = 'public')
    OR created_by = auth.uid()
  );

-- 9. RLS Policies — Write access
-- Admin check helper (checks profiles.role)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Admin-only write for reference tables
CREATE POLICY "Admin write" ON use_case_groups FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON use_case_groups FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON use_case_groups FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Admin write" ON categories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON categories FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON categories FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Admin write" ON tags FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON tags FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON tags FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Admin write" ON bundles FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admin update" ON bundles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin delete" ON bundles FOR DELETE TO authenticated USING (is_admin());

-- Prompts: any authenticated user can insert (submit prompts)
CREATE POLICY "Authenticated insert prompts" ON prompts FOR INSERT TO authenticated
  WITH CHECK (true);

-- Prompts: creator or admin can update
CREATE POLICY "Creator or admin update prompts" ON prompts FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin())
  WITH CHECK (created_by = auth.uid() OR is_admin());

-- Prompts: creator or admin can delete
CREATE POLICY "Creator or admin delete prompts" ON prompts FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR is_admin());
