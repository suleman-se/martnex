#!/bin/bash

echo "================================"
echo "   Martnex Docker Setup"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if this is first run
if [ ! -f "backend/pnpm-lock.yaml" ]; then
    echo "📦 First time setup detected..."
    echo ""

    echo "🏗️  Building Docker images (this may take 5-10 minutes)..."
    docker-compose up --build -d

    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 30

    echo ""
    echo "🗄️  Running database migrations..."
    docker-compose exec backend pnpm run db:migrate

    echo ""
    echo "🌱 Seeding initial data..."
    docker-compose exec backend pnpm run seed

    echo ""
    echo "✅ Setup complete!"
else
    echo "🚀 Starting services..."
    docker-compose up -d
fi

echo ""
echo "================================"
echo "   Services are running!"
echo "================================"
echo ""
echo "Frontend:      http://localhost:3000"
echo "Backend API:   http://localhost:9001"
echo "Admin Panel:   http://localhost:7001"
echo ""
echo "Default admin credentials:"
echo "Email:    admin@martnex.io"
echo "Password: supersecret"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
echo "See README.docker.md for more commands"
echo "================================"
