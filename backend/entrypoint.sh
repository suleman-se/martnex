#!/bin/sh
set -e

echo "📦 Ensuring dependencies are installed..."
CI=true pnpm install --no-frozen-lockfile

echo "🔄 Running database migrations..."
pnpm run db:migrate

echo "🔗 Syncing module links..."
pnpm run db:sync

echo "🔑 Creating publishable API key (if missing)..."
pnpm exec medusa exec ./src/scripts/create-publishable-key.ts

echo "✅ Migration complete. Starting server..."
exec pnpm run dev
