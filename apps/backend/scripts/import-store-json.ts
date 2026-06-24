/**
 * One-time migration: apps/backend/data/store.json → Supabase Postgres (backend_* tables).
 *
 * Usage (from repo root):
 *   pnpm --filter @fitown/backend import:store
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

import '../src/load-env.js';
import { closeDb, getDb } from '../src/db/client.js';

type LegacyStore = {
  users: Array<{
    id: string;
    email: string;
    fullName: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
  }>;
  profiles: Array<{
    id: string;
    full_name: string;
    age: number | null;
    date_of_birth: string | null;
    gender: string | null;
    country_region: string | null;
    height_cm: number | null;
    body_weight_kg: number | null;
    focus: string[];
    role: string;
    onboarding_complete: boolean;
    home_image_url: string | null;
    home_image_signature: string | null;
    home_image_generated_at: string | null;
    created_at: string;
    updated_at: string;
  }>;
  devices: Array<{
    id: string;
    userId: string;
    deviceLabel: string;
    identityKeyPublic: string;
    signingKeyPublic: string;
    registrationId: number;
    isRevoked: boolean;
    lastSeenAt: string;
  }>;
  syncBlobs: Array<{
    id: string;
    ownerId: string;
    entityType: string;
    entityId: string;
    payloadCiphertext: string;
    payloadNonce: string;
    keyVersion: number;
    idempotencyKey: string;
    recordVersion: number;
    isDeleted: boolean;
    updatedAt: string;
  }>;
  messageEnvelopes: Array<{
    id: string;
    conversationId: string;
    senderUserId: string;
    senderDeviceId: string;
    recipientUserId: string;
    payloadCiphertext: string;
    payloadNonce: string;
    keyVersion: number;
    idempotencyKey: string;
    createdAt: string;
    deliveredAt: string | null;
    readAt: string | null;
  }>;
  wrappedGrantKeys: Array<{
    id: string;
    accessGrantId: string;
    clientId: string;
    granteeId: string;
    granteeDeviceId: string | null;
    wrappedKeyCiphertext: string;
    wrappedKeyNonce: string;
    keyVersion: number;
    isActive: boolean;
    revokedAt: string | null;
    createdAt: string;
  }>;
  revokedTokens: string[];
};

const storePath = path.resolve(import.meta.dirname, '../data/store.json');

const main = async (): Promise<void> => {
  if (!existsSync(storePath)) {
    console.log('No store.json found — nothing to import.');
    return;
  }

  const store = JSON.parse(readFileSync(storePath, 'utf8')) as LegacyStore;
  const sql = getDb();

  let users = 0;
  let profiles = 0;
  let devices = 0;

  for (const user of store.users) {
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO public.backend_users (id, email, password_hash, password_salt, full_name, created_at)
      VALUES (
        ${user.id}::uuid,
        ${user.email},
        ${user.passwordHash},
        ${user.passwordSalt},
        ${user.fullName},
        ${user.createdAt}::timestamptz
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    if (inserted.length > 0) users += 1;
  }

  for (const profile of store.profiles) {
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO public.backend_profiles (
        id, full_name, age, date_of_birth, gender, country_region, height_cm, body_weight_kg,
        focus, role, onboarding_complete, home_image_url, home_image_signature,
        home_image_generated_at, created_at, updated_at
      )
      VALUES (
        ${profile.id}::uuid,
        ${profile.full_name},
        ${profile.age},
        ${profile.date_of_birth}::date,
        ${profile.gender}::public.gender_type,
        ${profile.country_region},
        ${profile.height_cm},
        ${profile.body_weight_kg},
        ${profile.focus},
        ${profile.role}::public.fitown_user_role,
        ${profile.onboarding_complete},
        ${profile.home_image_url},
        ${profile.home_image_signature},
        ${profile.home_image_generated_at}::timestamptz,
        ${profile.created_at}::timestamptz,
        ${profile.updated_at}::timestamptz
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    if (inserted.length > 0) profiles += 1;
  }

  for (const device of store.devices) {
    const inserted = await sql<{ id: string }[]>`
      INSERT INTO public.backend_devices (
        id, user_id, device_label, identity_key_public, signing_key_public,
        registration_id, is_revoked, last_seen_at
      )
      VALUES (
        ${device.id}::uuid,
        ${device.userId}::uuid,
        ${device.deviceLabel},
        ${device.identityKeyPublic},
        ${device.signingKeyPublic},
        ${device.registrationId},
        ${device.isRevoked},
        ${device.lastSeenAt}::timestamptz
      )
      ON CONFLICT (user_id, registration_id) DO NOTHING
      RETURNING id
    `;
    if (inserted.length > 0) devices += 1;
  }

  for (const blob of store.syncBlobs) {
    await sql`
      INSERT INTO public.backend_sync_blobs (
        id, owner_id, entity_type, entity_id, payload_ciphertext, payload_nonce,
        key_version, idempotency_key, record_version, is_deleted, updated_at
      )
      VALUES (
        ${blob.id}::uuid,
        ${blob.ownerId}::uuid,
        ${blob.entityType},
        ${blob.entityId},
        ${blob.payloadCiphertext},
        ${blob.payloadNonce},
        ${blob.keyVersion},
        ${blob.idempotencyKey},
        ${blob.recordVersion},
        ${blob.isDeleted},
        ${blob.updatedAt}::timestamptz
      )
      ON CONFLICT (owner_id, idempotency_key) DO NOTHING
    `;
  }

  for (const envelope of store.messageEnvelopes) {
    await sql`
      INSERT INTO public.backend_message_envelopes (
        id, conversation_id, sender_user_id, sender_device_id, recipient_user_id,
        payload_ciphertext, payload_nonce, key_version, idempotency_key,
        created_at, delivered_at, read_at
      )
      VALUES (
        ${envelope.id}::uuid,
        ${envelope.conversationId},
        ${envelope.senderUserId}::uuid,
        ${envelope.senderDeviceId},
        ${envelope.recipientUserId}::uuid,
        ${envelope.payloadCiphertext},
        ${envelope.payloadNonce},
        ${envelope.keyVersion},
        ${envelope.idempotencyKey},
        ${envelope.createdAt}::timestamptz,
        ${envelope.deliveredAt},
        ${envelope.readAt}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const key of store.wrappedGrantKeys) {
    await sql`
      INSERT INTO public.backend_wrapped_grant_keys (
        id, access_grant_id, client_id, grantee_id, grantee_device_id,
        wrapped_key_ciphertext, wrapped_key_nonce, key_version, is_active, revoked_at, created_at
      )
      VALUES (
        ${key.id}::uuid,
        ${key.accessGrantId},
        ${key.clientId}::uuid,
        ${key.granteeId}::uuid,
        ${key.granteeDeviceId},
        ${key.wrappedKeyCiphertext},
        ${key.wrappedKeyNonce},
        ${key.keyVersion},
        ${key.isActive},
        ${key.revokedAt},
        ${key.createdAt}::timestamptz
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const token of store.revokedTokens) {
    await sql`
      INSERT INTO public.backend_revoked_tokens (token)
      VALUES (${token})
      ON CONFLICT (token) DO NOTHING
    `;
  }

  console.log(
    `Import complete: ${users} users, ${profiles} profiles, ${devices} devices, ` +
      `${store.syncBlobs.length} sync blobs, ${store.messageEnvelopes.length} messages.`,
  );
};

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
