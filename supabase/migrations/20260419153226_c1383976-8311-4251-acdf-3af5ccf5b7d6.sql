-- 1) Sellers: replace permissive public SELECT with column-aware policies via a public view + restricted base policy

-- Drop existing public select policy
DROP POLICY IF EXISTS "Approved sellers viewable by everyone" ON public.sellers;

-- Public can only see approved sellers; sensitive columns are filtered at the application layer via a view.
-- Owners and admins still get full row access via the other policies below.
CREATE POLICY "Approved sellers public safe columns"
ON public.sellers
FOR SELECT
USING (
  status = 'approved'::seller_status
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create a public-safe view exposing only non-sensitive columns
CREATE OR REPLACE VIEW public.sellers_public AS
SELECT
  id,
  slug,
  business_name,
  description,
  logo_url,
  cover_url,
  category,
  country,
  website,
  rating,
  total_orders,
  status,
  is_demo,
  created_at,
  updated_at
FROM public.sellers
WHERE status = 'approved'::seller_status;

GRANT SELECT ON public.sellers_public TO anon, authenticated;

-- Revoke direct anon access to the sellers table (RLS still allows owner/admin via authenticated)
REVOKE SELECT ON public.sellers FROM anon;

-- 2) user_plans: prevent self-upgrade of tier / plan_expires_at
DROP POLICY IF EXISTS "Users can update own plan" ON public.user_plans;

CREATE POLICY "Users can update own plan non-billing"
ON public.user_plans
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND tier = (SELECT tier FROM public.user_plans WHERE user_id = auth.uid())
  AND plan_expires_at IS NOT DISTINCT FROM (SELECT plan_expires_at FROM public.user_plans WHERE user_id = auth.uid())
);