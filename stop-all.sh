#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

docker compose --profile integration down --remove-orphans
docker compose down --remove-orphans
