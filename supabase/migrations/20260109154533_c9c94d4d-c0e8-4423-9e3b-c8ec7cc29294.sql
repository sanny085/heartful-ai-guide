-- Add is_report_send column to heart_health_assessments table
ALTER TABLE public.heart_health_assessments
ADD COLUMN is_report_send BOOLEAN NOT NULL DEFAULT false;