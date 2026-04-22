ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS slot_capacity integer NOT NULL DEFAULT 30;