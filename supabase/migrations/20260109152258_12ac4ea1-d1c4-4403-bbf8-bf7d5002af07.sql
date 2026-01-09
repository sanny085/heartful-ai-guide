-- Add water_intake and profession columns to heart_health_assessments table
ALTER TABLE public.heart_health_assessments
ADD COLUMN water_intake TEXT NULL,
ADD COLUMN profession TEXT NULL;