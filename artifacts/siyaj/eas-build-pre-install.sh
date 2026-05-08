#!/usr/bin/env bash
set -eo pipefail

echo "Siyaj pre-install: regenerating pnpm lockfile for EAS compatibility..."
pnpm install --no-frozen-lockfile
echo "Lockfile ready."
