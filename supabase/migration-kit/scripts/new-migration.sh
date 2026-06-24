#!/usr/bin/env bash
set -euo pipefail

# Scaffold a new FitOwn migration file and update manifest.json.
# Usage: ./supabase/migration-kit/scripts/new-migration.sh fitown_short_description

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <snake_name>" >&2
  echo "Example: $0 fitown_profile_avatar_url" >&2
  exit 1
fi

name="$1"
if [[ ! "$name" =~ ^fitown_[a-z0-9_]+$ ]]; then
  echo "ERROR: name must match fitown_<snake_case> (e.g. fitown_add_avatar_url)" >&2
  exit 1
fi

timestamp="$(date -u +%Y%m%d%H%M%S)"
version="${timestamp}"
filename="${version}_${name}.sql"
filepath="$MIG_DIR/$filename"

if [[ -e "$filepath" ]]; then
  echo "ERROR: $filepath already exists" >&2
  exit 1
fi

cat >"$filepath" <<EOF
-- ${name//_/ }
-- TODO: describe change; keep idempotent where possible (IF NOT EXISTS, ON CONFLICT)

EOF

echo "Created: supabase/migrations/$filename"

if command -v python3 >/dev/null 2>&1; then
  python3 - "$MANIFEST" "$version" "$filename" "$name" <<'PY'
import json, sys
from datetime import datetime, timezone

manifest_path, version, filename, name = sys.argv[1:5]
with open(manifest_path, encoding="utf-8") as f:
    data = json.load(f)

data["generated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
data["migrations"].append({
    "version": version,
    "filename": filename,
    "name": name,
    "summary": "TODO: update summary in manifest.json",
})
data["migrations"].sort(key=lambda m: m["version"])

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
  echo "Updated: supabase/migration-kit/manifest.json"
else
  echo "WARN: python3 not found — update manifest.json manually"
fi

echo ""
echo "Next steps:"
echo "  1. Edit supabase/migrations/$filename"
echo "  2. Update packages/types if schema changed"
echo "  3. pnpm db:migrate"
