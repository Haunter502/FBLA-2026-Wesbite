# Numera - Design Decisions & Architecture

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Design](#database-design)
3. [Authentication & Security](#authentication--security)
4. [UI/UX Design Principles](#uiux-design-principles)
5. [Component Architecture](#component-architecture)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility Strategy](#accessibility-strategy)

---

## Technology Stack

### Why Next.js + TypeScript?

**Decision**: Use Next.js 16 with App Router and TypeScript

**Rationale**:
- **Performance**: Server components reduce client-side JavaScript
- **Developer Experience**: App Router provides simpler routing and layouts
- **Type Safety**: TypeScript catches errors at compile time
- **Full-Stack**: Handle both frontend UI and backend APIs in one framework
- **Deployment**: Vercel integration makes production deployment seamless
- **Production Ready**: Used by thousands of production apps

**Alternatives Considered**:
- SvelteKit: Too niche for team collaboration
- Remix: Less mature ecosystem than Next.js
- Traditional React + Express: More boilerplate and infrastructure needed

---

### Why Drizzle ORM?

**Decision**: Use Drizzle ORM with SQLite (dev) and PostgreSQL (production)

**Rationale**:
- **Type Safety**: Full TypeScript support with zero-cost abstractions
- **Lightweight**: Small bundle size, no runtime overhead
- **Flexibility**: Can write raw SQL when needed
- **Migrations**: Automatic migration generation
- **DX**: Intuitive query building with IDE autocomplete
- **Auth Integration**: Direct support for Auth.js Drizzle adapter

**Why NOT Prisma?**:
- Larger bundle size
- Magic under the hood makes debugging harder
- Migration system can be restrictive
- When we needed to migrate away, Drizzle was the clear winner

**Why SQLite for Dev, PostgreSQL for Prod?**:
- **SQLite**: Zero-setup for developers, file-based persistence, perfect for local testing
- **PostgreSQL**: Scales to millions of users, supports advanced features, proven in production
- **Switching Cost**: Drizzle makes it easy to switch databases by just changing config

---

### Why Auth.js (NextAuth v5)?

**Decision**: Use Auth.js (the new NextAuth) with Credentials and Google OAuth

**Rationale**:
- **Industry Standard**: 50k+ stars, used by thousands of production apps
- **Multiple Strategies**: Support credentials + OAuth + Magic Links if needed
- **Security**: Battle-tested authentication flows
- **Drizzle Adapter**: First-class integration with our ORM
- **Session Management**: Built-in token management and callbacks
- **JWTs + Database Sessions**: Flexible session storage

**Why Not Custom Auth**?
- Security is hard; reuse battle-tested solutions
- Auth.js handles edge cases we'd miss
- Active maintenance and security updates

---

### Why Tailwind CSS?

**Decision**: Use Tailwind CSS with custom theme configuration

**Rationale**:
- **Consistency**: Design tokens enforced across codebase
- **Performance**: Only ships CSS for used utilities
- **Responsive**: Built-in mobile-first responsive design
- **DX**: Rapid prototyping with utility classes
- **Customization**: Easy to apply Numera color palette
- **Dark Mode**: Built-in dark mode support

**Color Palette Integration**:
```typescript
// src/lib/theme.ts
const COLORS = {
  primary: "#00F2DE",    // Light Turquoise
  secondary: "#00A799",  // Medium Teal
  accent: "#005049",     // Dark Teal
  text: "#000000",       // Black
  background: "#FFFFFF", // White
}
```

---

### Why Framer Motion?

**Decision**: Use Framer Motion for animations

**Rationale**:
- **Accessibility**: Respects `prefers-reduced-motion` out of the box
- **Performance**: GPU-accelerated animations
- **DX**: Simple declarative animation API
- **React Integration**: First-class React hooks support
- **Gesture Support**: Touch interactions built-in

**Reduced Motion Strategy**:
```typescript
// In components
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

// Animations automatically disable if user prefers reduced motion
return <motion.div animate={!prefersReducedMotion ? variants : {}} />
```

---

## Database Design

### Schema Overview

**Key Principles**:
1. **Normalization**: Minimize data duplication
2. **Relationships**: Clear foreign keys and cascading deletes
3. **Indexing**: Strategic indexes for common queries
4. **Flexibility**: JSON columns for semi-structured data (questions)

### Entity Relationship Diagram (Simplified)

```
Users ─────┬─ Sessions
           ├─ Accounts (OAuth)
           ├─ Progress ────┬─ Units
           │               ├─ Lessons
           │               ├─ Quizzes
           │               └─ Tests
           ├─ Streaks
           ├─ UserBadges ─ Badges
           ├─ Reviews
           ├─ TutoringRequests ─ TutoringSlots ─ Teachers
           └─ EventLogs

Units ─────┬─ Lessons ─┬─ FlashcardSets ─ Flashcards
           ├─ Quizzes
           ├─ Tests
           ├─ Skills
           └─ FlashcardSets
```

### Table-by-Table Decisions

#### **Users Table**
- `id` (UUID): Unique identifier
- `email` (string, unique): For auth and communication
- `role` (enum): STUDENT|TEACHER|ADMIN for authorization
- `password` (string, nullable): For credentials auth; NULL if OAuth only
- Why separate `emailVerified` timestamp?: Supports email confirmation flows

#### **Units Table**
- `slug` (unique): URL-friendly identifier for `/units/[unitSlug]`
- `order` (integer): Determines unit sequence
- Why not auto-increment? Allows reordering without changing IDs
- `heroImage` (nullable): Supports future feature of custom images

#### **Lessons Table**
- `type` (enum): VIDEO|READING|EXERCISE for content filtering
- `khanUrl` & `youtubeId` (nullable): Support different video sources
- `duration` (integer): Used for recommendation algorithm
- Index on `unitId` + `order`: Common query pattern

#### **Progress Table**
- Composite key on `userId + unitId + lessonId + quizId + testId`: Ensures one progress record per activity
- `status` (enum): Tracks learning state
- `score` (nullable): Only populated for quizzes/tests
- Why separate timestamps? `lastViewedAt` vs `completedAt` helps analytics

#### **EventLogs Table**
- `payload` (JSON string): Flexible schema for different event types
- Why JSON string vs relational tables? Handles various event structures
- Indexed on `userId` + `type` + `createdAt`: Supports analytics queries

#### **Streaks Table**
- `userId` (unique): One streak per user
- Why update records vs append-only? Need current state for quick lookups
- `lastActiveAt` (timestamp): Key to streak calculation logic

### Indexing Strategy

```sql
-- Fast lookups
CREATE INDEX unit_slug_idx ON units(slug);
CREATE INDEX lesson_unitId_idx ON lessons(unitId);
CREATE INDEX progress_userId_idx ON progress(userId);

-- Analytics queries
CREATE INDEX eventLog_userId_type_idx ON eventLogs(userId, type);
CREATE INDEX eventLog_createdAt_idx ON eventLogs(createdAt);

-- Sorting operations
CREATE INDEX unit_order_idx ON units(order);
CREATE INDEX lesson_order_idx ON lessons(order);
CREATE INDEX tutoringSlot_start_idx ON tutoringSlots(start);
```

---

## Authentication & Security

### Authentication Flow

```
User Sign Up/In
    ↓
Auth.js Routes
    ↓
├─ Credentials Provider (email + password)
│  └─ Hash check via bcrypt
│
└─ OAuth Provider (Google)
   └─ OAuth callback

    ↓
Create Session (JWT + DB)
    ↓
Set Secure HTTP-Only Cookie
    ↓
Redirect to Dashboard
```

### Password Security

- **Hashing**: bcrypt with salt rounds = 10
- **Never stored**: Plain passwords never logged or stored
- **Comparison**: Constant-time comparison to prevent timing attacks

```typescript
// In seed script
const hashedPassword = await bcrypt.hash(password, 10);

// In auth provider
const passwordMatch = await bcrypt.compare(password, user.password);
```

### Session Management

- **Strategy**: JWT tokens with database session storage
- **Expiration**: Configurable via Auth.js settings
- **Refresh**: Automatic token refresh on request
- **Revocation**: Sessions can be invalidated by deleting from database

### Environment Variables

```bash
# Never commit these
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
AUTH_GOOGLE_ID=from_google_console
AUTH_GOOGLE_SECRET=from_google_console
```

### Input Validation

- **Every API endpoint**: Validates input with Zod schemas
- **Client-side**: React Hook Form for UX feedback
- **Server-side**: Final validation before database mutation
- **Never trust client input**

Example:
```typescript
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const parsed = registerSchema.safeParse(body);
if (!parsed.success) return error;
```

### Protection Against Common Attacks

1. **SQL Injection**: Drizzle ORM uses parameterized queries
2. **XSS**: React auto-escapes JSX content
3. **CSRF**: Next.js built-in CSRF protection
4. **Brute Force**: Future: Add rate limiting to auth endpoints
5. **Sensitive Data**: No sensitive data in response headers or logs

---

## UI/UX Design Principles

### Color Palette Rationale

| Color | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| Primary | #00F2DE | CTAs, accents | High contrast, energetic, welcomes action |
| Secondary | #00A799 | Secondary buttons, cards | Complementary, professional |
| Accent | #005049 | Dark backgrounds, text | High contrast for accessibility |
| Text | #000000 | Body text | Maximum readability |
| Background | #FFFFFF | Page background | Clean, minimal |

### Design System

**Typography**:
- **Headings**: Geist Sans, bold weight
- **Body**: Geist Sans, regular weight
- **Code**: Geist Mono (for technical content)
- **Hierarchy**: h1 (2.5rem) → h6 (1rem)

**Spacing**:
- **4pt base unit**: All spacing multiples of 4
- **Margin/Padding**: 4, 8, 12, 16, 24, 32, 48px
- **Consistency**: Enforced via Tailwind classnames

**Components**:
- **Buttons**: Consistent sizing, accessible focus states
- **Cards**: Rounded corners (border-radius: 16px), soft shadows
- **Inputs**: Clear labels, error states, helper text
- **Focus Rings**: 3px outline in primary color

### Animation Philosophy

**Principles**:
1. **Purposeful**: Every animation serves a function (clarity, feedback, delight)
2. **Performant**: GPU-accelerated, 60fps minimum
3. **Accessible**: Respects `prefers-reduced-motion` always
4. **Consistent**: Similar interactions use similar animations

**Examples**:
- **Scroll Reveal**: Sections fade in as you scroll down (engagement)
- **Progress Rings**: Animated counter-clockwise arc (visual feedback)
- **Card Hover**: Subtle lift + shadow change (interactivity hint)
- **Page Transition**: Fade between pages (continuity)

### Dark Mode Strategy

- **System Preference**: Detects `prefers-color-scheme`
- **Manual Toggle**: Optional theme switcher in navbar
- **Persistence**: Saves to localStorage
- **Contrast**: Dark mode colors verified for WCAG AA

---

## Component Architecture

### Folder Structure Philosophy

```
components/
├── ui/               # Reusable primitives (Button, Card, Input)
├── layout/           # Shared layout (NavBar, Footer)
├── dashboard/        # Dashboard-specific features
├── home/             # Landing page components
├── flashcards/       # Flashcard functionality
├── tutoring/         # Tutoring features
└── providers/        # React Context providers
```

### Component Principles

1. **Single Responsibility**: Each component does one thing
2. **Prop-Based Configuration**: Flexible via props, not global config
3. **TypeScript**: Every prop fully typed with JSDoc comments
4. **Accessibility**: Built-in ARIA labels, keyboard support
5. **Error Boundaries**: Graceful fallbacks for failures

### Example Component

```typescript
// src/components/dashboard/progress-ring.tsx
interface ProgressRingProps {
  percentage: number;        // 0-100
  radius: number;           // SVG circle radius
  strokeWidth: number;      // Line thickness
  label: string;            // Accessible label
  animated?: boolean;       // Respect prefers-reduced-motion
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  radius,
  strokeWidth,
  label,
  animated = true,
}) => {
  // Implementation with TypeScript generics if needed
}
```

---

## Performance Optimization

### Bundle Size Management

**Strategy**: Code splitting by route
- Each page route loads only needed code
- Vendor libraries split into separate chunks
- Lazy-load heavy components (modals, charts)

**Build Output**:
- Total JS: ~50-80kb (gzipped)
- CSS: ~30-40kb (gzipped)
- Target: < 150kb total for good Core Web Vitals

### Image Optimization

- **Strategy**: Use Next.js `<Image>` component
- **Formats**: Serve WebP to modern browsers, JPEG fallback
- **Responsive**: Automatic srcset generation for multiple screen sizes
- **Lazy Loading**: Images load as user scrolls

### Caching Strategy

```typescript
// Cache lesson queries for 1 hour
export const revalidate = 3600;
```

- **ISR (Incremental Static Regeneration)**: Revalidate on-demand
- **Database Caches**: Consider Redis for frequently accessed data
- **HTTP Caching**: Set proper Cache-Control headers in production

### Database Query Optimization

**Avoid N+1 Queries**:
```typescript
// ❌ Bad: N+1 query problem
const units = await db.query.units.findMany();
for (const unit of units) {
  const lessons = await db.query.lessons.findMany(); // Query per unit!
}

// ✅ Good: Single query with relations
const unitsWithLessons = await db.query.units.findMany({
  with: { lessons: true }
});
```

---

## Accessibility Strategy

### WCAG 2.1 Level AA Target

**Framework**: Use established web standards
- **Semantic HTML**: `<nav>`, `<main>`, `<article>` not `<div>` everywhere
- **ARIA**: Labels, live regions, roles where semantic HTML insufficient
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Readers**: Test with NVDA/JAWS/VoiceOver
- **Color Contrast**: 4.5:1 minimum for text

### Implementation Checklist

- [x] Skip-to-content link
- [x] Proper heading hierarchy (h1 → h6, no gaps)
- [x] Form labels associated with inputs
- [x] Alt text on all images
- [x] Focus visible on all interactive elements
- [x] No keyboard traps
- [x] Aria-live for dynamic content updates
- [x] Color not sole differentiator (use icons + text)
- [x] Sufficient color contrast
- [x] Respects prefers-reduced-motion

### Example: Accessible Button

```typescript
<button
  className="btn btn-primary"
  onClick={handleClick}
  aria-label="Start lesson"
  aria-pressed={isActive}
  role="button"
  tabIndex={disabled ? -1 : 0}
>
  Start Lesson
</button>
```

### Testing

1. **Manual Testing**:
   - Keyboard-only navigation (no mouse)
   - Tab through entire site
   - Test with screen reader (VoiceOver on Mac)

2. **Automated Testing**:
   - Lighthouse Accessibility audit
   - axe DevTools browser extension
   - Pa11y CLI for CI/CD

3. **User Testing**:
   - Include people with disabilities in testing
   - Gather feedback on real usability

---

## Recommendation Algorithm

### Next Best Lesson Logic

**Goal**: Present the most relevant next lesson to each student

**Algorithm**:
```
1. Filter units ordered by completion
2. For each unit:
   a. Get all lessons ordered by sequence
   b. Find first non-started lesson
   c. Check if prerequisite unit complete
3. Return lesson with:
   - Unit context
   - Reason (new, resume, review)
   - Direct link to start
```

**Fallback Strategy**:
- If all lessons complete → return first lesson as "review opportunity"
- If no data → return unit 1, lesson 1
- Cache recommendations for 24 hours to reduce DB load

### Streak Calculation

**Algorithm**:
```
lastActive = user's last activity timestamp
today = now
daysSinceActive = today - lastActive

If daysSinceActive === 0:
  // Same day, no streak increase
  currentStreak = currentStreak
  
Else if daysSinceActive === 1:
  // One day gap, streak continues
  currentStreak += 1
  
Else:
  // Gap > 1 day, streak resets
  currentStreak = 1

longestStreak = max(currentStreak, longestStreak)
```

---

## Deployment Architecture

### Development Environment

```bash
DATABASE_URL=file:./dev.db  # SQLite
npm run db:generate          # Generate types
npm run db:push             # Create tables
npm run db:seed             # Seed demo data
npm run dev                 # Start Next.js
```

### Production Environment (Vercel)

1. **Database**: PostgreSQL on Neon/Supabase/Vercel Postgres
2. **Hosting**: Vercel (auto deploys on git push)
3. **CDN**: Vercel Edge Network
4. **Monitoring**: Vercel Analytics + Sentry for errors
5. **Security**: HTTPS, environment variables, rate limiting

```bash
# Production database setup
DATABASE_URL=postgresql://user:pass@host/db
drizzle-kit migrate
```

---

## Future Enhancements

### Phase 2 (Post-Launch)

1. **Real-Time Features**:
   - WebSocket support for live tutoring
   - Real-time collaboration on problem sets
   - Instant progress updates

2. **AI/ML**:
   - Personalized content recommendations
   - Predictive difficulty adjustments
   - Plagiarism detection for submissions

3. **Analytics Dashboard**:
   - Teacher analytics (class performance)
   - Student insights (learning patterns)
   - Platform metrics

4. **Gamification+**:
   - Leaderboards
   - Achievements (badges 2.0)
   - Profile customization

5. **Content**:
   - More subjects beyond Algebra 1
   - Video uploads from educators
   - Community-contributed resources

---

## Conclusion

Numera's architecture balances **developer experience** with **production readiness**:

- **DX**: TypeScript, Drizzle, modern React patterns
- **Performance**: Optimized bundles, smart caching
- **Security**: Auth.js best practices, input validation
- **Accessibility**: WCAG 2.1 AA compliance
- **Maintainability**: Clear separation of concerns, documented decisions
- **Scalability**: Designed to grow from 1K to 1M users

Every decision prioritizes the core mission: **making algebra learning engaging, accessible, and effective**.

---

**Built with ❤️ for FBLA Website Design 2025-2026**

