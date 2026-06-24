import { getDb } from './client.js';

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  fullName: string;
  createdAt: string;
};

export type ProfileRecord = {
  id: string;
  full_name: string;
  age: number | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  country_region: string | null;
  height_cm: number | null;
  body_weight_kg: number | null;
  focus: string[];
  role: 'client' | 'professional';
  onboarding_complete: boolean;
  home_image_url: string | null;
  home_image_signature: string | null;
  home_image_generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SyncBlob = {
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
};

export type MessageEnvelope = {
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
};

export type WrappedGrantKey = {
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
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  full_name: string;
  created_at: Date;
};

type ProfileRow = {
  id: string;
  full_name: string;
  age: number | null;
  date_of_birth: Date | null;
  gender: ProfileRecord['gender'];
  country_region: string | null;
  height_cm: number | null;
  body_weight_kg: string | number | null;
  focus: string[];
  role: ProfileRecord['role'];
  onboarding_complete: boolean;
  home_image_url: string | null;
  home_image_signature: string | null;
  home_image_generated_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

const toIso = (value: Date | null | undefined): string | null =>
  value ? value.toISOString() : null;

const toDateOnly = (value: Date | null | undefined): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

const mapUser = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  passwordSalt: row.password_salt,
  fullName: row.full_name,
  createdAt: row.created_at.toISOString(),
});

const mapProfile = (row: ProfileRow): ProfileRecord => ({
  id: row.id,
  full_name: row.full_name,
  age: row.age,
  date_of_birth: toDateOnly(row.date_of_birth),
  gender: row.gender,
  country_region: row.country_region,
  height_cm: row.height_cm,
  body_weight_kg:
    row.body_weight_kg == null ? null : Number.parseFloat(String(row.body_weight_kg)),
  focus: row.focus ?? [],
  role: row.role,
  onboarding_complete: row.onboarding_complete,
  home_image_url: row.home_image_url,
  home_image_signature: row.home_image_signature,
  home_image_generated_at: toIso(row.home_image_generated_at),
  created_at: row.created_at.toISOString(),
  updated_at: row.updated_at.toISOString(),
});

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const sql = getDb();
  const rows = await sql<UserRow[]>`
    SELECT id, email, password_hash, password_salt, full_name, created_at
    FROM public.backend_users
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `;
  return rows[0] ? mapUser(rows[0]) : null;
};

export const findUserById = async (userId: string): Promise<UserRecord | null> => {
  const sql = getDb();
  const rows = await sql<UserRow[]>`
    SELECT id, email, password_hash, password_salt, full_name, created_at
    FROM public.backend_users
    WHERE id = ${userId}::uuid
    LIMIT 1
  `;
  return rows[0] ? mapUser(rows[0]) : null;
};

export const createUserWithProfile = async (input: {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<{ user: UserRecord; profile: ProfileRecord }> => {
  const sql = getDb();
  const now = new Date().toISOString();

  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO public.backend_users (id, email, password_hash, password_salt, full_name, created_at)
      VALUES (
        ${input.id}::uuid,
        ${input.email},
        ${input.passwordHash},
        ${input.passwordSalt},
        ${input.fullName},
        ${now}::timestamptz
      )
    `;
    await tx`
      INSERT INTO public.backend_profiles (
        id, full_name, role, onboarding_complete, created_at, updated_at
      )
      VALUES (
        ${input.id}::uuid,
        ${input.fullName},
        'client',
        false,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
  });

  const user = await findUserById(input.id);
  const profile = await findProfileByUserId(input.id);
  if (!user || !profile) {
    throw new Error('Failed to create user profile');
  }
  return { user, profile };
};

export const upsertSocialUser = async (input: {
  email: string;
  fullName: string;
  passwordHash: string;
  passwordSalt: string;
  userId: string;
}): Promise<UserRecord> => {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    if (input.fullName && existing.fullName !== input.fullName) {
      await updateProfile(existing.id, { full_name: input.fullName });
      await getDb()`
        UPDATE public.backend_users
        SET full_name = ${input.fullName}
        WHERE id = ${existing.id}::uuid
      `;
      return { ...existing, fullName: input.fullName };
    }
    return existing;
  }

  const { user } = await createUserWithProfile({
    id: input.userId,
    email: input.email,
    fullName: input.fullName,
    passwordHash: input.passwordHash,
    passwordSalt: input.passwordSalt,
  });
  return user;
};

export const findProfileByUserId = async (userId: string): Promise<ProfileRecord | null> => {
  const sql = getDb();
  const rows = await sql<ProfileRow[]>`
    SELECT *
    FROM public.backend_profiles
    WHERE id = ${userId}::uuid
    LIMIT 1
  `;
  return rows[0] ? mapProfile(rows[0]) : null;
};

