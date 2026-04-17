
-- Auto-log CO2 saved when a user saves a recipe (~2.5 kg avg vs meat-based meal)
CREATE OR REPLACE FUNCTION public.log_co2_on_saved_recipe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.co2_log (user_id, kg_co2, action)
  VALUES (NEW.user_id, 2.5, 'saved_recipe:' || NEW.external_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_co2_on_saved_recipe ON public.saved_recipes;
CREATE TRIGGER trg_log_co2_on_saved_recipe
AFTER INSERT ON public.saved_recipes
FOR EACH ROW
EXECUTE FUNCTION public.log_co2_on_saved_recipe();

-- Auto-log CO2 saved when a user makes a restaurant reservation (~1.8 kg vs traditional restaurant)
CREATE OR REPLACE FUNCTION public.log_co2_on_reservation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.co2_log (user_id, kg_co2, action)
    VALUES (NEW.user_id, 1.8, 'reservation:' || NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_co2_on_reservation ON public.restaurant_reservations;
CREATE TRIGGER trg_log_co2_on_reservation
AFTER INSERT ON public.restaurant_reservations
FOR EACH ROW
EXECUTE FUNCTION public.log_co2_on_reservation();

-- Allow service role and the trigger function to insert into co2_log
-- (already covered by existing INSERT policy "Users can insert own co2 log" + SECURITY DEFINER on function)
