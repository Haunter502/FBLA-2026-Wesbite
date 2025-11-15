# Numera - FBLA Website Design Demo Script

**Duration**: 7 minutes (with 3-minute Q&A)  
**Equipment**: Laptop with browser open to localhost:3000 or deployed URL

---

## Introduction (45 seconds)

"Good morning/afternoon. I'm [Name], and I'm excited to present **Numera**, a student learning hub for Algebra 1.

The name combines 'number' with 'era,' symbolizing a new era of math learning. Our π logo represents the mathematical foundation we're building on.

Numera addresses three key challenges students face:
1. **Fragmented resources** - We centralize everything in one place
2. **Lack of personalization** - Our algorithm recommends the right lesson at the right time
3. **Limited peer support** - Live tutoring and immediate help connect students instantly

Let's dive in."

---

## Home Page & Features (60 seconds)

**[Navigate to home page]**

"This is our home page. Notice the clean, modern design with our custom teal color palette chosen for visual appeal and accessibility—all colors meet WCAG AA contrast standards.

**Key features visible here:**
- Top navigation bar with all major sections
- Hero section explaining our mission
- Three feature cards highlighting our unique value propositions
- Student testimonials carousel with 5-star reviews
- Call-to-action buttons for sign-up

The site is fully responsive. **[Resize browser or switch to mobile view]** See how the navigation collapses into a hamburger menu, and content reflows for smaller screens. We've tested on desktop, tablet, and mobile devices."

---

## Authentication & User Roles (30 seconds)

**[Click "Sign In"]**

"Numera supports three user roles:
- **Students** - access all learning content
- **Teachers** - manage tutoring sessions
- **Admins** - moderate reviews and analytics

We use NextAuth with both email/password and Google OAuth. Passwords are bcrypt-hashed for security.

**[Log in with demo student account]**"

---

## Student Dashboard (90 seconds)

**[Navigate to /dashboard]**

"This is the heart of Numera - the student dashboard. Here students can:

**1. Track Progress with Visual Indicators:**
- **Progress rings** for each of our 14 Algebra 1 units
- Animated SVG arcs that smoothly fill as you complete lessons
- Percentage completion front and center

**2. Maintain Motivation:**
- **Streak counter** showing daily activity - currently at 3 days
- Badges for achievements like 'First Quiz Passed' and 'Week Streak'
- Visual rewards system encourages consistent practice

**3. Get Personalized Recommendations:**
- 'Next Best Lesson' card uses our recommendation algorithm
- Analyzes completed lessons and suggests optimal next step
- Takes unit order and lesson dependencies into account

**[Scroll to show all units]**

All 14 units are here: Linear Equations, Systems, Polynomials, Quadratics, Functions, Exponents & Radicals, Rational Expressions, Graphing, Absolute Value, Exponentials, Sequences, Data Analysis, Probability, and Real-World Applications."

---

## Units & Lessons (90 seconds)

**[Click "Units" in nav, then click first unit]**

"Each unit contains 8 comprehensive lessons. Let's explore one.

**[Click a lesson]**

Every lesson page includes:

**1. Khan Academy Integration:**
- Embedded video lectures from Khan Academy
- We properly attribute all content with 'Open on Khan Academy' links
- Students can watch inline or visit Khan for full experience

**2. Reading Materials:**
- Concept summaries
- Step-by-step examples
- Practice problem links

**3. Interactive Flashcards:**
**[Click 'Flashcards' tab]**
- Spaced repetition learning
- Front and back with optional hints
- Smooth flip animations with Framer Motion
- Keyboard accessible - press Space to flip

**4. Progress Tracking:**
- 'Mark Complete' button updates progress immediately
- Increments streak counter
- Awards badges when milestones are reached

**[Click 'Mark Complete']**

See how the UI updates in real-time? That's our progress API syncing completion status and updating streaks."

---

## Search Functionality (30 seconds)

**[Navigate to /search]**

"Students can quickly find content with our global search.

**[Type 'quadratics' in search box]**

Results include:
- **Units** matching the query
- **Lessons** with relevant content
- **Skills** for targeted practice

Each result card shows type, description, and direct link."

---

## Live Tutoring & Schedule (60 seconds)

**[Navigate to /tutoring]**

"This is our **required schedule page**. Students can:

**1. View Available Tutoring Sessions:**
- Calendar view of all tutoring slots
- Teacher info, time, and capacity shown
- Next 7 days of availability

**[Scroll to calendar]**

**2. Book a Scheduled Session:**
- Click a slot
- Confirm booking
- Spots automatically decrement

**3. Request Immediate Help:**
**[Click 'Need Help Now' button]**

- For urgent questions
- Creates a tutoring request
- Teachers see pending requests in real-time
- Modal explains what to prepare

This immediate help feature goes beyond the rubric requirements and addresses a real student pain point."

---

## Teacher Profiles (20 seconds)

**[Navigate to /teachers]**

"We have three teacher profiles:
- Dr. Sarah Johnson - PhD, 15 years experience
- Prof. Michael Chen - Former engineer, real-world focus
- Ms. Emily Rodriguez - National Board Certified

Each profile includes bio, avatar, email, and office hours."

