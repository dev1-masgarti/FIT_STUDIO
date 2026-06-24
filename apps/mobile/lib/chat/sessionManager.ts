import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

import { registerDeviceKeys } from '@/lib/crypto/deviceKeys';

export type ChatSessionContext = {
  selfUserId: string;
  peerUserId: string;
  peerPublicKey: string;
  sharedSecret: string;
};

export const buildChatSession = async (
  selfUserId: string,
  peerUserId: string,
  peerPublicKey: string,
): Promise<ChatSessionContext> => {
  const { bundle } = await registerDeviceKeys(selfUserId, 'primary-mobile');
  const shared = nacl.box.before(
    decodeBase64(peerPublicKey),
    decodeBase64(bundle.identitySecretKey),
  );
  return {
    selfUserId,
    peerUserId,
    peerPublicKey,
    sharedSecret: encodeBase64(shared),
  };
};

export const encryptChatMessage = (
  context: ChatSessionContext,
  plaintext: string,
): { ciphertext: string; nonce: string; keyVersion: number } => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const message = new TextEncoder().encode(plaintext);
  const ciphertext = nacl.box.after(
    message,
    nonce,
    decodeBase64(context.sharedSecret),
  );
  return {
    ciphertext: encodeBase64(ciphertext),
    nonce: encodeBase64(nonce),
    keyVersion: 1,
  };
};

export const decryptChatMessage = (
  context: ChatSessionContext,
  ciphertext: string,
  nonce: string,
): string | null => {
  const opened = nacl.box.open.after(
    decodeBase64(ciphertext),
    decodeBase64(nonce),
    decodeBase64(context.sharedSecret),
  );
  if (!opened) return null;
  return new TextDecoder().decode(new Uint8Array(opened));
};
