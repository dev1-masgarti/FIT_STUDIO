import { AppState, type AppStateStatus } from 'react-native';
import { useEffect, useRef, type ReactNode } from 'react';

import { STREAMING_SETTINGS } from '@/constants/streaming';
import { createStreamingChannels } from '@/lib/realtime/streaming';
import { useSync } from '@/providers/SyncProvider';
import { useAuth } from '@/providers/AuthProvider';

export const StreamingProvider = ({ children }: { children: ReactNode }) => {
  const { session, isConfigured } = useAuth();
  const { triggerSync } = useSync();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const disposeRef = useRef<null | (() => Promise<void> | void)>(null);
  const resyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isConfigured || !session?.user.id || !session?.accessToken) return;

    const scheduleResync = () => {
      if (resyncTimeoutRef.current) clearTimeout(resyncTimeoutRef.current);
      resyncTimeoutRef.current = setTimeout(() => {
        triggerSync().catch(() => undefined);
      }, STREAMING_SETTINGS.resyncDebounceMs);
    };

    const handle = createStreamingChannels(session.accessToken, session.user.id, {
      onSyncChange: scheduleResync,
      onMessageEnvelope: scheduleResync,
    });
    disposeRef.current = handle.dispose;

    const appSub = AppState.addEventListener('change', (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;
      const becameActive = prevState.match(/inactive|background/) && nextState === 'active';
      if (becameActive) {
        triggerSync().catch(() => undefined);
      }
    });

    return () => {
      appSub.remove();
      if (resyncTimeoutRef.current) clearTimeout(resyncTimeoutRef.current);
      Promise.resolve(handle.dispose()).catch(() => undefined);
      disposeRef.current = null;
    };
  }, [isConfigured, session?.user.id, triggerSync]);

  return children;
};
