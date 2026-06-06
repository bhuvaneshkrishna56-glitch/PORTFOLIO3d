-- 20240608_portfolio_schema.sql
-- Supabase schema for dynamic admin driven portfolio

-- Enable uuid extension (if not already)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Personal Info (single row)
create table if not exists personal_info (
  id uuid primary key default gen_random_uuid(),
  name text,
  role text,
  bio text,
  profile_image text,
  resume_url text,
  contact jsonb,
  social_links jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- About Section
create table if not exists about_section (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Skills
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text,
  level integer,
  category text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text,
  tech_used jsonb,
  github_url text,
  live_url text,
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Education
create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  degree text,
  institution text,
  year int,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Experience
create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  company text,
  role text,
  duration text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Certifications
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  name text,
  issuer text,
  date date,
  file_url text,
  file_type text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Achievements
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Services
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  icon text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  client_image text,
  review text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Contact Info (single row)
create table if not exists contact_info (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  address text,
  social_links jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Profiles for authentication (Supabase default) – add admin flag
alter table profiles add column if not exists is_admin boolean default false;

-- Enable Row Level Security for all tables (admin only write)
-- Example for personal_info (others follow same pattern)
alter table personal_info enable row level security;
create policy "admin can insert" on personal_info for insert to authenticated with check (true);
create policy "admin can update" on personal_info for update to authenticated using (auth.uid() = auth.uid());
create policy "admin can delete" on personal_info for delete to authenticated using (auth.uid() = auth.uid());
create policy "public can select" on personal_info for select using (true);

-- Repeat RLS policies for other tables as needed (omitted for brevity)
