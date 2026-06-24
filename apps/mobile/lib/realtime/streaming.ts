import { STREAMING_CHANNELS } from '@/constants/streaming';
import { isBackendConfigured } from '@/lib/backend/client';

type StreamCallbacks = {
  onSyncChange: () => void;
  onMessageEnvelope: () => void;
};

type ChannelHandle = {
  dispose: () => Promise<void> | void;
};

export const createStreamingChannels = (
  accessToken: string,
  userId: string,
  callbacks: StreamCallbacks,
): ChannelHandle => {
  if (!isBackendConfigured()) {
    return { dispose: async () => undefined };
  }

  const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
  const wsBase = baseUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:').replace(/\/+$/, '');
  const socket = new WebSocket(
    `${wsBase}/ws?token=${encodeURIComponent(accessToken)}&channel=${encodeURIComponent(
      `${STREAMING_CHANNELS.encryptedSync}|${STREAMING_CHANNELS.chatEnvelopes}`,
    )}&user=${encodeURIComponent(userId)}`,
  );

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(String(event.data)) as { event?: string };
      if (payload.event === 'sync_updated') callbacks.onSyncChange();
      if (payload.event === 'chat_message' || payload.event === 'chat_receipt') {
        callbacks.onMessageEnvelope();
      }
    } catch {
      // ignore malformed events
    }
  };
  socket.onerror = () => {
    console.warn('[stream] websocket error');
  };

  return {
    dispose: () => socket.close(),
  };
};
