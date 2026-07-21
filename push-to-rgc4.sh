#!/bin/bash
# Push this code to RGC4/AmeraIOT_No_Landing_Page
# The token is already saved in this workspace — no need to type it.

set -e

echo "Step 1: Clearing any stale lock..."
rm -f .git/config.lock

echo "Step 2: Setting up the remote..."
git remote add rgc4-no "https://${GITHUB_TOKEN}@github.com/RGC4/AmeraIOT_No_Landing_Page.git" 2>/dev/null || true

echo "Step 3: Pushing your code..."
git push rgc4-no main --force

echo ""
echo "Done! Your code is now on github.com/RGC4/AmeraIOT_No_Landing_Page"
