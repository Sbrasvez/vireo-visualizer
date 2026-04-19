-- Re-grant column-level SELECT on safe columns only.
-- Sensitive columns (email, phone, vat_number, stripe_account_id, stripe_payouts_enabled,
-- commission_rate, total_sales_cents, approved_by, rejection_reason) are NOT included.
GRANT SELECT (
  id,
  user_id,
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
  approved_at,
  created_at,
  updated_at
) ON public.sellers TO anon, authenticated;