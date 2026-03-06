# Quick Start: Editing Content

## The Fastest Way to Update Content

### 1. View Current Content
```bash
npm run view-content
```

### 2. Edit Seed File
Open `drizzle/seed.ts` and find:
- **Lessons**: Line ~180-240 (lessonsData array)
- **Quizzes**: Line ~256-299 (quizzesData array)  
- **Tests**: Line ~309-333 (testsData array)

### 3. Make Your Changes

**For Videos:**
```typescript
youtubeId: 'YOUR_VIDEO_ID',  // Just the ID, not the full URL
```

**For Questions:**
```typescript
questions: [
  {
    id: 1,
    question: 'Your question here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,  // 0, 1, 2, or 3
    explanation: 'Why this is correct',
  },
]
```

### 4. Re-seed Database
```bash
npm run db:seed
```

### 5. View in Browser
Refresh your browser to see changes!

---

## Need Help?

- **Full Guide**: See `CONTENT_MANAGEMENT_GUIDE.md`
- **Quick Reference**: See `QUICK_EDIT_GUIDE.md`
- **View Content**: `npm run view-content`
- **Admin Panel**: Go to `/admin/content` (login as admin/teacher)

