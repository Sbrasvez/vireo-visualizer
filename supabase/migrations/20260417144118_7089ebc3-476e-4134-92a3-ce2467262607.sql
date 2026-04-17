-- ============================================================
-- 1. ROLES SYSTEM
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('customer', 'seller', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'customer'::app_role FROM auth.users
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. SELLERS
-- ============================================================
CREATE TYPE public.seller_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');

CREATE TABLE public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  email TEXT,
  phone TEXT,
  vat_number TEXT,
  country TEXT DEFAULT 'IT',
  category TEXT,
  website TEXT,
  status seller_status NOT NULL DEFAULT 'pending',
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.15,
  stripe_account_id TEXT,
  stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  total_sales_cents BIGINT NOT NULL DEFAULT 0,
  total_orders INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved sellers viewable by everyone"
  ON public.sellers FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can apply as seller"
  ON public.sellers FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Sellers can update own profile"
  ON public.sellers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sellers"
  ON public.sellers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.grant_seller_role_on_approval()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'seller')
    ON CONFLICT DO NOTHING;
    NEW.approved_at := COALESCE(NEW.approved_at, now());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_grant_seller_role
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.grant_seller_role_on_approval();

-- ============================================================
-- 3. SELLER PRODUCTS
-- ============================================================
CREATE TABLE public.seller_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL DEFAULT 'home',
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents INT,
  currency TEXT NOT NULL DEFAULT 'eur',
  images TEXT[] NOT NULL DEFAULT '{}',
  primary_image TEXT,
  stock INT NOT NULL DEFAULT 0,
  unlimited_stock BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_reused BOOLEAN NOT NULL DEFAULT false,
  is_bio BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  weight_grams INT,
  shipping_cents INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,
  sales_count INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seller_products_seller ON public.seller_products(seller_id);
CREATE INDEX idx_seller_products_category ON public.seller_products(category) WHERE is_published = true;
CREATE INDEX idx_seller_products_published ON public.seller_products(is_published, created_at DESC);

ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products viewable by everyone"
  ON public.seller_products FOR SELECT
  USING (
    (is_published = true AND EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_products.seller_id AND s.status = 'approved'
    ))
    OR EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_products.seller_id AND s.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Sellers manage own products"
  ON public.seller_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_products.seller_id AND s.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_products.seller_id AND s.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_seller_products_updated_at
  BEFORE UPDATE ON public.seller_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. MARKETPLACE ORDERS
