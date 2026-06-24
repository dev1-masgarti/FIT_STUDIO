import AsyncStorage from '@react-native-async-storage/async-storage';

import { assertHttpsUrl } from '@/constants/security';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const SESSION_KEY = 'fitown_backend_session_v1';

export type AppSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
  expiresAt: number;
};

export const isBackendConfigured = (): boolean => {
  if (!backendUrl) return false;
  try {
    assertHttpsUrl(backendUrl);
    return true;
  } catch {
    return false;
  }
};

const endpoint = (path: string): string => {
  if (!isBackendConfigured()) {
    throw new Error(
      'Backend is not configured. Set EXPO_PUBLIC_BACKEND_URL in apps/mobile/.env.local',
    );
  }
  return `${backendUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

export const saveSession = async (session: AppSession | null): Promise<void> => {
  if (!session) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = async (): Promise<AppSession | null> => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.accessToken || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getSessionToken = async (): Promise<string | null> => {
  const session = await loadSession();
  return session?.accessToken ?? null;
};

export const backendFetch = async <T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown>;
    token?: string | null;
  },
): Promise<T> => {
  const response = await fetch(endpoint(path), {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `Backend request failed (${response.status})`);
  }
  return payload as T;
};
