# Next Steps - Completing the Numera FBLA Project

## 🎯 What's Been Completed

### ✅ Infrastructure (100%)
- Drizzle ORM setup with SQLite/PostgreSQL support
- Auth.js with Credentials + Google OAuth
- Tailwind CSS with brand color palette
- Next.js 16 configuration
- Comprehensive database schema (20 tables)
- Complete seed script with 14 units, 90+ lessons, quizzes, tests

### ✅ Core Components (100%)
- All UI primitives (Button, Card, Dialog, Badge, Progress, Input, Label)
- Domain-specific components (UnitCard, LessonCard, StreakCounter, BadgeList)
- Search, Teacher, and Review components
- Progress tracking components

### ✅ Documentation (80%)
- Comprehensive README.md
- Implementation status tracking
- .env.example with all variables
- This next-steps guide

---

## 🚧 Critical Tasks Remaining

### Priority 1: Migrate Remaining Files from Prisma to Drizzle

**Files still using Prisma** (must be updated):

1. `/src/app/page.tsx` - Home page
2. `/src/app/dashboard/page.tsx` - Dashboard
3. `/src/app/units/page.tsx` - Units list
4. `/src/app/units/[unitSlug]/page.tsx` - Unit detail
5. `/src/app/lessons/[lessonSlug]/page.tsx` - Lesson detail
6. `/src/app/lessons/[lessonSlug]/flashcards/[setId]/page.tsx` - Flashcards
7. `/src/app/teachers/page.tsx` - Teachers list
8. `/src/app/tutoring/page.tsx` - Tutoring page
9. `/src/app/api/flashcards/[setId]/route.ts` - Flashcard API
10. `/src/app/api/tutoring/book/route.ts` - Booking API
11. `/src/app/api/tutoring/immediate/route.ts` - Immediate help API
12. `/src/app/api/tutoring/slots/route.ts` - Slots API

**How to migrate a file**:

```typescript
// OLD (Prisma)
import { prisma } from "@/lib/prisma"
const units = await prisma.unit.findMany()

// NEW (Drizzle)
import { db, units as unitsTable } from "@/lib/db"
const units = await db.select().from(unitsTable)
```

**Common patterns**:

```typescript
// Find many
prisma.unit.findMany() 
→ db.select().from(units)

// Find unique/by ID
prisma.unit.findUnique({ where: { id } })
→ db.select().from(units).where(eq(units.id, id)).limit(1)

// Create
prisma.unit.create({ data: {...} })
→ db.insert(units).values({...}).returning()

// Update
prisma.unit.update({ where: { id }, data: {...} })
→ db.update(units).set({...}).where(eq(units.id, id))

// Delete
prisma.unit.delete({ where: { id } })
→ db.delete(units).where(eq(units.id, id))

// Relations/Joins
prisma.lesson.findMany({ include: { unit: true } })
→ db.select().from(lessons).innerJoin(units, eq(lessons.unitId, units.id))
```

### Priority 2: Create Missing API Routes

Create these files in `/src/app/api/`:

```typescript
// /api/recommendations/next/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getNextBestLesson } from "@/lib/recommendations"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const recommendation = await getNextBestLesson(session.user.id)
  return NextResponse.json({ recommendation })
}

// /api/progress/update/route.ts
// Track lesson completion, update streaks, award badges

// /api/quiz/[quizId]/submit/route.ts
// Handle quiz submissions, calculate scores

// /api/contact/route.ts
// Handle contact form submissions
```

### Priority 3: Build/Update Key Pages

#### Home Page (`/src/app/page.tsx`)

```typescript
import { db, units, reviews, users } from "@/lib/db"
import { HeroSection } from "@/components/home/hero-section"
import { ReviewsCarousel } from "@/components/home/reviews-carousel"
import { UnitCard } from "@/components/units/unit-card"

export default async function HomePage() {
  const allUnits = await db.select().from(units).limit(6)
  const allReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      user: { name: users.name },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.moderated, true))
  
  return (
    <main>
      <HeroSection />
      <section className="container py-16">
        <h2>Start Learning</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {allUnits.map(unit => <UnitCard key={unit.id} unit={unit} />)}
        </div>
      </section>
      <section className="container py-16">
        <ReviewsCarousel reviews={allReviews} />
      </section>
    </main>
  )
}
```

#### Dashboard (`/src/app/dashboard/page.tsx`)

