-- FitOwn exercise library

CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  muscle_groups text[] NOT NULL DEFAULT '{}',
  is_system boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercises_name_not_empty CHECK (char_length(trim(name)) > 0)
);

CREATE INDEX exercises_category_idx ON public.exercises (category);
CREATE INDEX exercises_name_trgm_idx ON public.exercises USING gin (name extensions.gin_trgm_ops);
CREATE INDEX exercises_is_system_idx ON public.exercises (is_system) WHERE is_system = true;
CREATE UNIQUE INDEX exercises_system_name_unique ON public.exercises (lower(name)) WHERE is_system = true;

CREATE TRIGGER exercises_set_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read system + own custom exercises
CREATE POLICY exercises_select ON public.exercises
  FOR SELECT TO authenticated
  USING (is_system = true OR created_by = (SELECT auth.uid()));

CREATE POLICY exercises_insert_own ON public.exercises
  FOR INSERT TO authenticated
  WITH CHECK (is_system = false AND created_by = (SELECT auth.uid()));

CREATE POLICY exercises_update_own ON public.exercises
  FOR UPDATE TO authenticated
  USING (is_system = false AND created_by = (SELECT auth.uid()))
  WITH CHECK (is_system = false AND created_by = (SELECT auth.uid()));

CREATE POLICY exercises_delete_own ON public.exercises
  FOR DELETE TO authenticated
  USING (is_system = false AND created_by = (SELECT auth.uid()));
