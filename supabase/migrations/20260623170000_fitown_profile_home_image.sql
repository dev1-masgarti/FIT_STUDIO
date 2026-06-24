-- Home image metadata for AI-generated visuals.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_region text,
  ADD COLUMN IF NOT EXISTS home_image_url text,
  ADD COLUMN IF NOT EXISTS home_image_signature text,
  ADD COLUMN IF NOT EXISTS home_image_generated_at timestamptz;
