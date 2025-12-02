# 🚀 Quick Start Guide

## One-Command Setup

```bash
git clone https://github.com/suleman-se/martnex.git
cd martnex
./start.sh
```

That's it! Wait 2-5 minutes and visit:
- **Frontend**: <http://localhost:3000>
- **Admin Panel**: <http://localhost:7001> (admin@martnex.io / supersecret)

---

## Common Commands

| Command | Description |
|---------|-------------|
| `./start.sh` | Start everything (first time setup) |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make logs-backend` | View backend logs only |
| `make logs-frontend` | View frontend logs only |
| `make restart` | Restart all services |
| `make clean` | Remove everything (fresh start) |
| `make shell-backend` | Access backend terminal |
| `make shell-db` | Access database |
| `make status` | Check service status |

Run `make help` to see all available commands.

---

## Project URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | <http://localhost:3000> | Customer-facing website |
| Backend API | <http://localhost:9001> | REST API endpoints |
| Admin Panel | <http://localhost:7001> | Admin dashboard |
| PostgreSQL | `localhost:5432` | Database |
| Redis | `localhost:6379` | Cache/Sessions |

---

## Default Credentials

**Admin Account:**
- Email: `admin@martnex.io`
- Password: `supersecret`

⚠️ **Change these in production!**

---

## Stopping & Restarting

```bash
# Stop everything
docker-compose down

# Start again
docker-compose up -d

# Or use make
make down
make up
```

---

## Fresh Start (Reset Everything)

```bash
# Warning: This deletes all data!
make clean

# Then start fresh
./start.sh
```

---

## Need Help?

- **Docker Guide**: [README.docker.md](README.docker.md)
- **Setup Details**: [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
- **Implementation Plan**: [planning/IMPLEMENTATION_PLAN.md](planning/IMPLEMENTATION_PLAN.md)
- **Troubleshooting**: See [README.docker.md](README.docker.md#troubleshooting)

---

## What's Running?

Check status:
```bash
make status
# or
docker-compose ps
```

Should show:
- ✅ martnex-postgres (healthy)
- ✅ martnex-redis (healthy)
- ✅ martnex-backend (running)
- ✅ martnex-frontend (running)

---

## Making Changes

1. Edit files in `backend/src/` or `frontend/src/`
2. Changes auto-reload (hot reload enabled)
3. View logs: `make logs`
4. Access at <http://localhost:3000> or <http://localhost:7001>

---

## Common Issues

### Port already in use
```bash
# Find what's using the port
lsof -i :3000

# Change port in docker-compose.yml or kill the process
```

### Services won't start
```bash
# View logs
make logs

# Rebuild
docker-compose down
docker-compose up --build -d
```

### Can't access admin panel
1. Wait 30 seconds after first build
2. Check logs: `make logs-backend`
3. Visit: <http://localhost:7001>

---

**That's it! Start building your marketplace! 🎉**
