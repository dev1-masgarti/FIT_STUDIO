-- Add height for onboarding body metrics

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height_cm smallint
  CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 280));
