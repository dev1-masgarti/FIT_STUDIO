-- FitOwn PAR-Q health screening responses

CREATE TABLE public.parq_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  responses jsonb NOT NULL,
  cleared boolean NOT NULL DEFAULT false,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parq_responses_valid_shape CHECK (
    jsonb_typeof(responses) = 'object'
    AND responses ? 'answers'
    AND jsonb_typeof(responses -> 'answers') = 'array'
  )
);

CREATE UNIQUE INDEX parq_responses_user_latest_idx
  ON public.parq_responses (user_id, completed_at DESC);

CREATE INDEX parq_responses_user_idx ON public.parq_responses (user_id);

CREATE TRIGGER parq_responses_set_updated_at
  BEFORE UPDATE ON public.parq_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.parq_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY parq_owner_all ON public.parq_responses
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
