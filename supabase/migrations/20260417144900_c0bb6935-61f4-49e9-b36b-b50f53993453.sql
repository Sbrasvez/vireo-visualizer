-- Atomic stock decrement helper used by the marketplace webhook.
CREATE OR REPLACE FUNCTION public.decrement_product_stock(_id uuid, _qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.seller_products
  SET stock = GREATEST(0, stock - _qty),
      sales_count = sales_count + _qty
  WHERE id = _id AND unlimited_stock = false;

  UPDATE public.seller_products
  SET sales_count = sales_count + _qty
  WHERE id = _id AND unlimited_stock = true;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_product_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(uuid, integer) TO service_role;