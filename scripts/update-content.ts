/**
 * Content Update Script
 * 
 * This script allows you to update lessons, quizzes, and tests in the database
 * without re-seeding the entire database.
 * 
 * Usage:
 *   npm run update-content
 * 
 * Or import functions and use programmatically:
 *   import { updateLesson, updateQuiz, updateTest } from './scripts/update-content'
 */

import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const db = getDbSync();

/**
 * Update a lesson by slug
 */
export async function updateLesson(
  slug: string,
  updates: {
    title?: string;
    description?: string;
    type?: 'VIDEO' | 'READING' | 'EXERCISE';
    youtubeId?: string | null;
    khanUrl?: string | null;
    duration?: number | null;
    order?: number;
  }
) {
  const [lesson] = await db
    .select()
    .from(schema.lessons)
    .where(eq(schema.lessons.slug, slug))
    .limit(1);

  if (!lesson) {
    throw new Error(`Lesson with slug "${slug}" not found`);
  }

  const [updated] = await db
    .update(schema.lessons)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(schema.lessons.id, lesson.id))
    .returning();

  console.log(`✅ Updated lesson: ${updated.title}`);
  return updated;
}

/**
 * Update quiz questions by quiz ID
 */
export async function updateQuizQuestions(
  quizId: string,
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>
) {
  const [quiz] = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.id, quizId))
    .limit(1);

  if (!quiz) {
    throw new Error(`Quiz with ID "${quizId}" not found`);
  }

  const [updated] = await db
    .update(schema.quizzes)
    .set({
      questions: questions as any,
      updatedAt: new Date(),
    })
    .where(eq(schema.quizzes.id, quizId))
    .returning();

  console.log(`✅ Updated quiz: ${updated.title}`);
  return updated;
}

/**
 * Update test questions by test ID
 */
export async function updateTestQuestions(
  testId: string,
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>
) {
  const [test] = await db
    .select()
    .from(schema.tests)
    .where(eq(schema.tests.id, testId))
    .limit(1);

  if (!test) {
    throw new Error(`Test with ID "${testId}" not found`);
  }

  const [updated] = await db
    .update(schema.tests)
    .set({
      questions: questions as any,
      updatedAt: new Date(),
    })
    .where(eq(schema.tests.id, testId))
    .returning();

  console.log(`✅ Updated test: ${updated.title}`);
  return updated;
}

/**
 * Update quiz by title (finds first matching quiz)
 */
export async function updateQuizByTitle(
  title: string,
  updates: {
    description?: string;
    timeLimit?: number | null;
    passingScore?: number;
    questions?: Array<{
      id: number;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
  }
) {
  const quizzes = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.title, title))
    .limit(1);

  if (quizzes.length === 0) {
    throw new Error(`Quiz with title "${title}" not found`);
  }

  const quiz = quizzes[0];
  const updateData: any = {
    ...updates,
    updatedAt: new Date(),
  };

  if (updates.questions) {
    updateData.questions = updates.questions;
  }

  const [updated] = await db
    .update(schema.quizzes)
    .set(updateData)
    .where(eq(schema.quizzes.id, quiz.id))
    .returning();

  console.log(`✅ Updated quiz: ${updated.title}`);
  return updated;
}

/**
 * Update test by title (finds first matching test)
 */
export async function updateTestByTitle(
  title: string,
  updates: {
    description?: string;
    timeLimit?: number | null;
    passingScore?: number;
    questions?: Array<{
      id: number;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
  }
) {
  const tests = await db
    .select()
    .from(schema.tests)
    .where(eq(schema.tests.title, title))
    .limit(1);

  if (tests.length === 0) {
    throw new Error(`Test with title "${title}" not found`);
  }

  const test = tests[0];
  const updateData: any = {
    ...updates,
    updatedAt: new Date(),
  };

  if (updates.questions) {
    updateData.questions = updates.questions;
  }

  const [updated] = await db
    .update(schema.tests)
    .set(updateData)
    .where(eq(schema.tests.id, test.id))
    .returning();

  console.log(`✅ Updated test: ${updated.title}`);
  return updated;
}

/**
 * Get all lessons (for reference)
 */
export async function getAllLessons() {
  return await db.select().from(schema.lessons);
}

/**
 * Get all quizzes (for reference)
 */
export async function getAllQuizzes() {
  return await db.select().from(schema.quizzes);
}

/**
 * Get all tests (for reference)
 */
export async function getAllTests() {
  return await db.select().from(schema.tests);
}

// Example usage (uncomment and modify as needed)
/*
async function main() {
  try {
    // Update a lesson's YouTube video
    await updateLesson('linear-equations-intro', {
      youtubeId: 'NEW_VIDEO_ID',
      description: 'Updated description',
    });

    // Update quiz questions
    await updateQuizByTitle('Linear Equations & Inequalities Quiz', {
      questions: [
        {
          id: 1,
          question: 'What is the solution to 2x + 5 = 13?',
          options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
          correctAnswer: 0,
          explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
        },
        // Add more questions...
      ],
    });

    console.log('✅ Content updated successfully!');
  } catch (error) {
    console.error('❌ Error updating content:', error);
    process.exit(1);
  }
}

// Uncomment to run
// main();
*/



