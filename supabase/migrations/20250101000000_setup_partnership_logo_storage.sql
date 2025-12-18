-- Create storage bucket for partnership logos (if it doesn't exist)
-- Note: You may need to create the bucket manually in Supabase Dashboard first
-- This migration only sets up the policies

-- Ensure bucket exists (this will fail silently if bucket doesn't exist)
-- You need to create the bucket manually: Storage → New bucket → Name: partnership_logo_images → Public: ON

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public uploads to partnership_logo_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to partnership_logo_images" ON storage.objects;

-- Create policy to allow public uploads (INSERT)
CREATE POLICY "Allow public uploads to partnership_logo_images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership_logo_images');

-- Create policy to allow public access to view images (SELECT)
CREATE POLICY "Allow public access to partnership_logo_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'partnership_logo_images');

-- Optional: Allow updates (for replacing images)
CREATE POLICY "Allow public updates to partnership_logo_images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'partnership_logo_images')
WITH CHECK (bucket_id = 'partnership_logo_images');

-- Optional: Allow deletes (for removing images)
CREATE POLICY "Allow public deletes to partnership_logo_images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'partnership_logo_images');

