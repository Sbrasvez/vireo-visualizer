-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_payment_intent_id text,
  customer_email text NOT NULL,
  amount_total integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  shipping_name text,
  shipping_address jsonb,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_session ON public.orders(stripe_session_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage orders"
  ON public.orders FOR ALL
  USING (auth.role() = 'service_role');

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  price_id text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_amount integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage order items"
  ON public.order_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.has_active_subscription(
  user_uuid uuid,
  check_env text DEFAULT 'sandbox'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_user_plan_from_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
  active_tier plan_tier;
  active_expires timestamptz;
BEGIN
  target_user := COALESCE(NEW.user_id, OLD.user_id);
  IF target_user IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT
    CASE
      WHEN bool_or(s.product_id = 'vireo_business') THEN 'business'::plan_tier
      WHEN bool_or(s.product_id = 'vireo_pro') THEN 'pro'::plan_tier
      ELSE 'free'::plan_tier
    END,
    MAX(s.current_period_end)
  INTO active_tier, active_expires
  FROM public.subscriptions s
  WHERE s.user_id = target_user
    AND (
      (s.status IN ('active', 'trialing') AND (s.current_period_end IS NULL OR s.current_period_end > now()))
      OR (s.status = 'canceled' AND s.current_period_end > now())
    );

  active_tier := COALESCE(active_tier, 'free'::plan_tier);

  INSERT INTO public.user_plans (user_id, tier, plan_expires_at)
  VALUES (target_user, active_tier, active_expires)
  ON CONFLICT (user_id) DO UPDATE
    SET tier = EXCLUDED.tier,
        plan_expires_at = EXCLUDED.plan_expires_at,
        updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER subscriptions_sync_user_plan
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_plan_from_subscription();
