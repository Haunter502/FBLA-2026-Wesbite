# Numera - FBLA Website Design Competition

**π Numera** | The Online Learning Hub for Math: , Track.

A comprehensive, student-centered learning platform for Algebra 1 featuring 14 units of lessons, interactive flashcards, live tutoring, progress tracking, and personalized recommendations.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd numera-fbla

# Install dependencies
npm install

# Set up environment variables
cp env.example.txt .env.local
# Edit .env.local with your configuration (see Environment Variables section)

# Generate database schema and push to SQLite
npm run db:generate
npm run db:push -- --force

# Seed the database with 14 units, lessons, teachers, and demo users
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

After seeding, use these accounts to explore the platform:

- **Student**: `student@example.com` / `Passw0rd!`
- **Teacher**: `teacher@example.com` / `Passw0rd!`
- **Admin**: `admin@example.com` / `Passw0rd!`

---

## 📋 Features

### ✅ Required FBLA Features

- **Schedule Page**: Live tutoring sessions and group study booking
- **Student Dashboard**: Progress tracking with rings/bars, streaks, badges
- **Resources Section**: Lessons, videos, quizzes, flashcards, downloadable materials

### ✨ Additional Features

- **14 Algebra 1 Units**: Linear equations, quadratics, polynomials, functions, and more
- **Interactive Flashcards**: Spaced repetition learning
- **Khan Academy Integration**: Embedded video lessons
- **Global Search**: Find units, lessons, and skills quickly
- **Personalized Recommendations**: Next-best-lesson algorithm
- **Teacher Profiles**: 3 placeholder math educators
- **Student Reviews**: Star ratings and testimonials
- **Immediate Help Requests**: On-demand tutoring
- **Role-Based Access**: Student, Teacher, and Admin roles
- **Dark Mode**: Automatic theme switching
- **Fully Responsive**: Desktop, tablet, and mobile support
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, ARIA labels

---

## 🗄️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript 5 |
| **Database** | Drizzle ORM + SQLite (dev) / Postgres (prod) |
| **Authentication** | NextAuth.js v5 with Drizzle Adapter |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Animations** | Framer Motion (with reduced-motion support) |
| **Forms** | React Hook Form + Zod validation |
| **Deployment** | Vercel-ready |

---

## 📁 Project Structure

```
numera-fbla/
├── drizzle/                    # Drizzle ORM
│   ├── schema.ts               # Database schema (20 tables)
│   ├── seed.ts                 # Seed script with 14 units
│   └── migrations/             # Auto-generated migrations
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home (hero, reviews carousel)
│   │   ├── dashboard/          # Student dashboard
│   │   ├── units/              # Unit grid and detail pages
│   │   ├── lessons/            # Lesson pages with Khan embeds
│   │   ├── search/             # Global search
│   │   ├── tutoring/           # Schedule + immediate help
│   │   ├── teachers/           # Teacher profiles
│   │   ├── auth/               # Sign in / sign up
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── contact/        # Contact form
│   │   │   ├── flashcards/     # Flashcard API
│   │   │   ├── tutoring/       # Booking API
│   │   │   └── search/         # Search API
│   │   ├── about/              # About page
│   │   ├── careers/            # Math careers
│   │   ├── contact/            # Contact form
│   │   ├── docs/               # Documentation
│   │   └── resources/          # Resources page
│   ├── components/             # Reusable React components
│   │   ├── dashboard/          # Progress rings, badges
│   │   ├── flashcards/         # Flashcard viewer
│   │   ├── home/               # Hero, feature cards
│   │   ├── layout/             # NavBar, Footer
│   │   ├── tutoring/           # Tutoring components
│   │   └── ui/                 # shadcn/ui primitives
│   ├── lib/                    # Utilities
│   │   ├── db.ts               # Drizzle client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── recommendations.ts  # Next-best-lesson logic
│   │   ├── theme.ts            # Color palette
│   │   └── utils.ts            # Helpers (cn, etc.)
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── docs/                       # Competition documentation
│   ├── rubric.md               # FBLA rubric checklist
│   └── demo-script.md          # 2-min demo outline
├── drizzle.config.ts           # Drizzle Kit config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
├── package.json                # Dependencies & scripts
└── README.md                   # You are here!
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Apply schema to database
npm run db:seed      # Seed with demo data
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Environment Variables

Create a `.env.local` file (see `env.example.txt`):

```bash
# Database (leave empty for SQLite dev.db)
DATABASE_URL=

# NextAuth
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=http://localhost:3000

