#!/usr/bin/env sh
set -eu
command -v docker >/dev/null 2>&1 || { echo "Docker is not installed or not in PATH."; exit 1; }
[ -f .env ] || cp .env.example .env
docker compose up --build -d
docker compose ps
echo "Open http://localhost:3000"
