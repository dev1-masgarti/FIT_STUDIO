import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';

type ProfileRow = {
  id: string;
  full_name: string;
  age: number | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  country_region: string | null;
  home_image_url: string | null;
  home_image_signature: string | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const firstText = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return null;
};

const extractImageUrlFromPoe = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;

  const root = payload as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
    output?: unknown;
    image_url?: string;
    url?: string;
  };

  if (firstText(root.image_url)) return firstText(root.image_url);
  if (firstText(root.url)) return firstText(root.url);

  const choice = root.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === 'string') {
    const urlMatch = content.match(/https?:\/\/\S+\.(png|jpg|jpeg|webp)\S*/i);
    if (urlMatch?.[0]) return urlMatch[0];
  }

  if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== 'object') continue;
      const typed = item as Record<string, unknown>;
      const direct = firstText(typed.image_url) ?? firstText(typed.url);
      if (direct) return direct;

      const nested = typed.image_url;
      if (nested && typeof nested === 'object') {
        const nestedUrl = firstText((nested as Record<string, unknown>).url);
        if (nestedUrl) return nestedUrl;
      }
    }
  }

  if (root.output && typeof root.output === 'object') {
    const output = root.output as Record<string, unknown>;
    const maybe = firstText(output.image_url) ?? firstText(output.url);
    if (maybe) return maybe;
  }

  return null;
};

const ageFromProfile = (profile: ProfileRow): number | null => {
  if (typeof profile.age === 'number' && Number.isFinite(profile.age)) return profile.age;
  if (!profile.date_of_birth) return null;

  const birth = new Date(profile.date_of_birth);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age > 0 ? age : null;
};

const normalizeGender = (gender: ProfileRow['gender']) => {
  if (!gender) return 'person';
  if (gender === 'prefer_not_to_say') return 'person';
  return gender;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const poeApiKey = Deno.env.get('POE_API_KEY');
  const poeApiUrl = Deno.env.get('POE_API_URL') ?? 'https://api.poe.com/v1/chat/completions';
  const poeImageModel = Deno.env.get('POE_IMAGE_MODEL') ?? 'GPT-Image-1';
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const unsignedPreset = Deno.env.get('CLOUDINARY_UNSIGNED_PRESET');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: 'Missing Supabase server credentials' });
  }
  if (!poeApiKey || !cloudName || !unsignedPreset) {
    return json(500, { error: 'Missing POE/Cloudinary environment variables' });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return json(401, { error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return json(401, { error: 'Invalid Authorization token' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return json(401, { error: 'Unable to authenticate user' });
  }

  const { data: allowed, error: limitError } = await supabase.rpc('enforce_rate_limit', {
    p_scope: 'generate_home_image',
    p_limit: 20,
    p_window_seconds: 3600,
    p_actor_ip: request.headers.get('x-forwarded-for') ?? null,
  });
  if (limitError) {
    return json(500, { error: 'Rate limit check failed', details: limitError.message });
  }
  if (!allowed) {
    return json(429, { error: 'Rate limit exceeded' });
  }

  const body = await request.json().catch(() => ({})) as {
    region?: string;
    force_regenerate?: boolean;
  };

  const region = firstText(body.region) ?? 'Global';
  const forceRegenerate = Boolean(body.force_regenerate);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,full_name,age,date_of_birth,gender,country_region,home_image_url,home_image_signature')
    .eq('id', userData.user.id)
    .single<ProfileRow>();

  if (profileError || !profile) {
    return json(404, { error: 'Profile not found' });
  }

  const age = ageFromProfile(profile);
  const normalizedGender = normalizeGender(profile.gender);
  const signature = `${age ?? 'unknown'}|${normalizedGender}|${region}`;

  if (!forceRegenerate && profile.home_image_url && profile.home_image_signature === signature) {
    return json(200, { image_url: profile.home_image_url, cached: true });
  }

  const firstName = profile.full_name?.trim().split(/\s+/)[0] ?? 'Athlete';
  const prompt =
    `Create a high-quality semi-realistic fitness portrait illustration for a mobile workout app. ` +
    `Subject profile: ${normalizedGender}, age ${age ?? 'unknown'}, region ${region}. ` +
    `Style: confident athlete, upper-body framing, dark cinematic background with subtle neon teal rim light, ` +
    `clean composition, modern premium aesthetic, no text, no logos, no nudity.`;

  const poeResponse = await fetch(poeApiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${poeApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: poeImageModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      user: userData.user.id,
      stream: false,
    }),
  });

  if (!poeResponse.ok) {
    const details = await poeResponse.text();
    return json(502, { error: 'POE image generation failed', details });
  }

  const poePayload = await poeResponse.json();
  const sourceImageUrl = extractImageUrlFromPoe(poePayload);
  if (!sourceImageUrl) {
    return json(502, { error: 'POE response did not include an image URL', payload: poePayload });
  }

  const rawImageResponse = await fetch(sourceImageUrl);
  if (!rawImageResponse.ok) {
    return json(502, { error: 'Failed to fetch generated image from POE URL' });
  }

  const imageBuffer = await rawImageResponse.arrayBuffer();
  const imageBytes = new Uint8Array(imageBuffer);
  const imageDataUrl = `data:image/png;base64,${encodeBase64(imageBytes)}`;

  const cloudinaryForm = new FormData();
  cloudinaryForm.set('file', imageDataUrl);
  cloudinaryForm.set('upload_preset', unsignedPreset);
  cloudinaryForm.set(
    'public_id',
    `fit-studio/home/${userData.user.id}-${Date.now()}`,
  );
  cloudinaryForm.set('folder', 'fit-studio/home');
  cloudinaryForm.set('tags', `fitown,home-image,${firstName.toLowerCase()}`);

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: cloudinaryForm },
  );

  if (!cloudinaryResponse.ok) {
    const details = await cloudinaryResponse.text();
    return json(502, { error: 'Cloudinary upload failed', details });
  }

  const cloudinaryPayload = await cloudinaryResponse.json() as {
    secure_url?: string;
  };

  const secureUrl = firstText(cloudinaryPayload.secure_url);
  if (!secureUrl) {
    return json(502, { error: 'Cloudinary did not return secure_url' });
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      country_region: region,
      home_image_url: secureUrl,
      home_image_signature: signature,
      home_image_generated_at: new Date().toISOString(),
    })
    .eq('id', userData.user.id);

  if (updateError) {
    return json(500, { error: 'Failed to persist image URL', details: updateError.message });
  }

  await supabase.rpc('log_security_event', {
    p_event_type: 'home_image_generated',
    p_event_scope: 'profile',
    p_metadata: {
      source: 'poe+cloudinary',
      cached: false,
      signature,
    },
  });

  return json(200, { image_url: secureUrl, cached: false });
});
