-- Lock down public SELECT on restaurants (PII: email, phone)
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;

-- Owners see their full restaurant row
DROP POLICY IF EXISTS "Owners view own restaurant" ON public.restaurants;
CREATE POLICY "Owners view own restaurant"
  ON public.restaurants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Anonymous and authenticated visitors must use restaurants_public view.
-- Revoke direct SELECT on the base table from anon.
REVOKE SELECT ON public.restaurants FROM anon;
GRANT SELECT ON public.restaurants TO authenticated;
