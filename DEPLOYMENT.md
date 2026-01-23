# Deployment Guide for Vercel

## Quick Deploy Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **Set up Database**:
   - Go to your Vercel project dashboard
   - Navigate to Storage → Create Database → Postgres
   - Copy the connection string

5. **Add Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` - Your Postgres connection string from step 4
   - `AUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `AUTH_URL` - Your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
   - `NODE_ENV` - Set to `production`

6. **Run Database Migrations**:
   ```bash
   vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```

7. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub** (already done)

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Import your repository**:
   - Click "Add New Project"
   - Select `NUMERA_FBLA_NCCC_FINAL`
   - Vercel will auto-detect Next.js settings

4. **Set up Database**:
   - In project settings, go to Storage
   - Create a Postgres database
   - Copy the connection string

5. **Add Environment Variables**:
   - Go to Settings → Environment Variables
   - Add:
     - `DATABASE_URL` - Postgres connection string
     - `AUTH_SECRET` - Generate with: `openssl rand -base64 32`
     - `AUTH_URL` - Your Vercel URL
     - `NODE_ENV` - `production`

6. **Deploy**:
   - Vercel will automatically deploy on push
   - Or click "Deploy" in the dashboard

7. **Run Database Setup** (after first deployment):
   ```bash
   # Connect to Vercel CLI
   vercel link
   vercel env pull .env.local
   
   # Run migrations and seed
   npm run db:push
   npm run db:seed
   ```

## Database Migration

After setting up the Postgres database, you'll need to:

1. **Push schema**:
   ```bash
   npm run db:push
   ```

2. **Seed initial data** (optional):
   ```bash
   npm run db:seed
   ```

## Environment Variables Needed

- `DATABASE_URL` - Postgres connection string (from Vercel Storage)
- `AUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `AUTH_URL` - Your production URL
- `NODE_ENV` - Set to `production`

## Notes

- The app will automatically use PostgreSQL when `DATABASE_URL` starts with `postgres`
- Make sure to run migrations after setting up the database
- The free tier of Vercel Postgres should be sufficient for development/testing
