-- Dedicated Fastify backend persistence (replaces apps/backend/data/store.json).
-- User identity + profile metadata only; workout payloads stay E2EE in encrypted_sync_blobs.

CREATE TABLE IF NOT EXISTS public.backend_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS backend_users_email_idx ON public.backend_users (lower(email));

CREATE TABLE IF NOT EXISTS public.backend_profiles (
  id uuid PRIMARY KEY REFERENCES public.backend_users (id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  age smallint CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
  date_of_birth date,
  gender public.gender_type,
  country_region text,
  height_cm smallint CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 280)),
  body_weight_kg numeric(5, 2) CHECK (body_weight_kg IS NULL OR body_weight_kg > 0),
  focus text[] NOT NULL DEFAULT '{}',
  role public.fitown_user_role NOT NULL DEFAULT 'client',
  onboarding_complete boolean NOT NULL DEFAULT false,
  home_image_url text,
  home_image_signature text,
  home_image_generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER backend_profiles_set_updated_at
  BEFORE UPDATE ON public.backend_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.backend_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.backend_users (id) ON DELETE CASCADE,
  device_label text NOT NULL DEFAULT 'mobile',
  identity_key_public text NOT NULL DEFAULT '',
  signing_key_public text NOT NULL DEFAULT '',
  registration_id integer NOT NULL,
  is_revoked boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, registration_id)
);

CREATE TABLE IF NOT EXISTS public.backend_sync_blobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.backend_users (id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  payload_ciphertext text NOT NULL,
  payload_nonce text NOT NULL,
  key_version integer NOT NULL DEFAULT 1,
  idempotency_key text NOT NULL,
  record_version bigint NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS backend_sync_blobs_pull_idx
  ON public.backend_sync_blobs (owner_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.backend_message_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  sender_user_id uuid NOT NULL REFERENCES public.backend_users (id) ON DELETE CASCADE,
  sender_device_id text NOT NULL DEFAULT '',
  recipient_user_id uuid NOT NULL REFERENCES public.backend_users (id) ON DELETE CASCADE,
  payload_ciphertext text NOT NULL,
  payload_nonce text NOT NULL,
  key_version integer NOT NULL DEFAULT 1,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS backend_message_envelopes_conversation_idx
  ON public.backend_message_envelopes (conversation_id, created_at);

CREATE TABLE IF NOT EXISTS public.backend_wrapped_grant_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_grant_id text NOT NULL,
  client_id uuid NOT NULL REFERENCES public.backend_users (id) ON DELETE CASCADE,
  grantee_id uuid NOT NULL REFERENCES public.backend_users (id) ON DELETE CASCADE,
  grantee_device_id text,
  wrapped_key_ciphertext text NOT NULL DEFAULT '',
  wrapped_key_nonce text NOT NULL DEFAULT '',
  key_version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.backend_revoked_tokens (
  token text PRIMARY KEY,
  revoked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS backend_revoked_tokens_revoked_at_idx
  ON public.backend_revoked_tokens (revoked_at DESC);
