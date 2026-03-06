# Content Management Guide

This guide explains how to update lessons, quizzes, and tests in your Numera application.

## Database Structure

All content is stored in a SQLite database. The database file is located at:
- Development: `drizzle/local.db` (or path specified in `.env` as `DATABASE_URL`)

## Option 1: Edit the Seed File (Recommended for Initial Setup)

The easiest way to update content is by editing the seed file and re-running it.

### Location
- Seed file: `drizzle/seed.ts`

### Updating Lessons

Lessons are stored with the following structure:

```typescript
{
  slug: 'linear-equations-intro',  // URL-friendly identifier (must be unique)
  unitId: unit.id,                  // ID of the parent unit
  title: 'Introduction to Linear Equations',
  description: 'Learn the basics of linear equations...',
  type: 'VIDEO' | 'READING' | 'EXERCISE',
  khanUrl: 'https://www.khanacademy.org/...',  // Optional: Khan Academy URL
  youtubeId: 'dQw4w9WgXcQ',                    // Optional: YouTube video ID
  duration: 15,                                // Optional: Duration in minutes
  order: 1,                                    // Display order within unit
}
```

**For VIDEO lessons:**
- Set `type: 'VIDEO'`
- Provide either `youtubeId` (just the ID, e.g., 'dQw4w9WgXcQ') or `khanUrl` (full URL)
- Example:
  ```typescript
  {
    slug: 'linear-equations-intro',
    title: 'Introduction to Linear Equations',
    description: 'Learn how to solve linear equations step by step.',
    type: 'VIDEO',
    youtubeId: '7q4r7IJWnKE',  // YouTube video ID
    duration: 12,
    order: 1,
  }
  ```

**For READING lessons:**
- Set `type: 'READING'`
- Provide `description` with the reading content, or `khanUrl` for external reading
- Example:
  ```typescript
  {
    slug: 'linear-equations-guide',
    title: 'Linear Equations Study Guide',
    description: 'This comprehensive guide covers all aspects of linear equations...',
    type: 'READING',
    khanUrl: 'https://www.khanacademy.org/...',  // Optional
    duration: 10,
    order: 2,
  }
  ```

### Updating Quizzes

Quizzes are stored with questions as JSON:

```typescript
{
  unitId: unit.id,
  title: 'Linear Equations Quiz',
  description: 'Test your understanding of linear equations.',
  timeLimit: 30,  // Optional: Time limit in minutes
  passingScore: 70,  // Required: Passing score (0-100)
  questions: [
    {
      id: 1,  // Unique question ID within the quiz
      question: 'What is the solution to 2x + 5 = 13?',
      options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
      correctAnswer: 0,  // Index of correct option (0-based)
      explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
    },
    {
      id: 2,
      question: 'Which equation is linear?',
      options: ['x² + 5 = 10', '2x + 3 = 7', 'x³ = 8', '√x = 4'],
      correctAnswer: 1,
      explanation: 'A linear equation has a variable with power 1. Only 2x + 3 = 7 fits this.',
    },
    // Add more questions...
  ],
}
```

**Question Structure:**
- `id`: Unique number within the quiz (1, 2, 3, ...)
- `question`: The question text
- `options`: Array of 4 answer choices
- `correctAnswer`: Index of the correct answer (0, 1, 2, or 3)
- `explanation`: Optional explanation shown after answering

### Updating Tests

Tests use the same structure as quizzes:

```typescript
{
  unitId: unit.id,
  title: 'Linear Equations Test',
  description: 'Comprehensive test on linear equations.',
  timeLimit: 60,  // Usually longer than quizzes
  passingScore: 70,
  questions: [
    // Same question structure as quizzes
  ],
}
```

## Option 2: Direct Database Editing (Advanced)

You can edit the database directly using a SQLite browser or command line.

### Using SQLite Command Line

```bash
# Open the database
sqlite3 drizzle/local.db

# View all lessons
SELECT id, slug, title, type, youtube_id, khan_url FROM lessons;

# Update a lesson's YouTube ID
UPDATE lessons 
SET youtube_id = 'NEW_VIDEO_ID', updated_at = unixepoch() 
WHERE slug = 'linear-equations-intro';

# Update quiz questions (stored as JSON)
UPDATE quizzes 
SET questions = '[
  {
    "id": 1,
    "question": "Your question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation here"
  }
]',
updated_at = unixepoch()
WHERE id = 'QUIZ_ID';

# Exit
.quit
```

### Using a SQLite GUI Tool

1. Download DB Browser for SQLite: https://sqlitebrowser.org/
2. Open `drizzle/local.db`
3. Navigate to the `lessons`, `quizzes`, or `tests` table
4. Edit the data directly
5. For JSON fields (questions), make sure the JSON is valid

## Option 3: Using the Admin Interface (Coming Soon)

We'll create an admin interface to manage content through the web UI.

## Step-by-Step: Updating Content via Seed File

### 1. Edit the Seed File

Open `drizzle/seed.ts` and find the section you want to update:

- **Lessons**: Look for `lessonsData` array (around line 180-240)
- **Quizzes**: Look for `quizzesData` array (around line 256-299)
- **Tests**: Look for `testsData` array (around line 301-344)

### 2. Update the Content

