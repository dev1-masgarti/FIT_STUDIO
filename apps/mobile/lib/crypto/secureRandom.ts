import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';

/**
 * tweetnacl resolves its PRNG at module-load time by probing for a global
 * `crypto.getRandomValues`. On React Native that polyfill is not guaranteed to
 * be installed before tweetnacl initializes, which surfaces as a runtime
 * "no PRNG" error. We explicitly back tweetnacl with expo-crypto's native CSPRNG
 * so key generation always has a secure source.
 */
let configured = false;

export const ensureSecureRandom = (): void => {
  if (configured) return;

  nacl.setPRNG((output: Uint8Array, length: number) => {
    let remaining = length;
    let offset = 0;
    // expo-crypto caps getRandomBytes at 1024 bytes per call.
    while (remaining > 0) {
      const chunk = Math.min(remaining, 1024);
      const bytes = Crypto.getRandomBytes(chunk);
      output.set(bytes, offset);
      offset += chunk;
      remaining -= chunk;
    }
  });

  configured = true;
};

ensureSecureRandom();
