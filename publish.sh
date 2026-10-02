#!/usr/bin/env bash
# One-time: create the repo under aashiAi1217, enable Pages (Actions), push.
# Run this after: gh auth login   (choose the aashiAi1217 account)
set -euo pipefail
OWNER=aashiAi1217
REPO=card-perks
cd "$(dirname "$0")"

LOGIN=$(gh api user --jq .login)
if [ "$LOGIN" != "$OWNER" ]; then
  echo "gh is logged in as '$LOGIN'. Run:  gh auth login   and pick $OWNER first." >&2
  exit 1
fi

gh repo view "$OWNER/$REPO" >/dev/null 2>&1 || gh repo create "$OWNER/$REPO" --public --description "Perks – a checklist for every credit card credit 💳"
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
git branch -M main
git push -u origin main
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || true
echo
echo "Pushed. Watch the deploy:  gh run watch --repo $OWNER/$REPO"
echo "Site will be live at:      https://aashiai1217.github.io/$REPO/"