---

## Quizzes & Assessments (30 seconds)

**[Navigate back to a unit page, click 'Take Quiz']**

"Each unit has:
- **Quizzes** with 5 questions, 30-minute time limit
- **Tests** with 10 questions, 60-minute time limit
- Passing score of 70-75%

**[Show quiz interface]**

Features:
- Timer countdown
- Multiple choice questions
- Submit button
- Score and explanations after submission
- Progress saved to dashboard"

---

## Accessibility & Technical Excellence (30 seconds)

"Numera prioritizes accessibility:

**[Press Tab key repeatedly]**

- **Keyboard navigation** with visible focus rings
- **Skip-to-content** link for screen readers
- **ARIA labels** on all interactive elements
- **Color contrast** meets AA standards

**[Open DevTools → Emulate reduced motion]**

- **Respects prefers-reduced-motion** - animations disable automatically
- All content remains accessible without motion

**Technical stack:**
- Next.js 16 with App Router for performance
- Drizzle ORM with SQLite (dev) and Postgres (production)
- Tailwind CSS for consistent, maintainable styling
- Lighthouse scores target 95+ across all metrics"

---

## Additional Pages (Quick Tour - 20 seconds)

**[Rapid clicks through:]**

- **/resources** - Downloadable study guides, links to external tools
- **/careers** - Math career exploration (actuary, data scientist, engineer)
- **/about** - Team info and mission statement
- **/contact** - Form with server-side validation and email integration
- **/docs** - Project documentation and student handbook"

---

## Conclusion (30 seconds)

"To summarize, Numera delivers:

✅ **All required FBLA elements**: Schedule, Dashboard, Resources  
✅ **14 comprehensive Algebra 1 units** with 112 lessons  
✅ **Personalized learning** via recommendation engine  
✅ **Community support** through live tutoring  
✅ **Accessibility-first design** following WCAG 2.1 AA  
✅ **Modern, polished UX** that students actually want to use  

We've built a platform that doesn't just meet the rubric - it creates a genuine learning experience that empowers students to master algebra.

I'm happy to answer any questions. Thank you!"

---

## Q&A Preparation

### Common Questions & Answers

**Q: How does the recommendation algorithm work?**  
A: It finds the first incomplete lesson in the earliest unit based on order, considering prerequisites. Code is in `/src/lib/recommendations.ts`.

**Q: Where is the content from?**  
A: All video lessons link to Khan Academy with proper attribution. We embed their videos via iframe and include "Open on Khan Academy" links on every lesson page.

**Q: How do you handle user data and privacy?**  
A: We use NextAuth for secure authentication with bcrypt-hashed passwords. Data is stored in a relational database with proper foreign key constraints. No personal data is shared with third parties.

**Q: What if a student loses their streak?**  
A: The streak resets to 1 if they miss a day, but we save their "longest streak" as a personal best for motivation.

**Q: How did you test compatibility?**  
A: We used browser DevTools responsive mode and physical devices. Tested on Chrome, Firefox, and Safari at desktop (1920px), tablet (768px), and mobile (375px) widths.

**Q: Can this scale to other subjects beyond Algebra 1?**  
A: Absolutely. The database schema is subject-agnostic. We could add Geometry, Algebra 2, or even non-math subjects by creating new units and lessons.

**Q: How do you prevent cheating on quizzes?**  
A: Currently, quizzes are for practice and self-assessment. For high-stakes testing, we'd implement time-limited sessions, randomized question order, and proctoring integration.

**Q: What's the tech stack and why?**  
A: Next.js for performance and SEO, Drizzle ORM for type-safe database access, Tailwind for rapid styling, and Framer Motion for smooth animations. All chosen for developer experience and production readiness.

**Q: How would you deploy this?**  
A: Vercel for frontend and serverless functions, Neon or Supabase for Postgres database, Vercel Analytics for metrics. Full CI/CD via GitHub integration.

**Q: What's the most challenging feature you built?**  
A: The streak system was tricky - had to calculate day differences accurately across timezones, handle edge cases like same-day completions, and ensure atomicity when updating both progress and streaks.

---

## Technical Demos (If Time Permits)

### Show Database Structure
**[Open Drizzle Studio or show schema file]**

"Our database has 20 tables with proper relationships, indexes, and foreign keys. Everything is type-safe with Drizzle ORM."

### Show Animations
**[Hover over cards, interact with progress rings]**

"All animations use Framer Motion with attention to performance and accessibility. They respect prefers-reduced-motion settings."

### Show Mobile Responsiveness
**[Resize browser or use DevTools device emulation]**

"The entire site adapts fluidly. Navigation becomes a hamburger menu, grids stack, and touch targets are appropriately sized."

---

## Backup: If Demo Breaks

"If the live demo fails, I have a video recording of the full user flow and can walk through the codebase structure to show implementation details."

---

**Total Time**: ~6:30 (leaves 30 seconds buffer)  
**Confidence Level**: ⭐⭐⭐⭐⭐

**Practice Notes:**
- Run through 3x before competition
- Time each section with stopwatch
- Test all demo accounts beforehand
- Clear browser cache to avoid stale data
- Have backup tab open to rubric.md for quick reference
