#!/usr/bin/env bash
set -euo pipefail

# Apply pending FitOwn SQL migrations with tracking (skips already-applied).
# Usage: ./supabase/migration-kit/scripts/apply.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

verify_fitown_project
require_psql
ensure_tracking_table

applied_now=0
skipped=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  version="$(migration_version "$file")"
  filename="$(basename "$file")"
  checksum="$(migration_checksum "$file")"

  if is_migration_applied "$version"; then
    echo "SKIP  $filename (already applied)"
    skipped=$((skipped + 1))
    continue
  fi

  echo "APPLY $filename"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"

  if [[ -n "$checksum" ]]; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
      "INSERT INTO fitown.schema_migrations (version, filename, checksum)
       VALUES ('${version}', '${filename}', '${checksum}')
       ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum;"
  else
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
      "INSERT INTO fitown.schema_migrations (version, filename)
       VALUES ('${version}', '${filename}')
       ON CONFLICT (version) DO NOTHING;"
  fi

  applied_now=$((applied_now + 1))
done < <(list_local_migrations)

echo ""
echo "Done: ${applied_now} applied, ${skipped} skipped."

# Refresh local state snapshot
bash "$SCRIPT_DIR/status.sh" >/dev/null 2>&1 || true
