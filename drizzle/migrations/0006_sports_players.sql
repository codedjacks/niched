CREATE TABLE public.sports_players (
  league text NOT NULL,
  espn_id text NOT NULL,
  name text NOT NULL,
  name_key text NOT NULL,
  teams text[] NOT NULL DEFAULT '{}',
  seasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  awards text[] NOT NULL DEFAULT '{}',
  birth_place text,
  draft text,
  career jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (league, espn_id)
);
CREATE INDEX sports_players_name_key_idx ON public.sports_players (league, name_key);
CREATE TABLE public.sports_player_aliases (
  league text NOT NULL,
  query_key text NOT NULL,
  espn_id text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (league, query_key)
);
GRANT SELECT ON public.sports_players TO anon, authenticated;
GRANT ALL ON public.sports_players TO service_role;
GRANT ALL ON public.sports_player_aliases TO service_role;
ALTER TABLE public.sports_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_player_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sports reference data is readable" ON public.sports_players FOR SELECT TO anon, authenticated USING (true);