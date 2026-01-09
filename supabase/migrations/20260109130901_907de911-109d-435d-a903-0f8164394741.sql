-- Add email column to heart_health_assessments table
ALTER TABLE public.heart_health_assessments
ADD COLUMN email TEXT NULL;