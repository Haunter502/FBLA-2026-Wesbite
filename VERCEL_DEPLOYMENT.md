# Vercel Deployment Guide

## Environment Variables

Your environment variables are stored in `.env.local` (not committed to git for security).

### Required Environment Variables for Vercel

Add these in your Vercel project settings → Environment Variables:

#### 1. Database Configuration
```
DATABASE_URL=
```
- **For development:** Leave empty (uses SQLite `dev.db`)
- **For production:** Use a PostgreSQL connection string (Vercel Postgres recommended)
- **Example:** `postgresql://user:password@host:5432/dbname`

#### 2. NextAuth Configuration
```
AUTH_SECRET=<your-secret-here>
AUTH_URL=https://your-domain.vercel.app
```
- **AUTH_SECRET:** Generate with: `openssl rand -base64 32`
- **AUTH_URL:** Your Vercel deployment URL (e.g., `https://numera-fbla.vercel.app`)

#### 3. Email Configuration (Optional)
```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@numera.edu
```
- Only needed if you want email functionality
- Leave empty if not using email

### Steps to Deploy

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In project settings → Environment Variables
   - Add each variable from `.env.local`
   - Make sure to:
     - Generate a new `AUTH_SECRET` for production
     - Set `AUTH_URL` to your Vercel domain
     - Set up a PostgreSQL database (Vercel Postgres) and add `DATABASE_URL`

4. **Database Setup**
   - **Option 1:** Use Vercel Postgres (recommended)
     - Add Vercel Postgres integration
     - It will automatically set `DATABASE_URL`
   - **Option 2:** Use external PostgreSQL
     - Get connection string from your provider
     - Add as `DATABASE_URL` environment variable

5. **Deploy**
   - Vercel will automatically deploy on push
   - Or click "Deploy" in the dashboard

### Important Notes

- **SQLite won't work on Vercel** - You need PostgreSQL for production
- **AUTH_SECRET** must be at least 32 characters
- **AUTH_URL** must match your actual Vercel domain
- Environment variables are case-sensitive
- Add variables for all environments (Production, Preview, Development)

### Database Migration

After setting up PostgreSQL, you'll need to:
1. Run migrations: `npm run db:push` (or use Drizzle migrations)
2. Seed the database: `npm run db:seed`

You can do this via Vercel's CLI or add a build script.

### Current Environment Variables

Check `.env.local` for your current values (not shown here for security).


