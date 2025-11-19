-- Create table for heart health assessments
CREATE TABLE IF NOT EXISTS public.heart_health_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Profile data
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  height NUMERIC,
  weight NUMERIC,
  
  -- Lifestyle data
  diet TEXT,
  exercise TEXT,
  sleep_hours NUMERIC,
  smoking TEXT,
  tobacco_use TEXT[],
  
  -- Medical data
  knows_lipids TEXT,
  high_cholesterol TEXT,
  diabetes TEXT,
  systolic INTEGER,
  diastolic INTEGER,
  
  -- Calculated metrics
  bmi NUMERIC,
  heart_age INTEGER,
  risk_score NUMERIC,
  
  -- AI insights
  ai_insights JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.heart_health_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own assessments"
  ON public.heart_health_assessments
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE profiles.user_id = heart_health_assessments.user_id));

CREATE POLICY "Users can create their own assessments"
  ON public.heart_health_assessments
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE profiles.user_id = heart_health_assessments.user_id));

CREATE POLICY "Users can update their own assessments"
  ON public.heart_health_assessments
  FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE profiles.user_id = heart_health_assessments.user_id));

-- Create index for faster queries
CREATE INDEX idx_heart_health_assessments_user_id ON public.heart_health_assessments(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_heart_health_assessments_updated_at
  BEFORE UPDATE ON public.heart_health_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();