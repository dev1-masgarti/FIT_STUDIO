import { backendFetch, getSessionToken } from '@/lib/backend/client';

type WrappedGrantKeyInput = {
  accessGrantId: string;
  clientId: string;
  granteeId: string;
  granteeDeviceId: string | null;
  wrappedKeyCiphertext: string;
  wrappedKeyNonce: string;
  keyVersion: number;
};

export const acceptShareInviteToken = async (tokenHash: string): Promise<string> => {
  const token = await getSessionToken();
  const response = await backendFetch<{ grant_id: string }>('/share/accept-invite', {
    method: 'POST',
    token,
    body: {
      token: tokenHash,
    },
  });
  return response.grant_id;
};

export const upsertGrantWrappedKey = async (
  input: WrappedGrantKeyInput,
): Promise<void> => {
  const token = await getSessionToken();
  await backendFetch('/share/wrapped-key', {
    method: 'POST',
    token,
    body: {
      access_grant_id: input.accessGrantId,
      client_id: input.clientId,
      grantee_id: input.granteeId,
      grantee_device_id: input.granteeDeviceId,
      wrapped_key_ciphertext: input.wrappedKeyCiphertext,
      wrapped_key_nonce: input.wrappedKeyNonce,
      key_version: input.keyVersion,
      is_active: true,
    },
  });
};

export const revokeGrantWrappedKeys = async (
  accessGrantId: string,
  keyVersion: number,
): Promise<void> => {
  const token = await getSessionToken();
  await backendFetch('/share/wrapped-key/revoke', {
    method: 'POST',
    token,
    body: {
      access_grant_id: accessGrantId,
      key_version: keyVersion,
    },
  });
};
