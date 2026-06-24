-- FitOwn workout sessions and entries

CREATE TABLE public.workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type public.workout_type NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_min smallint CHECK (duration_min IS NULL OR duration_min >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX workout_sessions_user_started_idx
  ON public.workout_sessions (user_id, started_at DESC);

CREATE INDEX workout_sessions_user_type_idx
  ON public.workout_sessions (user_id, type);

CREATE TRIGGER workout_sessions_set_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.strength_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions (id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises (id) ON DELETE RESTRICT,
  set_number smallint NOT NULL CHECK (set_number > 0),
  weight_kg numeric(6, 2) NOT NULL CHECK (weight_kg >= 0),
  reps smallint NOT NULL CHECK (reps > 0),
  rpe smallint CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, exercise_id, set_number)
);

CREATE INDEX strength_sets_session_idx ON public.strength_sets (session_id);
CREATE INDEX strength_sets_exercise_idx ON public.strength_sets (exercise_id);

CREATE TABLE public.cardio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions (id) ON DELETE CASCADE,
  activity text NOT NULL,
  duration_min smallint NOT NULL CHECK (duration_min > 0),
  intensity smallint NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  distance_km numeric(6, 2) CHECK (distance_km IS NULL OR distance_km >= 0),
  intervals smallint CHECK (intervals IS NULL OR intervals >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cardio_entries_session_idx ON public.cardio_entries (session_id);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strength_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_entries ENABLE ROW LEVEL SECURITY;

-- Owner policies: workout_sessions
CREATE POLICY workout_sessions_owner_all ON public.workout_sessions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- strength_sets: owner via session
CREATE POLICY strength_sets_owner_all ON public.strength_sets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = (SELECT auth.uid())
    )
  );

-- cardio_entries: owner via session
CREATE POLICY cardio_entries_owner_all ON public.cardio_entries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = (SELECT auth.uid())
    )
  );
