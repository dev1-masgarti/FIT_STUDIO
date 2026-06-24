---
name: fitown-supabase-migrations
description: >-
  FitOwn Supabase database migrations and schema safety. Use when creating or applying
  SQL migrations, changing profiles/workouts/RLS schema, syncing packages/types with
  Postgres, running db:migrate, or any Supabase DDL for FitOwn. Enforces correct project
  (spcnvkgzzmtdzehrarnp), tracked migrations via fitown.schema_migrations, and forbids
  wrong MCP project usage.
---

# FitOwn Supabase Migrations

## Mandatory: read before any schema change

1. **Project binding** → [references/project-binding.md](references/project-binding.md)
2. **Workflow** → [references/workflow.md](references/workflow.md)
3. **Manifest** → `supabase/migration-kit/manifest.json`

## Quick commands

```bash
pnpm db:status              # applied vs pending
pnpm db:migrate             # apply pending only (tracked)
pnpm db:migrate:new fitown_<name>   # scaffold SQL + manifest
```

Kit lives in **`supabase/migration-kit/`**. SQL files in **`supabase/migrations/`**.

## Hard rules

| Rule | Why |
|------|-----|
| **Never** use Cursor `user-supabase` MCP for FitOwn DDL | MCP may target wrong project (`fgiukjexmvdinutymxwq`) |
| **Always** verify `DATABASE_URL` host is `db.spcnvkgzzmtdzehrarnp.supabase.co` | Prevents destroying wrong database |
| **Never** edit applied migration files | Add a new timestamped file instead |
| **Always** update `packages/types` when `profiles` or domain tables change | Mobile reads `@fitown/types` |
| **Always** run `pnpm db:status` after migrate | Confirm zero pending |
| Prefer idempotent SQL | `IF NOT EXISTS`, `ON CONFLICT DO NOTHING` for seeds |

## Creating a migration

```
Task Progress:
- [ ] Read workflow + project-binding references
- [ ] pnpm db:migrate:new fitown_<short_name>
- [ ] Write idempotent SQL in supabase/migrations/
- [ ] Update manifest summary in manifest.json
- [ ] Update packages/types/src/index.ts if columns changed
- [ ] Update apps/mobile/lib/api/*.ts repositories if needed
- [ ] pnpm db:migrate
- [ ] pnpm db:status (must show 0 pending)
- [ ] pnpm typecheck
```

## Tracking

- **Local catalog:** `supabase/migration-kit/manifest.json` (committed)
- **Remote truth:** `fitown.schema_migrations` table
- **Local snapshot:** `supabase/migration-kit/local-state.json` (gitignored, written by status)

## Bootstrap (one-time)

If the DB already has schema from the legacy untracked apply script:

```bash
pnpm db:migrate:bootstrap
pnpm db:status
```

Then use `pnpm db:migrate` for new files only.

## Schema ↔ types map

| Postgres | TypeScript |
|----------|------------|
| `public.profiles` | `packages/types` → `Profile` |
| `public.exercises` | exercise types in migrations / future types |
| RLS policies | Document in `docs/planning/plans/09-database-api.md` |

## Additional resources

- [project-binding.md](references/project-binding.md) — correct Supabase project, env, MCP trap
- [workflow.md](references/workflow.md) — full apply/status/new migration flow
- `supabase/migration-kit/README.md` — human operator guide
- `docs/planning/plans/09-database-api.md` — module plan for schema
