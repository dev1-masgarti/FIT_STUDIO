#!/usr/bin/env bash
# Shared helpers for FitOwn migration-kit scripts.
set -euo pipefail

FITOWN_PROJECT_REF="spcnvkgzzmtdzehrarnp"
FITOWN_DB_HOST="db.${FITOWN_PROJECT_REF}.supabase.co"
FITOWN_API_URL="https://${FITOWN_PROJECT_REF}.supabase.co"

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$KIT_DIR/../.." && pwd)"
MIG_DIR="$ROOT_DIR/supabase/migrations"
MANIFEST="$KIT_DIR/manifest.json"
ENV_LOCAL="$ROOT_DIR/supabase/.env.local"
LOCAL_STATE="$KIT_DIR/local-state.json"

load_database_url() {
  if [[ -z "${DATABASE_URL:-}" && -f "$ENV_LOCAL" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_LOCAL"
    set +a
  fi

  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "ERROR: DATABASE_URL is not set." >&2
    echo "       Add to supabase/.env.local (see supabase/.env.example)" >&2
    exit 1
  fi
}

require_psql() {
  if ! command -v psql >/dev/null 2>&1; then
    echo "ERROR: psql not found. Install: brew install libpq" >&2
    exit 1
  fi
}

verify_fitown_project() {
  load_database_url

  if [[ "$DATABASE_URL" != *"${FITOWN_DB_HOST}"* && "$DATABASE_URL" != *"${FITOWN_PROJECT_REF}"* ]]; then
    echo "ERROR: DATABASE_URL does not target FitOwn project ${FITOWN_PROJECT_REF}." >&2
    echo "       Expected host: ${FITOWN_DB_HOST}" >&2
    echo "       Cursor user-supabase MCP may be linked to a DIFFERENT project — do not use MCP for FitOwn DDL." >&2
    exit 1
  fi
}

migration_version() {
  basename "$1" .sql
}

migration_checksum() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    echo ""
  fi
}

ensure_tracking_table() {
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE SCHEMA IF NOT EXISTS fitown;
CREATE TABLE IF NOT EXISTS fitown.schema_migrations (
  version text PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  checksum text,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL
}

is_migration_applied() {
  local version="$1"
  local count
  count="$(psql "$DATABASE_URL" -tA -v ON_ERROR_STOP=1 -c \
    "SELECT COUNT(*) FROM fitown.schema_migrations WHERE version = '${version}';")"
  [[ "$count" -gt 0 ]]
}

list_local_migrations() {
  ls "$MIG_DIR"/*.sql 2>/dev/null | sort
}

write_local_state() {
  local pending_count="$1"
  local applied_count="$2"
  local total_count="$3"

  if ! command -v python3 >/dev/null 2>&1; then
    return 0
  fi

  python3 - "$LOCAL_STATE" "$FITOWN_PROJECT_REF" "$pending_count" "$applied_count" "$total_count" <<'PY'
import json, sys
from datetime import datetime, timezone

path, ref, pending, applied, total = sys.argv[1:6]
payload = {
    "checked_at": datetime.now(timezone.utc).isoformat(),
    "project_ref": ref,
    "total_local": int(total),
    "applied": int(applied),
    "pending": int(pending),
}
with open(path, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)
    f.write("\n")
PY
}
