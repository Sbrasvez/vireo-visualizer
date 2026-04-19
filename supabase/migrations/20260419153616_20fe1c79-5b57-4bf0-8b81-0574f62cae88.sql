-- Authenticated users need full column access (admins, sellers viewing own row).
-- RLS policies still control which rows they can see.
GRANT SELECT ON public.sellers TO authenticated;