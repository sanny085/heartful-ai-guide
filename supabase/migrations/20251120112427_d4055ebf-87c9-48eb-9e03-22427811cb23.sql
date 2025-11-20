-- Create wellness_leads table
CREATE TABLE IF NOT EXISTS public.wellness_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '+91',
  mobile TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  state TEXT NOT NULL,
  health_challenges TEXT,
  health_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wellness_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for lead collection)
CREATE POLICY "Anyone can submit wellness leads" 
ON public.wellness_leads 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all leads
CREATE POLICY "Admins can view all wellness leads" 
ON public.wellness_leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);