export const updateProfile = async (
  userId: string,
  patch: Partial<
    Pick<
      ProfileRecord,
      | 'full_name'
      | 'age'
      | 'date_of_birth'
      | 'gender'
      | 'country_region'
      | 'height_cm'
      | 'body_weight_kg'
      | 'focus'
      | 'onboarding_complete'
      | 'home_image_url'
      | 'home_image_signature'
      | 'home_image_generated_at'
    >
  >,
): Promise<ProfileRecord | null> => {
  const current = await findProfileByUserId(userId);
  if (!current) return null;

  const next: ProfileRecord = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const sql = getDb();
  const rows = await sql<ProfileRow[]>`
    UPDATE public.backend_profiles
    SET
      full_name = ${next.full_name},
      age = ${next.age},
      date_of_birth = ${next.date_of_birth}::date,
      gender = ${next.gender},
      country_region = ${next.country_region},
      height_cm = ${next.height_cm},
      body_weight_kg = ${next.body_weight_kg},
      focus = ${next.focus},
      onboarding_complete = ${next.onboarding_complete},
      home_image_url = ${next.home_image_url},
      home_image_signature = ${next.home_image_signature},
      home_image_generated_at = ${next.home_image_generated_at}::timestamptz,
      updated_at = now()
    WHERE id = ${userId}::uuid
    RETURNING *
  `;
  return rows[0] ? mapProfile(rows[0]) : null;
};

export const revokeToken = async (token: string): Promise<void> => {
  const sql = getDb();
  await sql`
    INSERT INTO public.backend_revoked_tokens (token)
    VALUES (${token})
    ON CONFLICT (token) DO NOTHING
  `;
};

export const isTokenRevoked = async (token: string): Promise<boolean> => {
  const sql = getDb();
  const rows = await sql<{ token: string }[]>`
    SELECT token FROM public.backend_revoked_tokens WHERE token = ${token} LIMIT 1
  `;
  return rows.length > 0;
};

export const registerDevice = async (input: {
  userId: string;
  deviceId: string;
  deviceLabel: string;
  identityKeyPublic: string;
  signingKeyPublic: string;
  registrationId: number;
}): Promise<string> => {
  const sql = getDb();
  const rows = await sql<{ id: string }[]>`
    INSERT INTO public.backend_devices (
      id, user_id, device_label, identity_key_public, signing_key_public, registration_id, last_seen_at
    )
    VALUES (
      ${input.deviceId}::uuid,
      ${input.userId}::uuid,
      ${input.deviceLabel},
      ${input.identityKeyPublic},
      ${input.signingKeyPublic},
      ${input.registrationId},
      now()
    )
    ON CONFLICT (user_id, registration_id)
    DO UPDATE SET last_seen_at = now()
    RETURNING id
  `;
  return rows[0]?.id ?? input.deviceId;
};

export const pushSyncBlobs = async (
  ownerId: string,
  changes: Array<{
    entity_type: string;
    entity_id: string;
    payload_ciphertext: string;
    payload_nonce: string;
    key_version: number;
    idempotency_key: string;
    record_version: number;
    is_deleted: boolean;
  }>,
): Promise<number> => {
  const sql = getDb();
  let inserted = 0;

  for (const item of changes) {
    if (!item.idempotency_key) continue;
    const rows = await sql<{ id: string }[]>`
      INSERT INTO public.backend_sync_blobs (
        owner_id, entity_type, entity_id, payload_ciphertext, payload_nonce,
        key_version, idempotency_key, record_version, is_deleted, updated_at
      )
      VALUES (
        ${ownerId}::uuid,
        ${item.entity_type},
        ${item.entity_id},
        ${item.payload_ciphertext},
        ${item.payload_nonce},
        ${item.key_version},
        ${item.idempotency_key},
        ${item.record_version},
        ${item.is_deleted},
        now()
      )
      ON CONFLICT (owner_id, idempotency_key) DO NOTHING
      RETURNING id
    `;
    if (rows.length > 0) inserted += 1;
  }

  return inserted;
};

export const pullSyncBlobs = async (
  ownerId: string,
  since: string,
): Promise<
  Array<{
    entity_type: string;
    entity_id: string;
    payload_ciphertext: string;
    payload_nonce: string;
    key_version: number;
    record_version: number;
    is_deleted: boolean;
    updated_at: string;
  }>
> => {
  const sql = getDb();
  const rows = await sql<
    Array<{
      entity_type: string;
      entity_id: string;
      payload_ciphertext: string;
      payload_nonce: string;
      key_version: number;
      record_version: string;
      is_deleted: boolean;
      updated_at: Date;
    }>
  >`
    SELECT entity_type, entity_id, payload_ciphertext, payload_nonce, key_version,
           record_version, is_deleted, updated_at
    FROM public.backend_sync_blobs
    WHERE owner_id = ${ownerId}::uuid
      AND updated_at > ${since}::timestamptz
    ORDER BY updated_at ASC
    LIMIT 300
  `;

  return rows.map((row) => ({
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    payload_ciphertext: row.payload_ciphertext,
    payload_nonce: row.payload_nonce,
    key_version: row.key_version,
    record_version: Number(row.record_version),
    is_deleted: row.is_deleted,
    updated_at: row.updated_at.toISOString(),
  }));
};

