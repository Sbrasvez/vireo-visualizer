-- Lock down public access to public.sellers: PII like vat_number, phone, email,
-- stripe_account_id, commission_rate must not be readable by anon/authenticated.
-- Anonymous + authenticated visitors must use the sellers_public view instead.

DROP POLICY IF EXISTS "Approved sellers public safe columns" ON public.sellers;

-- Owners can read their own seller row (all columns).
CREATE POLICY "Owners can view own seller row"
  ON public.sellers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read everything (already covered by "Admins can manage all sellers"
-- which is FOR ALL; we keep it). No additional policy needed.

-- Revoke broad column-level grants from anon. Only the safe view remains for anon.
REVOKE SELECT ON public.sellers FROM anon;

-- Authenticated users may need to join sellers indirectly (e.g. via embedded
-- selects). Since RLS now restricts rows to owner-only, granting SELECT on the
-- table to authenticated is safe — no row will be returned unless they own it.
-- Embedded joins from anon must go through sellers_public.
GRANT SELECT ON public.sellers TO authenticated;

-- Make sure the public view is readable by anon and authenticated.
GRANT SELECT ON public.sellers_public TO anon, authenticated;