-- ============================================================
CREATE TABLE public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address JSONB,
  subtotal_cents INT NOT NULL,
  shipping_cents INT NOT NULL DEFAULT 0,
  total_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  platform_fee_cents INT NOT NULL DEFAULT 0,
  sellers_total_cents INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own orders"
  ON public.marketplace_orders FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages orders"
  ON public.marketplace_orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_marketplace_orders_updated_at
  BEFORE UPDATE ON public.marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.seller_products(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_amount_cents INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  line_total_cents INT NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.15,
  platform_fee_cents INT NOT NULL,
  seller_amount_cents INT NOT NULL,
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mp_order_items_order ON public.marketplace_order_items(order_id);
CREATE INDEX idx_mp_order_items_seller ON public.marketplace_order_items(seller_id);

ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own order items"
  ON public.marketplace_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_orders o
      WHERE o.id = marketplace_order_items.order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers view own item rows"
  ON public.marketplace_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = marketplace_order_items.seller_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers update fulfillment"
  ON public.marketplace_order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = marketplace_order_items.seller_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all items"
  ON public.marketplace_order_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages items"
  ON public.marketplace_order_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.recompute_seller_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_seller UUID;
BEGIN
  target_seller := COALESCE(NEW.seller_id, OLD.seller_id);
  IF target_seller IS NULL THEN RETURN NULL; END IF;

  UPDATE public.sellers s
  SET
    total_sales_cents = COALESCE((
      SELECT SUM(oi.seller_amount_cents)
      FROM public.marketplace_order_items oi
      JOIN public.marketplace_orders o ON o.id = oi.order_id
      WHERE oi.seller_id = target_seller AND o.status IN ('paid','fulfilled')
    ), 0),
    total_orders = COALESCE((
      SELECT COUNT(DISTINCT oi.order_id)
      FROM public.marketplace_order_items oi
      JOIN public.marketplace_orders o ON o.id = oi.order_id
      WHERE oi.seller_id = target_seller AND o.status IN ('paid','fulfilled')
    ), 0)
  WHERE s.id = target_seller;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_recompute_seller_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_order_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_seller_stats();

-- ============================================================
-- 5. STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-assets', 'seller-assets', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Seller assets publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'seller-assets');

CREATE POLICY "Sellers upload own assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'seller-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Sellers update own assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'seller-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Sellers delete own assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'seller-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 6. SEED
-- ============================================================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.sellers (
  id, slug, business_name, description, status, is_demo,
  email, country, category, commission_rate, approved_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'vireo-demo-store',
  'Vireo Demo Store',
  'Catalogo dimostrativo gestito direttamente da Vireo. Prodotti eco-sostenibili selezionati a mano.',
  'approved',
  true,
  'demo@vireo.app',
  'IT',
  'eco-lifestyle',
  0.15,
  now()
);

INSERT INTO public.seller_products (
  seller_id, slug, external_id, name, description, category,
  price_cents, compare_at_price_cents, primary_image, images,
  stock, unlimited_stock, is_published, is_reused, is_bio, tags
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'set-utensili-bambu', 'mkt_bamboo_utensils',
   'Set utensili in bambù', 'Utensili da cucina sostenibili in bambù 100% naturale.', 'kitchen',
   1890, 2490, '/src/assets/product-1.jpg', ARRAY['/src/assets/product-1.jpg'],
   0, true, true, false, false, ARRAY['bambù','cucina','zero-waste']),
  ('11111111-1111-1111-1111-111111111111', 'barattoli-vetro-riciclato', 'mkt_glass_jars',
   'Barattoli vetro riciclato (set 6)', 'Set di 6 barattoli in vetro 100% riciclato.', 'kitchen',
   2250, NULL, '/src/assets/product-2.jpg', ARRAY['/src/assets/product-2.jpg'],
   0, true, true, false, false, ARRAY['vetro','conservazione']),
  ('11111111-1111-1111-1111-111111111111', 'tote-bag-cotone-organico', 'mkt_tote_bag',
   'Tote bag cotone organico', 'Borsa in cotone bio certificato GOTS.', 'personal',
   1200, NULL, '/src/assets/product-3.jpg', ARRAY['/src/assets/product-3.jpg'],
   0, true, true, false, true, ARRAY['cotone','bio','tessile']),
  ('11111111-1111-1111-1111-111111111111', 'beeswax-wraps-set-3', 'mkt_beeswax_wraps',
   'Beeswax wraps (set 3)', 'Pellicole alimentari riutilizzabili in cera d''api.', 'bio',
   1550, NULL, '/src/assets/product-4.jpg', ARRAY['/src/assets/product-4.jpg'],
   0, true, true, false, true, ARRAY['cera','riutilizzabile']),
  ('11111111-1111-1111-1111-111111111111', 'set-utensili-riuso', 'mkt_reuse_utensils',
   'Set utensili (riuso)', 'Set utensili dalla seconda vita: usati ma in ottime condizioni.', 'reuse',
   990, 1890, '/src/assets/product-1.jpg', ARRAY['/src/assets/product-1.jpg'],
   0, true, true, true, false, ARRAY['riuso','seconda-vita']),
  ('11111111-1111-1111-1111-111111111111', 'barattoli-vintage-riuso', 'mkt_vintage_jars',
   'Barattoli vintage (riuso)', 'Barattoli vintage selezionati, perfetti per cucina e dispensa.', 'reuse',
   1100, NULL, '/src/assets/product-2.jpg', ARRAY['/src/assets/product-2.jpg'],
   0, true, true, true, false, ARRAY['vintage','riuso']);