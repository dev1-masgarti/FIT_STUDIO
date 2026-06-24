# FitOwn — MASGARTI Fit Tech

Client-owned fitness data platform (POC v0.1). pnpm monorepo with an Expo
React Native app (`apps/mobile`) and a dedicated Fastify backend (`apps/backend`).

> Before working in this repo, read the planning index: [`docs/planning/README.md`](docs/planning/README.md).

## Prerequisites

- **Node.js** 20+
- **pnpm** (this repo is pnpm-only — never npm or yarn)
- **git-crypt** (to decrypt shared dev credentials — see below)

## Install

```bash
pnpm install
```

## Run

```bash
pnpm dev:backend   # Fastify backend (WebSockets + JWT)
pnpm dev:mobile    # Expo dev client
```

---

## Credentials (git-crypt)

Sensitive dev credentials (Google OAuth client files, the iOS OAuth plist, etc.)
are committed to this repo **encrypted** with [git-crypt](https://github.com/AGWA/git-crypt).
Without the shared key you only see ciphertext; with it, the files decrypt
automatically on checkout.

Encrypted paths (see [`.gitattributes`](.gitattributes)):

- `apps/backend/credentials/**`
- `apps/mobile/credentials/**`
- `**/client_secret_*.json`

### First-time setup (new teammate)

1. Install git-crypt:

   ```bash
   brew install git-crypt      # macOS
   sudo apt install git-crypt  # Debian/Ubuntu
   ```

2. Get the shared key file (`fitown-git-crypt.key`) from a maintainer over a
   **secure channel** (password manager, encrypted message). Never email,
   Slack, or commit the key.

3. Clone and unlock:

   ```bash
   git clone https://github.com/dev1-masgarti/FIT_STUDIO.git
   cd FIT_STUDIO
   git-crypt unlock /path/to/fitown-git-crypt.key
   ```

After `unlock`, the credential files appear as normal plaintext in your working
tree. Every `git pull` decrypts automatically and every `git push` re-encrypts —
no manual steps required.

### Maintainer: export the key to share

```bash
git-crypt export-key ~/fitown-git-crypt.key
```

### Notes & safety

- **Never commit** the key file or any `.env*.local` file (both are gitignored).
- Anyone with the key can decrypt **all** current and future encrypted files.
  To revoke access you must rotate the key and re-encrypt.
- After rotating any real secret (e.g. the Google OAuth client secret in Google
  Cloud Console), update the local credential file and commit — git-crypt
  re-encrypts it automatically.
- Prefer **GPG mode** if you want per-user access without sharing a raw key:
  `git-crypt add-gpg-user <gpg-key-id>`.
