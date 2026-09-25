#!/usr/bin/env bash
set -euo pipefail

echo "== App Factory local security gate =="

if command -v gitleaks >/dev/null 2>&1; then
  echo "[1/5] Secret scan"
  gitleaks detect --no-banner
else
  echo "[1/5] gitleaks not installed; CI will run the secret scan"
fi

if [ -f package.json ]; then
  echo "[2/5] Dependency audit"
  npm audit --audit-level=high

  echo "[3/5] Typecheck"
  npm run check --if-present

  echo "[4/5] Tests"
  npm test --if-present

  echo "[5/5] Build"
  npm run build --if-present
else
  echo "No package.json yet; skipping npm-based checks."
fi

echo "Security gate complete. Also review RELEASE_CHECKLIST.md before production."
