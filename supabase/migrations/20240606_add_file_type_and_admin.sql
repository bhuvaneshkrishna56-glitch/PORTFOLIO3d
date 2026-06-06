-- 20240606_add_file_type_and_admin.sql
-- Add file_type column to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Add is_admin flag to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
