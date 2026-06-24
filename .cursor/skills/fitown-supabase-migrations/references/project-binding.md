# FitOwn Supabase project binding

## Correct project (only one)

| Field | Value |
|-------|-------|
| **Project ref** | `spcnvkgzzmtdzehrarnp` |
| **API URL** | `https://spcnvkgzzmtdzehrarnp.supabase.co` |
| **DB host** | `db.spcnvkgzzmtdzehrarnp.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/spcnvkgzzmtdzehrarnp |
| **config.toml** | `supabase/config.toml` → `project_id = "spcnvkgzzmtdzehrarnp"` |

## Environment files

| File | Purpose | Committed |
|------|---------|-----------|
| `apps/mobile/.env.local` | `EXPO_PUBLIC_SUPABASE_URL` + anon key | No |
| `supabase/.env.local` | `DATABASE_URL` + service role (migrations only) | No |
| `supabase/.env.example` | Templates | Yes |

**Mobile app must never use service role or `DATABASE_URL`.**

## Cursor MCP trap

The **`user-supabase` MCP** in this workspace may return:

```
https://fgiukjexmvdinutymxwq.supabase.co
```

That is **not** FitOwn. Symptoms if you use MCP for DDL:

- `list_migrations` shows unrelated tables (teams, talent_profiles, etc.)
- `profiles` has `email`, `avatar_url` — **wrong schema**
- FitOwn `profiles` has `focus`, `onboarding_complete`, `body_weight_kg`

**Do not** call MCP `apply_migration`, `execute_sql`, or `list_tables` for FitOwn schema work.

**Do** use:

```bash
pnpm db:status
pnpm db:migrate
```

## Verify before migrate

`apply.sh` aborts if `DATABASE_URL` does not contain `spcnvkgzzmtdzehrarnp`.

Manual check:

```bash
# Host must be db.spcnvkgzzmtdzehrarnp.supabase.co
echo "$DATABASE_URL" | grep spcnvkgzzmtdzehrarnp
```

## FitOwn profiles columns (sanity check)

After migrate, `profiles` should include at minimum:

- `full_name`, `age`, `date_of_birth`, `gender`, `height_cm`, `body_weight_kg`
- `focus` (text[]), `experience_level`, `role`, `onboarding_complete`

If you see `stripe_onboarding_completed` or `talent_profiles`, you are on the **wrong database**.
