-- Remove overly permissive admin access to sensitive medical data
-- Admins should not have blanket access to all patient medical information
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;