# Plan 11 — Encrypted Local-First Sync

**Phase:** Security extension  
**Scope:** Offline-first encrypted sync across device and server

---

## Goals

- Local encrypted persistence for domain data
- Outbox/inbox sync protocol with idempotency and tombstones
- Conflict-safe merge strategy (version + updated_at)
- Metadata-based RLS while payload remains ciphertext

## Backend deliverables

- `encrypted_sync_blobs` for ciphertext payloads
- `sync_tombstones` for deletes
- `sync_cursors` per user/device
- RPCs:
  - `push_sync_changes`
  - `pull_sync_changes`
  - `mark_sync_cursor`

## Mobile deliverables

- encrypted local DB with record and outbox tables
- repository abstraction: local write first, background sync
- background sync triggers:
  - app resume
  - connectivity recovery
  - periodic interval

## Security constraints

- no plaintext sensitive payload persisted remotely
- nonce per encrypted record envelope
- replay protection with idempotency key checks
- audit logs for key and grant sensitive events
