import './load-env.js';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

import { hashPassword, uid, verifyPassword } from './crypto.js';
import { getDb } from './db/client.js';
import {
  createUserWithProfile,
  findProfileByUserId,
  findUserByEmail,
  findUserById,
  insertMessageEnvelope,
  insertWrappedGrantKey,
  isTokenRevoked,
  listMessageEnvelopes,
  pullSyncBlobs,
  pushSyncBlobs,
  registerDevice,
  revokeToken,
  revokeWrappedGrantKeys,
  updateMessageReceipt,
  updateProfile,
  upsertSocialUser,
  type MessageEnvelope,
  type ProfileRecord,
  type WrappedGrantKey,
} from './db/repository.js';
import {
  getBearerToken,
  signAccessToken,
  unauthorized,
  verifyAccessToken,
} from './auth.js';

const port = Number(process.env.BACKEND_PORT ?? 8787);
const host = process.env.BACKEND_HOST ?? '0.0.0.0';
const googleAllowedClientIds = (process.env.GOOGLE_OAUTH_CLIENT_IDS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const appleAllowedAudiences = (process.env.APPLE_OAUTH_AUDIENCES ?? 'com.masgarti.fit')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const appleJwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

// Fail fast if Postgres is not configured.
getDb();

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(websocket);

const wsClientsByUser = new Map<string, Set<WebSocket>>();

const emitUserEvent = (userId: string, event: string, payload: Record<string, unknown>) => {
  const sockets = wsClientsByUser.get(userId);
  if (!sockets) return;
  const message = JSON.stringify({ event, payload, ts: new Date().toISOString() });
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) socket.send(message);
  }
};

const createSessionPayload = (user: { id: string; email: string }) => ({
  accessToken: signAccessToken(user.id, user.email),
  user: { id: user.id, email: user.email },
  expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
});

const verifyGoogleIdentityToken = async (
  idToken: string,
): Promise<{ email: string | null; fullName: string | null }> => {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Invalid Google identity token.');
  }
  const payload = (await response.json()) as {
    aud?: string;
    iss?: string;
    email?: string;
    name?: string;
    email_verified?: string;
  };

  if (
    payload.iss !== 'https://accounts.google.com' &&
    payload.iss !== 'accounts.google.com'
  ) {
    throw new Error('Invalid Google token issuer.');
  }
  if (googleAllowedClientIds.length > 0 && payload.aud && !googleAllowedClientIds.includes(payload.aud)) {
    throw new Error('Google token audience mismatch.');
  }
  if (payload.email_verified !== 'true') {
    throw new Error('Google account email is not verified.');
  }

  return {
    email: payload.email?.trim().toLowerCase() ?? null,
    fullName: payload.name?.trim() ?? null,
  };
};

const verifyAppleIdentityToken = async (
  idToken: string,
): Promise<{ email: string | null; fullName: string | null }> => {
  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: 'https://appleid.apple.com',
    audience: appleAllowedAudiences.length === 1 ? appleAllowedAudiences[0] : appleAllowedAudiences,
  });
  return {
    email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : null,
    fullName: null,
  };
};

const requireUser = async (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  const payload = verifyAccessToken(token);
  if (await isTokenRevoked(token)) return null;
  const user = await findUserById(payload.sub);
  if (!user || user.email !== payload.email) return null;
  return { token, payload, user };
};

app.get('/health', async () => ({
  ok: true,
  service: 'fitown-backend',
  storage: 'postgres',
  ts: new Date().toISOString(),
}));

app.register(async (router) => {
  router.get('/ws', { websocket: true }, (socket, request) => {
    const token = typeof request.query === 'object' && request.query ? (request.query as Record<string, string>).token : undefined;
    if (!token) {
      socket.send(JSON.stringify({ error: 'Missing token' }));
      socket.close();
      return;
    }
    let payload: { sub: string; email: string };
    try {
      payload = verifyAccessToken(token);
    } catch {
      socket.send(JSON.stringify({ error: 'Invalid token' }));
      socket.close();
      return;
    }

    const set = wsClientsByUser.get(payload.sub) ?? new Set<WebSocket>();
    set.add(socket);
    wsClientsByUser.set(payload.sub, set);
    socket.send(JSON.stringify({ event: 'connected', userId: payload.sub }));

    socket.on('close', () => {
      const current = wsClientsByUser.get(payload.sub);
      if (!current) return;
      current.delete(socket);
      if (current.size === 0) wsClientsByUser.delete(payload.sub);
    });
  });
});

app.post('/auth/sign-up', async (request, reply) => {
  const bodySchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  });
  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'Invalid sign-up payload' });
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (await findUserByEmail(email)) {
    return reply.status(409).send({ error: 'An account with this email already exists.' });
  }

  const { hash, salt } = hashPassword(parsed.data.password);
  const userId = uid();
  const { user, profile } = await createUserWithProfile({
    id: userId,
    email,
    fullName: parsed.data.fullName.trim(),
    passwordHash: hash,
    passwordSalt: salt,
  });

  return reply.send({
    session: createSessionPayload({ id: user.id, email: user.email }),
    profile,
  });
});

