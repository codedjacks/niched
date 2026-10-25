ALTER TABLE public.ai_questions ADD COLUMN track text NOT NULL DEFAULT 'main';
ALTER TABLE public.ai_questions DROP CONSTRAINT IF EXISTS ai_questions_day_position_key;
ALTER TABLE public.ai_questions ADD CONSTRAINT ai_questions_day_track_position_key UNIQUE (day, track, position);
CREATE TABLE public.ai_topic_rounds (
  day date NOT NULL,
  topic text NOT NULL CHECK (topic IN ('sports','entertainment','history')),
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating','ready','failed')),
  locked_until timestamptz NOT NULL DEFAULT now() + interval '3 minutes',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (day, topic)
);
GRANT ALL ON public.ai_topic_rounds TO service_role;
ALTER TABLE public.ai_topic_rounds ENABLE ROW LEVEL SECURITY;