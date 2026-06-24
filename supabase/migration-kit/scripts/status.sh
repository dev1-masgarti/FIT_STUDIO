#!/usr/bin/env bash
set -euo pipefail

# Print FitOwn migration status: local files vs fitown.schema_migrations on remote DB.
# Usage: ./supabase/migration-kit/scripts/status.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

verify_fitown_project
require_psql
ensure_tracking_table

echo "FitOwn migrations"
echo "  Project : ${FITOWN_PROJECT_REF}"
echo "  API URL : ${FITOWN_API_URL}"
echo ""

pending=0
applied=0
total=0

echo "VERSION              STATUS     FILE"
echo "-------------------- ---------- ----------------------------------------"

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  version="$(migration_version "$file")"
  filename="$(basename "$file")"
  total=$((total + 1))

  if is_migration_applied "$version"; then
    applied=$((applied + 1))
    printf '%-20s %-10s %s\n' "$version" "applied" "$filename"
  else
    pending=$((pending + 1))
    printf '%-20s %-10s %s\n' "$version" "PENDING" "$filename"
  fi
done < <(list_local_migrations)

echo ""
echo "Summary: ${applied}/${total} applied, ${pending} pending"
write_local_state "$pending" "$applied" "$total"

if [[ -f "$LOCAL_STATE" ]]; then
  echo "Local state snapshot: supabase/migration-kit/local-state.json"
fi

if [[ "$pending" -gt 0 ]]; then
  echo ""
  echo "Run: pnpm db:migrate"
  exit 1
fi
