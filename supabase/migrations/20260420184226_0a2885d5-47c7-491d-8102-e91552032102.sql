CREATE OR REPLACE FUNCTION public.admin_find_user_by_email(_email text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can look up users';
  END IF;

  RETURN QUERY
  SELECT u.id AS user_id, u.email::text
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_find_user_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_find_user_by_email(text) TO authenticated;