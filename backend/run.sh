#!/usr/bin/env bash
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."
if ! command -v bun >/dev/null 2>&1; then
  printf '%s\n' 'Missing required tool: bun' >&2
  exit 1
fi
if [[ ${#SIGNALSCOPE_REVIEWER_TOKEN} -lt 32 ]]; then
  printf '%s\n' 'Set SIGNALSCOPE_REVIEWER_TOKEN to a random value of at least 32 characters.' >&2
  exit 1
fi
exec bun backend/server.ts
