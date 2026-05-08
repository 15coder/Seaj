#!/usr/bin/env bash
set -e

echo "=== EAS pre-install: preparing workspace for build ==="

# Install pnpm globally so the rest of the build can use it
npm install -g pnpm@10.26.1
echo "pnpm installed: $(pnpm --version)"

# Replace pnpm-workspace.yaml with a minimal version any pnpm version understands.
# The original uses pnpm 9+ features (catalog:, minimumReleaseAge) which break older pnpm.
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - artifacts/siyaj
EOF
echo "Simplified pnpm-workspace.yaml written."

# Remove the incompatible lockfile (v9.0 format).
# We will regenerate a fresh compatible one below.
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
  cat > ~/.gradle/gradle.properties << GRADLEEOF
org.gradle.java.home=$JAVA17
org.gradle.jvmargs=-XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError -Xmx4g -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.parallel=true
GRADLEEOF
  echo "Gradle user home properties written (Java: $JAVA17)"
else
  echo "WARNING: Java 17 not found"
fi

# Generate a fresh lockfile so that EAS's own
# "pnpm install --frozen-lockfile" succeeds.
echo "Generating fresh pnpm-lock.yaml..."
pnpm install --no-frozen-lockfile
echo "Fresh lockfile generated."

echo "=== pre-install complete ==="
