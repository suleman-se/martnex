# Deployment Guide

Complete guide for deploying the marketplace platform to production.

---

## Deployment Architecture

```
Frontend (Next.js) → Vercel
Backend (Medusa.js) → Railway / DigitalOcean
Database (PostgreSQL) → Managed Service
Redis → Managed Service
File Storage → AWS S3 / Cloudinary
```

---

## Prerequisites

- [ ] Git repository with code
- [ ] Vercel account (free tier works)
- [ ] Railway/DigitalOcean account
- [ ] Domain name (optional but recommended)
- [ ] Stripe account (production keys)
- [ ] SendGrid account (production API key)
- [ ] AWS/Cloudinary account (for file uploads)

---

## Part 1: Database Deployment

### Option A: Railway PostgreSQL

1. **Create Database**
   - Go to Railway dashboard
   - Click "New Project" → "Provision PostgreSQL"
   - Copy connection string

2. **Connection String Format**
   ```
   postgresql://user:password@host:port/database
   ```

### Option B: DigitalOcean Managed Database

1. **Create Database**
   - Go to DigitalOcean → Databases
   - Create PostgreSQL cluster
   - Choose plan (Basic $15/mo recommended for start)
   - Copy connection details

2. **Connection Pooling**
   - Enable connection pooling
   - Use pool mode: Session

### Option C: AWS RDS

1. **Create RDS Instance**
   - Choose PostgreSQL
   - Select instance type (t3.micro for testing)
   - Configure security group
   - Copy endpoint

---

## Part 2: Redis Deployment

### Option A: Railway Redis

1. **Provision Redis**
   - Railway dashboard → "New" → "Database" → "Redis"
   - Copy connection URL

### Option B: DigitalOcean Redis

1. **Create Redis Cluster**
   - DigitalOcean → Databases → Redis
   - Basic plan ($15/mo)
   - Copy connection string

### Option C: Upstash (Serverless Redis)

1. **Create Database**
   - Go to upstash.com
   - Create database
   - Copy REST URL

---

## Part 3: Backend Deployment (Railway)

### Step 1: Prepare Backend

1. **Create `Procfile`** (if not exists)
   ```
   web: npm run start
   ```

2. **Update `package.json` scripts**
   ```json
   {
     "scripts": {
       "start": "medusa start",
       "build": "medusa build",
       "migrate": "medusa migrations run"
     }
   }
   ```

3. **Ensure `.env` is in `.gitignore`**

### Step 2: Deploy to Railway

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose backend folder

2. **Configure Environment Variables**

   Go to Settings → Variables and add:

   ```env
   NODE_ENV=production
   DATABASE_URL=<your-postgres-connection-string>
   REDIS_URL=<your-redis-connection-string>
   JWT_SECRET=<generate-random-secret>
   COOKIE_SECRET=<generate-random-secret>

   # Stripe
   STRIPE_API_KEY=sk_live_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # SendGrid
   SENDGRID_API_KEY=SG.your_key
   SENDGRID_FROM=noreply@yourdomain.com

   # File Storage (AWS S3 or Cloudinary)
   S3_URL=https://s3.amazonaws.com
   S3_BUCKET=your-bucket-name
   S3_REGION=us-east-1
   S3_ACCESS_KEY_ID=your_access_key
   S3_SECRET_ACCESS_KEY=your_secret_key

   # Admin CORS
   ADMIN_CORS=https://yourdomain.com,https://admin.yourdomain.com
   STORE_CORS=https://yourdomain.com
   ```

3. **Run Migrations**
   - In Railway, go to your service
   - Click "Settings" → "Deploy"
   - After deployment, run migrations manually:
     ```bash
     railway run medusa migrations run
     ```

4. **Get Backend URL**
   - Railway generates a URL like: `https://your-app.railway.app`
   - Copy this for frontend configuration

### Step 3: Configure Domain (Optional)

1. **Add Custom Domain**
   - Railway Settings → Domains
   - Add your domain (e.g., api.yourdomain.com)
   - Update DNS records as instructed

---

## Part 4: Backend Deployment (DigitalOcean Alternative)

### Option: Deploy to DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean → Apps
   - Connect GitHub repository
   - Select backend folder

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Run command: `npm run start`

3. **Set Environment Variables** (same as Railway above)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

---

## Part 5: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update Environment Variables**

   Create `.env.production`:
   ```env
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```

2. **Test Production Build Locally**
   ```bash
   npm run build
   npm run start
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Dashboard**
   - Go to vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select frontend folder
   - Configure as Next.js project

3. **Set Environment Variables**

   In Vercel dashboard → Settings → Environment Variables:
   ```env
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel auto-deploys from main branch

5. **Get Frontend URL**
   - Vercel provides URL like: `https://your-app.vercel.app`
   - Or configure custom domain

### Step 3: Configure Custom Domain

1. **Add Domain in Vercel**
   - Settings → Domains
   - Add your domain (e.g., yourdomain.com)
   - Update DNS records as instructed

2. **SSL Certificate**
   - Vercel automatically provisions SSL
   - Wait for propagation

---

## Part 6: File Storage Setup

### Option A: AWS S3

1. **Create S3 Bucket**
   - Go to AWS S3 console
   - Create bucket (e.g., `martnex-uploads`)
   - Enable public read access for product images
   - Configure CORS

2. **Create IAM User**
   - Create user with S3 access
   - Save Access Key ID and Secret

