/**
 * Local-first workout repository. Sessions are stored encrypted on-device and
 * queued for E2EE sync to the backend — nothing confidential leaves the device
 * in plaintext.
 */

import type { WorkoutSession } from '@fitown/types';

import { decryptJsonPayload, encryptJsonPayload } from '@/lib/crypto/encryption';
import {
  deleteEncryptedRecord,
  getEncryptedRecord,
  listEncryptedRecordsByType,
  upsertEncryptedRecord,
} from '@/lib/localdb/encryptedStore';
import { queueEncryptedChange } from '@/lib/sync/syncEngine';

const WORKOUT_ENTITY_TYPE = 'workout_session';

export const createId = (): string =>
  `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;

export const saveWorkoutSession = async (session: WorkoutSession): Promise<void> => {
  const recordVersion = Date.now();
  const updatedAt = new Date().toISOString();

  const cacheEncrypted = await encryptJsonPayload(
    session.owner_id,
    WORKOUT_ENTITY_TYPE,
    session,
  );
  await upsertEncryptedRecord({
    entity_type: WORKOUT_ENTITY_TYPE,
    entity_id: session.id,
    payload_ciphertext: cacheEncrypted.ciphertext,
    payload_nonce: cacheEncrypted.nonce,
    key_version: cacheEncrypted.keyVersion,
    record_version: recordVersion,
    updated_at: updatedAt,
  });

  const syncEncrypted = await encryptJsonPayload(
    session.owner_id,
    WORKOUT_ENTITY_TYPE,
    session,
  );
  await queueEncryptedChange({
    entityType: WORKOUT_ENTITY_TYPE,
    entityId: session.id,
    payloadCiphertext: syncEncrypted.ciphertext,
    payloadNonce: syncEncrypted.nonce,
    keyVersion: syncEncrypted.keyVersion,
    recordVersion,
  });
};

export const listWorkoutSessions = async (
  userId: string,
): Promise<WorkoutSession[]> => {
  const rows = await listEncryptedRecordsByType(WORKOUT_ENTITY_TYPE);
  const sessions: WorkoutSession[] = [];

  for (const row of rows) {
    const value = await decryptJsonPayload<WorkoutSession>(
      userId,
      WORKOUT_ENTITY_TYPE,
      row.payload_ciphertext,
      row.payload_nonce,
    );
    if (value && value.owner_id === userId) {
      sessions.push(value);
    }
  }

  return sessions.sort((a, b) => b.performed_at.localeCompare(a.performed_at));
};

export const getWorkoutSession = async (
  userId: string,
  sessionId: string,
): Promise<WorkoutSession | null> => {
  const row = await getEncryptedRecord(WORKOUT_ENTITY_TYPE, sessionId);
  if (!row) return null;
  const value = await decryptJsonPayload<WorkoutSession>(
    userId,
    WORKOUT_ENTITY_TYPE,
    row.payload_ciphertext,
    row.payload_nonce,
  );
  if (!value || value.owner_id !== userId) return null;
  return value;
};

export const deleteWorkoutSession = async (
  session: WorkoutSession,
): Promise<void> => {
  await deleteEncryptedRecord(WORKOUT_ENTITY_TYPE, session.id);
  const encrypted = await encryptJsonPayload(
    session.owner_id,
    WORKOUT_ENTITY_TYPE,
    session,
  );
  await queueEncryptedChange({
    entityType: WORKOUT_ENTITY_TYPE,
    entityId: session.id,
    payloadCiphertext: encrypted.ciphertext,
    payloadNonce: encrypted.nonce,
    keyVersion: encrypted.keyVersion,
    recordVersion: Date.now(),
    isDeleted: true,
  });
};
