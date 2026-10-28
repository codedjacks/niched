CREATE TABLE public.daily_puzzles (
  id bigserial PRIMARY KEY,
  game text NOT NULL,
  day date NOT NULL,
  puzzle_key text NOT NULL,
  puzzle jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game, day),
  UNIQUE (game, puzzle_key)
);
GRANT SELECT ON public.daily_puzzles TO anon, authenticated;
GRANT ALL ON public.daily_puzzles TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.daily_puzzles_id_seq TO service_role;
ALTER TABLE public.daily_puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Daily puzzles up to tomorrow are public" ON public.daily_puzzles FOR SELECT TO anon, authenticated USING (day <= (now() AT TIME ZONE 'America/Chicago')::date + 1);