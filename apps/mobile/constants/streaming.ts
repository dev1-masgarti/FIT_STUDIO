import { Platform } from 'react-native';

export const STREAMING_CHANNELS = {
  encryptedSync: 'fitown:sync:encrypted_blobs',
  chatEnvelopes: 'fitown:chat:message_envelopes',
} as const;

export const STREAMING_SETTINGS = {
  reconnectDelayMs: Platform.OS === 'ios' ? 1500 : 1200,
  resyncDebounceMs: 400,
  pollFallbackMs: 20_000,
  eventsPerSecond: 20,
} as const;
