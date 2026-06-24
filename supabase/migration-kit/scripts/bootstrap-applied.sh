#!/usr/bin/env bash
set -euo pipefail

# Mark all local migration files as applied WITHOUT running SQL.
# Use once when bootstrapping tracking on a DB that already has the schema
# (e.g. after the legacy apply-all script).
# Usage: ./supabase/migration-kit/scripts/bootstrap-applied.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

verify_fitown_project
require_psql
ensure_tracking_table

echo "Bootstrapping fitown.schema_migrations (insert missing rows only)..."

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  version="$(migration_version "$file")"
  filename="$(basename "$file")"
  checksum="$(migration_checksum "$file")"

  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c \
    "INSERT INTO fitown.schema_migrations (version, filename, checksum)
     VALUES ('${version}', '${filename}', NULLIF('${checksum}', ''))
     ON CONFLICT (version) DO NOTHING;"
  echo "  recorded $filename"
done < <(list_local_migrations)

echo "Bootstrap complete. Run status.sh to verify."
