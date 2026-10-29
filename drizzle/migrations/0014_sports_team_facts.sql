CREATE TABLE public.sports_team_facts (
  id text PRIMARY KEY,
  league text NOT NULL,
  team_id text NOT NULL,
  team_name text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  scope text NOT NULL,
  venue_name text,
  venue_aliases text[] NOT NULL DEFAULT '{}',
  city text,
  source_id text NOT NULL REFERENCES public.sports_fact_sources(id),
  verified_at timestamptz NOT NULL
);
CREATE INDEX sports_team_facts_team ON public.sports_team_facts(league, team_id);
GRANT SELECT ON public.sports_team_facts TO anon, authenticated;
GRANT ALL ON public.sports_team_facts TO service_role;
ALTER TABLE public.sports_team_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sourced team facts" ON public.sports_team_facts FOR SELECT TO anon, authenticated USING (true);