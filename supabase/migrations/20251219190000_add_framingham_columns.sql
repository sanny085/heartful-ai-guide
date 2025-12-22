-- Add Framingham algorithm columns to heart_health_assessments table
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS framingham_heart_age INTEGER;

ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS framingham_risk_score DECIMAL(5,2);

-- Add comments for documentation
COMMENT ON COLUMN public.heart_health_assessments.framingham_heart_age IS 'Heart age calculated using Framingham algorithm';
COMMENT ON COLUMN public.heart_health_assessments.framingham_risk_score IS '10-year CVD risk percentage using Framingham algorithm';