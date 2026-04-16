DROP POLICY "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR true));