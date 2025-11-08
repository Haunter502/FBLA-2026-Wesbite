# 🚀 Numera Setup Guide

Complete instructions to get Numera running locally and in production.

**Status**: ✅ Ready for FBLA Website Design Competition 2025-2026

---

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
2. [Development Setup (Detailed)](#development-setup-detailed)
3. [Database Management](#database-management)
4. [Authentication Setup](#authentication-setup)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start (5 minutes)

### Prerequisites
- **Node.js** 18+ (check with `node --version`)
- **pnpm** 8+ (install with `npm install -g pnpm` if needed)
- **Git** (for cloning repository)

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd numera-fbla

# 2. Install dependencies
pnpm install

# 3. Create environment file
cat > .env.local << 'EOF'
DATABASE_URL=file:./dev.db
AUTH_SECRET=your-secret-key-change-me
AUTH_URL=http://localhost:3000
EOF

# 4. Setup database
pnpm db:generate    # Generate Drizzle types
pnpm db:push       # Create tables
pnpm db:seed       # Seed demo data (14 units, teachers, reviews)

# 5. Start development server
pnpm dev

# 6. Open browser
open http://localhost:3000
```

**Demo Accounts** (seed script creates these):
- Student: `student@example.com` / `Passw0rd!`
- Teacher: `teacher@example.com` / `Passw0rd!`
- Admin: `admin@example.com` / `Passw0rd!`

---

## Development Setup (Detailed)

### 1. Environment Variables

Create `.env.local` file in project root:

```bash
# Database
DATABASE_URL=file:./dev.db

# Authentication
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_URL=http://localhost:3000

# Google OAuth (optional, for social login)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Email (optional, for contact form)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

**Generate AUTH_SECRET**:
```bash
openssl rand -base64 32
```

**Get Google OAuth Keys**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy Client ID and Client Secret to `.env.local`

### 2. Install Dependencies

```bash
pnpm install
```

**What gets installed**:
- Next.js 16, React 19
- Drizzle ORM with SQLite driver
- Auth.js (NextAuth v5)
- Tailwind CSS & Framer Motion
- Development tools (TypeScript, ESLint)

**Install time**: ~3-5 minutes (first time)

### 3. Database Setup

#### Generate Drizzle Types

```bash
pnpm db:generate
```

This creates:
- Drizzle migrations directory
- SQL migration files
- TypeScript types from schema

**Output location**: `src/db/migrations/`

#### Create and Push Database

```bash
pnpm db:push
```

This:
1. Creates `dev.db` SQLite file locally
2. Creates all tables
3. Sets up relationships and indexes

**Verify**: Check `dev.db` exists in project root

#### Seed Demo Data

```bash
pnpm db:seed
```

This populates:
- 3 demo users (student, teacher, admin)
- 14 Algebra 1 units
- 6-9 lessons per unit
- Quizzes and tests
- Flashcard sets
- 3 teacher profiles
- Demo reviews
- Tutoring slots

**Verification**: Login with `student@example.com` / `Passw0rd!`

### 4. Start Development Server

```bash
pnpm dev
```

Output:
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Environments: .env.local
```

**Verify**: Open http://localhost:3000 in browser

### 5. Development Commands

```bash
# Start dev server (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Check types
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format

# Database commands
pnpm db:generate   # Generate migrations
pnpm db:push       # Apply migrations
pnpm db:seed       # Reseed data
```

---

## Database Management

### SQLite (Development)

**Location**: `dev.db` in project root

**Connect with CLI tools**:
```bash
# SQLite CLI
sqlite3 dev.db

# View schema
.schema

# Query
SELECT * FROM "user" LIMIT 5;
```

**Reset Database**:
```bash
# Delete SQLite file
rm dev.db

# Recreate
pnpm db:push
pnpm db:seed
```

### PostgreSQL (Production)

**Recommended Providers**:
- [Vercel Postgres](https://vercel.com/storage/postgres) - Easiest with Vercel
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - Firebase alternative
- [AWS RDS](https://aws.amazon.com/rds/) - Enterprise option

**Connection String Format**:
```
postgresql://username:password@hostname:5432/dbname
```

**Setup Steps**:
1. Create database on chosen provider
2. Copy connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations:
   ```bash
   pnpm db:push
   ```
5. (Optional) Run seed:
   ```bash
   pnpm db:seed
   ```

### Database Schema

**Key Tables**:
- `user` - User accounts and auth
- `unit` - Algebra 1 curriculum units
- `lesson` - Individual lessons with content
- `quiz` / `test` - Assessments
- `progress` - User learning progress
- `streak` - Daily learning streaks
- `badge` / `userBadge` - Gamification
- `teacher` - Tutor profiles
- `tutoringSlot` - Available tutoring times
- `review` - Student reviews
- `eventLog` - Activity logs for analytics

**View Full Schema**: `/src/db/schema.ts`

### Migrations

**Create New Migration** (if you modify schema):

```bash
# 1. Update src/db/schema.ts

# 2. Generate migration
pnpm db:generate

# 3. Review changes in src/db/migrations/

# 4. Apply migration
pnpm db:push
```

---

## Authentication Setup

### Credentials (Email/Password)

Users can sign up with email and password. Passwords are:
- Hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Validated server-side

**User Registration**:
- POST `/api/auth/register`
- Body: `{ email, password, name }`
- Creates user with STUDENT role

**User Login**:
- Via NextAuth signin page
- Stored session in database

### Google OAuth

**Setup Steps**:

1. **Create Google App**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Search for "Google+ API" and enable it

2. **Create OAuth Credentials**:
   - Go to "Credentials"
   - Create "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URI:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Save Client ID and Secret

3. **Add to `.env.local`**:
   ```bash
   AUTH_GOOGLE_ID=your_client_id
   AUTH_GOOGLE_SECRET=your_client_secret
   ```

4. **Test**:
   - Visit `http://localhost:3000/auth/sign-in`
   - Click "Continue with Google"
   - Complete OAuth flow

### Role-Based Access Control (RBAC)

**Roles**:
- `STUDENT` - Default role, can see lessons and dashboard
- `TEACHER` - Can manage tutoring slots
- `ADMIN` - Full access to all features

**Check Role in Code**:
```typescript
import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    return <div>Access Denied</div>;
  }
  
  // Admin content here
}
```

**Protected Routes**:
- `/dashboard` - STUDENT+ (auto-redirects if not logged in)
- `/admin` - ADMIN+ (redirects if insufficient permissions)
- `/api/*` - Most endpoints require authentication

---

## Production Deployment

### Deploy to Vercel (Recommended)

**Prerequisites**:
- Code pushed to GitHub
- GitHub account linked to Vercel
- PostgreSQL database created (Neon or Vercel Postgres)

**Steps**:

1. **Push Code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Import in Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select GitHub repo
   - Click "Import"

3. **Configure Environment Variables**:
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     DATABASE_URL=postgresql://...
     AUTH_SECRET=your_secure_secret
     AUTH_URL=https://yourdomain.vercel.app
     AUTH_GOOGLE_ID=...
     AUTH_GOOGLE_SECRET=...
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Click URL to visit live site

5. **Setup Database**:
   ```bash
   # Run migrations in production
   vercel env pull  # Pull production env vars
   pnpm db:push    # Apply migrations to production DB
   ```

### Custom Domain

1. Add domain in Vercel → Settings → Domains
2. Update DNS records (follow Vercel instructions)
3. Update `AUTH_URL` environment variable
4. Revalidate

### Monitoring & Logging

**Vercel Analytics**:
- Built-in performance monitoring
- View in Vercel Dashboard → Analytics

**Error Tracking** (optional):
- Set up Sentry for production errors
- Get Sentry DSN
- Add to environment variables

---

## Troubleshooting

### "Cannot find module '@/db/client'"

**Solution**: Database client not generated
```bash
pnpm db:generate
```

### "SQLITE_CANTOPEN: unable to open database file"

**Solution**: Database file doesn't exist or permissions issue
```bash
# Delete and recreate
rm dev.db
pnpm db:push
pnpm db:seed
```

### "AUTH_SECRET not configured"

**Solution**: Missing environment variable
```bash
# Add to .env.local
AUTH_SECRET=your_secret_generated_above
```

### "Authentication failed: Invalid credentials"

**Solution**: Demo accounts not seeded or password wrong
```bash
# Reseed database
pnpm db:seed

# Use correct credentials
# student@example.com / Passw0rd!
```

### "port 3000 already in use"

**Solution**: Another process using port 3000
```bash
# Option 1: Kill process
lsof -i :3000
kill -9 <PID>

# Option 2: Use different port
pnpm dev -- -p 3001
```

### "Module not found: 'drizzle-orm'"

**Solution**: Dependencies not installed
```bash
pnpm install
```

### "TypeScript errors in IDE but builds fine"

**Solution**: IDE not recognizing types
```bash
# Regenerate types
pnpm db:generate

# Restart TypeScript server in editor (VS Code: Cmd+Shift+P → TypeScript: Restart TS Server)
```

---

## File Structure Quick Reference

```
numera-fbla/
├── .env.local                 # Environment variables (create this)
├── .env.example              # Template (reference only)
├── .gitignore                # Git ignore rules
├── drizzle.config.ts         # Drizzle ORM config
├── next.config.ts            # Next.js config
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
│
├── src/
│   ├── db/
│   │   ├── client.ts         # Drizzle client
│   │   ├── schema.ts         # Database schema
│   │   └── migrations/       # Generated migration files
│   │
│   ├── lib/
│   │   ├── auth.ts           # Auth.js configuration
│   │   ├── theme.ts          # Color palette & tokens
│   │   ├── recommendations.ts # Learning recommendations
│   │   └── streaks.ts        # Streak logic
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── contact/route.ts
│   │   │   └── recommendations/next/route.ts
│   │   │
│   │   ├── dashboard/page.tsx
│   │   ├── units/page.tsx
│   │   ├── lessons/[lessonSlug]/page.tsx
│   │   ├── tutoring/page.tsx
│   │   ├── search/page.tsx
│   │   ├── teachers/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   └── components/
│       ├── ui/               # Reusable components
│       ├── layout/           # Header, Footer
│       ├── dashboard/        # Dashboard widgets
│       ├── home/            # Homepage sections
│       └── providers/       # Context providers
│
├── scripts/
│   └── seed.ts              # Database seeding script
│
├── docs/
│   ├── rubric.md            # FBLA rubric checklist
│   ├── demo-script.md       # Presentation script
│   └── design-decisions.md  # Architecture decisions
│
├── README.md                # Project overview
└── SETUP.md                 # This file
```

---

## Best Practices

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test locally
pnpm dev

# 3. Check types
pnpm type-check

# 4. Commit
git add .
git commit -m "Add feature"

# 5. Push and create PR
git push origin feature/my-feature
```

### Before Committing

- [ ] Run `pnpm type-check` (no errors)
- [ ] Run `pnpm lint` (no errors)
- [ ] Test locally on multiple browsers
- [ ] No console errors/warnings
- [ ] Sensitive data not in code (use `.env.local`)

### Database Changes

1. Modify `src/db/schema.ts`
2. Run `pnpm db:generate`
3. Review migration in `src/db/migrations/`
4. Test with `pnpm db:push`
5. Commit schema and migration together

---

## Performance Tips

- Use `pnpm` instead of `npm` (faster, better for monorepos)
- Clear node_modules if issues persist: `rm -rf node_modules && pnpm install`
- SQLite is great for dev but slow at scale; use PostgreSQL in prod
- Cache database queries when appropriate
- Lazy-load components and images

---

## Support & Questions

For issues not covered here:

1. Check `/docs/design-decisions.md` for architecture questions
2. Review `/docs/rubric.md` for competition requirements
3. Search GitHub Issues in the repository
4. Check Next.js docs: https://nextjs.org/docs
5. Check Drizzle docs: https://orm.drizzle.team
6. Check Auth.js docs: https://authjs.dev

---

## Ready to Ship? 🚀

Once you've completed setup:

1. [ ] Local development works
2. [ ] All demo accounts login successfully
3. [ ] Database seeded with 14 units
4. [ ] Homepage loads without errors
5. [ ] Dashboard shows progress
6. [ ] Search works
7. [ ] No console errors
8. [ ] Lighthouse score ≥ 95

**You're ready for the competition!**

Good luck! 🎯

---

**Last Updated**: November 2025  
**Numera v0.1.0** - Ready for FBLA Website Design 2025-2026
