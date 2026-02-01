-- Drop the overly permissive storage policies that were created in a later migration
-- These policies allow ANY authenticated user to upload without folder validation,
-- undermining the user-scoped policies

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- The following user-scoped policies from migration 20260201165244 will remain:
-- - "Users can upload their own photos" (INSERT with user folder check)
-- - "Users can update their own photos" (UPDATE with user folder check)
-- - "Users can delete their own photos" (DELETE with user folder check)
-- - "Anyone can view cv photos" (public SELECT for cv-photos bucket)