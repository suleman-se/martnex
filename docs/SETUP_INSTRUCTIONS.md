# Development Setup Instructions

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v17 or higher ([Download](https://www.postgresql.org/download/))
- **Redis** v7 or higher ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))
- **Code Editor** (VS Code recommended)

### Check Versions

```bash
node --version   # Should be v18+
pnpm --version
psql --version   # Should be v17+
redis-cli --version
```

---

## Part 1: Backend Setup (Medusa.js)

### Step 1: Navigate to Backend Directory

The backend project structure has already been created with Medusa v2.

```bash
cd /Users/macair/Documents/Project/martnex/backend
```

### Step 3: Configure PostgreSQL

#### Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE martnex;

# Create user (optional)
CREATE USER martnex WITH PASSWORD 'martnex_dev_password';
GRANT ALL PRIVILEGES ON DATABASE martnex TO martnex;

# Exit
\q
```

#### Update Database Connection

Edit `backend/.env`:

```env
DATABASE_URL=postgres://martnex:martnex_dev_password@localhost:5432/martnex?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret-change-in-production
COOKIE_SECRET=supersecret-cookie-change-in-production
```

### Step 2: Run Migrations

```bash
cd backend
pnpm install
pnpm run db:migrate
```

### Step 3: Seed Initial Data

```bash
pnpm run seed
```

This creates:
- Admin user: `admin@martnex.io` / `supersecret`
- Sample products and categories

### Step 4: Start Backend

```bash
pnpm run dev
```

Backend should be running at:
- **Storefront API:** http://localhost:9001
- **Admin API:** http://localhost:9001/admin
- **Admin UI:** http://localhost:7001

### Step 5: Test Backend

Visit http://localhost:7001 and login with:
- Email: `admin@martnex.io`
- Password: `supersecret`

---

## Part 2: Frontend Setup (Next.js)

### Step 1: Navigate to Frontend Directory

The frontend project structure has already been created with Next.js 16.

```bash
cd /Users/macair/Documents/Project/martnex/frontend
```

### Step 2: Install Dependencies

```bash
cd frontend
pnpm install
```

### Step 3: Configure Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Add later
```

### Step 4: Start Frontend

```bash
pnpm run dev
```

Visit http://localhost:3000 - you should see the Martnex frontend!

---

## Part 3: Redis Setup

### Option A: Local Redis (macOS)

```bash
# Install via Homebrew
brew install redis

# Start Redis
brew services start redis

# Test
redis-cli ping  # Should return "PONG"
```

### Option B: Docker Redis

```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

---

## Part 4: Payment Setup (Stripe)

### Step 1: Create Stripe Account

1. Sign up at https://stripe.com
2. Get your test API keys from Dashboard

### Step 2: Install Stripe Plugin

```bash
cd backend
pnpm add @medusajs/medusa-payment-stripe
```

### Step 3: Configure Stripe

Update `backend/medusa-config.ts`:

```typescript
modules: {
  // ... other modules
  medusaPaymentStripe: {
    resolve: "@medusajs/medusa-payment-stripe",
    options: {
      apiKey: process.env.STRIPE_API_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
}
```

Update `backend/.env`:

```env
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Restart Backend

```bash
pnpm run dev
```

---

## Part 5: File Upload Setup (Optional)

### Option A: AWS S3

```bash
cd backend
pnpm add @medusajs/medusa-file-s3
```

Configure in `medusa-config.ts`:

```typescript
modules: {
  medusaFileS3: {
    resolve: "@medusajs/medusa-file-s3",
    options: {
      fileUrl: process.env.S3_URL,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  },
}
```

### Option B: Cloudinary

```bash
pnpm add medusa-file-cloudinary
```

---

## Part 6: Email Setup (SendGrid)

### Step 1: Install SendGrid Plugin

```bash
cd backend
pnpm add medusa-plugin-sendgrid
```

### Step 2: Configure

Update `medusa-config.ts`:

```typescript
modules: {
  sendgrid: {
    resolve: "medusa-plugin-sendgrid",
    options: {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
    },
  },
}
```

Update `.env`:

```env
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM=noreply@yourdomain.com
```

---

## Development Tools Setup

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL
- GitLens
- Thunder Client (API testing)

### Install Development Tools

Development tools are already configured in both backend and frontend projects.

```bash
# Backend already has: typescript, ts-node, @types/node, eslint
# Frontend already has: eslint, prettier
```

### Create `.prettierrc` (both frontend & backend)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Testing the Complete Setup

### 1. Start All Services

```bash
# Terminal 1: Redis
brew services start redis  # or docker run...

# Terminal 2: PostgreSQL
brew services start postgresql

# Terminal 3: Backend
cd backend
pnpm run dev

# Terminal 4: Frontend
cd frontend
pnpm run dev
```

### 2. Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:9001
- **Admin UI:** http://localhost:7001
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 3. Test Checklist

- [ ] Frontend loads and shows products
- [ ] Admin UI accessible and functional
- [ ] Can create/edit products in admin
- [ ] Products appear on frontend
- [ ] Redis connection working (check backend logs)
- [ ] Database connection working

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :9001  # or :3000, :7001

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
brew services list

# Check connection
psql -U martnex -d martnex
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Restart Redis
brew services restart redis
```

### Medusa Migrations Fail

```bash
# Reset database
psql postgres
DROP DATABASE martnex;
CREATE DATABASE martnex;
\q

# Re-run migrations
pnpm run db:migrate
pnpm run seed
```

---

## Next Steps

Once setup is complete:

1. ✅ Explore Medusa Admin UI
2. ✅ Create test products
3. ✅ Test checkout flow
4. ✅ Review [planning/IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md)
5. ✅ Start Week 1 tasks
6. ✅ Read [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) for full requirements

---

## Useful Commands

### Backend

```bash
# Start development server
pnpm run dev

# Run migrations
pnpm run db:migrate

# Generate new migration
pnpm run db:generate

# Seed database
pnpm run seed

# Build for production
pnpm run build

# Start production
pnpm run start
```

### Frontend

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production
pnpm run start

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Database

```bash
# Connect to database
psql -U martnex -d martnex

# List tables
\dt

# Describe table
\d table_name

# Exit
\q
```

---

## Support

If you encounter issues:

1. Check Medusa docs: https://docs.medusajs.com
2. Check Next.js docs: https://nextjs.org/docs
3. Review error logs in terminal
4. Search GitHub issues
5. Ask in project team channel
