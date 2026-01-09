-- Create twelve_week_program table
CREATE TABLE public.twelve_week_program (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  age INTEGER NULL,
  city TEXT NULL,
  bp_range TEXT NULL,
  sugar_status TEXT NULL,
  medicines TEXT NULL,
  language TEXT NULL,
  gender TEXT NULL,
  name TEXT NULL,
  selected_program TEXT NULL
);

-- Enable Row Level Security
ALTER TABLE public.twelve_week_program ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for form submissions)
CREATE POLICY "Anyone can submit twelve week program application"
ON public.twelve_week_program
FOR INSERT
WITH CHECK (true);

-- Admins can view all submissions
CREATE POLICY "Admins can view all twelve week program submissions"
ON public.twelve_week_program
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));