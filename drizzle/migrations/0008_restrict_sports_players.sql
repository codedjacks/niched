DROP POLICY IF EXISTS "Public sports reference data is readable" ON public.sports_players;
REVOKE ALL ON public.sports_players FROM anon, authenticated;
GRANT ALL ON public.sports_players TO service_role;