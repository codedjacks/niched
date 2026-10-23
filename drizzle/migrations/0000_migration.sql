CREATE TABLE public.daily_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL,
  player_id uuid NOT NULL,
  player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
  score int NOT NULL CHECK (score BETWEEN 0 AND 700),
  tiers text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day, player_id)
);
CREATE INDEX daily_scores_day_score ON public.daily_scores (day, score DESC);
GRANT SELECT (id, day, player_name, score, tiers, created_at) ON public.daily_scores TO anon, authenticated;
GRANT ALL ON public.daily_scores TO service_role;
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is public" ON public.daily_scores FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.answer_counts (
  question_id text NOT NULL,
  answer_key text NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (question_id, answer_key)
);
GRANT SELECT ON public.answer_counts TO anon, authenticated;
GRANT ALL ON public.answer_counts TO service_role;
ALTER TABLE public.answer_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Answer counts are public" ON public.answer_counts FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.bump_answers(_question_ids text[], _keys text[])
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.answer_counts (question_id, answer_key, count)
  SELECT q, k, 1 FROM unnest(_question_ids, _keys) AS t(q, k)
  ON CONFLICT (question_id, answer_key) DO UPDATE SET count = answer_counts.count + 1;
$$;
REVOKE ALL ON FUNCTION public.bump_answers(text[], text[]) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_answers(text[], text[]) TO service_role;

CREATE OR REPLACE FUNCTION public.leaderboard_alltime(_limit int DEFAULT 50)
RETURNS TABLE (player_name text, total bigint, games bigint, best int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (array_agg(player_name ORDER BY created_at DESC))[1], sum(score), count(*), max(score)
  FROM public.daily_scores GROUP BY player_id ORDER BY sum(score) DESC LIMIT least(_limit, 100);
$$;
GRANT EXECUTE ON FUNCTION public.leaderboard_alltime(int) TO anon, authenticated;