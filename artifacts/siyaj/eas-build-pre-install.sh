#!/usr/bin/env bash
set -e

echo "=== EAS pre-install (siyaj): preparing workspace for build ==="

# Install pnpm globally so the rest of the build can use it
npm install -g pnpm@10.26.1
echo "pnpm installed."

# EAS runs this script from the repository root.
# Replace pnpm-workspace.yaml with a minimal version any pnpm version understands.
# The original uses pnpm 9+ features (catalog:, minimumReleaseAge) which break older pnpm.
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - artifacts/siyaj
  - lib/api-client-react
  - lib/api-zod
  - lib/api-spec
EOF

echo "Simplified pnpm-workspace.yaml written."

# Remove the incompatible lockfile (v9.0 format requires pnpm 9+).
# Without a lockfile, EAS will run a fresh install.
if [ -f pnpm-lock.yaml ]; then
  rm -f pnpm-lock.yaml
  echo "Removed incompatible pnpm-lock.yaml."
fi

# Set up Java 17 for Android Gradle builds
JAVA17=$(find /usr/lib/jvm /usr/local/lib/jvm 2>/dev/null -maxdepth 4 -name 'javac' | grep -E '(17|21|temurin)' | head -1 | sed 's|/bin/javac||')
if [ -z "$JAVA17" ]; then
  echo "Installing Java 17 via apt..."
  sudo apt-get update -qq
  sudo apt-get install -y --no-install-recommends openjdk-17-jdk
  JAVA17=$(find /usr/lib/jvm -maxdepth 4 -name 'javac' | grep '17' | head -1 | sed 's|/bin/javac||')
fi

if [ -n "$JAVA17" ]; then
  mkdir -p ~/.gradle
  printf 'org.gradle.java.home=%s\n' "$JAVA17" > ~/.gradle/gradle.properties
  echo "Java home set to $JAVA17"
else
  echo "WARNING: Java 17 not found or installed"
fi

echo "=== pre-install complete. EAS will now run a fresh pnpm install. ==="
