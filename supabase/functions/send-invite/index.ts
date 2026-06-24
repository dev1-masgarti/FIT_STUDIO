import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const sha256Hex = async (value: string): Promise<string> => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: 'Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY' });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json(401, { error: 'Missing bearer token' });
  const accessToken = authHeader.replace('Bearer ', '').trim();

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return json(401, { error: 'Unauthorized' });

  const { data: allowedData, error: allowedError } = await supabase.rpc('enforce_rate_limit', {
    p_scope: 'send_invite',
    p_limit: 20,
    p_window_seconds: 3600,
    p_actor_ip: request.headers.get('x-forwarded-for') ?? null,
  });
  if (allowedError) return json(500, { error: allowedError.message });
  if (!allowedData) return json(429, { error: 'Rate limit exceeded' });

  const body = (await request.json().catch(() => ({}))) as {
    invitee_email?: string;
    professional_role?:
      | 'strength_coach'
      | 'cardio_coach'
      | 'physio'
      | 'doctor'
      | 'nutritionist'
      | 'other';
    permissions?: Record<string, boolean>;
  };

  const inviteeEmail = body.invitee_email?.trim().toLowerCase();
  if (!inviteeEmail) return json(400, { error: 'invitee_email is required' });

  const defaultPermissions = {
    strength: false,
    cardio: false,
    parq: false,
    notes: false,
    body_measurements: false,
  };
  const permissions = { ...defaultPermissions, ...(body.permissions ?? {}) };

  const token = crypto.randomUUID();
  const tokenHash = await sha256Hex(token);

  const { data, error } = await supabase
    .from('share_invites')
    .insert({
      client_id: userData.user.id,
      invitee_email: inviteeEmail,
      professional_role: body.professional_role ?? 'other',
      permissions,
      token_hash: tokenHash,
      status: 'pending',
    })
    .select('id,invitee_email,professional_role,permissions,created_at,expires_at')
    .single();

  if (error) return json(500, { error: error.message });

  await supabase.rpc('log_security_event', {
    p_event_type: 'invite_created',
    p_event_scope: 'sharing',
    p_metadata: {
      invite_id: data.id,
      invitee_email: inviteeEmail,
    },
  });

  return json(200, {
    invite: data,
    token,
  });
});
