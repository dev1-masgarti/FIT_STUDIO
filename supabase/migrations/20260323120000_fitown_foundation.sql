-- FitOwn foundation: extensions, enums, shared utilities
-- Security: immutable search_path on all SECURITY DEFINER functions

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.fitown_user_role AS ENUM ('client', 'professional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.workout_type AS ENUM ('strength', 'cardio', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.experience_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.professional_role AS ENUM (
    'strength_coach', 'cardio_coach', 'physio', 'doctor', 'nutritionist', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Permission helper (SECURITY DEFINER — used by RLS policies)
-- Created after access_grants table exists (see sharing migration).
-- ---------------------------------------------------------------------------

-- Default permissions JSON shape validator
CREATE OR REPLACE FUNCTION public.is_valid_permissions(p jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT p ?& ARRAY['strength', 'cardio', 'parq', 'notes', 'body_measurements']
    AND jsonb_typeof(p -> 'strength') = 'boolean'
    AND jsonb_typeof(p -> 'cardio') = 'boolean'
    AND jsonb_typeof(p -> 'parq') = 'boolean'
    AND jsonb_typeof(p -> 'notes') = 'boolean'
    AND jsonb_typeof(p -> 'body_measurements') = 'boolean';
$$;
