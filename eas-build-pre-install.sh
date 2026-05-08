#!/usr/bin/env bash
set -e

echo "=== EAS pre-install: preparing workspace for build ==="

# Replace pnpm-workspace.yaml with a minimal version that any pnpm version understands.
# The original uses pnpm 9+ features (catalog:, minimumReleaseAge) which break older pnpm.
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
EOF

echo "Simplified pnpm-workspace.yaml written."

# Remove the incompatible lockfile (v9.0 format requires pnpm 9+).
# Without a lockfile, EAS will run "pnpm install" WITHOUT --frozen-lockfile.
if [ -f pnpm-lock.yaml ]; then
  rm -f pnpm-lock.yaml
  echo "Removed incompatible pnpm-lock.yaml."
fi

echo "=== pre-install complete. EAS will now run a fresh install. ==="
