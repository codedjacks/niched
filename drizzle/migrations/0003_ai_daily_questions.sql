CREATE TABLE public.ai_daily_rounds (
  day date PRIMARY KEY,
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating','ready','failed')),
  locked_until timestamptz NOT NULL DEFAULT now() + interval '3 minutes',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_daily_rounds TO service_role;
ALTER TABLE public.ai_daily_rounds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ai_questions (
  id text PRIMARY KEY,
  day date NOT NULL,
  position int NOT NULL,
  category text NOT NULL,
  prompt text NOT NULL,
  prompt_key text NOT NULL UNIQUE,
  answers jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day, position)
);
GRANT ALL ON public.ai_questions TO service_role;
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;