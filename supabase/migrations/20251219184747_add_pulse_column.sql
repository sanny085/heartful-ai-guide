-- Add pulse column to heart_health_assessments table
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS pulse INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN public.heart_health_assessments.pulse IS 'Pulse rate in beats per minute (bpm)';

