-- Create wellness_leads_dev table with same structure as wellness_leads
CREATE TABLE public.wellness_leads_dev (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  state TEXT NOT NULL,
  health_challenges TEXT,
  health_conditions TEXT,
  country_code TEXT NOT NULL DEFAULT '+91',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wellness_leads_dev ENABLE ROW LEVEL SECURITY;

-- Create policies similar to wellness_leads
CREATE POLICY "Anyone can submit wellness leads dev" 
ON public.wellness_leads_dev 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all wellness leads dev" 
ON public.wellness_leads_dev 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);