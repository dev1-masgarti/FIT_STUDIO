-- Scalable read helpers for dashboards (SECURITY DEFINER, RLS-aware)

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := COALESCE(p_user_id, auth.uid());
  v_month_count int;
  v_streak int;
BEGIN
  IF v_user_id IS NULL OR v_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT count(*)::int INTO v_month_count
  FROM public.workout_sessions
  WHERE user_id = v_user_id
    AND started_at >= date_trunc('month', now());

  WITH days AS (
    SELECT DISTINCT (started_at AT TIME ZONE 'UTC')::date AS d
    FROM public.workout_sessions
    WHERE user_id = v_user_id
      AND completed_at IS NOT NULL
    ORDER BY d DESC
  ),
  streak AS (
    SELECT d, row_number() OVER (ORDER BY d DESC) AS rn
    FROM days
  )
  SELECT count(*)::int INTO v_streak
  FROM streak
  WHERE d = (CURRENT_DATE - (rn - 1));

  RETURN jsonb_build_object(
    'workouts_this_month', v_month_count,
    'current_streak_days', COALESCE(v_streak, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_muscle_frequency(p_user_id uuid, p_days int DEFAULT 30)
RETURNS TABLE (muscle_group text, session_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mg AS muscle_group, count(DISTINCT ws.id) AS session_count
  FROM public.workout_sessions ws
  JOIN public.strength_sets ss ON ss.session_id = ws.id
  JOIN public.exercises e ON e.id = ss.exercise_id
  CROSS JOIN LATERAL unnest(e.muscle_groups) AS mg
  WHERE ws.user_id = p_user_id
    AND (
      p_user_id = auth.uid()
      OR public.has_data_grant(p_user_id, 'strength')
    )
    AND ws.started_at >= now() - (p_days || ' days')::interval
  GROUP BY mg
  ORDER BY session_count DESC;
$$;

REVOKE ALL ON FUNCTION public.get_muscle_frequency(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_muscle_frequency(uuid, int) TO authenticated;
