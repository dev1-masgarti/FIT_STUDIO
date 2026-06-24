# Plan 10 — E2EE Messaging

**Phase:** Security extension  
**Scope:** Client-trainer encrypted chat and realtime delivery

---

## Goals

- Strict E2EE message payloads (server cannot decrypt)
- Device-based key management with signed prekeys
- Local-first message send and retry queue
- Delivery/read receipts with metadata-only storage server-side

## Backend deliverables

- `user_devices`, `device_signed_prekeys`, `device_one_time_prekeys`
- `conversations`, `conversation_members`, `message_envelopes`, `message_receipts`
- RPCs for:
  - registering device key bundles
  - fetching prekeys
  - posting encrypted message envelopes
  - marking receipts

## Mobile deliverables

- `lib/chat/sessionManager.ts` for session bootstrap + encrypt/decrypt
- `lib/chat/chatClient.ts` for send/pull/ack
- `lib/sync/syncEngine.ts` integration for outbox retries
- trainer/client chat screens using local encrypted cache

## Security constraints

- Private keys never leave device secure storage
- Only ciphertext stored in `message_envelopes`
- Push notifications contain no message content
- Key rotation required on device revoke
