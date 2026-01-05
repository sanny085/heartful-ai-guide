-- Create 12_week_program table
CREATE TABLE IF NOT EXISTS public.twelve_week_program (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  age INTEGER,
  gender TEXT,
  city TEXT,
  language TEXT,
  bp_range TEXT,
  sugar_status TEXT,
  medicines TEXT,
  selected_program TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'twelve_week_program' AND column_name = 'name') THEN
        ALTER TABLE public.twelve_week_program ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'twelve_week_program' AND column_name = 'gender') THEN
        ALTER TABLE public.twelve_week_program ADD COLUMN gender TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'twelve_week_program' AND column_name = 'language') THEN
        ALTER TABLE public.twelve_week_program ADD COLUMN language TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'twelve_week_program' AND column_name = 'selected_program') THEN
        ALTER TABLE public.twelve_week_program ADD COLUMN selected_program TEXT;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.twelve_week_program ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on this table (comprehensive cleanup)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'twelve_week_program'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.twelve_week_program', r.policyname);
    END LOOP;
END $$;

-- Create policy to allow anyone (including anonymous users) to insert
-- IMPORTANT: No TO clause = applies to all roles (anon, authenticated, service_role)
-- IMPORTANT: WITH CHECK (true) = no restrictions on what can be inserted
-- This matches the exact pattern used in wellness_leads and volunteer_support tables
CREATE POLICY "Enable insert for authenticated users only" 
ON public.twelve_week_program 
FOR INSERT 
WITH CHECK (true);
