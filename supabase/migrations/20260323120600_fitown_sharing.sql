-- FitOwn sharing: invites and access grants

CREATE TABLE public.share_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  professional_role public.professional_role NOT NULL DEFAULT 'other',
  permissions jsonb NOT NULL DEFAULT '{"strength":false,"cardio":false,"parq":false,"notes":false,"body_measurements":false}'::jsonb,
  status public.invite_status NOT NULL DEFAULT 'pending',
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT share_invites_valid_permissions CHECK (public.is_valid_permissions(permissions)),
  CONSTRAINT share_invites_email_format CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX share_invites_client_idx ON public.share_invites (client_id, status);
CREATE INDEX share_invites_email_pending_idx
  ON public.share_invites (lower(invitee_email))
  WHERE status = 'pending';
CREATE UNIQUE INDEX share_invites_token_hash_idx ON public.share_invites (token_hash);

CREATE TRIGGER share_invites_set_updated_at
  BEFORE UPDATE ON public.share_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  grantee_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  invite_id uuid REFERENCES public.share_invites (id) ON DELETE SET NULL,
  permissions jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_grants_valid_permissions CHECK (public.is_valid_permissions(permissions)),
  CONSTRAINT access_grants_no_self_grant CHECK (client_id <> grantee_id),
  UNIQUE (client_id, grantee_id)
);

CREATE INDEX access_grants_grantee_active_idx
  ON public.access_grants (grantee_id)
  WHERE active = true AND revoked_at IS NULL;

CREATE INDEX access_grants_client_idx ON public.access_grants (client_id);

CREATE TRIGGER access_grants_set_updated_at
  BEFORE UPDATE ON public.access_grants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.share_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

-- share_invites: client manages their invites
CREATE POLICY share_invites_client_all ON public.share_invites
  FOR ALL TO authenticated
  USING (client_id = (SELECT auth.uid()))
  WITH CHECK (client_id = (SELECT auth.uid()));

-- Invitee can view pending invites sent to their email
CREATE POLICY share_invites_invitee_select ON public.share_invites
  FOR SELECT TO authenticated
  USING (
    status = 'pending'
    AND lower(invitee_email) = lower((SELECT auth.jwt() ->> 'email'))
  );

-- access_grants: client manages grants they issued
CREATE POLICY access_grants_client_all ON public.access_grants
  FOR ALL TO authenticated
  USING (client_id = (SELECT auth.uid()))
  WITH CHECK (client_id = (SELECT auth.uid()));

-- Grantee can read their own active grants (not write)
CREATE POLICY access_grants_grantee_select ON public.access_grants
  FOR SELECT TO authenticated
  USING (grantee_id = (SELECT auth.uid()) AND active = true AND revoked_at IS NULL);

-- Permission helper (must exist after access_grants table)
CREATE OR REPLACE FUNCTION public.has_data_grant(p_client_id uuid, p_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.access_grants ag
    WHERE ag.client_id = p_client_id
      AND ag.grantee_id = (SELECT auth.uid())
      AND ag.active = true
      AND ag.revoked_at IS NULL
      AND COALESCE((ag.permissions ->> p_permission)::boolean, false) = true
  );
$$;

REVOKE ALL ON FUNCTION public.has_data_grant(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_data_grant(uuid, text) TO authenticated;

-- Grantee profile read (depends on has_data_grant)
CREATE POLICY profiles_select_grantee ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_data_grant(id, 'strength')
    OR public.has_data_grant(id, 'cardio')
    OR public.has_data_grant(id, 'parq')
  );

-- Grantee read-only policies (SELECT only — no INSERT/UPDATE/DELETE)
CREATE POLICY workout_sessions_grantee_strength_select ON public.workout_sessions
  FOR SELECT TO authenticated
  USING (
    type IN ('strength', 'mixed')
    AND public.has_data_grant(user_id, 'strength')
  );

CREATE POLICY workout_sessions_grantee_cardio_select ON public.workout_sessions
  FOR SELECT TO authenticated
  USING (
    type IN ('cardio', 'mixed')
    AND public.has_data_grant(user_id, 'cardio')
  );

CREATE POLICY strength_sets_grantee_select ON public.strength_sets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id
        AND ws.type IN ('strength', 'mixed')
        AND public.has_data_grant(ws.user_id, 'strength')
    )
  );

CREATE POLICY cardio_entries_grantee_select ON public.cardio_entries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id
        AND ws.type IN ('cardio', 'mixed')
        AND public.has_data_grant(ws.user_id, 'cardio')
    )
  );

CREATE POLICY one_rm_grantee_select ON public.one_rm_estimates
  FOR SELECT TO authenticated
  USING (public.has_data_grant(user_id, 'strength'));

CREATE POLICY parq_grantee_select ON public.parq_responses
  FOR SELECT TO authenticated
  USING (public.has_data_grant(user_id, 'parq'));
