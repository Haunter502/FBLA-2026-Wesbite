/**
 * Example: How to update content
 * 
 * This file shows examples of how to update lessons, quizzes, and tests.
 * Copy the functions you need and modify the content.
 * 
 * Run with: npm run update-content
 */

import {
  updateLesson,
  updateQuizByTitle,
  updateTestByTitle,
  getAllLessons,
  getAllQuizzes,
} from './update-content';

async function exampleUpdates() {
  try {
    console.log('🔄 Starting content updates...\n');

    // Example 1: Update a lesson's YouTube video
    console.log('Example 1: Updating lesson video...');
    await updateLesson('linear-equations-intro', {
      youtubeId: '7q4r7IJWnKE', // Khan Academy: Introduction to Linear Equations
      description: 'Learn the basics of linear equations with step-by-step examples.',
      duration: 12,
    });
    console.log('✅ Lesson updated\n');

    // Example 2: Update quiz questions
    console.log('Example 2: Updating quiz questions...');
    await updateQuizByTitle('Linear Equations & Inequalities Quiz', {
      questions: [
        {
          id: 1,
          question: 'What is the solution to 2x + 5 = 13?',
          options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
          correctAnswer: 0,
          explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
        },
        {
          id: 2,
          question: 'Solve for x: 3x - 7 = 14',
          options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
          correctAnswer: 2,
          explanation: 'Add 7 to both sides: 3x = 21, then divide by 3: x = 7',
        },
        {
          id: 3,
          question: 'Which equation is equivalent to 4x + 8 = 20?',
          options: ['x + 2 = 5', 'x + 4 = 10', '2x + 4 = 10', 'x = 3'],
          correctAnswer: 3,
          explanation: 'Subtract 8: 4x = 12, divide by 4: x = 3',
        },
        {
          id: 4,
          question: 'Solve: 5(x - 2) = 15',
          options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
          correctAnswer: 2,
          explanation: 'Divide by 5: x - 2 = 3, add 2: x = 5',
        },
        {
          id: 5,
          question: 'What is the first step to solve 2x + 6 = 18?',
          options: ['Divide by 2', 'Subtract 6', 'Add 6', 'Multiply by 2'],
          correctAnswer: 1,
          explanation: 'First, subtract 6 from both sides to isolate the term with x',
        },
      ],
    });
    console.log('✅ Quiz updated\n');

    // Example 3: List all lessons to find slugs
    console.log('Example 3: Listing all lessons...');
    const lessons = await getAllLessons();
    console.log(`Found ${lessons.length} lessons:`);
    lessons.slice(0, 5).forEach((lesson: typeof lessons[0]) => {
      console.log(`  - ${lesson.slug}: ${lesson.title} (${lesson.type})`);
    });
    console.log('...\n');

    // Example 4: List all quizzes to find titles
    console.log('Example 4: Listing all quizzes...');
    const quizzes = await getAllQuizzes();
    console.log(`Found ${quizzes.length} quizzes:`);
    quizzes.slice(0, 5).forEach((quiz: typeof quizzes[0]) => {
      console.log(`  - ${quiz.title} (${quiz.questions.length || 0} questions)`);
    });
    console.log('...\n');

    console.log('✅ All examples completed!');
    console.log('\n💡 Tip: Modify this file with your own updates and run: npm run update-content');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Uncomment to run examples
// exampleUpdates();

export { exampleUpdates };



