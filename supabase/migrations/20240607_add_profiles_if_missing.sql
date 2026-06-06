-- 20240607_add_profiles_if_missing.sql
-- Safely create profiles table (if it does not exist) and add needed columns.

-- 1. Create a minimal profiles table if it is absent. Adjust columns as needed for your app.
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  is_admin boolean DEFAULT FALSE
);

-- 2. Add file_type column to certificates (if not already present).
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 3. Ensure is_admin column exists on profiles (no‑op if already created above).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
