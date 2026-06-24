-- FitOwn migration tracking (must run before other migrations are tracked)
-- Applied once; safe to re-run.

CREATE SCHEMA IF NOT EXISTS fitown;

CREATE TABLE IF NOT EXISTS fitown.schema_migrations (
  version text PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  checksum text,
  applied_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE fitown.schema_migrations IS
  'FitOwn SQL migrations applied via supabase/migration-kit/scripts/apply.sh';
