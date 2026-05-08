#!/usr/bin/env bash
set -eo pipefail

echo "Siyaj pre-install: setting up pnpm for EAS build..."

# Ensure frozen-lockfile is disabled
export PNPM_FLAGS="--no-frozen-lockfile"

# Remove incompatible lockfile if it exists
if [ -f pnpm-lock.yaml ]; then
  echo "Removing existing lockfile to avoid compatibility issues..."
  rm -f pnpm-lock.yaml
fi

echo "Pre-install complete."
