# Docker Setup Guide for Martnex

This guide will help you set up and run Martnex using Docker.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick Start

### 1. Clone the repository (if you haven't already)

```bash
git clone https://github.com/suleman-se/martnex.git
cd martnex
```

### 2. Build and start all services

```bash
docker-compose up --build
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Medusa Backend** on ports 9001 (API) and 7001 (Admin)
- **Next.js Frontend** on port 3000

### 3. Wait for services to be ready

The first time you run this, it will:
1. Download Docker images
2. Install pnpm dependencies
3. Build the services
4. Start all containers

This may take 5-10 minutes on first run.

### 4. Access the application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9001
- **Admin Panel**: http://localhost:7001

## Initial Setup

### Run database migrations

```bash
docker-compose exec backend pnpm run db:migrate
```

### Seed initial data

This creates an admin user (admin@martnex.io / supersecret):

```bash
docker-compose exec backend pnpm run seed
```

## Useful Commands

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove all data (clean slate)

```bash
docker-compose down -v
```

### Restart a specific service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Access service shell

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# PostgreSQL shell
docker-compose exec postgres psql -U martnex -d martnex
```

### Install new packages (using pnpm)

```bash
# Backend
docker-compose exec backend pnpm add <package-name>

# Frontend
docker-compose exec frontend pnpm add <package-name>

# Dev dependencies
docker-compose exec backend pnpm add -D <package-name>
```

### Run migrations

```bash
# Create new migration
docker-compose exec backend pnpm run migrations:create

# Run migrations
docker-compose exec backend pnpm run db:migrate
```

## Development Workflow

1. Make code changes in your local `backend/` or `frontend/` directories
2. Changes are automatically synced to containers via volumes
3. Hot reload is enabled - changes appear automatically
4. If you add dependencies, restart the container: `docker-compose restart backend`

## Troubleshooting

### Port already in use

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000  # or :9001, :5432, etc.

# Change ports in docker-compose.yml if needed
```

### Database connection errors

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend pnpm run db:migrate
```

### Container won't start

```bash
# View detailed logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d
```

### Clear everything and start fresh

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all Docker build cache
docker system prune -a

# Start fresh
docker-compose up --build
```

## Environment Variables

Key environment variables are in:
- `.env` (root level - for Docker Compose)
- `backend/.env` (backend-specific)
- `frontend/.env.local` (frontend-specific)

For production, update these with secure values!

## Project Structure

```
martnex/
├── docker-compose.yml          # Docker services configuration
├── .env                        # Environment variables
├── backend/
│   ├── Dockerfile             # Backend container config
│   ├── package.json           # Backend dependencies
│   ├── medusa-config.ts       # Medusa configuration
│   └── src/                   # Backend source code
└── frontend/
    ├── Dockerfile             # Frontend container config
    ├── package.json           # Frontend dependencies
    ├── next.config.ts         # Next.js configuration
    └── src/                   # Frontend source code
```

## Next Steps

1. ✅ Run migrations: `docker-compose exec backend pnpm run db:migrate`
2. ✅ Seed data: `docker-compose exec backend pnpm run seed`
3. ✅ Access admin panel: http://localhost:7001 (admin@martnex.io / supersecret)
4. ✅ Start building features!

For more details, see [SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)
