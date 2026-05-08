#!/usr/bin/env bash
# No set -e — never abort early

echo "=== EAS pre-install: start ==="
echo "pnpm: $(pnpm --version 2>/dev/null || echo 'not found')"
echo "node: $(node --version 2>/dev/null || echo 'not found')"

# Fix Gradle JVM args so Java 17 doesn't choke on -XX:MaxPermSize
mkdir -p ~/.gradle

JAVA_HOME_CANDIDATE=""
for dir in /usr/lib/jvm /usr/local/lib/jvm /opt/java; do
  found=$(find "$dir" -maxdepth 4 -name 'javac' 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    JAVA_HOME_CANDIDATE=$(dirname "$(dirname "$found")")
    break
  fi
done

if [ -n "$JAVA_HOME_CANDIDATE" ]; then
  cat > ~/.gradle/gradle.properties << GEOF
org.gradle.java.home=$JAVA_HOME_CANDIDATE
org.gradle.jvmargs=-XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError -Xmx4g -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.parallel=true
GEOF
  echo "Gradle: configured with JAVA_HOME=$JAVA_HOME_CANDIDATE"
else
  cat > ~/.gradle/gradle.properties << GEOF
org.gradle.jvmargs=-XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError -Xmx4g -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.parallel=true
GEOF
  echo "Gradle: configured with system Java"
fi

echo "=== EAS pre-install: done ==="