app.post('/auth/sign-in', async (request, reply) => {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'Invalid sign-in payload' });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const user = await findUserByEmail(email);
  if (!user) return reply.status(401).send({ error: 'Incorrect email or password.' });
  if (!verifyPassword(parsed.data.password, user.passwordHash, user.passwordSalt)) {
    return reply.status(401).send({ error: 'Incorrect email or password.' });
  }
  const profile = await findProfileByUserId(user.id);
  return reply.send({
    session: createSessionPayload({ id: user.id, email: user.email }),
    profile,
  });
});

app.post('/auth/social-sign-in', async (request, reply) => {
  const bodySchema = z.object({
    provider: z.enum(['google', 'apple']),
    idToken: z.string().min(16),
    email: z.string().email().optional(),
    fullName: z.string().min(1).optional(),
  });
  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'Invalid social sign-in payload' });
  }

  try {
    const providerIdentity =
      parsed.data.provider === 'google'
        ? await verifyGoogleIdentityToken(parsed.data.idToken)
        : await verifyAppleIdentityToken(parsed.data.idToken);

    const email = (providerIdentity.email ?? parsed.data.email ?? '').trim().toLowerCase();
    if (!email) {
      return reply.status(400).send({ error: 'Your social account did not provide an email.' });
    }
    const fullName =
      providerIdentity.fullName?.trim() ||
      parsed.data.fullName?.trim() ||
      (email.includes('@') ? email.split('@')[0] : 'Athlete');

    const generatedPassword = uid();
    const { hash, salt } = hashPassword(generatedPassword);
    const user = await upsertSocialUser({
      email,
      fullName,
      passwordHash: hash,
      passwordSalt: salt,
      userId: uid(),
    });
    const profile = await findProfileByUserId(user.id);

    return reply.send({
      session: createSessionPayload({ id: user.id, email: user.email }),
      profile,
    });
  } catch (error) {
    request.log.warn({ error }, 'social sign-in failed');
    return reply.status(401).send({ error: 'Unable to verify social sign-in token.' });
  }
});

app.get('/auth/session', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const profile = await findProfileByUserId(auth.user.id);
  return reply.send({
    session: {
      accessToken: auth.token,
      user: { id: auth.user.id, email: auth.user.email },
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    },
    profile,
  });
});

app.post('/auth/sign-out', async (request, reply) => {
  const token = getBearerToken(request);
  if (!token) return reply.send({ ok: true });
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return reply.send({ ok: true });
  await revokeToken(token);
  return reply.send({ ok: true });
});

app.post('/auth/forgot-password', async (_request, reply) => {
  return reply.send({ ok: true });
});

app.get('/profile/me', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const profile = await findProfileByUserId(auth.user.id);
  if (!profile) return reply.status(404).send({ error: 'Profile not found' });
  return reply.send(profile);
});

app.patch('/profile/me', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const patch = (request.body ?? {}) as Record<string, unknown>;
  const allowedKeys: (keyof ProfileRecord)[] = [
    'full_name',
    'age',
    'date_of_birth',
    'gender',
    'country_region',
    'height_cm',
    'body_weight_kg',
    'focus',
    'onboarding_complete',
    'home_image_url',
    'home_image_signature',
    'home_image_generated_at',
  ];
  const nextPatch: Partial<ProfileRecord> = {};
  for (const key of allowedKeys) {
    if (key in patch) {
      (nextPatch as Record<string, unknown>)[key] = patch[key];
    }
  }
  const profile = await updateProfile(auth.user.id, nextPatch);
  if (!profile) return reply.status(404).send({ error: 'Profile not found' });
  return reply.send(profile);
});

app.post('/devices/register', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const body = (request.body ?? {}) as Record<string, unknown>;
  const registrationId = Number(body.registration_id ?? 0);
  if (!registrationId) return reply.status(400).send({ error: 'registration_id is required' });

  const deviceId = await registerDevice({
    userId: auth.user.id,
    deviceId: uid(),
    deviceLabel: String(body.device_label ?? 'mobile'),
    identityKeyPublic: String(body.identity_key_public ?? ''),
    signingKeyPublic: String(body.signing_key_public ?? ''),
    registrationId,
  });
  return reply.send({ deviceId });
});

app.post('/sync/push', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const body = (request.body ?? {}) as { changes?: Array<Record<string, unknown>> };
  const changes = (body.changes ?? []).map((item) => ({
    entity_type: String(item.entity_type ?? ''),
    entity_id: String(item.entity_id ?? ''),
    payload_ciphertext: String(item.payload_ciphertext ?? ''),
    payload_nonce: String(item.payload_nonce ?? ''),
    key_version: Number(item.key_version ?? 1),
    idempotency_key: String(item.idempotency_key ?? ''),
    record_version: Number(item.record_version ?? 1),
    is_deleted: Boolean(item.is_deleted ?? false),
  }));
  const inserted = await pushSyncBlobs(auth.user.id, changes);
  emitUserEvent(auth.user.id, 'sync_updated', { inserted });
  return reply.send({ inserted });
});

