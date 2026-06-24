-- Seed 50 system exercises (idempotent)

INSERT INTO public.exercises (name, category, muscle_groups, is_system)
SELECT v.name, v.category, v.muscle_groups, true
FROM (VALUES
  ('Barbell Back Squat', 'compound', ARRAY['quadriceps', 'glutes', 'hamstrings']),
  ('Front Squat', 'compound', ARRAY['quadriceps', 'core']),
  ('Romanian Deadlift', 'compound', ARRAY['hamstrings', 'glutes', 'lower_back']),
  ('Conventional Deadlift', 'compound', ARRAY['hamstrings', 'glutes', 'back']),
  ('Barbell Bench Press', 'compound', ARRAY['chest', 'triceps', 'shoulders']),
  ('Incline Bench Press', 'compound', ARRAY['chest', 'shoulders']),
  ('Overhead Press', 'compound', ARRAY['shoulders', 'triceps']),
  ('Barbell Row', 'compound', ARRAY['back', 'biceps']),
  ('Pull-Up', 'compound', ARRAY['back', 'biceps']),
  ('Chin-Up', 'compound', ARRAY['back', 'biceps']),
  ('Lat Pulldown', 'compound', ARRAY['back', 'biceps']),
  ('Dumbbell Bench Press', 'compound', ARRAY['chest', 'triceps']),
  ('Dumbbell Shoulder Press', 'compound', ARRAY['shoulders', 'triceps']),
  ('Dumbbell Row', 'compound', ARRAY['back', 'biceps']),
  ('Goblet Squat', 'compound', ARRAY['quadriceps', 'glutes']),
  ('Leg Press', 'compound', ARRAY['quadriceps', 'glutes']),
  ('Hip Thrust', 'compound', ARRAY['glutes', 'hamstrings']),
  ('Bulgarian Split Squat', 'compound', ARRAY['quadriceps', 'glutes']),
  ('Walking Lunge', 'compound', ARRAY['quadriceps', 'glutes']),
  ('Cable Row', 'compound', ARRAY['back', 'biceps']),
  ('Seated Cable Row', 'compound', ARRAY['back', 'biceps']),
  ('Face Pull', 'accessory', ARRAY['rear_delts', 'upper_back']),
  ('Lateral Raise', 'accessory', ARRAY['shoulders']),
  ('Rear Delt Fly', 'accessory', ARRAY['rear_delts']),
  ('Barbell Curl', 'accessory', ARRAY['biceps']),
  ('Dumbbell Curl', 'accessory', ARRAY['biceps']),
  ('Hammer Curl', 'accessory', ARRAY['biceps', 'forearms']),
  ('Tricep Pushdown', 'accessory', ARRAY['triceps']),
  ('Skull Crusher', 'accessory', ARRAY['triceps']),
  ('Dips', 'compound', ARRAY['chest', 'triceps']),
  ('Push-Up', 'compound', ARRAY['chest', 'triceps', 'core']),
  ('Leg Curl', 'accessory', ARRAY['hamstrings']),
  ('Leg Extension', 'accessory', ARRAY['quadriceps']),
  ('Calf Raise', 'accessory', ARRAY['calves']),
  ('Plank', 'core', ARRAY['core']),
  ('Hanging Leg Raise', 'core', ARRAY['core']),
  ('Russian Twist', 'core', ARRAY['obliques', 'core']),
  ('Ab Wheel Rollout', 'core', ARRAY['core']),
  ('Kettlebell Swing', 'compound', ARRAY['glutes', 'hamstrings', 'core']),
  ('Farmer Carry', 'accessory', ARRAY['forearms', 'core', 'traps']),
  ('Trap Bar Deadlift', 'compound', ARRAY['glutes', 'hamstrings', 'quadriceps']),
  ('Pec Deck Fly', 'accessory', ARRAY['chest']),
  ('Cable Fly', 'accessory', ARRAY['chest']),
  ('Preacher Curl', 'accessory', ARRAY['biceps']),
  ('Incline Dumbbell Curl', 'accessory', ARRAY['biceps']),
  ('Close-Grip Bench Press', 'compound', ARRAY['triceps', 'chest']),
  ('Sumo Deadlift', 'compound', ARRAY['glutes', 'hamstrings', 'adductors']),
  ('Box Jump', 'plyometric', ARRAY['quadriceps', 'glutes']),
  ('Battle Ropes', 'cardio_strength', ARRAY['shoulders', 'core'])
) AS v(name, category, muscle_groups)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.exercises e
  WHERE e.is_system = true
    AND lower(e.name) = lower(v.name)
);
