-- Add new columns to heart_health_assessments table
-- All fields are nullable to maintain backward compatibility

-- Initial symptoms
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS chest_pain BOOLEAN,
ADD COLUMN IF NOT EXISTS shortness_of_breath BOOLEAN,
ADD COLUMN IF NOT EXISTS dizziness BOOLEAN,
ADD COLUMN IF NOT EXISTS fatigue BOOLEAN;

-- Diabetes sugar levels
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS fasting_sugar INTEGER,
ADD COLUMN IF NOT EXISTS post_meal_sugar INTEGER;

-- Lipid levels (LDL/HDL)
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS ldl INTEGER,
ADD COLUMN IF NOT EXISTS hdl INTEGER;

-- User notes (text + voice converted to text)
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Additional symptoms
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS swelling BOOLEAN,
ADD COLUMN IF NOT EXISTS palpitations BOOLEAN,
ADD COLUMN IF NOT EXISTS family_history BOOLEAN;

-- AI-generated diet plan
ALTER TABLE public.heart_health_assessments
ADD COLUMN IF NOT EXISTS diet_plan TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.heart_health_assessments.chest_pain IS 'Initial symptom: Chest pain';
COMMENT ON COLUMN public.heart_health_assessments.shortness_of_breath IS 'Initial symptom: Shortness of breath';
COMMENT ON COLUMN public.heart_health_assessments.dizziness IS 'Initial symptom: Dizziness or fainting';
COMMENT ON COLUMN public.heart_health_assessments.fatigue IS 'Initial symptom: Tiredness/fatigue';
COMMENT ON COLUMN public.heart_health_assessments.fasting_sugar IS 'Fasting blood sugar level (mg/dL)';
COMMENT ON COLUMN public.heart_health_assessments.post_meal_sugar IS 'Post-meal blood sugar level (mg/dL)';
COMMENT ON COLUMN public.heart_health_assessments.ldl IS 'LDL cholesterol level (mg/dL)';
COMMENT ON COLUMN public.heart_health_assessments.hdl IS 'HDL cholesterol level (mg/dL)';
COMMENT ON COLUMN public.heart_health_assessments.user_notes IS 'User-provided health notes (text or voice transcribed)';
COMMENT ON COLUMN public.heart_health_assessments.swelling IS 'Additional symptom: Swelling in legs or feet';
COMMENT ON COLUMN public.heart_health_assessments.palpitations IS 'Additional symptom: Irregular heartbeat/palpitations';
COMMENT ON COLUMN public.heart_health_assessments.family_history IS 'Additional symptom: Family history of heart disease';
COMMENT ON COLUMN public.heart_health_assessments.diet_plan IS 'AI-generated personalized diet plan';