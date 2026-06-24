# Migration workflow

## File naming

```
YYYYMMDDHHMMSS_fitown_<description>.sql
```

Example: `20260324120000_fitown_profile_height.sql`

- Timestamp must be UTC-ish sortable (14 digits)
- Prefix `fitown_` on the descriptive part
- One logical change per file

## Apply flow (tracked)

1. `ensure_tracking_table` creates `fitown.schema_migrations` if missing
2. For each `supabase/migrations/*.sql` in sorted order:
   - If `version` exists in `fitown.schema_migrations` → **skip**
   - Else run SQL file → insert row with version, filename, checksum

This replaces the legacy loop that re-ran every file on each invoke.

## Status flow

`pnpm db:status` compares local files to `fitown.schema_migrations`.

- Exit code **0** = all applied
- Exit code **1** = pending migrations exist

Writes `supabase/migration-kit/local-state.json`:

```json
{
  "checked_at": "2026-03-24T12:00:00+00:00",
  "project_ref": "spcnvkgzzmtdzehrarnp",
  "total_local": 12,
  "applied": 10,
  "pending": 2
}
```

## New migration flow

```bash
pnpm db:migrate:new fitown_add_avatar_url
```

Creates empty SQL template + appends to `manifest.json`.

Then:

1. Fill in SQL (idempotent DDL)
2. Update `summary` in manifest.json
3. Sync types / API layer
4. `pnpm db:migrate`

## Bootstrap (existing DB)

If schema exists but `fitown.schema_migrations` is empty:

```bash
pnpm db:migrate:bootstrap
```

Inserts all local filenames as applied **without** running SQL. Use only when the schema already matches.

## SQL guidelines

- Extensions/enums: `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object` pattern (see foundation migration)
- New columns: `ADD COLUMN IF NOT EXISTS`
- Seeds: `INSERT ... SELECT ... ON CONFLICT DO NOTHING` or `WHERE NOT EXISTS`
- RLS: enable on table, policies named `{table}_{action}_{role}`
- Functions: `SET search_path = public` on `SECURITY DEFINER`
- Never drop columns/tables in POC without explicit user approval

## After schema change checklist

- [ ] `packages/types/src/index.ts`
- [ ] `apps/mobile/lib/api/*.ts` (Supabase `.from()` updates)
- [ ] `docs/planning/plans/09-database-api.md` if new table
- [ ] `pnpm db:migrate` + `pnpm db:status`
- [ ] `pnpm typecheck`

## manifest.json

Committed catalog of migrations. Update when:

- Adding a file via `new-migration.sh` (automatic)
- Or run `sync-manifest.sh` to rebuild from folder

Keep `summary` fields accurate — agents read this for context.

## Local vs hosted

| Target | How |
|--------|-----|
| **Hosted** | `DATABASE_URL` in `supabase/.env.local` → `pnpm db:migrate` |
| **Local Docker** | `./dev.sh --local` then `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres pnpm db:migrate` |

## Supabase CLI (optional)

`supabase/config.toml` has `project_id = "spcnvkgzzmtdzehrarnp"`.

Requires `supabase link` + Docker for `supabase db push`. The migration-kit scripts are the **primary** path for this repo.
