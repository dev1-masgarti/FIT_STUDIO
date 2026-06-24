# FitOwn Security Blueprint — Local-First + Strict E2EE

## 1) Security goals

1. Client owns data, including cryptographic control of sensitive payloads.
2. Server never decrypts workouts, PARQ, chat messages, or trainer-shared payload content.
3. App remains functional offline with encrypted local persistence and deferred sync.
4. All transport is HTTPS/TLS and all server APIs are authenticated and rate-limited.

## 2) Data classification

### Server-readable (minimal)
- Auth identity metadata (user id, email, auth provider)
- Basic profile identity used for app shell (display name, role)
- Sharing metadata (who can access whom)
- Encrypted object metadata (type, version, timestamps, owner, recipient ids)

### End-to-end encrypted
- Workouts and set logs
- Cardio entries
- PARQ responses
- Trainer notes payload
- Chat message contents and attachments metadata
- Derived analytics snapshots that include sensitive fitness information

## 3) Threat model

### In scope
- Network attacker (MITM, replay, packet capture)
- Compromised server/storage (DB read exposure)
- Token theft attempts and API abuse
- Unauthorized trainer access after revoke
- Device theft with app session present

### Out of scope (POC constraints)
- Compromised OS / rooted kernel bypass
- Side-channel attacks on secure enclave hardware

## 4) Cryptography choices

- **Key agreement:** X25519
- **Symmetric encryption:** XSalsa20-Poly1305 (`tweetnacl.secretbox`)
- **KDF:** SHA-256 based key derivation with context + salt
- **Chat session:** Signal-style prekey + ratcheted session secrets (simplified envelope metadata in this phase)
- **Randomness:** secure random bytes from platform CSPRNG

## 5) Key hierarchy

1. Device identity key pair (long-term, per device)
2. Prekeys (signed + one-time) for session bootstrap
3. Account master secret (device-wrapped locally)
4. Domain content keys:
   - sync data key
   - chat conversation keys
   - grant-wrapped keys for trainer sharing

Private keys remain on device secure storage and are never sent to backend.

## 6) Local-first storage strategy

- Encrypted local SQLite envelope store for domain data and sync queue
- Sync outbox keeps encrypted payloads + idempotency key + retry metadata
- All writes are accepted locally first, then pushed to server
- Pull sync merges by version and timestamp with tombstone support

## 7) Backend strategy

- Supabase Postgres stores only encrypted payloads and metadata
- RLS continues to enforce ownership and grant metadata access
- Trainer access is mediated through wrapped grant keys
- Edge functions handle invite/accept/revoke workflows and messaging wake-ups

## 8) Transport and API controls

- HTTPS only (reject non-https URLs in client transport guard)
- Auth bearer token required for all mutable operations
- Idempotency keys on push/sync and message write
- Server-side rate limiting for key operations and messaging paths
- Security audit events for device registration, key rotation, invite accept, and revoke

## 9) Rollout policy

- Feature flags:
  - `e2ee_keys_enabled`
  - `encrypted_sync_enabled`
  - `e2ee_chat_enabled`
- Dual-read compatibility during migration
- Plaintext writes retired only after encrypted parity checks succeed
