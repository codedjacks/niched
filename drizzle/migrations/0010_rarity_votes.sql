CREATE TABLE public.rarity_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  question_id text NOT NULL CHECK (char_length(question_id) <= 80),
  answer_key text NOT NULL CHECK (char_length(answer_key) <= 80),
  tier text NOT NULL CHECK (tier IN ('pencil','paperclip','notebook','backpack','goldstar','valedictorian')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id, answer_key)
);
GRANT SELECT, INSERT, UPDATE ON public.rarity_votes TO authenticated;
GRANT ALL ON public.rarity_votes TO service_role;
ALTER TABLE public.rarity_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own votes read" ON public.rarity_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own votes insert" ON public.rarity_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own votes update" ON public.rarity_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.rarity_vote_counts(_question_id text, _answer_key text)
RETURNS TABLE(tier text, count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tier, count(*) FROM public.rarity_votes
  WHERE question_id = _question_id AND answer_key = _answer_key GROUP BY tier
$$;
GRANT EXECUTE ON FUNCTION public.rarity_vote_counts(text, text) TO anon, authenticated;