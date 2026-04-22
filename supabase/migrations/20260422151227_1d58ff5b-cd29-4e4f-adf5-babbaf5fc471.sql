-- Audit log table for slot capacity changes
CREATE TABLE public.restaurant_capacity_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  changed_by uuid,
  old_capacity integer,
  new_capacity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurant_capacity_audit_restaurant
  ON public.restaurant_capacity_audit (restaurant_id, created_at DESC);

ALTER TABLE public.restaurant_capacity_audit ENABLE ROW LEVEL SECURITY;

-- Owners and admins can view audit entries for their restaurants
CREATE POLICY "Owners and admins view capacity audit"
ON public.restaurant_capacity_audit
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = restaurant_capacity_audit.restaurant_id
      AND r.owner_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger function to log slot_capacity changes
CREATE OR REPLACE FUNCTION public.log_restaurant_capacity_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.slot_capacity IS DISTINCT FROM OLD.slot_capacity THEN
    INSERT INTO public.restaurant_capacity_audit
      (restaurant_id, changed_by, old_capacity, new_capacity)
    VALUES
      (NEW.id, auth.uid(), OLD.slot_capacity, NEW.slot_capacity);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_restaurant_capacity_change ON public.restaurants;
CREATE TRIGGER trg_log_restaurant_capacity_change
AFTER UPDATE OF slot_capacity ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.log_restaurant_capacity_change();