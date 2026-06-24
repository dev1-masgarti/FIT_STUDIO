# FitOwn — Technical Architecture (POC v0.1)

**Package manager:** pnpm (workspace monorepo)  
**Philosophy:** Lightweight, mobile-first, manual-entry data layer first, sharing/RBAC architected early

---

## 1. Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FitOwn POC v0.1                        │
├─────────────────────────────────────────────────────────────┤
│  Mobile App (Expo + React Native + TypeScript)              │
│  ├── Expo Router (file-based navigation)                    │
│  ├── NativeWind v4 (Tailwind → RN, gradient support)        │
│  ├── expo-linear-gradient (Figma gradient parity)           │
│  ├── React Native Reanimated (micro-interactions)           │
│  └── expo-secure-store (session tokens)                     │
├─────────────────────────────────────────────────────────────┤
│  Shared Packages (@fitown/*)                                │
│  ├── types        — Domain TypeScript interfaces            │
│  ├── utils        — 1RM calc, date helpers, validators      │
│  └── constants    — RPE labels, exercise seed, PARQ schema  │
├─────────────────────────────────────────────────────────────┤
│  Backend: Supabase                                          │
│  ├── Auth (email + Google OAuth)                            │
│  ├── PostgreSQL + Row Level Security (data ownership)       │
│  ├── Edge Functions (1RM batch, export, invite emails)      │
│  └── Storage (future: profile avatars only in POC)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Why This Stack

| Choice | Rationale |
|--------|-----------|
| **Expo (managed)** | Fastest path to iOS + Android from one codebase; aligns with mobile-first wireframe; OTA updates for pilot users |
| **pnpm workspaces** | Deduped `node_modules` (~40–60% disk savings vs npm); strict dependency hoisting; monorepo for shared types/utils |
| **TypeScript everywhere** | Type safety across app + packages; matches team front-end standards |
| **Supabase** | Auth + Postgres + RLS maps directly to "client owns data, professionals are guests"; already in project MCP; no custom auth server |
| **NativeWind** | Tailwind mental model; easy Figma token → class mapping; works with gradients via `expo-linear-gradient` |
| **No Redux** | Zustand for ephemeral UI state; TanStack Query for server cache — minimal boilerplate |

### 2.1 Explicitly Not in POC

| Avoided | Why |
|---------|-----|
| Next.js web app | POC is mobile-only per wireframe; web deferred |
| NestJS / custom API | Supabase covers auth + DB + RLS; less ops surface |
| MongoDB | Relational model fits workouts/sets/sharing permissions |
| Blockchain | Discovery doc defers Web3; RBAC in Postgres is sufficient |
| React Native bare workflow | Expo reduces native config overhead for POC |

---

## 3. Monorepo Structure

```
fit-studio/
├── apps/
│   └── mobile/                 # Expo app (primary deliverable)
│       ├── app/                # Expo Router screens
│       ├── components/         # UI components
│       ├── hooks/
│       ├── lib/                # Supabase client, query keys
│       ├── assets/             # Figma-exported icons, fonts
│       └── app.json
├── packages/
│   ├── types/                  # @fitown/types
│   ├── utils/                  # @fitown/utils (1RM, formatters)
│   └── constants/              # @fitown/constants (PARQ, exercises seed)
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── functions/
├── docs/
│   ├── planning/
│   └── extracted/
├── scripts/
│   └── extract-docs.py
├── .cursor/skills/
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

---

## 4. pnpm Configuration

### 4.1 Root `package.json` scripts

```json
{
  "scripts": {
    "dev": "pnpm --filter @fitown/mobile dev",
    "ios": "pnpm --filter @fitown/mobile ios",
    "android": "pnpm --filter @fitown/mobile android",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

### 4.2 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 4.3 Space-saving practices

- `node-linker=hoisted` only if needed for Expo compatibility; default isolated linker preferred  
- Shared devDependencies at root (`typescript`, `eslint`, `prettier`)  
- No duplicate React across packages (enforced via `pnpm.overrides`)  
- `.npmrc`: `shamefully-hoist=false`, `strict-peer-dependencies=true`

---

## 5. Mobile App Architecture

### 5.1 Navigation (Expo Router)

```
app/
├── (auth)/
│   ├── splash.tsx
│   ├── sign-up.tsx
│   └── quick-profile.tsx
├── (tabs)/
│   ├── _layout.tsx          # Bottom nav: Home | Log | History | Share | Profile
│   ├── index.tsx            # Dashboard
│   ├── log/
│   │   ├── index.tsx        # Workout type
│   │   ├── exercise.tsx
│   │   ├── sets.tsx
│   │   └── cardio.tsx
│   ├── history/
│   │   ├── index.tsx
│   │   ├── [sessionId].tsx
│   │   └── exercise/[id].tsx
│   ├── share/
│   │   ├── index.tsx        # My Team
│   │   ├── access/[id].tsx
│   │   └── invite.tsx
│   └── profile/
│       ├── index.tsx
│       ├── parq/
│       └── settings/
├── (trainer)/               # Role-gated routes
│   └── client/[id].tsx
└── _layout.tsx
```

### 5.2 State Management

| Layer | Tool | Responsibility |
|-------|------|----------------|
| Server data | TanStack Query v5 | Workouts, history, sharing, PARQ |
| Auth session | Supabase Auth + SecureStore | JWT persistence |
| Active workout draft | Zustand | In-progress sets before save |
| Theme/tokens | React Context | Design tokens from Figma |

### 5.3 Design System Mapping

| Figma token | Implementation |
|-------------|----------------|
| Colors | `tailwind.config.ts` → NativeWind theme |
| Gradients | `expo-linear-gradient` wrapper component `<GradientBackground />` |
| Typography | Expo Google Fonts or bundled `.ttf` from Figma export |
| Spacing/radius | Tailwind scale matching Figma 4px grid |
| Icons | SVG via `react-native-svg` from Figma export |

---

## 6. Backend Schema (Supabase)

### 6.1 Core Tables

```sql
-- profiles (extends auth.users)
profiles (id, full_name, age, gender, body_weight_kg, focus[], experience_level, role)

-- exercises (seed + user custom)
exercises (id, name, category, muscle_groups[], is_system)

-- workout_sessions
workout_sessions (id, user_id, type, started_at, duration_min, notes)

-- strength_sets
strength_sets (id, session_id, exercise_id, set_number, weight_kg, reps, rpe)

-- cardio_entries
cardio_entries (id, session_id, activity, duration_min, intensity, distance_km, intervals)

-- one_rm_estimates (computed, cached)
one_rm_estimates (id, user_id, exercise_id, value_kg, calculated_at, source_set_id)

-- parq_responses
parq_responses (id, user_id, answers jsonb, flags jsonb, completed_at, valid_until)

-- share_invites & access_grants
share_invites (id, client_id, invitee_email, role, permissions jsonb, status)
access_grants (id, client_id, grantee_id, permissions jsonb, active, revoked_at)
```

### 6.2 Row Level Security (Data Ownership)

| Policy | Rule |
|--------|------|
| **Owner read/write** | `auth.uid() = user_id` on all personal data |
| **Grantee read-only** | Join `access_grants` where `grantee_id = auth.uid()` AND `active = true` AND permission bit set |
| **No grantee write** | Professionals cannot INSERT/UPDATE client workout data |
| **Revoke** | Client sets `active = false`; immediate effect |

### 6.3 Edge Functions

| Function | Purpose |
|----------|---------|
| `calculate-one-rm` | Recompute 1RM after set save (Epley formula) |
| `export-user-data` | GDPR-style JSON/CSV export |
| `send-invite` | Email invite to professional |

---

## 7. Key Algorithms

### 7.1 1RM Estimation (POC)

```typescript
// packages/utils/src/one-rm.ts
// Epley: 1RM = weight × (1 + reps / 30)
// Use best set from session; store with timestamp for temporal context
```

Reference: strengthlevel.com methodology mentioned in discovery.

### 7.2 Streak & Monthly Stats

- Streak: consecutive calendar days with ≥1 logged session  
- Monthly count: sessions in current month timezone-aware

---

## 8. Authentication

| Method | POC |
|--------|-----|
| Email + password | Yes |
| Google OAuth | Yes (Supabase provider) |
| Phone verification | No (wireframe: "No phone verification in POC") |
| Trainer vs Client role | `profiles.role` enum: `client` \| `professional` |

---

## 9. Dev Tooling

| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Code style (match existing conventions) |
| TypeScript 5.x strict | Type safety |
| Supabase CLI | Local dev + migrations |
| Expo Dev Client | Native module testing |
| Figma MCP + project skill | Design-to-code replication |

---

## 10. Environment Variables

```bash
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# supabase/functions (server-side only)
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 11. Deployment (Post-Implementation)

| Target | Service |
|--------|---------|
| Mobile | EAS Build → TestFlight / Play Internal Testing |
| Backend | Supabase hosted project |
| CI | GitHub Actions: typecheck, lint, EAS preview on PR |

---

## 12. Performance & Size Budgets

| Metric | Target |
|--------|--------|
| App bundle (OTA) | <25 MB |
| Cold start | <2s on mid-range Android |
| Set save latency | <500ms perceived (optimistic UI) |
| Offline | Draft workout in Zustand; sync on reconnect (Phase 2) |

---

## 13. Security Checklist

- [ ] RLS enabled on every table with user data  
- [ ] Anon key only in client; service role server-only  
- [ ] Export requires re-auth or recent session  
- [ ] Delete account cascades all user data  
- [ ] Invite tokens expire (7 days)

### 13.1 E2EE + Local-first extension

- Sensitive domain payloads are stored as encrypted envelopes; server retains metadata only.
- Local app storage is source-of-truth for domain writes while offline; sync queue publishes ciphertext later.
- Device key lifecycle:
  - per-device identity keypair
  - signed and one-time prekeys for chat/session bootstrap
  - wrapped grant keys for trainer sharing
- Transport controls:
  - HTTPS-only endpoint guard in client
  - idempotency keys for sync/message writes
  - rate-limit and audit tables in backend
- Full protocol and threat model: `docs/planning/SECURITY_E2EE_LOCAL_FIRST.md`

---

## 14. Dependencies (Pinned Intent)

### apps/mobile

```
expo ~52
expo-router ~4
react-native ~0.76
nativewind ^4
expo-linear-gradient
@tanstack/react-query ^5
zustand ^5
@supabase/supabase-js ^2
react-native-svg
expo-secure-store
```

### packages/utils

```
(no runtime deps — pure functions)
```

---

## 15. Migration Path to Future Layers

| Future feature | Extension point |
|----------------|-----------------|
| Wearables | `integrations` table + import Edge Function |
| AI coaching | Read structured workout/PARQ via API; no schema break |
| Recovery model | `recovery_scores` table fed by session RPE + frequency |
| Web dashboard | Add `apps/web` (Next.js) sharing `@fitown/*` packages |
| Offline-first | WatermelonDB or PowerSync on top of existing schema |
