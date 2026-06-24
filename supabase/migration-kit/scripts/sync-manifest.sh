#!/usr/bin/env bash
set -euo pipefail

# Regenerate manifest.json from supabase/migrations/*.sql filenames.
# Usage: ./supabase/migration-kit/scripts/sync-manifest.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 required" >&2
  exit 1
fi

python3 - "$MANIFEST" "$MIG_DIR" <<'PY'
import json, re, sys
from datetime import datetime, timezone
from pathlib import Path

manifest_path = Path(sys.argv[1])
mig_dir = Path(sys.argv[2])

existing = {}
if manifest_path.exists():
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    for m in data.get("migrations", []):
        existing[m["filename"]] = m

migrations = []
for path in sorted(mig_dir.glob("*.sql")):
    filename = path.name
    version = path.stem.split("_", 1)[0]
    if not re.fullmatch(r"\d{14}", version):
        print(f"WARN: skipping non-standard filename: {filename}", file=sys.stderr)
        continue
    name = path.stem[len(version) + 1 :] if "_" in path.stem else path.stem
    prev = existing.get(filename, {})
    migrations.append({
        "version": version,
        "filename": filename,
        "name": prev.get("name", name),
        "summary": prev.get("summary", "TODO: add summary"),
    })

out = {
    "project_ref": "spcnvkgzzmtdzehrarnp",
    "project_url": "https://spcnvkgzzmtdzehrarnp.supabase.co",
    "db_host": "db.spcnvkgzzmtdzehrarnp.supabase.co",
    "migrations_dir": "../migrations",
    "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "migrations": migrations,
}

manifest_path.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
print(f"Synced {len(migrations)} migrations → {manifest_path}")
PY
