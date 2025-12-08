-- Create volunteer_support table
CREATE TABLE public.volunteer_support (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  district TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.volunteer_support ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit volunteer registration
CREATE POLICY "Anyone can submit volunteer registration" 
ON public.volunteer_support 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to view all volunteer registrations
CREATE POLICY "Admins can view all volunteer registrations" 
ON public.volunteer_support 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);