Example: To update a lesson's video:

```typescript
{
  slug: 'linear-equations-intro',
  unitId: unit.id,
  title: 'Introduction to Linear Equations',
  description: 'Learn how to solve linear equations step by step.',
  type: 'VIDEO' as const,
  youtubeId: 'YOUR_NEW_VIDEO_ID',  // Change this
  duration: 12,
  order: 1,
}
```

Example: To update quiz questions:

```typescript
questions: [
  {
    id: 1,
    question: 'What is 2 + 2?',  // Change this
    options: ['3', '4', '5', '6'],  // Change these
    correctAnswer: 1,  // Change to index of correct answer
    explanation: '2 + 2 equals 4',  // Change this
  },
  // Add more questions...
],
```

### 3. Clear Existing Data (Optional)

If you want to start fresh:

```bash
# Delete the database
rm drizzle/local.db

# Or just delete specific tables
sqlite3 drizzle/local.db "DELETE FROM lessons; DELETE FROM quizzes; DELETE FROM tests;"
```

### 4. Re-run the Seed Script

```bash
npm run db:seed
```

This will recreate all content with your updates.

## Finding YouTube Video IDs

1. Go to the YouTube video
2. The URL looks like: `https://www.youtube.com/watch?v=VIDEO_ID`
3. Copy the `VIDEO_ID` part (e.g., `7q4r7IJWnKE`)

## Finding Khan Academy URLs

1. Go to the Khan Academy lesson/exercise
2. Copy the full URL from your browser
3. Use it as the `khanUrl` value

## Example: Complete Lesson Update

```typescript
// In drizzle/seed.ts, find the lessonsData array and update:
{
  slug: 'linear-equations-solving',
  unitId: unit.id,
  title: 'Solving Linear Equations',
  description: 'Learn step-by-step methods for solving linear equations.',
  type: 'VIDEO' as const,
  youtubeId: 'x-PlBk5nzA0',  // Khan Academy video on solving equations
  khanUrl: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-inequalities/solving-linear-equations/v/simple-equations',
  duration: 15,
  order: 2,
}
```

## Example: Complete Quiz Update

```typescript
// In drizzle/seed.ts, find the quizzesData array and update:
{
  unitId: unit.id,
  title: 'Linear Equations Quiz',
  description: 'Test your understanding of solving linear equations.',
  timeLimit: 30,
  passingScore: 70,
  questions: [
    {
      id: 1,
      question: 'Solve for x: 3x + 7 = 22',
      options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
      correctAnswer: 0,
      explanation: 'Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5',
    },
    {
      id: 2,
      question: 'Solve for x: 2(x + 3) = 14',
      options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
      correctAnswer: 0,
      explanation: 'Divide both sides by 2: x + 3 = 7, then subtract 3: x = 4',
    },
    {
      id: 3,
      question: 'Which is the solution to 5x - 10 = 15?',
      options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
      correctAnswer: 2,
      explanation: 'Add 10 to both sides: 5x = 25, then divide by 5: x = 5',
    },
    {
      id: 4,
      question: 'Solve: 4x + 8 = 2x + 20',
      options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
      correctAnswer: 2,
      explanation: 'Subtract 2x from both sides: 2x + 8 = 20, subtract 8: 2x = 12, divide by 2: x = 6',
    },
    {
      id: 5,
      question: 'What is the first step to solve 3(x - 2) = 15?',
      options: ['Divide by 3', 'Subtract 2', 'Add 2', 'Multiply by 3'],
      correctAnswer: 0,
      explanation: 'First, divide both sides by 3 to get: x - 2 = 5',
    },
  ],
}
```

## Quick Reference

### Lesson Fields
- `slug`: URL-friendly identifier (unique, required)
- `title`: Display title (required)
- `description`: Lesson description (required)
- `type`: 'VIDEO', 'READING', or 'EXERCISE' (required)
- `youtubeId`: YouTube video ID (optional, for VIDEO type)
- `khanUrl`: Khan Academy URL (optional)
- `duration`: Duration in minutes (optional)
- `order`: Display order (required)

### Quiz/Test Fields
- `title`: Quiz/test title (required)
- `description`: Description (optional)
- `timeLimit`: Time limit in minutes (optional)
- `passingScore`: Passing score 0-100 (required, default: 70)
- `questions`: Array of question objects (required)

### Question Structure
- `id`: Unique question ID (required)
- `question`: Question text (required)
- `options`: Array of 4 options (required)
- `correctAnswer`: Index of correct answer 0-3 (required)
- `explanation`: Explanation text (optional)

## Troubleshooting

### Content Not Updating
1. Make sure you re-ran the seed script: `npm run db:seed`
2. Clear your browser cache
3. Restart the development server: `npm run dev`

### JSON Errors in Quizzes/Tests
- Make sure all JSON is valid (use a JSON validator)
- Escape quotes properly: `"question": "What is 2 + 2?"`
- Make sure arrays and objects are properly formatted

### Video Not Showing
- Check that `youtubeId` is just the ID, not the full URL
- Verify the video is publicly accessible on YouTube
- Check browser console for errors

## Next Steps

For easier content management, consider:
1. Creating an admin interface for content editing
2. Using a CMS (Content Management System)
3. Setting up a staging environment for testing changes



