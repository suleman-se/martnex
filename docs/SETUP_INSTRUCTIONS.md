# Development Setup Instructions

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v13 or higher ([Download](https://www.postgresql.org/download/))
- **Redis** v6 or higher ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))
- **Code Editor** (VS Code recommended)

### Check Versions

```bash
node --version   # Should be v18+
npm --version
psql --version   # Should be v13+
redis-cli --version
```

---

## Part 1: Backend Setup (Medusa.js)

### Step 1: Install Medusa CLI

```bash
npm install -g @medusajs/medusa-cli
```

### Step 2: Create Medusa Project

```bash
cd /Users/macair/Documents/Project/martnex
medusa new backend
cd backend
```

### Step 3: Configure PostgreSQL

#### Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE martnex_dev;

# Create user (optional)
CREATE USER medusa_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE martnex_dev TO medusa_user;

# Exit
\q
```

#### Update Database Connection

Edit `backend/.env`:

```env
DATABASE_URL=postgres://medusa_user:your_password@localhost:5432/martnex_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
COOKIE_SECRET=your-super-secret-cookie-key-change-this
```

### Step 4: Run Migrations

```bash
cd backend
npm run build
medusa migrations run
```

### Step 5: Seed Initial Data

```bash
npm run seed
```

This creates:
- Admin user: `admin@medusa-test.com` / `supersecret`
- Sample products and categories

### Step 6: Start Backend

```bash
npm run dev
```

Backend should be running at:
- **Storefront API:** http://localhost:9000
- **Admin API:** http://localhost:9000/admin
- **Admin UI:** http://localhost:7001

### Step 7: Test Backend

Visit http://localhost:7001 and login with:
- Email: `admin@medusa-test.com`
- Password: `supersecret`

---

## Part 2: Frontend Setup (Next.js)

### Step 1: Create Next.js Project

```bash
cd /Users/macair/Documents/Project/martnex
npx create-next-app@latest frontend --typescript --tailwind --app
```

Choose these options:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ✅ Import alias (@/*)

### Step 2: Install Dependencies

```bash
cd frontend
npm install @medusajs/medusa-js axios
npm install react-hook-form zod @hookform/resolvers
npm install zustand
npm install lucide-react class-variance-authority clsx tailwind-merge
```

### Step 3: Install Shadcn/UI

```bash
npx shadcn-ui@latest init
```

### Step 4: Configure Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Add later
```

### Step 5: Create API Client

Create `frontend/src/lib/api/client.ts`:

```typescript
import Medusa from "@medusajs/medusa-js"

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  maxRetries: 3,
})

export default medusa
```

### Step 6: Test Connection

Create `frontend/src/app/page.tsx`:

```typescript
import medusa from "@/lib/api/client"

export default async function Home() {
  const { products } = await medusa.products.list()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-3 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h2 className="font-semibold">{product.title}</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Step 7: Start Frontend

```bash
npm run dev
```

Visit http://localhost:3000 - you should see sample products!

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
npm install medusa-payment-stripe
```

### Step 3: Configure Stripe

Update `backend/medusa-config.js`:

```javascript
const plugins = [
  // ... other plugins
  {
    resolve: `medusa-payment-stripe`,
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
]
```

Update `backend/.env`:

```env
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Restart Backend

```bash
npm run dev
```

---

## Part 5: File Upload Setup (Optional)

### Option A: AWS S3

```bash
cd backend
npm install medusa-file-s3
```

Configure in `medusa-config.js`:

```javascript
{
  resolve: `medusa-file-s3`,
  options: {
    s3_url: process.env.S3_URL,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    access_key_id: process.env.S3_ACCESS_KEY_ID,
    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
  },
}
```

### Option B: Cloudinary

```bash
npm install medusa-file-cloudinary
```

---

## Part 6: Email Setup (SendGrid)

### Step 1: Install SendGrid Plugin

```bash
cd backend
npm install medusa-plugin-sendgrid
```

### Step 2: Configure

Update `medusa-config.js`:

```javascript
{
  resolve: `medusa-plugin-sendgrid`,
  options: {
    api_key: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM,
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

```bash
cd backend
npm install -D typescript ts-node @types/node
npm install -D eslint prettier

cd ../frontend
npm install -D eslint prettier prettier-plugin-tailwindcss
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
npm run dev

# Terminal 4: Frontend
cd frontend
npm run dev
```

### 2. Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:9000
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
lsof -i :9000  # or :3000, :7001

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
brew services list

# Check connection
psql -U medusa_user -d martnex_dev
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
DROP DATABASE martnex_dev;
CREATE DATABASE martnex_dev;
\q

# Re-run migrations
medusa migrations run
npm run seed
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
npm run dev

# Run migrations
medusa migrations run

# Create new migration
medusa migrations create YourMigrationName

# Seed database
npm run seed

# Build for production
npm run build

# Start production
npm run start
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production
npm run start

# Lint code
npm run lint
```

### Database

```bash
# Connect to database
psql -U medusa_user -d martnex_dev

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
