import * as SQLite from 'expo-sqlite';

type EncryptedRecordRow = {
  entity_type: string;
  entity_id: string;
  payload_ciphertext: string;
  payload_nonce: string;
  key_version: number;
  record_version: number;
  updated_at: string;
};

export type SyncOutboxItem = {
  id: string;
  entityType: string;
  entityId: string;
  payloadCiphertext: string;
  payloadNonce: string;
  keyVersion: number;
  recordVersion: number;
  idempotencyKey: string;
  isDeleted: boolean;
  createdAt: string;
  retryCount: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('fitown-local.db');
    const db = await dbPromise;
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS encrypted_records (
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload_ciphertext TEXT NOT NULL,
        payload_nonce TEXT NOT NULL,
        key_version INTEGER NOT NULL DEFAULT 1,
        record_version INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (entity_type, entity_id)
      );

      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload_ciphertext TEXT NOT NULL,
        payload_nonce TEXT NOT NULL,
        key_version INTEGER NOT NULL DEFAULT 1,
        record_version INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  return dbPromise;
};

export const upsertEncryptedRecord = async (row: EncryptedRecordRow): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO encrypted_records (
      entity_type, entity_id, payload_ciphertext, payload_nonce, key_version, record_version, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(entity_type, entity_id)
    DO UPDATE SET
      payload_ciphertext = excluded.payload_ciphertext,
      payload_nonce = excluded.payload_nonce,
      key_version = excluded.key_version,
      record_version = excluded.record_version,
      updated_at = excluded.updated_at`,
    [
      row.entity_type,
      row.entity_id,
      row.payload_ciphertext,
      row.payload_nonce,
      row.key_version,
      row.record_version,
      row.updated_at,
    ],
  );
};

export const getEncryptedRecord = async (
  entityType: string,
  entityId: string,
): Promise<EncryptedRecordRow | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<EncryptedRecordRow>(
    `SELECT entity_type, entity_id, payload_ciphertext, payload_nonce, key_version, record_version, updated_at
     FROM encrypted_records
     WHERE entity_type = ? AND entity_id = ?
     LIMIT 1`,
    [entityType, entityId],
  );
  return row ?? null;
};

export const listEncryptedRecordsByType = async (
  entityType: string,
): Promise<EncryptedRecordRow[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<EncryptedRecordRow>(
    `SELECT entity_type, entity_id, payload_ciphertext, payload_nonce, key_version, record_version, updated_at
     FROM encrypted_records
     WHERE entity_type = ?
     ORDER BY updated_at DESC`,
    [entityType],
  );
  return rows ?? [];
};

export const deleteEncryptedRecord = async (
  entityType: string,
  entityId: string,
): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM encrypted_records WHERE entity_type = ? AND entity_id = ?',
    [entityType, entityId],
  );
};

export const enqueueOutboxItem = async (item: SyncOutboxItem): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_outbox (
      id, entity_type, entity_id, payload_ciphertext, payload_nonce, key_version, record_version,
      idempotency_key, is_deleted, created_at, retry_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.entityType,
      item.entityId,
      item.payloadCiphertext,
      item.payloadNonce,
      item.keyVersion,
      item.recordVersion,
      item.idempotencyKey,
      item.isDeleted ? 1 : 0,
      item.createdAt,
      item.retryCount,
    ],
  );
};

export const listOutboxItems = async (limit = 100): Promise<SyncOutboxItem[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    entity_type: string;
    entity_id: string;
    payload_ciphertext: string;
    payload_nonce: string;
    key_version: number;
    record_version: number;
    idempotency_key: string;
    is_deleted: number;
    created_at: string;
    retry_count: number;
  }>(
    `SELECT *
     FROM sync_outbox
     ORDER BY created_at ASC
     LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    payloadCiphertext: row.payload_ciphertext,
    payloadNonce: row.payload_nonce,
    keyVersion: row.key_version,
    recordVersion: row.record_version,
    idempotencyKey: row.idempotency_key,
    isDeleted: row.is_deleted === 1,
    createdAt: row.created_at,
    retryCount: row.retry_count,
  }));
};

export const deleteOutboxItem = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM sync_outbox WHERE id = ?', [id]);
};

export const bumpOutboxRetry = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE sync_outbox SET retry_count = retry_count + 1 WHERE id = ?',
    [id],
  );
};
