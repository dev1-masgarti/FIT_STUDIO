-- Store date of birth from onboarding (age is derived for queries/display)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date
  CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);
