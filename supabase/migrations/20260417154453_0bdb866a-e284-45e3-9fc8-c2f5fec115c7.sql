-- Wishlist table: one row per (user, product)
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.seller_products(id) ON DELETE CASCADE,
  note TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX idx_wishlists_public ON public.wishlists(user_id) WHERE is_public = true;

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Owner can do everything on own rows
CREATE POLICY "Users view own wishlist"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own wishlist"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own wishlist"
  ON public.wishlists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own wishlist"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- Public read for wishlists marked as public (for shareable link)
CREATE POLICY "Public wishlists viewable by everyone"
  ON public.wishlists FOR SELECT
  USING (is_public = true);

-- Updated_at trigger
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();