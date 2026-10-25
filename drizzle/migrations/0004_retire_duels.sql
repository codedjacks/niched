-- Retire the Challenge a Friend (live duels) feature without breaking the live app.
-- The app no longer reads or writes these tables; access is revoked and they are marked deprecated.
ALTER PUBLICATION supabase_realtime DROP TABLE public.match_answers;
ALTER PUBLICATION supabase_realtime DROP TABLE public.matches;
DROP POLICY IF EXISTS "Players see their match answers" ON public.match_answers;
DROP POLICY IF EXISTS "Players read participating matches" ON public.matches;
REVOKE ALL ON public.match_answers FROM anon, authenticated;
REVOKE ALL ON public.matches FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.is_match_player(uuid, uuid);

COMMENT ON TABLE public.matches IS 'DEPRECATED: Challenge a Friend duels removed; app no longer reads or writes this table';
COMMENT ON TABLE public.match_answers IS 'DEPRECATED: Challenge a Friend duels removed; app no longer reads or writes this table';

-- Matches are gone, so profiles only need own-row reads (rankings use security-definer RPCs)
DROP POLICY IF EXISTS "Players read own and opponent profiles" ON public.profiles;
CREATE POLICY "Players read own profile" ON public.profiles
FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
GRANT SELECT ON public.profiles TO authenticated;
