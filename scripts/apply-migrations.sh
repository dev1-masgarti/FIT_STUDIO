#!/usr/bin/env bash
set -euo pipefail

# Legacy entrypoint — delegates to tracked migration-kit apply.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT_DIR/supabase/migration-kit/scripts/apply.sh" "$@"