3. **Update Backend Environment**
   - Add S3 credentials to Railway/DigitalOcean

### Option B: Cloudinary

1. **Create Account**
   - Go to cloudinary.com
   - Get API credentials

2. **Configure Backend**
   - Add Cloudinary credentials to environment

---

## Part 7: Configure Webhooks

### Stripe Webhooks

1. **Create Webhook Endpoint**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-backend-url/hooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

2. **Get Webhook Secret**
   - Copy signing secret
   - Add to backend environment as `STRIPE_WEBHOOK_SECRET`

### PayPal Webhooks (if using)

1. **Create Webhook**
   - PayPal Developer Dashboard → Webhooks
   - URL: `https://your-backend-url/hooks/paypal`
   - Select events

---

## Part 8: Email Configuration

### SendGrid Setup

1. **Verify Domain**
   - SendGrid → Settings → Sender Authentication
   - Verify your domain or single sender

2. **Create API Key**
   - Settings → API Keys → Create
   - Copy key to backend environment

3. **Create Email Templates** (optional)
   - Dynamic Templates for order confirmations
   - Update template IDs in code

---

## Part 9: Monitoring & Error Tracking

### Sentry Setup

1. **Create Sentry Project**
   - Go to sentry.io
   - Create project for Next.js (frontend)
   - Create project for Node.js (backend)

2. **Install Sentry**

   **Backend:**
   ```bash
   npm install @sentry/node
   ```

   **Frontend:**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Configure Sentry**

   Add DSN to environment variables:
   ```env
   SENTRY_DSN=https://your-dsn@sentry.io/project
   ```

---

## Part 10: CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm install
      - run: cd backend && npm run build
      - run: cd backend && npm test
      # Railway auto-deploys on push

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Vercel auto-deploys on push
```

---

## Part 11: Post-Deployment Tasks

### 1. Run Database Migrations

```bash
# Using Railway CLI
railway run medusa migrations run

# Or via admin panel if available
```

### 2. Create Admin User

```bash
# Using Railway CLI
railway run medusa user -e admin@yourdomain.com -p your-secure-password
```

### 3. Test Critical Flows

- [ ] User registration
- [ ] Product listing
- [ ] Add to cart
- [ ] Checkout with Stripe
- [ ] Order confirmation email
- [ ] Admin login
- [ ] Seller registration

### 4. Configure CORS

Ensure backend CORS allows frontend domain:

```env
STORE_CORS=https://yourdomain.com,https://www.yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
```

### 5. Set Up Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- Better Uptime

Monitor:
- Frontend URL
- Backend health endpoint: `https://your-backend-url/health`

---

## Part 12: Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] Environment variables secured (not in code)
- [ ] Database has strong password
- [ ] Redis has password/authentication
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Stripe webhook signatures verified
- [ ] File uploads validated and scanned
- [ ] Admin panel behind authentication
- [ ] Security headers configured
- [ ] Regular backups scheduled

---

## Part 13: Backup Strategy

### Database Backups

**Railway:**
- Automatic daily backups
- Configure retention period

**DigitalOcean:**
- Enable automated backups
- Set backup window

**Manual Backup:**
```bash
pg_dump -h your-host -U your-user -d your-db > backup.sql
```

### Code Backups

- Git repository (GitHub)
- Multiple branches
- Tag releases

---

## Rollback Procedures

### Frontend Rollback

**Vercel:**
- Go to Deployments
- Click previous deployment
- Click "Promote to Production"

### Backend Rollback

**Railway:**
- Go to Deployments
- Select previous deployment
- Click "Redeploy"

**Manual:**
```bash
git revert <commit-hash>
git push origin main
```

---

## Cost Estimates

### Minimum Monthly Costs

| Service | Cost |
|---------|------|
| Railway (Backend + PostgreSQL + Redis) | $5-20 |
| Vercel (Frontend) | $0 (hobby) |
| AWS S3 (Storage) | $1-5 |
| SendGrid (Email) | $0-15 |
| Domain Name | $10-15/year |
| **Total** | **~$10-40/month** |

### Scaling Costs

As traffic grows:
- Database: $15-50/month
- Backend hosting: $20-100/month
- Redis: $15-30/month
- CDN: $0-50/month
- **Total (scaled):** $50-200/month

---

## Troubleshooting

### Build Fails

- Check Node version compatibility
- Review build logs
- Verify all dependencies installed

### Database Connection Errors

- Check connection string format
- Verify firewall/IP whitelist
- Test connection locally

### CORS Errors

- Update CORS environment variables
- Ensure protocol matches (http vs https)
- Clear browser cache

### Stripe Webhook Failures

- Verify webhook secret
- Check endpoint URL is accessible
- Review Stripe dashboard logs

---

## Maintenance

### Regular Tasks

- [ ] Monitor error logs (daily)
- [ ] Review database performance (weekly)
- [ ] Update dependencies (monthly)
- [ ] Review security updates (monthly)
- [ ] Test backups (monthly)
- [ ] Review costs and usage (monthly)

---

## Support & Documentation

- **Medusa Docs:** https://docs.medusajs.com
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **DigitalOcean Docs:** https://docs.digitalocean.com

---

## Next Steps After Deployment

1. ✅ Configure custom domain
2. ✅ Set up monitoring and alerts
3. ✅ Test all user flows
4. ✅ Load test the platform
5. ✅ Create user documentation
6. ✅ Plan marketing launch
