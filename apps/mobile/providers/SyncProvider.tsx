import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

import { useAuth } from '@/providers/AuthProvider';
import { flushSyncOutbox, pullEncryptedChanges } from '@/lib/sync/syncEngine';

const SYNC_CURSOR_KEY_PREFIX = 'fitown_sync_cursor_v1';
const SYNC_INTERVAL_MS = 20_000;

const sanitizeSecureStorePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, '_');

const cursorKey = (userId: string): string =>
  `${SYNC_CURSOR_KEY_PREFIX}_${sanitizeSecureStorePart(userId)}`;

type SyncContextValue = {
  triggerSync: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

const getCursor = async (userId: string): Promise<string> => {
  const value = await SecureStore.getItemAsync(cursorKey(userId));
  return value ?? new Date(0).toISOString();
};

const setCursor = async (userId: string, next: string): Promise<void> => {
  await SecureStore.setItemAsync(cursorKey(userId), next);
};

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { session, isConfigured } = useAuth();
  const busyRef = useRef(false);

  const triggerSync = async () => {
    if (!isConfigured || !session?.user.id || busyRef.current) return;
    busyRef.current = true;
    try {
      await flushSyncOutbox();
      const cursor = await getCursor(session.user.id);
      const { nextSince } = await pullEncryptedChanges(cursor);
      await setCursor(session.user.id, nextSince);
    } catch (error) {
      console.warn('[sync] failed:', error);
    } finally {
      busyRef.current = false;
    }
  };

  useEffect(() => {
    if (!isConfigured || !session?.user.id) return;
    triggerSync().catch(() => undefined);
    const timer = setInterval(() => {
      triggerSync().catch(() => undefined);
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isConfigured, session?.user.id]);

  const value = useMemo<SyncContextValue>(
    () => ({
      triggerSync,
    }),
    [isConfigured, session?.user.id],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextValue => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
};
