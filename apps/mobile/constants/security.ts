export const securityFlags = {
  e2eeKeysEnabled: true,
  encryptedSyncEnabled: true,
  e2eeChatEnabled: true,
} as const;

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

const backendHostname = (() => {
  try {
    return backendUrl ? new URL(backendUrl).hostname : null;
  } catch {
    return null;
  }
})();

export const trustedHostnames = [backendHostname].filter((value): value is string => Boolean(value));

const isLocalDevHost = (parsed: URL): boolean =>
  (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
  process.env.NODE_ENV !== 'production';

export const assertHttpsUrl = (url: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL for secure transport');
  }

  if (parsed.protocol !== 'https:' && !isLocalDevHost(parsed)) {
    throw new Error(`Insecure transport blocked for URL: ${parsed.href}`);
  }
};
