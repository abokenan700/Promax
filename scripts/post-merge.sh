#!/bin/bash
set -e

echo "Running post-merge setup..."

# Install all workspace dependencies
pnpm install

# Push database schema changes
pnpm --filter @workspace/db run push

echo "Post-merge setup complete."