export const insertMessageEnvelope = async (envelope: MessageEnvelope): Promise<void> => {
  const sql = getDb();
  await sql`
    INSERT INTO public.backend_message_envelopes (
      id, conversation_id, sender_user_id, sender_device_id, recipient_user_id,
      payload_ciphertext, payload_nonce, key_version, idempotency_key, created_at,
      delivered_at, read_at
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
  `;
};

export const listMessageEnvelopes = async (
  conversationId: string,
  userId: string,
): Promise<MessageEnvelope[]> => {
  const sql = getDb();
  const rows = await sql<
    Array<{
      id: string;
      conversation_id: string;
      sender_user_id: string;
      sender_device_id: string;
      recipient_user_id: string;
      payload_ciphertext: string;
      payload_nonce: string;
      key_version: number;
      idempotency_key: string;
      created_at: Date;
      delivered_at: Date | null;
      read_at: Date | null;
    }>
  >`
    SELECT *
    FROM public.backend_message_envelopes
    WHERE conversation_id = ${conversationId}
      AND (sender_user_id = ${userId}::uuid OR recipient_user_id = ${userId}::uuid)
    ORDER BY created_at ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderUserId: row.sender_user_id,
    senderDeviceId: row.sender_device_id,
    recipientUserId: row.recipient_user_id,
    payloadCiphertext: row.payload_ciphertext,
    payloadNonce: row.payload_nonce,
    keyVersion: row.key_version,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at.toISOString(),
    deliveredAt: toIso(row.delivered_at),
    readAt: toIso(row.read_at),
  }));
};

export const updateMessageReceipt = async (
  messageId: string,
  recipientUserId: string,
  status: 'delivered' | 'read',
): Promise<MessageEnvelope | null> => {
  const sql = getDb();
  const rows =
    status === 'read'
      ? await sql<
          Array<{
            id: string;
            conversation_id: string;
            sender_user_id: string;
            sender_device_id: string;
            recipient_user_id: string;
            payload_ciphertext: string;
            payload_nonce: string;
            key_version: number;
            idempotency_key: string;
            created_at: Date;
            delivered_at: Date | null;
            read_at: Date | null;
          }>
        >`
          UPDATE public.backend_message_envelopes
          SET read_at = now()
          WHERE id = ${messageId}::uuid
            AND recipient_user_id = ${recipientUserId}::uuid
          RETURNING *
        `
      : await sql<
          Array<{
            id: string;
            conversation_id: string;
            sender_user_id: string;
            sender_device_id: string;
            recipient_user_id: string;
            payload_ciphertext: string;
            payload_nonce: string;
            key_version: number;
            idempotency_key: string;
            created_at: Date;
            delivered_at: Date | null;
            read_at: Date | null;
          }>
        >`
          UPDATE public.backend_message_envelopes
          SET delivered_at = now()
          WHERE id = ${messageId}::uuid
            AND recipient_user_id = ${recipientUserId}::uuid
          RETURNING *
        `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderUserId: row.sender_user_id,
    senderDeviceId: row.sender_device_id,
    recipientUserId: row.recipient_user_id,
    payloadCiphertext: row.payload_ciphertext,
    payloadNonce: row.payload_nonce,
    keyVersion: row.key_version,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at.toISOString(),
    deliveredAt: toIso(row.delivered_at),
    readAt: toIso(row.read_at),
  };
};

export const insertWrappedGrantKey = async (row: WrappedGrantKey): Promise<void> => {
  const sql = getDb();
  await sql`
    INSERT INTO public.backend_wrapped_grant_keys (
      id, access_grant_id, client_id, grantee_id, grantee_device_id,
      wrapped_key_ciphertext, wrapped_key_nonce, key_version, is_active, revoked_at, created_at
    )
    VALUES (
      ${row.id}::uuid,
      ${row.accessGrantId},
      ${row.clientId}::uuid,
      ${row.granteeId}::uuid,
      ${row.granteeDeviceId},
      ${row.wrappedKeyCiphertext},
      ${row.wrappedKeyNonce},
      ${row.keyVersion},
      ${row.isActive},
      ${row.revokedAt},
      ${row.createdAt}::timestamptz
    )
  `;
};

export const revokeWrappedGrantKeys = async (input: {
  clientId: string;
  accessGrantId: string;
  keyVersion?: number;
}): Promise<Array<{ granteeId: string; accessGrantId: string }>> => {
  const sql = getDb();
  const rows = await sql<Array<{ grantee_id: string; access_grant_id: string }>>`
    UPDATE public.backend_wrapped_grant_keys
    SET
      is_active = false,
      revoked_at = now(),
      key_version = COALESCE(${input.keyVersion ?? null}, key_version)
    WHERE client_id = ${input.clientId}::uuid
      AND access_grant_id = ${input.accessGrantId}
      AND is_active = true
    RETURNING grantee_id, access_grant_id
  `;
  return rows.map((row) => ({
    granteeId: row.grantee_id,
    accessGrantId: row.access_grant_id,
  }));
};
