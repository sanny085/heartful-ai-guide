-- Remove foreign key constraint from profiles.user_id to auth.users
-- This prevents issues when users are deleted from auth but we want to preserve profile data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add index on user_id for performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add a comment explaining why we don't use a foreign key
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users(id) but without foreign key constraint to allow flexible user management';