import { backendFetch, getSessionToken } from '@/lib/backend/client';
import {
  bumpOutboxRetry,
  deleteOutboxItem,
  enqueueOutboxItem,
  listOutboxItems,
  upsertEncryptedRecord,
  type SyncOutboxItem,
} from '@/lib/localdb/encryptedStore';

type QueueEncryptedChangeInput = {
  entityType: string;
  entityId: string;
  payloadCiphertext: string;
  payloadNonce: string;
  keyVersion: number;
  recordVersion: number;
  isDeleted?: boolean;
};

const randomId = () =>
  `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;

export const queueEncryptedChange = async (
  input: QueueEncryptedChangeInput,
): Promise<void> => {
  const nowIso = new Date().toISOString();
  const item: SyncOutboxItem = {
    id: randomId(),
    entityType: input.entityType,
    entityId: input.entityId,
    payloadCiphertext: input.payloadCiphertext,
    payloadNonce: input.payloadNonce,
    keyVersion: input.keyVersion,
    recordVersion: input.recordVersion,
    idempotencyKey: randomId(),
    isDeleted: Boolean(input.isDeleted),
    createdAt: nowIso,
    retryCount: 0,
  };
  await enqueueOutboxItem(item);
};

export const flushSyncOutbox = async (): Promise<{ pushed: number; failed: number }> => {
  const pending = await listOutboxItems(200);
  if (pending.length === 0) return { pushed: 0, failed: 0 };

  const payload = pending.map((item) => ({
    entity_type: item.entityType,
    entity_id: item.entityId,
    payload_ciphertext: item.payloadCiphertext,
    payload_nonce: item.payloadNonce,
    key_version: item.keyVersion,
    idempotency_key: item.idempotencyKey,
    record_version: item.recordVersion,
    is_deleted: item.isDeleted,
  }));

  const token = await getSessionToken();
  try {
    await backendFetch('/sync/push', {
      method: 'POST',
      token,
      body: { changes: payload },
    });
  } catch {
    await Promise.all(pending.map((item) => bumpOutboxRetry(item.id)));
    return { pushed: 0, failed: pending.length };
  }

  await Promise.all(pending.map((item) => deleteOutboxItem(item.id)));
  return { pushed: pending.length, failed: 0 };
};

export const pullEncryptedChanges = async (
  since: string,
): Promise<{ nextSince: string }> => {
  const token = await getSessionToken();
  let data: Array<Record<string, unknown>> = [];
  try {
    const result = await backendFetch<{ changes: Array<Record<string, unknown>> }>(
      `/sync/pull?since=${encodeURIComponent(since)}`,
      { token },
    );
    data = result.changes ?? [];
  } catch {
    return { nextSince: since };
  }

  let latest = since;
  for (const row of data as Array<Record<string, unknown>>) {
    const updatedAt = String(row.updated_at ?? since);
    if (updatedAt > latest) latest = updatedAt;

    await upsertEncryptedRecord({
      entity_type: String(row.entity_type),
      entity_id: String(row.entity_id),
      payload_ciphertext: String(row.payload_ciphertext),
      payload_nonce: String(row.payload_nonce),
      key_version: Number(row.key_version ?? 1),
      record_version: Number(row.record_version ?? 1),
      updated_at: updatedAt,
    });
  }

  return { nextSince: latest };
};
