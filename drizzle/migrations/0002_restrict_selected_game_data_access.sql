DROP POLICY "Answer counts are public" ON public.answer_counts;
REVOKE SELECT ON public.answer_counts FROM anon, authenticated;

CREATE FUNCTION public.question_answer_counts(_question_ids text[])
RETURNS TABLE(question_id text, answer_key text, count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.question_id, a.answer_key, a.count
  FROM public.answer_counts a
  WHERE a.question_id = ANY (_question_ids[1:20]);
$$;
REVOKE ALL ON FUNCTION public.question_answer_counts(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.question_answer_counts(text[]) TO anon, authenticated, service_role;

DROP POLICY "Ranked scores are public" ON public.ranked_scores;
CREATE POLICY "Players read own ranked scores" ON public.ranked_scores
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
REVOKE SELECT ON public.ranked_scores FROM anon;
GRANT SELECT ON public.ranked_scores TO authenticated;

CREATE FUNCTION public.ranked_daily(_day text)
RETURNS TABLE(id uuid, user_id uuid, score integer, tiers text[], created_at timestamptz, display_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT r.id, r.user_id, r.score, r.tiers, r.created_at, p.display_name, p.avatar_url
  FROM public.ranked_scores r JOIN public.profiles p ON p.id = r.user_id
  WHERE r.day = _day AND _day ~ '^\d{4}-\d{2}-\d{2}$'
  ORDER BY r.score DESC, r.created_at ASC LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.ranked_daily(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ranked_daily(text) TO anon, authenticated, service_role;

DROP POLICY "Leaderboard is public" ON public.daily_scores;
CREATE POLICY "Players read own legacy daily scores" ON public.daily_scores
FOR SELECT TO authenticated USING (player_id = (SELECT auth.uid()));
REVOKE SELECT ON public.daily_scores FROM anon;
GRANT SELECT ON public.daily_scores TO authenticated;

DROP POLICY "Profiles are public" ON public.profiles;
CREATE POLICY "Players read own and opponent profiles" ON public.profiles
FOR SELECT TO authenticated USING (
  id = (SELECT auth.uid()) OR EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (m.host_id = (SELECT auth.uid()) AND m.guest_id = profiles.id)
       OR (m.guest_id = (SELECT auth.uid()) AND m.host_id = profiles.id)
  )
);
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT ON public.profiles TO authenticated;

DROP POLICY "Signed-in players can see matches" ON public.matches;
CREATE POLICY "Players read participating matches" ON public.matches
FOR SELECT TO authenticated USING (host_id = (SELECT auth.uid()) OR guest_id = (SELECT auth.uid()));

DROP POLICY "Avatar images are public" ON storage.objects;
CREATE POLICY "Users read own avatar files" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND owner_id = (SELECT auth.uid())::text);
