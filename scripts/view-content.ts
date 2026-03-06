/**
 * View Content Script
 * 
 * View all lessons, quizzes, and tests in the database.
 * Useful for finding IDs, slugs, and titles to update.
 * 
 * Usage:
 *   npm run view-content
 */

import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from '../drizzle/schema';
import { asc } from 'drizzle-orm';

const db = getDbSync();

async function viewContent() {
  console.log('📚 Viewing all content in the database...\n');

  // View all units
  console.log('📦 UNITS:');
  console.log('='.repeat(80));
  const units = await db.select().from(schema.units).orderBy(asc(schema.units.order));
  units.forEach((unit: typeof schema.units.$inferSelect) => {
    console.log(`  ${unit.order}. ${unit.title} (slug: ${unit.slug})`);
  });
  console.log(`\nTotal: ${units.length} units\n`);

  // View all lessons
  console.log('📖 LESSONS:');
  console.log('='.repeat(80));
  const lessons = await db.select().from(schema.lessons).orderBy(asc(schema.lessons.order));
  lessons.forEach((lesson: typeof schema.lessons.$inferSelect) => {
    const videoInfo = lesson.youtubeId ? `YouTube: ${lesson.youtubeId}` : lesson.khanUrl ? `Khan: ${lesson.khanUrl.slice(0, 50)}...` : 'No video';
    console.log(`  ${lesson.order}. ${lesson.title}`);
    console.log(`     Slug: ${lesson.slug} | Type: ${lesson.type} | ${videoInfo}`);
  });
  console.log(`\nTotal: ${lessons.length} lessons\n`);

  // View all quizzes
  console.log('❓ QUIZZES:');
  console.log('='.repeat(80));
  const quizzes = await db.select().from(schema.quizzes);
  quizzes.forEach((quiz: typeof schema.quizzes.$inferSelect) => {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : JSON.parse(quiz.questions as string);
    console.log(`  - ${quiz.title}`);
    console.log(`    ID: ${quiz.id} | Questions: ${questions.length} | Time Limit: ${quiz.timeLimit || 'None'} min | Passing: ${quiz.passingScore}%`);
  });
  console.log(`\nTotal: ${quizzes.length} quizzes\n`);

  // View all tests
  console.log('📝 TESTS:');
  console.log('='.repeat(80));
  const tests = await db.select().from(schema.tests);
  tests.forEach((test: typeof schema.tests.$inferSelect) => {
    const questions = Array.isArray(test.questions) ? test.questions : JSON.parse(test.questions as string);
    console.log(`  - ${test.title}`);
    console.log(`    ID: ${test.id} | Questions: ${questions.length} | Time Limit: ${test.timeLimit || 'None'} min | Passing: ${test.passingScore}%`);
  });
  console.log(`\nTotal: ${tests.length} tests\n`);

  // Detailed view of a specific quiz (example)
  if (quizzes.length > 0) {
    console.log('📋 EXAMPLE QUIZ DETAILS:');
    console.log('='.repeat(80));
    const exampleQuiz = quizzes[0];
    const questions = Array.isArray(exampleQuiz.questions) 
      ? exampleQuiz.questions 
      : JSON.parse(exampleQuiz.questions as string);
    
    console.log(`Quiz: ${exampleQuiz.title}`);
    console.log(`ID: ${exampleQuiz.id}`);
    console.log(`Questions (${questions.length}):\n`);
    
    questions.slice(0, 3).forEach((q: any) => {
      console.log(`  ${q.id}. ${q.question}`);
      q.options.forEach((opt: string, idx: number) => {
        const marker = idx === q.correctAnswer ? '✓' : ' ';
        console.log(`     ${marker} ${idx + 1}. ${opt}`);
      });
      if (q.explanation) {
        console.log(`     Explanation: ${q.explanation}`);
      }
      console.log();
    });
    
    if (questions.length > 3) {
      console.log(`  ... and ${questions.length - 3} more questions`);
    }
  }

  console.log('\n💡 Tip: Use these IDs, slugs, and titles in your update scripts!');
}

viewContent().catch(console.error);



