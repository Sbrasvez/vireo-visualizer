-- Magic Bags: anti-spreco offerings from restaurants
CREATE TABLE public.magic_bags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'mixed',
  original_price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2) NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 1 CHECK (quantity_available >= 0),
  pickup_start TIMESTAMPTZ NOT NULL,
  pickup_end TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  co2_saved_kg NUMERIC(5,2) NOT NULL DEFAULT 1.5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_magic_bags_restaurant ON public.magic_bags(restaurant_id);
CREATE INDEX idx_magic_bags_active ON public.magic_bags(is_active, pickup_end);

ALTER TABLE public.magic_bags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Magic bags are viewable by everyone"
  ON public.magic_bags FOR SELECT USING (true);

CREATE TRIGGER update_magic_bags_updated_at
  BEFORE UPDATE ON public.magic_bags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Magic Bag Reservations
CREATE TABLE public.magic_bag_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magic_bag_id UUID NOT NULL REFERENCES public.magic_bags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','collected','cancelled','expired')),
  pickup_code TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  collected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_magic_bag_reservations_user ON public.magic_bag_reservations(user_id);
CREATE INDEX idx_magic_bag_reservations_bag ON public.magic_bag_reservations(magic_bag_id);

ALTER TABLE public.magic_bag_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bag reservations"
  ON public.magic_bag_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bag reservations"
  ON public.magic_bag_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bag reservations"
  ON public.magic_bag_reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to atomically reserve a bag (decrement quantity + insert reservation)
CREATE OR REPLACE FUNCTION public.reserve_magic_bag(
  _bag_id UUID,
  _quantity INTEGER DEFAULT 1
)
RETURNS public.magic_bag_reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _bag public.magic_bags;
  _reservation public.magic_bag_reservations;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO _bag FROM public.magic_bags WHERE id = _bag_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Magic bag not found';
  END IF;
  IF NOT _bag.is_active OR _bag.quantity_available < _quantity THEN
    RAISE EXCEPTION 'Magic bag not available';
  END IF;
  IF _bag.pickup_end < now() THEN
    RAISE EXCEPTION 'Pickup window expired';
  END IF;

  UPDATE public.magic_bags
    SET quantity_available = quantity_available - _quantity,
        is_active = (quantity_available - _quantity) > 0
    WHERE id = _bag_id;

  INSERT INTO public.magic_bag_reservations (magic_bag_id, user_id, quantity, total_price)
  VALUES (_bag_id, _user_id, _quantity, _bag.discounted_price * _quantity)
  RETURNING * INTO _reservation;

  -- Log CO2 savings
  INSERT INTO public.co2_log (user_id, kg_co2, action)
  VALUES (_user_id, _bag.co2_saved_kg * _quantity, 'magic_bag:' || _bag_id);

  RETURN _reservation;
END;
$$;

-- Seed: a few demo Magic Bags using existing restaurants
INSERT INTO public.magic_bags (restaurant_id, title, description, category, original_price, discounted_price, quantity_available, pickup_start, pickup_end, co2_saved_kg)
SELECT
  r.id,
  'Magic Bag ' || r.name,
  'Sorpresa anti-spreco con piatti del giorno: salviamo cibo buono dallo spreco!',
  CASE WHEN row_number() OVER () % 3 = 0 THEN 'bakery' WHEN row_number() OVER () % 3 = 1 THEN 'meal' ELSE 'mixed' END,
  18.00,
  6.00,
  3,
  date_trunc('day', now()) + interval '18 hours',
  date_trunc('day', now()) + interval '21 hours',
  2.5
FROM public.restaurants r
LIMIT 6;