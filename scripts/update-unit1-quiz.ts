import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from '../drizzle/schema';
import { eq } from '../src/lib/drizzle-helpers';

const db = getDbSync();

async function updateQuiz() {
  console.log('🔄 Updating Unit 1 quiz with 4-5 questions...');

  // Get unit 1 (Linear Equations & Inequalities)
  const [unit] = await db
    .select()
    .from(schema.units)
    .where(eq(schema.units.order, 1))
    .limit(1);

  if (!unit) {
    console.error('❌ Unit 1 not found');
    process.exit(1);
  }

  console.log(`Found unit: ${unit.title}`);

  // Get the main quiz for this unit
  const [quiz] = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.unitId, unit.id))
    .limit(1);

  if (!quiz) {
    console.error('❌ Quiz not found for unit 1');
    process.exit(1);
  }

  console.log(`Found quiz: ${quiz.title}`);

  // Create 5 questions for Linear Equations & Inequalities
  const questions = [
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
  ];

  // Update the quiz
  await db
    .update(schema.quizzes)
    .set({
      questions: questions as any,
      updatedAt: new Date(),
    })
    .where(eq(schema.quizzes.id, quiz.id));

  console.log(`✅ Updated quiz with ${questions.length} questions`);
  console.log('Questions:');
  questions.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.question}`);
  });
}

updateQuiz()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

