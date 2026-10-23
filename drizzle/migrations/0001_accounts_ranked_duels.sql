CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student' CHECK (char_length(display_name) BETWEEN 1 AND 20),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, left(coalesce(nullif(trim(NEW.raw_user_meta_data->>'display_name'), ''), split_part(NEW.email, '@', 1), 'Student'), 20));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Server-verified daily scores (one per account per day)
CREATE TABLE public.ranked_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day text NOT NULL,
  score int NOT NULL CHECK (score BETWEEN 0 AND 700),
  tiers text[] NOT NULL DEFAULT '{}',
  answers jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day, user_id)
);
CREATE INDEX ranked_scores_day_score ON public.ranked_scores (day, score DESC);
GRANT SELECT (id, user_id, day, score, tiers, created_at) ON public.ranked_scores TO anon, authenticated;
GRANT ALL ON public.ranked_scores TO service_role;
ALTER TABLE public.ranked_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ranked scores are public" ON public.ranked_scores FOR SELECT TO anon, authenticated USING (true);

COMMENT ON TABLE public.daily_scores IS 'DEPRECATED: replaced by ranked_scores (account-verified)';

CREATE OR REPLACE FUNCTION public.ranked_alltime(_limit int DEFAULT 50)
RETURNS TABLE (user_id uuid, display_name text, avatar_url text, total bigint, games bigint, best int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.display_name, p.avatar_url, sum(r.score), count(*), max(r.score)
  FROM public.ranked_scores r JOIN public.profiles p ON p.id = r.user_id
  GROUP BY p.id ORDER BY sum(r.score) DESC LIMIT least(_limit, 100);
$$;
GRANT EXECUTE ON FUNCTION public.ranked_alltime(int) TO anon, authenticated;

-- Live head-to-head
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_ids text[] NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'done')),
  starts_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in players can see matches" ON public.matches FOR SELECT TO authenticated USING (true);

CREATE TABLE public.match_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  q_index int NOT NULL CHECK (q_index BETWEEN 0 AND 6),
  display text,
  tier text,
  points int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id, q_index)
);
GRANT SELECT ON public.match_answers TO authenticated;
GRANT ALL ON public.match_answers TO service_role;
ALTER TABLE public.match_answers ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.is_match_player(_match uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.matches WHERE id = _match AND (host_id = _user OR guest_id = _user));
$$;
CREATE POLICY "Players see their match answers" ON public.match_answers FOR SELECT TO authenticated
  USING (public.is_match_player(match_id, auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_answers;

-- Avatar uploads: users write only inside their own folder
CREATE POLICY "Avatar images are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);