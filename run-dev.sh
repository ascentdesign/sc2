#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/packages/convex" && npx convex dev &
sleep 15
cd "$SCRIPT_DIR/apps/web" && npx next dev --turbopack --port 5000
