#!/bin/bash
cd "$(dirname "$0")" 
npx convex dev &
sleep 20
echo "Convex should be running now"
