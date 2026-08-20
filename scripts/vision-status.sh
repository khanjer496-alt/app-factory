#!/usr/bin/env bash
set -euo pipefail

if [[ -f VISION.md ]]; then
  echo "VISION.md: present"
  echo "Before material scope changes, read VISION.md and classify the change as aligned, resisted, or ambiguous."
  exit 0
fi

count=$(git rev-list --count HEAD 2>/dev/null || echo 0)
echo "VISION.md: not yet present"
echo "Repository commits: $count"
if [[ "$count" -ge 15 ]]; then
  echo "Suggestion: there may now be enough product history to run /vision."
else
  echo "Keep building from PRODUCT_SPEC.md. Run /vision once meaningful product history exists."
fi