app.get('/sync/pull', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const since = String((request.query as { since?: string }).since ?? new Date(0).toISOString());
  const changes = await pullSyncBlobs(auth.user.id, since);
  return reply.send({ changes });
});

app.post('/chat/messages/send', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const body = (request.body ?? {}) as Record<string, unknown>;
  const envelope: MessageEnvelope = {
    id: uid(),
    conversationId: String(body.conversation_id ?? ''),
    senderUserId: auth.user.id,
    senderDeviceId: String(body.sender_device_id ?? ''),
    recipientUserId: String(body.recipient_user_id ?? ''),
    payloadCiphertext: String(body.payload_ciphertext ?? ''),
    payloadNonce: String(body.payload_nonce ?? ''),
    keyVersion: Number(body.key_version ?? 1),
    idempotencyKey: String(body.idempotency_key ?? uid()),
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    readAt: null,
  };
  await insertMessageEnvelope(envelope);
  emitUserEvent(envelope.recipientUserId, 'chat_message', { messageId: envelope.id });
  return reply.send({ id: envelope.id });
});

app.get('/chat/messages/:conversationId', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const conversationId = (request.params as { conversationId: string }).conversationId;
  const items = await listMessageEnvelopes(conversationId, auth.user.id);
  return reply.send({ items });
});

app.post('/chat/messages/:messageId/receipt', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const messageId = (request.params as { messageId: string }).messageId;
  const body = (request.body ?? {}) as { status?: 'delivered' | 'read' };
  const message = await updateMessageReceipt(
    messageId,
    auth.user.id,
    body.status === 'read' ? 'read' : 'delivered',
  );
  if (!message) return reply.status(404).send({ error: 'Message not found' });
  emitUserEvent(message.senderUserId, 'chat_receipt', {
    messageId,
    status: body.status ?? 'delivered',
  });
  return reply.send({ ok: true });
});

app.post('/share/accept-invite', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const body = (request.body ?? {}) as { token?: string };
  return reply.send({ grant_id: `${auth.user.id}:${String(body.token ?? '')}` });
});

app.post('/share/wrapped-key', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const body = (request.body ?? {}) as Record<string, unknown>;
  const row: WrappedGrantKey = {
    id: uid(),
    accessGrantId: String(body.access_grant_id ?? ''),
    clientId: auth.user.id,
    granteeId: String(body.grantee_id ?? ''),
    granteeDeviceId: (body.grantee_device_id as string | null) ?? null,
    wrappedKeyCiphertext: String(body.wrapped_key_ciphertext ?? ''),
    wrappedKeyNonce: String(body.wrapped_key_nonce ?? ''),
    keyVersion: Number(body.key_version ?? 1),
    isActive: true,
    revokedAt: null,
    createdAt: new Date().toISOString(),
  };
  await insertWrappedGrantKey(row);
  emitUserEvent(row.granteeId, 'wrapped_key', { accessGrantId: row.accessGrantId });
  return reply.send({ id: row.id });
});

app.post('/share/wrapped-key/revoke', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const body = (request.body ?? {}) as { access_grant_id?: string; key_version?: number };
  const grantId = String(body.access_grant_id ?? '');
  const revoked = await revokeWrappedGrantKeys({
    clientId: auth.user.id,
    accessGrantId: grantId,
    keyVersion: body.key_version,
  });
  for (const item of revoked) {
    emitUserEvent(item.granteeId, 'wrapped_key_revoked', { accessGrantId: item.accessGrantId });
  }
  return reply.send({ ok: true });
});

app.post('/home-image/generate', async (request, reply) => {
  const auth = await requireUser(request.headers.authorization);
  if (!auth) return unauthorized(reply);
  const profile = await findProfileByUserId(auth.user.id);
  if (!profile) return reply.status(404).send({ error: 'Profile not found' });

  const body = (request.body ?? {}) as { region?: string };
  const region = body.region ?? profile.country_region ?? 'Global';
  const signature = `${profile.age ?? 'unknown'}|${profile.gender ?? 'person'}|${region}`;
  if (profile.home_image_url && profile.home_image_signature === signature) {
    return reply.send({ image_url: profile.home_image_url, cached: true });
  }

  const placeholder = `https://placehold.co/600x600/0c0c0c/ffffff.png?text=${encodeURIComponent(profile.full_name || 'Athlete')}`;
  const updated = await updateProfile(auth.user.id, {
    home_image_url: placeholder,
    home_image_signature: signature,
    home_image_generated_at: new Date().toISOString(),
    country_region: region,
  });
  return reply.send({ image_url: updated?.home_image_url ?? placeholder, cached: false });
});

await app.listen({ port, host });
app.log.info(`Fitown backend running on http://${host}:${port} (Postgres)`);
