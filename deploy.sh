#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-full}"

cd "$PROJECT_DIR"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

if [ "$MODE" = "core" ]; then
  docker compose build mysql redis backend frontend
else
  docker compose --profile integration build
fi

echo "build complete: $MODE"
echo "run: ./start-all.sh $MODE"
