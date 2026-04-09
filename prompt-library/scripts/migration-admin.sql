-- Admin Dashboard — RLS policy for admin to read ALL prompts
-- Run this in the Supabase SQL Editor

-- Admins can see all prompts regardless of status/visibility
CREATE POLICY "Admin read all prompts" ON prompts
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Make your user an admin (run this once):
-- UPDATE profiles SET role = 'admin' WHERE display_name = 'Hamza Saraswat';
