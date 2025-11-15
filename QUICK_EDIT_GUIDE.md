# Quick Edit Guide

## 🎥 Updating Lesson Videos

### Find the lesson in `drizzle/seed.ts`

Look for the `lessonsData` array (around line 180-240). Find the lesson you want to update:

```typescript
{
  slug: 'linear-equations-intro',
  unitId: unit.id,
  title: 'Introduction to Linear Equations',
  description: 'Learn the basics...',
  type: 'VIDEO' as const,
  youtubeId: 'YOUR_YOUTUBE_ID_HERE',  // ← Change this
  duration: 12,
  order: 1,
}
```

### Get YouTube Video ID

1. Go to YouTube video
2. Copy the ID from URL: `https://www.youtube.com/watch?v=VIDEO_ID`
3. Paste just the ID (e.g., `7q4r7IJWnKE`)

### Update and Re-seed

```bash
npm run db:seed
```

---

## 📝 Updating Quiz Questions

### Find the quiz in `drizzle/seed.ts`

Look for the `quizzesData` array (around line 256-299). Each unit has a quiz:

```typescript
{
  unitId: unit.id,
  title: `${unit.title} Quiz`,
  description: `Test your understanding...`,
  timeLimit: 30,
  passingScore: 70,
  questions: [
    {
      id: 1,
      question: 'YOUR QUESTION HERE',  // ← Change this
      options: ['Option A', 'Option B', 'Option C', 'Option D'],  // ← Change these
      correctAnswer: 0,  // ← Change to 0, 1, 2, or 3 (index of correct answer)
      explanation: 'YOUR EXPLANATION HERE',  // ← Change this
    },
    // Add more questions...
  ],
}
```

### Question Format

- `id`: Unique number (1, 2, 3, ...)
- `question`: The question text
- `options`: Array of exactly 4 options
- `correctAnswer`: Index of correct option (0 = first, 1 = second, etc.)
- `explanation`: Explanation shown after answering

### Example Quiz Question

```typescript
{
  id: 1,
  question: 'What is the solution to 2x + 5 = 13?',
  options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
  correctAnswer: 0,  // x = 4 is correct (first option, index 0)
  explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
}
```

### Update and Re-seed

```bash
npm run db:seed
```

---

## 📚 Updating Reading Lessons

### Find the lesson in `drizzle/seed.ts`

Look for lessons with `type: 'READING'`:

```typescript
{
  slug: 'linear-equations-guide',
  unitId: unit.id,
  title: 'Linear Equations Study Guide',
  description: 'YOUR READING CONTENT HERE',  // ← Put reading content here
  type: 'READING' as const,
  khanUrl: 'https://www.khanacademy.org/...',  // ← Optional: Link to external reading
  duration: 10,
  order: 8,
}
```

### Update and Re-seed

```bash
npm run db:seed
```

---

## 🔍 View Current Content

### See all content in the database

```bash
npm run view-content
```

This shows:
- All lessons with their slugs, types, and video IDs
- All quizzes with question counts
- All tests with question counts

### View in web interface

1. Log in as admin or teacher
2. Go to `/admin/content`
3. Browse all lessons, quizzes, and tests

---

## 🛠️ Update Without Re-seeding Everything

### Use the update script

Edit `scripts/example-update.ts` with your changes:

```typescript
// Update a lesson
await updateLesson('linear-equations-intro', {
  youtubeId: 'NEW_VIDEO_ID',
  description: 'New description',
});

// Update quiz questions
await updateQuizByTitle('Linear Equations & Inequalities Quiz', {
  questions: [
    {
      id: 1,
      question: 'Your question',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: 'Explanation',
    },
  ],
});
```

Then run:
```bash
npm run update-content
```

---

## 📋 Common Tasks

### Change a video for a lesson

1. Find lesson in `drizzle/seed.ts` by slug
2. Update `youtubeId` field
3. Run `npm run db:seed`

### Add questions to a quiz

1. Find quiz in `drizzle/seed.ts`
2. Add new question object to `questions` array
3. Run `npm run db:seed`

### Change quiz passing score

1. Find quiz in `drizzle/seed.ts`
2. Update `passingScore` field (0-100)
3. Run `npm run db:seed`

### Update lesson description

1. Find lesson in `drizzle/seed.ts`
2. Update `description` field
3. Run `npm run db:seed`

---

## ⚠️ Important Notes

1. **Always backup** your database before making changes
2. **Re-seed deletes** existing data and recreates it
3. **Slugs must be unique** - don't duplicate lesson slugs
4. **Question IDs** must be unique within each quiz/test
5. **Correct answer** is 0-based index (0, 1, 2, or 3)

---

## 🆘 Troubleshooting

### Content not updating?

1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Check database was updated: `npm run view-content`

### JSON errors in quizzes?

- Make sure all quotes are escaped: `"question": "What is 2 + 2?"`
- Validate JSON at: https://jsonlint.com/
- Check commas between array items

### Video not showing?

- Verify YouTube ID is correct (just the ID, not full URL)
- Check video is public on YouTube
- Check browser console for errors

---

## 📖 Full Guide

For detailed instructions, see `CONTENT_MANAGEMENT_GUIDE.md`



