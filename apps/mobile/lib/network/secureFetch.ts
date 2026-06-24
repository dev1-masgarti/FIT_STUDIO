import { assertHttpsUrl, trustedHostnames } from '@/constants/security';

const isTrustedHostname = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  trustedHostnames.some((trusted) => trusted === hostname);

/**
 * Secure transport guard.
 * Note: True certificate/public-key pinning requires native transport hooks.
 * In this phase we enforce HTTPS + strict host allowlist in JS and keep
 * all high-risk actions server-side with rate limits + audit trails.
 */
export const secureFetch = async (
  input: string,
  init?: RequestInit,
): Promise<Response> => {
  assertHttpsUrl(input);
  const url = new URL(input);
  if (!isTrustedHostname(url.hostname)) {
    throw new Error(`Untrusted host blocked: ${url.hostname}`);
  }

  const nextHeaders = new Headers(init?.headers ?? {});
  if (!nextHeaders.has('X-Fitown-Client')) {
    nextHeaders.set('X-Fitown-Client', 'mobile');
  }

  return fetch(input, {
    ...init,
    headers: nextHeaders,
  });
};