```typescript
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { db, units, progress, streaks, userBadges, badges } from "@/lib/db"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { StreakCounter } from "@/components/dashboard/streak-counter"
import { BadgeList } from "@/components/dashboard/badge-list"
import { NextBestLesson } from "@/components/dashboard/next-best-lesson"
import { getNextBestLesson } from "@/lib/recommendations"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/sign-in")
  
  // Fetch all user data in parallel
  const [allUnits, userProgress, userStreak, userBadgesData, nextLesson] = 
    await Promise.all([
      db.select().from(units),
      db.select().from(progress).where(eq(progress.userId, session.user.id)),
      db.select().from(streaks).where(eq(streaks.userId, session.user.id)).limit(1),
      db.select({
        id: userBadges.id,
        awardedAt: userBadges.awardedAt,
        badge: {
          slug: badges.slug,
          name: badges.name,
          description: badges.description,
          icon: badges.icon,
        }
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, session.user.id)),
      getNextBestLesson(session.user.id),
    ])
  
  // Calculate progress per unit
  // Render dashboard with all components
  return (
    <div className="container py-8">
      <h1>Your Dashboard</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <StreakCounter current={userStreak[0]?.current || 0} longest={userStreak[0]?.longest || 0} />
        <NextBestLesson lesson={nextLesson} />
        <BadgeList badges={userBadgesData} />
      </div>
      {/* Progress rings for all units */}
    </div>
  )
}
```

### Priority 4: Test & Polish

1. **Run the dev server**:
   ```bash
   npm run dev
   ```

2. **Test critical flows**:
   - Sign up / Sign in
   - Navigate to dashboard
   - View units and lessons
   - Complete a lesson
   - Take a quiz
   - Book tutoring

3. **Fix any errors** that appear in console

4. **Add animations** using Framer Motion where needed

5. **Test accessibility**:
   - Keyboard navigation
   - Screen reader support
   - Color contrast

6. **Run Lighthouse audit** and optimize to ≥95

### Priority 5: Deploy

1. **Set up PostgreSQL** on Neon/Vercel
2. **Configure environment variables** in Vercel
3. **Deploy** via `vercel --prod`
4. **Seed production database**: `DATABASE_URL="postgres://..." npm run db:seed`
5. **Test in production**

---

## 📋 Quick Commands

```bash
# Development
npm run dev                    # Start dev server (port 3000)

# Database
npm run db:generate            # After schema changes
npm run db:push                # Apply schema to database
npm run db:seed                # Seed with sample data
npm run db:studio              # Open DB GUI

# Build
npm run build                  # Test production build
npm run start                  # Run production build locally
```

---

## 🎨 Design Tokens

```typescript
// Colors (already in tailwind.config.ts)
primary: #00A799        // Teal
primary-light: #00F2DE  // Bright cyan
primary-dark: #005049   // Dark teal

// Spacing
4px base unit (Tailwind default)

// Typography
font-sans: Geist Sans
font-mono: Geist Mono
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/lib/prisma'"

**Solution**: The file still references Prisma. Update imports to:
```typescript
import { db, [tables] } from "@/lib/db"
```

### Issue: Database not found

**Solution**: Run:
```bash
npm run db:push
npm run db:seed
```

### Issue: Auth not working

**Solution**: Check `.env.local` has:
```
AUTH_SECRET=<random-string>
AUTH_URL=http://localhost:3000
```

### Issue: TypeScript errors

**Solution**: Drizzle returns arrays. Always destructure:
```typescript
const [user] = await db.select().from(users).where(...).limit(1)
```

---

## 📚 Resources

- **Drizzle Docs**: https://orm.drizzle.team/docs/overview
- **Next.js App Router**: https://nextjs.org/docs/app
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Auth.js**: https://authjs.dev/

---

## 🎯 Success Checklist

- [ ] All Prisma references migrated to Drizzle
- [ ] Home page displays units and reviews
- [ ] Dashboard shows progress, streaks, badges
- [ ] Units page lists all 14 units with progress
- [ ] Lesson pages show Khan Academy videos
- [ ] Quiz/test system working
- [ ] Search returns accurate results
- [ ] Tutoring booking works
- [ ] Teachers page shows 3 profiles
- [ ] All pages are accessible (keyboard, screen reader)
- [ ] Animations respect reduced-motion
- [ ] Lighthouse scores ≥95
- [ ] Deployed to production
- [ ] Production database seeded

---

**You're 60% complete! The foundation is solid. Focus on migrating the remaining files to Drizzle, then building out the pages. Good luck! 🚀**

