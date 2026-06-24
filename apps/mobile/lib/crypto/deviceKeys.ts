import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

import '@/lib/crypto/secureRandom';
import { backendFetch, getSessionToken } from '@/lib/backend/client';

const KEYPAIR_PREFIX = 'fitown_e2ee_device_keypair_v1';
const SIGNING_PREFIX = 'fitown_e2ee_signing_keypair_v1';
const REGISTRATION_PREFIX = 'fitown_e2ee_registration_v1';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: 'fitown.secure',
};

const sanitizeSecureStorePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, '_');

const secureStoreKey = (prefix: string, userId: string): string =>
  `${prefix}_${sanitizeSecureStorePart(userId)}`;

export type DeviceKeyBundle = {
  identityPublicKey: string;
  identitySecretKey: string;
  signingPublicKey: string;
  signingSecretKey: string;
  registrationId: number;
};

const randomRegistrationId = async (): Promise<number> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}-${Math.random()}-${Math.random()}`,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  return parseInt(digest.slice(0, 8), 16);
};

const getOrCreate = async (userId: string): Promise<DeviceKeyBundle> => {
  const keyPairKey = secureStoreKey(KEYPAIR_PREFIX, userId);
  const signPairKey = secureStoreKey(SIGNING_PREFIX, userId);
  const registrationKey = secureStoreKey(REGISTRATION_PREFIX, userId);

  const existingIdentity = await SecureStore.getItemAsync(keyPairKey, secureStoreOptions);
  const existingSign = await SecureStore.getItemAsync(signPairKey, secureStoreOptions);
  const existingRegistration = await SecureStore.getItemAsync(registrationKey, secureStoreOptions);

  if (existingIdentity && existingSign && existingRegistration) {
    return {
      ...JSON.parse(existingIdentity),
      ...JSON.parse(existingSign),
      registrationId: Number(existingRegistration),
    } as DeviceKeyBundle;
  }

  const identity = nacl.box.keyPair();
  const signing = nacl.sign.keyPair();
  const registrationId = await randomRegistrationId();

  const bundle: DeviceKeyBundle = {
    identityPublicKey: encodeBase64(identity.publicKey),
    identitySecretKey: encodeBase64(identity.secretKey),
    signingPublicKey: encodeBase64(signing.publicKey),
    signingSecretKey: encodeBase64(signing.secretKey),
    registrationId,
  };

  await SecureStore.setItemAsync(
    keyPairKey,
    JSON.stringify({
      identityPublicKey: bundle.identityPublicKey,
      identitySecretKey: bundle.identitySecretKey,
    }),
    secureStoreOptions,
  );
  await SecureStore.setItemAsync(
    signPairKey,
    JSON.stringify({
      signingPublicKey: bundle.signingPublicKey,
      signingSecretKey: bundle.signingSecretKey,
    }),
    secureStoreOptions,
  );
  await SecureStore.setItemAsync(registrationKey, String(registrationId), secureStoreOptions);

  return bundle;
};

export const registerDeviceKeys = async (
  userId: string,
  deviceLabel: string,
): Promise<{ deviceId: string; bundle: DeviceKeyBundle }> => {
  const bundle = await getOrCreate(userId);
  const token = await getSessionToken();
  const response = await backendFetch<{ deviceId: string }>('/devices/register', {
    method: 'POST',
    token,
    body: {
      user_id: userId,
      device_label: deviceLabel,
      identity_key_public: bundle.identityPublicKey,
      signing_key_public: bundle.signingPublicKey,
      registration_id: bundle.registrationId,
    },
  });
  return { deviceId: response.deviceId, bundle };
};
