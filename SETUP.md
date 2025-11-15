# Numera Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your database URL and other credentials.

3. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

Optional variables:
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `SMTP_*` - For email functionality

## Demo Accounts

After running the seed script, you can log in with:
- **Student**: `student@example.com` / `Passw0rd!`
- **Teacher**: `teacher@example.com` / `Passw0rd!`
- **Admin**: `admin@example.com` / `Passw0rd!`

## What to Edit

### Color Palette
Edit `src/lib/theme.ts` and `src/app/globals.css` to update the color scheme.

### Teacher Bios
Edit `prisma/seed.ts` to update teacher information, or use Prisma Studio:
```bash
npx prisma studio
```

### Content
- Units/Lessons: Edit `prisma/seed.ts` or use Prisma Studio
- Home page content: `src/app/page.tsx`
- About page: `src/app/about/page.tsx`

### Rubric Mapping
Update `docs/rubric.md` if you make changes to feature locations.

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Try `npm run db:push` again

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your app URL
- For Google OAuth, ensure credentials are correct

### Build Errors
- Run `npm run db:generate` to regenerate Prisma Client
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Deployment

See `README.md` for deployment instructions. For Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!
