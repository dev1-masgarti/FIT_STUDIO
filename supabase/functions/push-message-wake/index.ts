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

  const allowed = await supabase.rpc('enforce_rate_limit', {
    p_scope: 'push_message_wake',
    p_limit: 240,
    p_window_seconds: 3600,
    p_actor_ip: request.headers.get('x-forwarded-for') ?? null,
  });
  if (allowed.error) return json(500, { error: allowed.error.message });
  if (!allowed.data) return json(429, { error: 'Rate limit exceeded' });

  const body = (await request.json().catch(() => ({}))) as { message_id?: string };
  if (!body.message_id) return json(400, { error: 'message_id is required' });

  const { data: message, error: messageError } = await supabase
    .from('message_envelopes')
    .select('id,recipient_user_id,sender_user_id,delivered_at')
    .eq('id', body.message_id)
    .single();
  if (messageError || !message) return json(404, { error: 'Message not found' });

  if (message.sender_user_id !== userData.user.id) {
    return json(403, { error: 'Cannot trigger wake for message not sent by caller' });
  }

  if (!message.delivered_at) {
    await supabase
      .from('message_envelopes')
      .update({ delivered_at: new Date().toISOString() })
      .eq('id', message.id);
  }

  await supabase.rpc('log_security_event', {
    p_event_type: 'message_wake',
    p_event_scope: 'chat',
    p_metadata: {
      message_id: message.id,
      sender_user_id: message.sender_user_id,
      recipient_user_id: message.recipient_user_id,
    },
  });

  return json(200, {
    message_id: message.id,
    recipient_user_id: message.recipient_user_id,
    wake_dispatched: true,
  });
});
