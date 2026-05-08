#!/usr/bin/env bash
set -eo pipefail

echo "Siyaj pre-install: generating fresh pnpm lockfile compatible with EAS pnpm version..."

# Remove incompatible lockfile — EAS may have a different pnpm version
# which causes "Ignoring not compatible lockfile" warning followed by failure
if [ -f pnpm-lock.yaml ]; then
  echo "Removing existing lockfile..."
  rm -f pnpm-lock.yaml
fi

# Generate a fresh lockfile using the EAS environment's pnpm version
# so that the subsequent "pnpm install --frozen-lockfile" step succeeds
pnpm install --no-frozen-lockfile

echo "Fresh lockfile generated. EAS frozen-lockfile install should now succeed."
