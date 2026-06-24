import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

import '@/lib/crypto/secureRandom';

const KEY_PREFIX = 'fitown_e2ee_master_key_v1';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: 'fitown.secure',
};

const sanitizeSecureStorePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, '_');

const masterKeyName = (userId: string): string =>
  `${KEY_PREFIX}_${sanitizeSecureStorePart(userId)}`;

const deriveKeyMaterial = async (
  baseKeyB64: string,
  context: string,
): Promise<Uint8Array> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${baseKeyB64}:${context}:fitown:v1`,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return decodeBase64(digest);
};

const getScopedMasterKey = async (userId: string): Promise<string> => {
  const keyName = masterKeyName(userId);
  const existing = await SecureStore.getItemAsync(keyName, secureStoreOptions);
  if (existing) return existing;

  const random = nacl.randomBytes(32);
  const next = encodeBase64(random);
  await SecureStore.setItemAsync(keyName, next, secureStoreOptions);
  return next;
};

export const encryptJsonPayload = async (
  userId: string,
  context: string,
  payload: unknown,
): Promise<{ ciphertext: string; nonce: string; keyVersion: number }> => {
  const masterKey = await getScopedMasterKey(userId);
  const derivedKey = await deriveKeyMaterial(masterKey, context);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const message = new TextEncoder().encode(JSON.stringify(payload));

  const ciphertext = nacl.secretbox(message, nonce, derivedKey);
  return {
    ciphertext: encodeBase64(ciphertext),
    nonce: encodeBase64(nonce),
    keyVersion: 1,
  };
};

export const decryptJsonPayload = async <T>(
  userId: string,
  context: string,
  ciphertext: string,
  nonce: string,
): Promise<T | null> => {
  const masterKey = await getScopedMasterKey(userId);
  const derivedKey = await deriveKeyMaterial(masterKey, context);
  const opened = nacl.secretbox.open(
    decodeBase64(ciphertext),
    decodeBase64(nonce),
    derivedKey,
  );
  if (!opened) return null;
  const text = new TextDecoder().decode(new Uint8Array(opened));
  return JSON.parse(text) as T;
};

export const removeMasterKey = async (userId: string): Promise<void> => {
  await SecureStore.deleteItemAsync(masterKeyName(userId), secureStoreOptions);
};