# Google OAuth (optional)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Email (optional - for contact form)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@numera.edu
```

---

## 🗃️ Database Schema

Drizzle ORM with 20 tables:

- **users**, accounts, sessions, verification_tokens (NextAuth)
- **units** (14 Algebra 1 units)
- **lessons** (112 lessons with Khan links)
- **quizzes**, **tests** (assessments per unit)
- **skills** (searchable skill tags)
- **flashcard_sets**, **flashcards** (spaced repetition)
- **progress** (user completion tracking)
- **badges**, **user_badges** (achievements)
- **streaks** (daily activity tracking)
- **reviews** (student testimonials)
- **teachers**, **tutoring_slots**, **tutoring_requests**
- **event_logs** (analytics, recommendations)

---

## 🎨 Design System

### Color Palette

```css
Primary: #00F2DE (Teal Light)
Secondary: #00A799 (Teal)
Accent: #005049 (Teal Dark)
Black: #000000
White: #FFFFFF
```

### Typography

- Font Family: System UI stack (Inter-like)
- Base Size: 16px
- Scale: 4pt rhythm (Tailwind default)

### Components

- **Buttons**: Primary, Secondary, Ghost, Outline
- **Cards**: Rounded-2xl, soft shadows
- **Progress Rings**: Animated SVG arcs
- **Badges**: Pill-shaped, colorful icons
- **Forms**: React Hook Form + Zod validation

---

## ♿ Accessibility

- **WCAG 2.1 AA** target
- **ARIA labels** on interactive elements
- **Keyboard navigation** (Tab, Enter, Escape)
- **Focus indicators** (visible rings)
- **Color contrast** meets AA standards
- **prefers-reduced-motion** respected
- **Skip-to-content** link for screen readers

---

## 📊 FBLA Rubric Compliance

See `/docs/rubric.md` for a detailed checklist mapping every rubric item to implementation locations.

### Summary

- ✅ **Planning & Development**: Documented in README, clear architecture
- ✅ **Website Features**: All required elements + more (schedule, dashboard, resources)
- ✅ **UX Design**: Modern, cohesive, accessible, mobile-friendly
- ✅ **Content**: Grammar-checked, sources cited (Khan Academy)
- ✅ **Compatibility**: Tested on desktop, tablet, mobile (Chrome, Firefox, Safari)
- ✅ **Interactivity**: Error-free forms, smooth animations, working search
- ✅ **Consistency**: Unified layout, NavBar/Footer on all pages
- ✅ **Metrics**: Google Analytics placeholders, event logging

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Set environment variables**:
   - `DATABASE_URL` (Neon/Supabase Postgres)
   - `AUTH_SECRET`, `AUTH_URL`
   - (Optional) Google OAuth, SMTP
4. **Deploy**: Vercel auto-builds on push

```bash
# Generate production migrations
DATABASE_URL=postgres://... npm run db:generate
DATABASE_URL=postgres://... npm run db:push -- --force
DATABASE_URL=postgres://... npm run db:seed
```

### Environment-Specific Notes

- **Development**: SQLite (`dev.db` file)
- **Production**: Switch to Postgres (Neon, Vercel Postgres, or Supabase)
- **Migrations**: Auto-generated by Drizzle Kit

---

## 📖 Adding Content

### Add a New Unit

1. Edit `drizzle/seed.ts`, add to `unitsData` array
2. Run `npm run db:seed` (or manually insert via Drizzle Studio)

### Add a New Lesson

```typescript
await db.insert(lessons).values({
  slug: 'unique-slug',
  unitId: '<unit-id>',
  title: 'Lesson Title',
  description: 'Brief description',
  type: 'VIDEO', // or 'READING', 'EXERCISE'
  khanUrl: 'https://www.khanacademy.org/...',
  youtubeId: 'dQw4w9WgXcQ',
  duration: 15,
  order: 1,
});
```

### Add a Quiz

```typescript
await db.insert(quizzes).values({
  unitId: '<unit-id>',
  title: 'Quiz Title',
  timeLimit: 30,
  passingScore: 70,
  questions: [
    {
      id: 1,
      question: 'Question text?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: 'Why A is correct...',
    },
    // ...more questions
  ],
});
```

---

## 🔐 Authentication Flow

1. **Credentials Auth**: Email/password (bcrypt hashed)
2. **Google OAuth**: Optional, configured via Google Cloud Console
3. **Session**: JWT-based (NextAuth v5)
4. **Roles**: `STUDENT` (default), `TEACHER`, `ADMIN`

---

## 📈 Recommendation Algorithm

**Next Best Lesson**:

1. Get all completed lessons for user
2. Iterate through units in order
3. Find first incomplete lesson in each unit
4. Return that lesson + unit context

Located in: `src/lib/recommendations.ts`

---

## 🧪 Testing

*(Future enhancement)*

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright for critical flows (auth, quiz submission)
- **Lighthouse**: Performance/SEO/Accessibility >= 95

---

## 📜 License

This project is for the FBLA Website Design competition and is not licensed for commercial use.

---

## 👥 Team

*[Add your team members' names and roles here]*

---

## 🙏 Acknowledgments

- **Khan Academy**: Educational content embeds
- **FBLA**: Competition guidelines and inspiration
- **shadcn/ui**: Beautiful, accessible components
- **Drizzle ORM**: Type-safe database layer

---

## 📧 Contact

For questions or support, reach out via the [Contact Page](/contact) or email `contact@numera.edu` (placeholder).

---

**Built with ❤️ for the 2025-2026 FBLA Website Design Competition**
