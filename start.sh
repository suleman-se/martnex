#!/bin/bash

# Martnex Multi-Vendor Startup & Repair Script
# This script handles the "Catch-22" of Medusa v2 module loading by ensuring
# migrations run BEFORE the main server boots.

echo "================================"
echo "   Martnex System Orchestrator"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Function to run a command and check for success
run_step() {
    echo "🏗️  $1..."
    if $2; then
        echo "✅ Success: $1"
    else
        echo "❌ Failed: $1"
        return 1
    fi
}

# 1. Start Infrastructure only (DB & Redis)
echo "🚀 Starting infrastructure (Postgres & Redis)..."
docker-compose up -d postgres redis

# 2. Wait for Postgres to be healthy
echo "⏳ Waiting for database to be ready..."
RETRIES=30
until docker-compose exec postgres pg_isready -U martnex > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "   ...waiting for Postgres ($RETRIES retries left)"
    sleep 2
    RETRIES=$((RETRIES-1))
done

if [ $RETRIES -eq 0 ]; then
    echo "❌ Postgres failed to become ready in time."
    exit 1
fi

echo "✅ Database is ready"
echo ""

# 3. Check if database needs initialization
# We check if the 'seller' table exists (our custom module)
DB_READY=$(docker-compose exec postgres psql -U martnex -d martnex -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'seller');" | tr -d '[:space:]')

if [ "$DB_READY" != "t" ]; then
    echo "🗄️  Database initialization detected (First run or recovery)..."
    
    echo "📦 Ensuring dependencies are installed in container..."
    docker-compose run --rm backend pnpm install
    
    echo "🏗️  Running migrations..."
    docker-compose run --rm backend pnpm run db:migrate
    
    echo "🌱 Seeding initial data..."
    docker-compose run --rm backend pnpm run seed
    
    echo "🔗 Syncing module links..."
    docker-compose run --rm backend pnpm run db:sync
    
    echo "🔑 Registering Publishable API Key..."
    docker-compose run --rm backend pnpm exec medusa exec ./src/scripts/create-publishable-key.ts
    
    echo "✨ Database initialized successfully!"
else
    echo "✅ Database schema detected. Skipping initialization."
fi

echo ""
echo "🚀 Starting Martnex Backend and Frontend..."
docker-compose up -d

echo ""
echo "================================"
echo "   All systems are GO!"
echo "================================"
echo ""
echo "Frontend:      http://localhost:3000"
echo "Backend API:   http://localhost:9001"
echo "Admin Panel:   http://localhost:7001"
echo ""
echo "Credentials (Admin): admin@martnex.io / supersecret"
echo "================================"
echo ""
echo "To view logs: docker-compose logs -f backend"
