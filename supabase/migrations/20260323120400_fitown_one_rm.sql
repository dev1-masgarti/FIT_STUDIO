-- FitOwn 1RM estimates with automatic calculation

CREATE OR REPLACE FUNCTION public.calculate_one_rm_epley(p_weight_kg numeric, p_reps smallint)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_reps IS NULL OR p_reps <= 0 OR p_weight_kg IS NULL OR p_weight_kg <= 0 THEN NULL
    WHEN p_reps = 1 THEN p_weight_kg
    ELSE round((p_weight_kg * (1 + p_reps::numeric / 30))::numeric, 2)
  END;
$$;

CREATE TABLE public.one_rm_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises (id) ON DELETE RESTRICT,
  estimated_1rm_kg numeric(6, 2) NOT NULL CHECK (estimated_1rm_kg > 0),
  source_set_id uuid REFERENCES public.strength_sets (id) ON DELETE SET NULL,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);

CREATE INDEX one_rm_estimates_user_idx ON public.one_rm_estimates (user_id, calculated_at DESC);

-- Recalculate best 1RM for user+exercise after strength set changes
CREATE OR REPLACE FUNCTION public.refresh_one_rm_estimate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_exercise_id uuid;
  v_best_1rm numeric;
  v_best_set_id uuid;
BEGIN
  SELECT ws.user_id, COALESCE(NEW.exercise_id, OLD.exercise_id)
  INTO v_user_id, v_exercise_id
  FROM public.workout_sessions ws
  WHERE ws.id = COALESCE(NEW.session_id, OLD.session_id);

  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT
    public.calculate_one_rm_epley(ss.weight_kg, ss.reps),
    ss.id
  INTO v_best_1rm, v_best_set_id
  FROM public.strength_sets ss
  JOIN public.workout_sessions ws ON ws.id = ss.session_id
  WHERE ws.user_id = v_user_id
    AND ss.exercise_id = v_exercise_id
  ORDER BY public.calculate_one_rm_epley(ss.weight_kg, ss.reps) DESC NULLS LAST
  LIMIT 1;

  IF v_best_1rm IS NULL THEN
    DELETE FROM public.one_rm_estimates
    WHERE user_id = v_user_id AND exercise_id = v_exercise_id;
  ELSE
    INSERT INTO public.one_rm_estimates (user_id, exercise_id, estimated_1rm_kg, source_set_id, calculated_at)
    VALUES (v_user_id, v_exercise_id, v_best_1rm, v_best_set_id, now())
    ON CONFLICT (user_id, exercise_id)
    DO UPDATE SET
      estimated_1rm_kg = EXCLUDED.estimated_1rm_kg,
      source_set_id = EXCLUDED.source_set_id,
      calculated_at = EXCLUDED.calculated_at;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER strength_sets_refresh_one_rm
  AFTER INSERT OR UPDATE OR DELETE ON public.strength_sets
  FOR EACH ROW EXECUTE FUNCTION public.refresh_one_rm_estimate();

ALTER TABLE public.one_rm_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY one_rm_owner_all ON public.one_rm_estimates
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
