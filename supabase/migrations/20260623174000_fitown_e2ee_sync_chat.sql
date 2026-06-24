-- FitOwn E2EE + local-first sync foundation

DO $$ BEGIN
  CREATE TYPE public.conversation_type AS ENUM ('direct', 'group');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.message_receipt_status AS ENUM ('delivered', 'read');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  device_label text NOT NULL,
  identity_key_public text NOT NULL,
  signing_key_public text NOT NULL,
  registration_id integer NOT NULL,
  is_revoked boolean NOT NULL DEFAULT false,
  revoked_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, registration_id)
);

CREATE TABLE IF NOT EXISTS public.device_signed_prekeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.user_devices (id) ON DELETE CASCADE,
  prekey_id integer NOT NULL,
  public_key text NOT NULL,
  signature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, prekey_id)
);

CREATE TABLE IF NOT EXISTS public.device_one_time_prekeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.user_devices (id) ON DELETE CASCADE,
  prekey_id integer NOT NULL,
  public_key text NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, prekey_id)
);

CREATE TABLE IF NOT EXISTS public.encrypted_sync_blobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  payload_ciphertext text NOT NULL,
  payload_nonce text NOT NULL,
  key_version integer NOT NULL DEFAULT 1,
  idempotency_key text NOT NULL,
  record_version bigint NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, entity_type, entity_id, record_version),
  UNIQUE (owner_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS encrypted_sync_blobs_pull_idx
  ON public.encrypted_sync_blobs (owner_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.sync_cursors (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.user_devices (id) ON DELETE CASCADE,
  last_pulled_at timestamptz NOT NULL DEFAULT to_timestamp(0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, device_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.conversation_type NOT NULL DEFAULT 'direct',
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.message_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  sender_device_id uuid NOT NULL REFERENCES public.user_devices (id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  message_type text NOT NULL DEFAULT 'ciphertext',
  payload_ciphertext text NOT NULL,
  payload_nonce text NOT NULL,
  key_version integer NOT NULL DEFAULT 1,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  UNIQUE (sender_user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS message_envelopes_recipient_idx
  ON public.message_envelopes (recipient_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.message_receipts (
  message_id uuid NOT NULL REFERENCES public.message_envelopes (id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  recipient_device_id uuid REFERENCES public.user_devices (id) ON DELETE SET NULL,
  status public.message_receipt_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, recipient_user_id, status)
);

CREATE TABLE IF NOT EXISTS public.grant_wrapped_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_grant_id uuid NOT NULL REFERENCES public.access_grants (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  grantee_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  grantee_device_id uuid REFERENCES public.user_devices (id) ON DELETE CASCADE,
  wrapped_key_ciphertext text NOT NULL,
  wrapped_key_nonce text NOT NULL,
  key_version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS grant_wrapped_keys_grantee_idx
  ON public.grant_wrapped_keys (grantee_id, is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS public.security_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_scope text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  actor_user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  actor_ip text,
  window_started_at timestamptz NOT NULL,
  window_seconds integer NOT NULL,
  hit_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, actor_user_id, actor_ip, window_started_at, window_seconds)
);

CREATE TRIGGER user_devices_set_updated_at
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER encrypted_sync_blobs_set_updated_at
  BEFORE UPDATE ON public.encrypted_sync_blobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER sync_cursors_set_updated_at
  BEFORE UPDATE ON public.sync_cursors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER api_rate_limits_set_updated_at
  BEFORE UPDATE ON public.api_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_signed_prekeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_one_time_prekeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_sync_blobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_wrapped_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_devices_owner_all ON public.user_devices;
CREATE POLICY user_devices_owner_all ON public.user_devices
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS device_signed_prekeys_owner_all ON public.device_signed_prekeys;
CREATE POLICY device_signed_prekeys_owner_all ON public.device_signed_prekeys
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_devices ud
      WHERE ud.id = device_id
        AND ud.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_devices ud
      WHERE ud.id = device_id
        AND ud.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS device_one_time_prekeys_owner_all ON public.device_one_time_prekeys;
CREATE POLICY device_one_time_prekeys_owner_all ON public.device_one_time_prekeys
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_devices ud
      WHERE ud.id = device_id
        AND ud.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_devices ud
      WHERE ud.id = device_id
        AND ud.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS encrypted_sync_blobs_owner_all ON public.encrypted_sync_blobs;
CREATE POLICY encrypted_sync_blobs_owner_all ON public.encrypted_sync_blobs
  FOR ALL TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sync_cursors_owner_all ON public.sync_cursors;
CREATE POLICY sync_cursors_owner_all ON public.sync_cursors
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS conversations_member_select ON public.conversations;
CREATE POLICY conversations_member_select ON public.conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = id
        AND cm.user_id = (SELECT auth.uid())
        AND cm.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS conversations_creator_insert ON public.conversations;
CREATE POLICY conversations_creator_insert ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS conversation_members_self_select ON public.conversation_members;
CREATE POLICY conversation_members_self_select ON public.conversation_members
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_id
        AND cm.user_id = (SELECT auth.uid())
        AND cm.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS conversation_members_creator_manage ON public.conversation_members;
CREATE POLICY conversation_members_creator_manage ON public.conversation_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.created_by = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS message_envelopes_member_select ON public.message_envelopes;
CREATE POLICY message_envelopes_member_select ON public.message_envelopes
  FOR SELECT TO authenticated
  USING (
    recipient_user_id = (SELECT auth.uid())
    OR sender_user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS message_envelopes_sender_insert ON public.message_envelopes;
CREATE POLICY message_envelopes_sender_insert ON public.message_envelopes
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = message_envelopes.conversation_id
        AND cm.user_id = sender_user_id
        AND cm.left_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_members rm
      WHERE rm.conversation_id = message_envelopes.conversation_id
        AND rm.user_id = recipient_user_id
        AND rm.left_at IS NULL
    )
  );

DROP POLICY IF EXISTS message_receipts_owner_all ON public.message_receipts;
CREATE POLICY message_receipts_owner_all ON public.message_receipts
  FOR ALL TO authenticated
  USING (recipient_user_id = (SELECT auth.uid()))
  WITH CHECK (recipient_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS grant_wrapped_keys_client_manage ON public.grant_wrapped_keys;
CREATE POLICY grant_wrapped_keys_client_manage ON public.grant_wrapped_keys
  FOR ALL TO authenticated
  USING (client_id = (SELECT auth.uid()))
  WITH CHECK (client_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS grant_wrapped_keys_grantee_select ON public.grant_wrapped_keys;
CREATE POLICY grant_wrapped_keys_grantee_select ON public.grant_wrapped_keys
  FOR SELECT TO authenticated
  USING (
    grantee_id = (SELECT auth.uid())
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM public.access_grants ag
      WHERE ag.id = access_grant_id
        AND ag.active = true
        AND ag.revoked_at IS NULL
    )
  );

DROP POLICY IF EXISTS security_audit_events_actor_select ON public.security_audit_events;
CREATE POLICY security_audit_events_actor_select ON public.security_audit_events
  FOR SELECT TO authenticated
  USING (actor_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS api_rate_limits_actor_all ON public.api_rate_limits;
CREATE POLICY api_rate_limits_actor_all ON public.api_rate_limits
  FOR ALL TO authenticated
  USING (actor_user_id = (SELECT auth.uid()))
  WITH CHECK (actor_user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_event_scope text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_events (actor_user_id, event_type, event_scope, metadata)
  VALUES ((SELECT auth.uid()), p_event_type, p_event_scope, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  p_scope text,
  p_limit integer,
  p_window_seconds integer,
  p_actor_ip text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
BEGIN
  INSERT INTO public.api_rate_limits (scope, actor_user_id, actor_ip, window_started_at, window_seconds, hit_count)
  VALUES (p_scope, (SELECT auth.uid()), p_actor_ip, v_window, p_window_seconds, 1)
  ON CONFLICT (scope, actor_user_id, actor_ip, window_started_at, window_seconds)
  DO UPDATE SET hit_count = public.api_rate_limits.hit_count + 1;

  SELECT hit_count
  INTO v_hits
  FROM public.api_rate_limits
  WHERE scope = p_scope
    AND actor_user_id = (SELECT auth.uid())
    AND actor_ip IS NOT DISTINCT FROM p_actor_ip
    AND window_started_at = v_window
    AND window_seconds = p_window_seconds;

  RETURN v_hits <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_rate_limit(text, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_rate_limit(text, integer, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.push_sync_changes(p_changes jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_inserted integer := 0;
BEGIN
  IF p_changes IS NULL OR jsonb_typeof(p_changes) <> 'array' THEN
    RAISE EXCEPTION 'p_changes must be a json array';
  END IF;

  FOREACH v_item IN ARRAY (SELECT array_agg(value) FROM jsonb_array_elements(p_changes))
  LOOP
    INSERT INTO public.encrypted_sync_blobs (
      owner_id,
      entity_type,
      entity_id,
      payload_ciphertext,
      payload_nonce,
      key_version,
      idempotency_key,
      record_version,
      is_deleted
    )
    VALUES (
      (SELECT auth.uid()),
      v_item ->> 'entity_type',
      (v_item ->> 'entity_id')::uuid,
      v_item ->> 'payload_ciphertext',
      v_item ->> 'payload_nonce',
      COALESCE((v_item ->> 'key_version')::integer, 1),
      v_item ->> 'idempotency_key',
      (v_item ->> 'record_version')::bigint,
      COALESCE((v_item ->> 'is_deleted')::boolean, false)
    )
    ON CONFLICT (owner_id, idempotency_key) DO NOTHING;

    IF FOUND THEN
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  PERFORM public.log_security_event(
    'sync_push',
    'encrypted_sync',
    jsonb_build_object('inserted', v_inserted)
  );

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.push_sync_changes(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.push_sync_changes(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.pull_sync_changes(
  p_since timestamptz DEFAULT to_timestamp(0),
  p_limit integer DEFAULT 200
)
RETURNS SETOF public.encrypted_sync_blobs
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.encrypted_sync_blobs
  WHERE owner_id = (SELECT auth.uid())
    AND updated_at > p_since
  ORDER BY updated_at ASC
  LIMIT LEAST(GREATEST(p_limit, 1), 1000);
$$;

REVOKE ALL ON FUNCTION public.pull_sync_changes(timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pull_sync_changes(timestamptz, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_share_invite_token(p_token_hash text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.share_invites;
  v_grant_id uuid;
BEGIN
  SELECT *
  INTO v_invite
  FROM public.share_invites
  WHERE token_hash = p_token_hash
    AND status = 'pending'
    AND expires_at > now()
    AND lower(invitee_email) = lower((SELECT auth.jwt() ->> 'email'))
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found or expired';
  END IF;

  INSERT INTO public.access_grants (client_id, grantee_id, invite_id, permissions, active)
  VALUES (v_invite.client_id, (SELECT auth.uid()), v_invite.id, v_invite.permissions, true)
  ON CONFLICT (client_id, grantee_id)
  DO UPDATE SET
    permissions = EXCLUDED.permissions,
    active = true,
    revoked_at = NULL,
    updated_at = now()
  RETURNING id INTO v_grant_id;

  UPDATE public.share_invites
  SET status = 'accepted',
      accepted_by = (SELECT auth.uid()),
      updated_at = now()
  WHERE id = v_invite.id;

  PERFORM public.log_security_event(
    'invite_accepted',
    'sharing',
    jsonb_build_object('invite_id', v_invite.id, 'grant_id', v_grant_id)
  );

  RETURN v_grant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_share_invite_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_share_invite_token(text) TO authenticated;
