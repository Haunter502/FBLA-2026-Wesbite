# Prisma → Drizzle ORM Migration Guide

This document tracks the migration from Prisma to Drizzle ORM for the Numera FBLA project.

## ✅ Completed

### Core Infrastructure
- ✅ **Drizzle Schema** (`drizzle/schema.ts`) - All 20 tables with relations
- ✅ **Database Client** (`src/lib/db.ts`) - SQLite (dev) and Postgres (prod) ready
- ✅ **Migrations** - Generated and pushed to dev.db
- ✅ **Seed Script** (`drizzle/seed.ts`) - 14 units, 112 lessons, teachers, reviews
- ✅ **Package.json** - Updated scripts and dependencies
- ✅ **Next.config.ts** - Removed Prisma, added better-sqlite3

### Authentication
- ✅ **Auth Config** (`src/lib/auth.ts`) - DrizzleAdapter configured
- ✅ **Registration API** (`src/app/api/auth/register/route.ts`) - Uses Drizzle

### API Routes
- ✅ **Search API** (`src/app/api/search/route.ts`) - Drizzle queries with SQL
- ✅ **Reviews API** (`src/app/api/reviews/route.ts`) - Create/fetch reviews
- ✅ **Recommendations API** (`src/app/api/recommendations/next/route.ts`) - Next lesson algorithm
- ✅ **Progress API** (`src/app/api/progress/[id]/route.ts`) - Update progress & streaks

### Pages
- ✅ **Home Page** (`src/app/page.tsx`) - Units & reviews with Drizzle
- ✅ **Dashboard** (`src/app/dashboard/page.tsx`) - Progress rings, streaks, badges

### Utilities
- ✅ **Recommendations** (`src/lib/recommendations.ts`) - Next-best-lesson logic
- ✅ **Theme** (`src/lib/theme.ts`) - Color palette

### Documentation
- ✅ **README.md** - Complete project documentation
- ✅ **docs/rubric.md** - FBLA rubric compliance checklist
- ✅ **docs/demo-script.md** - 7-minute presentation script
- ✅ **env.example.txt** - Environment variables template

### PWA
- ✅ **Manifest** (`public/manifest.json`) - PWA configuration
- ✅ **Layout** - Manifest and meta tags added

---

## 🚧 Files Still Using Prisma (Need Migration)

These files have Prisma imports and need to be updated to use Drizzle:

### Pages
1. `/src/app/units/page.tsx` - Units grid page
2. `/src/app/units/[unitSlug]/page.tsx` - Unit detail page
3. `/src/app/lessons/[lessonSlug]/page.tsx` - Lesson detail with Khan embeds
4. `/src/app/lessons/[lessonSlug]/flashcards/[setId]/page.tsx` - Flashcard viewer
5. `/src/app/tutoring/page.tsx` - Tutoring schedule
6. `/src/app/teachers/page.tsx` - Teacher profiles

### API Routes
7. `/src/app/api/tutoring/slots/route.ts` - Get tutoring slots
8. `/src/app/api/tutoring/immediate/route.ts` - Immediate help requests
9. `/src/app/api/tutoring/book/route.ts` - Book tutoring sessions
10. `/src/app/api/flashcards/[setId]/route.ts` - Flashcard data

---

## 📝 Migration Pattern

For each file, follow this pattern:

### Before (Prisma)
```typescript
import { prisma } from "@/lib/prisma"

const data = await prisma.unit.findMany({
  where: { id: unitId },
  include: {
    lessons: true,
  },
})
```

### After (Drizzle)
```typescript
import { db } from "@/lib/db"
import { units, lessons } from "../../drizzle/schema"
import { eq } from "drizzle-orm"

const data = await db
  .select({
    id: units.id,
    title: units.title,
    lessons: lessons, // Use joins or separate queries
  })
  .from(units)
  .leftJoin(lessons, eq(lessons.unitId, units.id))
  .where(eq(units.id, unitId))
```

---

## 🔄 Common Query Conversions

### Find Many
```typescript
// Prisma
await prisma.unit.findMany({ orderBy: { order: 'asc' } })

// Drizzle
await db.select().from(units).orderBy(asc(units.order))
```

