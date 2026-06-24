# FitOwn Migration Kit

Tracked SQL migrations for the FitOwn Supabase project (`spcnvkgzzmtdzehrarnp`).

## Layout

```
supabase/
├── migration-kit/
│   ├── manifest.json       # Canonical list of migration files (committed)
│   ├── local-state.json    # Last status check (gitignored)
│   └── scripts/
│       ├── apply.sh        # Apply pending migrations only
│       ├── status.sh       # Local vs remote tracking table
│       ├── new-migration.sh
│       ├── bootstrap-applied.sh
│       └── sync-manifest.sh
└── migrations/
    └── *.sql               # SQL files (source of truth for DDL)
```

Remote state lives in **`fitown.schema_migrations`** on Postgres (not in Supabase MCP).

## Setup

1. Copy `supabase/.env.example` → `supabase/.env.local`
2. Set `DATABASE_URL` (Dashboard → Settings → Database → connection string)
3. URL-encode special characters in the password

## Commands (from repo root)

| Command | Action |
|---------|--------|
| `pnpm db:status` | Show applied vs pending migrations |
| `pnpm db:migrate` | Apply pending migrations (tracked) |
| `pnpm db:migrate:new fitown_name` | Scaffold new migration + manifest entry |
| `pnpm db:migrate:bootstrap` | Record all files as applied (existing DB) |

## Agent skill

Use **`fitown-supabase-migrations`** (`.cursor/skills/fitown-supabase-migrations/SKILL.md`) before any schema work.

## Wrong Supabase project

Cursor **`user-supabase` MCP** may be linked to a different project (`fgiukjexmvdinutymxwq`). **Never** use MCP `apply_migration` or `execute_sql` for FitOwn DDL. Use `pnpm db:migrate` only.
