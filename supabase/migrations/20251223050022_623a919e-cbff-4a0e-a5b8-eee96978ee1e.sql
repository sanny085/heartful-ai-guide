-- Add pulse column to heart_health_assessments table
ALTER TABLE public.heart_health_assessments ADD COLUMN IF NOT EXISTS pulse integer;

-- Add Framingham-related columns if they don't exist
ALTER TABLE public.heart_health_assessments ADD COLUMN IF NOT EXISTS total_cholesterol integer;
ALTER TABLE public.heart_health_assessments ADD COLUMN IF NOT EXISTS on_bp_medication boolean DEFAULT false;
ALTER TABLE public.heart_health_assessments ADD COLUMN IF NOT EXISTS framingham_risk numeric;