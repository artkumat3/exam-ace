-- Make payment-screenshots bucket public so AI can access the images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'payment-screenshots';

-- Add RLS policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid() IS NOT NULL
);

-- Public read access for verification
CREATE POLICY "Public read access for payment screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots');