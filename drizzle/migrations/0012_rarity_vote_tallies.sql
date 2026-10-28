CREATE OR REPLACE FUNCTION public.rarity_vote_tallies(_question_ids text[])
RETURNS TABLE(question_id text, answer_key text, tier text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT question_id, answer_key, tier, count(*) FROM public.rarity_votes
  WHERE question_id = ANY(_question_ids[1:20]) GROUP BY question_id, answer_key, tier
$$;
GRANT EXECUTE ON FUNCTION public.rarity_vote_tallies(text[]) TO anon, authenticated;