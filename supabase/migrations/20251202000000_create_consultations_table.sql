-- Create Consultant Submissions table
CREATE TABLE IF NOT EXISTS public.Consultant_Submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.Consultant_Submissions ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "consultant_dev" ON public.Consultant_Submissions;

-- Create policy to allow anyone to submit consultations
CREATE POLICY "consultant_dev" 
ON public.Consultant_Submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to view their own appointments (by email)
-- This allows authenticated users to see appointments where email matches their auth email (case-insensitive)
CREATE POLICY "Users can view their own appointments" 
ON public.Consultant_Submissions 
FOR SELECT 
TO authenticated
USING (
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_consultant_submissions_created_at ON public.Consultant_Submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_consultant_submissions_email ON public.Consultant_Submissions(email);

