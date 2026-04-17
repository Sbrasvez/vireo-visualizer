-- The original "publicly readable" SELECT policies on storage.objects are too broad
-- because they allow the JS client to LIST every object in the bucket via
-- supabase.storage.from(bucket).list('').
--
-- We restrict reads so that only the OWNER can list/inspect via the API,
-- while public asset access continues to work because each bucket is marked
-- public=true and Supabase serves the files via /storage/v1/object/public/**
-- without requiring a SELECT policy.

-- avatars (existing)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars: owner can list own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- community (existing)
DROP POLICY IF EXISTS "Community photos publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Community: public can read" ON storage.objects;
CREATE POLICY "Community: owner can list own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'community'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- seller-assets (just added in previous migration)
DROP POLICY IF EXISTS "Seller assets publicly readable" ON storage.objects;
CREATE POLICY "Seller assets: owner can list own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'seller-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );