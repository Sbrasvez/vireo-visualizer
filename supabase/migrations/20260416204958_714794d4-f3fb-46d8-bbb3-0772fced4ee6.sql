-- Enums
CREATE TYPE public.cuisine_type AS ENUM ('vegano', 'vegetariano', 'plant_based', 'bio', 'mediterraneo', 'crudista', 'fusion', 'km_zero');
CREATE TYPE public.price_range AS ENUM ('€', '€€', '€€€', '€€€€');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Restaurants table
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  short_description TEXT,
  description TEXT,
  cuisine cuisine_type[] NOT NULL DEFAULT '{}',
  price price_range NOT NULL DEFAULT '€€',
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours JSONB,
  cover_image TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  available_now BOOLEAN NOT NULL DEFAULT true,
  eco_certifications TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_city ON public.restaurants(city);
CREATE INDEX idx_restaurants_available ON public.restaurants(available_now);
CREATE INDEX idx_restaurants_coords ON public.restaurants(lat, lng);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT USING (true);

CREATE TRIGGER trg_restaurants_updated
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Photos
CREATE TABLE public.restaurant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_photos_restaurant ON public.restaurant_photos(restaurant_id);

ALTER TABLE public.restaurant_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos are viewable by everyone"
  ON public.restaurant_photos FOR SELECT USING (true);

-- Menu items
CREATE TABLE public.restaurant_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(6,2),
  is_vegan BOOLEAN DEFAULT true,
  allergens TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_restaurant ON public.restaurant_menu_items(restaurant_id);

ALTER TABLE public.restaurant_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menu items are viewable by everyone"
  ON public.restaurant_menu_items FOR SELECT USING (true);

-- Reviews
CREATE TABLE public.restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_restaurant ON public.restaurant_reviews(restaurant_id);

ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.restaurant_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews"
  ON public.restaurant_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews"
  ON public.restaurant_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews"
  ON public.restaurant_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_reviews_updated
  BEFORE UPDATE ON public.restaurant_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reservations
CREATE TABLE public.restaurant_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 30),
  notes TEXT,
  status reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservations_restaurant ON public.restaurant_reservations(restaurant_id);
CREATE INDEX idx_reservations_user ON public.restaurant_reservations(user_id);

ALTER TABLE public.restaurant_reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can create reservations (guests + auth users)
CREATE POLICY "Anyone can create reservations"
  ON public.restaurant_reservations FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Only owners can view their reservations
CREATE POLICY "Users can view own reservations"
  ON public.restaurant_reservations FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own reservations"
  ON public.restaurant_reservations FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE TRIGGER trg_reservations_updated
  BEFORE UPDATE ON public.restaurant_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to recompute rating after review changes
CREATE OR REPLACE FUNCTION public.recompute_restaurant_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  UPDATE public.restaurants
  SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.restaurant_reviews WHERE restaurant_id = target_id), 0),
    reviews_count = (SELECT COUNT(*) FROM public.restaurant_reviews WHERE restaurant_id = target_id)
  WHERE id = target_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_recompute
  AFTER INSERT OR UPDATE OR DELETE ON public.restaurant_reviews
  FOR EACH ROW EXECUTE FUNCTION public.recompute_restaurant_rating();