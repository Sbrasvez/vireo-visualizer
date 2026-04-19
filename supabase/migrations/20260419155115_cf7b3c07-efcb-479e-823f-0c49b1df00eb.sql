-- 1) Add owner_user_id to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS owner_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_user_id);

-- Owners can update their restaurant
DROP POLICY IF EXISTS "Owners can update own restaurant" ON public.restaurants;
CREATE POLICY "Owners can update own restaurant"
  ON public.restaurants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Admins manage all restaurants
DROP POLICY IF EXISTS "Admins manage restaurants" ON public.restaurants;
CREATE POLICY "Admins manage restaurants"
  ON public.restaurants
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Create restaurants_public view (no email, phone, owner_user_id)
DROP VIEW IF EXISTS public.restaurants_public;
CREATE VIEW public.restaurants_public
WITH (security_invoker = true)
AS
SELECT
  id, slug, name, city, region, address, lat, lng,
  short_description, description, cuisine, price,
  website, opening_hours, cover_image, rating,
  reviews_count, available_now, eco_certifications,
  tags, created_at, updated_at
FROM public.restaurants;

GRANT SELECT ON public.restaurants_public TO anon, authenticated;

-- 3) restaurant_reservations: owners can see/update bookings for their restaurant
DROP POLICY IF EXISTS "Owners view restaurant reservations" ON public.restaurant_reservations;
CREATE POLICY "Owners view restaurant reservations"
  ON public.restaurant_reservations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_reservations.restaurant_id
        AND r.owner_user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Owners update restaurant reservations" ON public.restaurant_reservations;
CREATE POLICY "Owners update restaurant reservations"
  ON public.restaurant_reservations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_reservations.restaurant_id
        AND r.owner_user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_reservations.restaurant_id
        AND r.owner_user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 4) user_plans: drop user-update policy (only service_role / triggers may change tier)
DROP POLICY IF EXISTS "Users can update own plan non-billing" ON public.user_plans;

-- Service role bypasses RLS, so the existing sync_user_plan_from_subscription
-- trigger (SECURITY DEFINER) keeps working. No replacement policy needed.
