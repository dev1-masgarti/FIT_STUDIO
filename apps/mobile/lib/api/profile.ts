/**
 * Postgres-backed repositories — queries map 1:1 to public.* tables.
 * Swap transport (Supabase REST → custom API) without changing callers.
 */

import type { OnboardingProfileInput, Profile, QuickProfileInput } from '@fitown/types';

import { backendFetch, getSessionToken } from '@/lib/backend/client';
import { decryptJsonPayload, encryptJsonPayload } from '@/lib/crypto/encryption';
import { getEncryptedRecord, upsertEncryptedRecord } from '@/lib/localdb/encryptedStore';
import { queueEncryptedChange } from '@/lib/sync/syncEngine';

const PROFILE_ENTITY_TYPE = 'profile';

const cacheEncryptedProfile = async (profile: Profile): Promise<void> => {
  const encrypted = await encryptJsonPayload(profile.id, PROFILE_ENTITY_TYPE, profile);
  await upsertEncryptedRecord({
    entity_type: PROFILE_ENTITY_TYPE,
    entity_id: profile.id,
    payload_ciphertext: encrypted.ciphertext,
    payload_nonce: encrypted.nonce,
    key_version: encrypted.keyVersion,
    record_version: Date.now(),
    updated_at: new Date().toISOString(),
  });
};

const loadCachedProfile = async (userId: string): Promise<Profile | null> => {
  const cached = await getEncryptedRecord(PROFILE_ENTITY_TYPE, userId);
  if (!cached) return null;
  const value = await decryptJsonPayload<Profile>(
    userId,
    PROFILE_ENTITY_TYPE,
    cached.payload_ciphertext,
    cached.payload_nonce,
  );
  return value;
};

const queueProfileChange = async (profile: Profile): Promise<void> => {
  const encrypted = await encryptJsonPayload(profile.id, PROFILE_ENTITY_TYPE, profile);
  await queueEncryptedChange({
    entityType: PROFILE_ENTITY_TYPE,
    entityId: profile.id,
    payloadCiphertext: encrypted.ciphertext,
    payloadNonce: encrypted.nonce,
    keyVersion: encrypted.keyVersion,
    recordVersion: Date.now(),
  });
};

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const token = await getSessionToken();
    const profile = await backendFetch<Profile>('/profile/me', { token });
    if (profile) {
      await cacheEncryptedProfile(profile);
    }
    return profile;
  } catch (error) {
    const cached = await loadCachedProfile(userId);
    if (cached) return cached;
    throw error;
  }
};

export const completeOnboarding = async (
  userId: string,
  input: OnboardingProfileInput,
): Promise<Profile> => {
  const updatePayload = {
    full_name: input.full_name,
    age: input.age,
    date_of_birth: input.date_of_birth,
    gender: input.gender,
    height_cm: input.height_cm,
    body_weight_kg: input.body_weight_kg,
    focus: input.focus,
    onboarding_complete: true,
  };

  try {
    const token = await getSessionToken();
    const profile = await backendFetch<Profile>('/profile/me', {
      method: 'PATCH',
      token,
      body: updatePayload,
    });
    await cacheEncryptedProfile(profile);
    return profile;
  } catch (error) {
    const fallback: Profile = {
      id: userId,
      full_name: input.full_name,
      age: input.age,
      date_of_birth: input.date_of_birth,
      gender: input.gender,
      country_region: null,
      height_cm: input.height_cm,
      body_weight_kg: input.body_weight_kg,
      home_image_url: null,
      home_image_signature: null,
      home_image_generated_at: null,
      focus: input.focus,
      experience_level: null,
      role: 'client',
      onboarding_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await cacheEncryptedProfile(fallback);
    await queueProfileChange(fallback);
    return fallback;
  }
};

export const updateQuickProfile = async (
  userId: string,
  input: QuickProfileInput,
): Promise<Profile> => {
  const updatePayload = {
    focus: input.focus,
    experience_level: input.experience_level,
    body_weight_kg: input.body_weight_kg,
    onboarding_complete: true,
  };

  try {
    const token = await getSessionToken();
    const profile = await backendFetch<Profile>('/profile/me', {
      method: 'PATCH',
      token,
      body: updatePayload,
    });
    await cacheEncryptedProfile(profile);
    return profile;
  } catch (error) {
    const existing = (await loadCachedProfile(userId)) ?? ({
      id: userId,
      full_name: '',
      age: null,
      date_of_birth: null,
      gender: null,
      country_region: null,
      height_cm: null,
      body_weight_kg: null,
      home_image_url: null,
      home_image_signature: null,
      home_image_generated_at: null,
      focus: [],
      experience_level: null,
      role: 'client',
      onboarding_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile);
    const fallback: Profile = {
      ...existing,
      focus: input.focus,
      experience_level: input.experience_level,
      body_weight_kg: input.body_weight_kg,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };
    await cacheEncryptedProfile(fallback);
    await queueProfileChange(fallback);
    return fallback;
  }
};

export const skipOnboarding = async (userId: string): Promise<Profile> => {
  try {
    const token = await getSessionToken();
    const profile = await backendFetch<Profile>('/profile/me', {
      method: 'PATCH',
      token,
      body: { onboarding_complete: true },
    });
    await cacheEncryptedProfile(profile);
    return profile;
  } catch (error) {
    const existing = await loadCachedProfile(userId);
    if (!existing) throw error;
    const fallback: Profile = {
      ...existing,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };
    await cacheEncryptedProfile(fallback);
    await queueProfileChange(fallback);
    return fallback;
  }
};

export const updateProfileName = async (
  userId: string,
  fullName: string,
): Promise<void> => {
  const token = await getSessionToken();
  await backendFetch('/profile/me', {
    method: 'PATCH',
    token,
    body: { full_name: fullName },
  });
};

export type PersonalDetailsInput = {
  full_name: string;
  date_of_birth: string | null;
  gender: Profile['gender'];
  height_cm: number | null;
  body_weight_kg: number | null;
};

const ageFromIsoDate = (value: string | null): number | null => {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

export const updatePersonalDetails = async (
  userId: string,
  input: PersonalDetailsInput,
): Promise<Profile> => {
  const token = await getSessionToken();
  const profile = await backendFetch<Profile>('/profile/me', {
    method: 'PATCH',
    token,
    body: {
      full_name: input.full_name,
      date_of_birth: input.date_of_birth,
      gender: input.gender,
      height_cm: input.height_cm,
      body_weight_kg: input.body_weight_kg,
      age: ageFromIsoDate(input.date_of_birth),
    },
  });
  await cacheEncryptedProfile(profile);
  return profile;
};
