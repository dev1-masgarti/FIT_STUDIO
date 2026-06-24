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

Start the backend and the mobile dev server (in two terminals):

```bash
pnpm dev:backend   # Fastify backend (Postgres + JWT)
pnpm dev:mobile    # Expo dev client
```

### Backend database

The backend stores user accounts and profiles in **Supabase Postgres** (not a local
JSON file). Before first run:

1. Copy `apps/backend/.env.example` → `apps/backend/.env`
2. Set `DATABASE_URL` to your Supabase connection string (same value as
   `supabase/.env.local`)
3. Apply migrations: `pnpm db:migrate`
4. If you have legacy data in `apps/backend/data/store.json`, import once:
   `pnpm --filter @fitown/backend import:store`

### Run on Android

1. Start an Android emulator (Android Studio → Device Manager) **or** connect a
   physical device with USB debugging enabled.
2. Run `pnpm dev:mobile`.
3. In the Expo terminal, press **`a`** to build/open the app on Android.

### Run on iOS (macOS only)

1. Run `pnpm dev:mobile`.
2. In the Expo terminal, press **`i`** to open the app in the iOS Simulator.

Other handy Expo keys while `pnpm dev:mobile` is running: **`r`** reload,
**`j`** open debugger, **`?`** show all commands.

> First launch on a device/emulator compiles the native dev client and can take
> several minutes; subsequent launches are fast.

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
   brew install git-crypt      # macOS (Homebrew)
   sudo apt install git-crypt  # Debian/Ubuntu
   ```

   **Windows** (run in PowerShell, then use Git Bash for the `git-crypt` commands):

   ```powershell
   choco install git-crypt     # via Chocolatey
   # or
   scoop install git-crypt     # via Scoop
   ```

   If you don't use a package manager, download the prebuilt `git-crypt.exe`
   from the [releases page](https://github.com/AGWA/git-crypt/releases) and place
   it somewhere on your `PATH` (e.g. your Git install's `bin` folder).

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
