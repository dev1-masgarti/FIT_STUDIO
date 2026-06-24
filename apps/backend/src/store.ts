import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

export type DeviceRecord = {
  id: string;
  userId: string;
  deviceLabel: string;
  identityKeyPublic: string;
  signingKeyPublic: string;
  registrationId: number;
  isRevoked: boolean;
  lastSeenAt: string;
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

export type AppStore = {
  users: UserRecord[];
  profiles: ProfileRecord[];
  syncBlobs: SyncBlob[];
  devices: DeviceRecord[];
  messageEnvelopes: MessageEnvelope[];
  wrappedGrantKeys: WrappedGrantKey[];
  revokedTokens: string[];
};

const storePath = path.resolve(process.cwd(), 'apps/backend/data/store.json');

const emptyStore = (): AppStore => ({
  users: [],
  profiles: [],
  syncBlobs: [],
  devices: [],
  messageEnvelopes: [],
  wrappedGrantKeys: [],
  revokedTokens: [],
});

let cache: AppStore | null = null;

const ensureParent = async () => {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
};

export const loadStore = async (): Promise<AppStore> => {
  if (cache) return cache;
  await ensureParent();
  try {
    const content = await fs.readFile(storePath, 'utf8');
    cache = JSON.parse(content) as AppStore;
    return cache;
  } catch {
    cache = emptyStore();
    await saveStore(cache);
    return cache;
  }
};

export const saveStore = async (next: AppStore): Promise<void> => {
  cache = next;
  await ensureParent();
  await fs.writeFile(storePath, JSON.stringify(next, null, 2), 'utf8');
};

export const uid = () => crypto.randomUUID();

export const hashPassword = (password: string): { hash: string; salt: string } => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return { hash, salt };
};

export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const computed = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
};