### Find Unique
```typescript
// Prisma
await prisma.unit.findUnique({ where: { id } })

// Drizzle
const [unit] = await db.select().from(units).where(eq(units.id, id)).limit(1)
```

### Create
```typescript
// Prisma
await prisma.unit.create({ data: { title, description, order } })

// Drizzle
const [unit] = await db.insert(units).values({ title, description, order }).returning()
```

### Update
```typescript
// Prisma
await prisma.unit.update({ where: { id }, data: { title } })

// Drizzle
const [updated] = await db.update(units).set({ title }).where(eq(units.id, id)).returning()
```

### Delete
```typescript
// Prisma
await prisma.unit.delete({ where: { id } })

// Drizzle
await db.delete(units).where(eq(units.id, id))
```

### Joins / Include
```typescript
// Prisma
await prisma.unit.findMany({
  include: {
    lessons: {
      where: { status: 'COMPLETED' },
    },
  },
})

// Drizzle
await db
  .select({
    unitId: units.id,
    unitTitle: units.title,
    lessonId: lessons.id,
    lessonTitle: lessons.title,
  })
  .from(units)
  .leftJoin(lessons, eq(lessons.unitId, units.id))
  .where(eq(lessons.status, 'COMPLETED'))
```

---

## 🎯 Next Steps to Complete Migration

1. **Update Remaining Pages** (6 files):
   - Replace `import { prisma } from "@/lib/prisma"` with Drizzle imports
   - Convert Prisma queries to Drizzle syntax
   - Test each page after migration

2. **Update Remaining API Routes** (4 files):
   - Convert tutoring and flashcard APIs
   - Ensure error handling remains consistent

3. **Remove Old Dependencies**:
   ```bash
   npm uninstall @prisma/client prisma @auth/prisma-adapter
   ```

4. **Delete Old Files**:
   - ✅ `src/lib/prisma.ts` (already deleted)
   - `prisma/schema.prisma` (keep for reference, or delete)
   - `prisma/seed.ts` (replaced by `drizzle/seed.ts`)
   - `scripts/post-prisma-generate.js` (no longer needed)

5. **Test Everything**:
   ```bash
   npm run build
   npm run start
   ```
   - Test auth flow
   - Test dashboard
   - Test search
   - Test tutoring booking
   - Test flashcards
   - Test progress tracking

6. **Production Deployment**:
   - Set up Postgres database (Neon/Supabase/Vercel Postgres)
   - Update `DATABASE_URL` in production environment
   - Run migrations:
     ```bash
     DATABASE_URL=postgres://... npm run db:push -- --force
     DATABASE_URL=postgres://... npm run db:seed
     ```

---

## ✨ Benefits of Drizzle Migration

1. **Type Safety**: Full TypeScript inference on queries
2. **Performance**: Lighter runtime, faster queries
3. **Flexibility**: Easy to use raw SQL when needed
4. **Smaller Bundle**: ~7KB vs ~45KB for Prisma
5. **Better Control**: Direct control over queries and joins

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/lib/prisma'"
**Solution**: File still has Prisma import. Replace with:
```typescript
import { db } from "@/lib/db"
import { tableName } from "../../drizzle/schema"
```

### Issue: "Property 'include' does not exist"
**Solution**: Drizzle doesn't use `include`. Use joins:
```typescript
// Instead of include
.leftJoin(otherTable, eq(table.foreignKey, otherTable.id))
```

### Issue: "UNIQUE constraint failed"
**Solution**: Check if record exists first:
```typescript
const [existing] = await db.select().from(table).where(eq(table.field, value)).limit(1)
if (existing) {
  // Handle duplicate
}
```

### Issue: "Cannot read property 'id' of undefined"
**Solution**: Drizzle returns arrays. Destructure:
```typescript
const [user] = await db.select()...
if (!user) {
  // Handle not found
}
```

---

## 📚 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle + NextAuth](https://authjs.dev/reference/adapter/drizzle)
- [Drizzle SQLite](https://orm.drizzle.team/docs/get-started-sqlite)
- [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)

---

**Migration Status**: ~60% Complete (Core infra done, pages remaining)  
**Last Updated**: [Current Date]  
**Remaining Work**: ~2-3 hours to update remaining 10 files

