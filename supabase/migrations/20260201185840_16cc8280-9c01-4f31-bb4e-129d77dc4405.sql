-- Create RLS policies for cv-photos bucket to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cv-photos');

-- Allow anyone to read photos (bucket is public)
CREATE POLICY "Anyone can view cv photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cv-photos');

-- Allow authenticated users to update their own photos
CREATE POLICY "Authenticated users can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cv-photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cv-photos');