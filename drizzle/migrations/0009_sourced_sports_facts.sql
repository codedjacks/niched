CREATE TABLE public.sports_fact_sources (
 id text PRIMARY KEY,
 provider text NOT NULL,
 url text NOT NULL,
 retrieved_at timestamptz NOT NULL,
 payload jsonb NOT NULL,
 payload_hash text NOT NULL,
 CONSTRAINT sports_source_https CHECK (url LIKE 'https://%')
);
GRANT SELECT ON public.sports_fact_sources TO anon, authenticated;
GRANT ALL ON public.sports_fact_sources TO service_role;
ALTER TABLE public.sports_fact_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sports source evidence" ON public.sports_fact_sources FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.sports_facts (
 id text PRIMARY KEY,
 league text NOT NULL,
 player_id text NOT NULL,
 player_name text NOT NULL,
 metric text NOT NULL,
 value numeric NOT NULL,
 unit text NOT NULL,
 scope text NOT NULL DEFAULT 'career regular season',
 source_id text NOT NULL REFERENCES public.sports_fact_sources(id),
 verified_at timestamptz NOT NULL,
 CONSTRAINT sports_fact_league CHECK (league IN ('nba','nfl','mlb','nhl')),
 CONSTRAINT sports_fact_nonnegative CHECK (value >= 0),
 UNIQUE (league, player_id, metric, scope)
);
GRANT SELECT ON public.sports_facts TO anon, authenticated;
GRANT ALL ON public.sports_facts TO service_role;
ALTER TABLE public.sports_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sourced sports facts" ON public.sports_facts FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX sports_facts_league_metric ON public.sports_facts (league, metric);
COMMENT ON TABLE public.sports_facts IS 'Source-backed public sports facts. Trusted import only; no AI-generated or client-authored values.';