import { config } from 'dotenv';
import { resolve } from 'path';
import { getDbSync } from '../src/lib/db-server';
import * as schema from '../drizzle/schema';
import { eq } from '../src/lib/drizzle-helpers';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const db = getDbSync();

async function updateLinearEquationsUnit() {
  console.log('🔄 Updating Linear Equations & Inequalities unit...');

  // Get the unit
  const [unit] = await db
    .select()
    .from(schema.units)
    .where(eq(schema.units.slug, 'linear-equations'))
    .limit(1);

  if (!unit) {
    console.error('❌ Unit not found');
    return;
  }

  console.log(`✅ Found unit: ${unit.title}`);

  // Delete existing lessons for this unit
  await db.delete(schema.lessons).where(eq(schema.lessons.unitId, unit.id));
  console.log('🗑️  Deleted existing lessons');

  // Create new lessons
  const lessons = [
    {
      slug: 'introduction-to-linear-equations-inequalities-1',
      unitId: unit.id,
      title: 'Introduction to Linear Equations & Inequalities',
      description: 'Learn the basics of linear equations',
      type: 'VIDEO' as const,
      youtubeId: 'DrZJKdXlZ3I',
      duration: 6.5,
      order: 1,
    },
    {
      slug: 'introduction-to-linear-equations-inequalities-2',
      unitId: unit.id,
      title: 'Introduction to Linear Equations & Inequalities',
      description: 'Learn the basics of linear equations',
      type: 'VIDEO' as const,
      youtubeId: 'DrZJKdXlZ3I',
      duration: 6.5,
      order: 2,
    },
    {
      slug: 'fundamental-concepts-linear-equations',
      unitId: unit.id,
      title: 'Fundamental Concepts',
      description: 'Practice and understand the basics of linear equations',
      type: 'READING' as const,
      khanUrl: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-inequalities',
      duration: 15,
      order: 3,
    },
    {
      slug: 'worked-examples-linear-equations',
      unitId: unit.id,
      title: 'Worked Examples',
      description: 'Practice applying concepts through examples',
      type: 'VIDEO' as const,
      youtubeId: '1c5HY3z4k8M',
      duration: 4,
      order: 4,
    },
    {
      slug: 'advanced-techniques-linear-equations',
      unitId: unit.id,
      title: 'Advanced Techniques',
      description: 'Learn how to solve linear equations with unknown coefficients',
      type: 'VIDEO' as const,
      youtubeId: 'adPgapI',
      duration: 6,
      order: 6,
    },
    {
      slug: 'real-world-applications-linear-equations',
      unitId: unit.id,
      title: 'Real-World Applications',
      description: 'To use inequalities to solve problems in a given context and real-world problems',
      type: 'VIDEO' as const,
      youtubeId: 'E6rn-YD_2_Q',
      duration: 4,
      order: 7,
    },
    {
      slug: 'unit-review-linear-equations',
      unitId: unit.id,
      title: 'Unit Review',
      description: 'Practice and understand the basics of linear equations',
      type: 'READING' as const,
      khanUrl: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-inequalities',
      duration: 15,
      order: 8,
    },
  ];

  await db.insert(schema.lessons).values(lessons);
  console.log(`✅ Created ${lessons.length} lessons`);

  // Update the main quiz with the new question
  const [existingQuiz] = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.unitId, unit.id))
    .where(eq(schema.quizzes.title, 'Linear Equations & Inequalities Quiz'))
    .limit(1);

  if (existingQuiz) {
    const quizQuestions = [
      {
        id: '1',
        question: 'What is the solution to 2x + 5 = 13?',
        options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
        correct: 0,
        explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
      },
    ];

    await db
      .update(schema.quizzes)
      .set({
        questions: JSON.stringify(quizQuestions),
        updatedAt: new Date(),
      })
      .where(eq(schema.quizzes.id, existingQuiz.id));

    console.log('✅ Updated main quiz');
  }

  // Create Practice Problems Set 1
  const practiceSet1Questions = [
    {
      id: '1',
      question: 'What is the solution to 2(5 − d) = 2 − 4d?',
      options: ['d = −4', 'd = −2', 'd = 2', 'd = 4'],
      correct: 0,
      explanation: 'Distribute 2 → 10 − 2d = 2 − 4d. Add 4d to both sides → 10 + 2d = 2. Subtract 10 → 2d = −8. Divide by 2 → d = −4.',
    },
    {
      id: '2',
      question: 'What is the solution to 8(10 − k) = 2k?',
      options: ['k = 4', 'k = 6', 'k = 8', 'k = 10'],
      correct: 2,
      explanation: 'Distribute 8 → 80 − 8k = 2k. Add 8k to both sides → 80 = 10k. Divide by 10 → k = 8.',
    },
    {
      id: '3',
      question: 'What is the solution to 0.5(7d + 4) = 7 − 1.5d?',
      options: ['d = 1', 'd = 2', 'd = 3', 'd = 4'],
      correct: 0,
      explanation: 'Distribute 0.5 → 3.5d + 2 = 7 − 1.5d. Add 1.5d to both sides → 5d + 2 = 7. Subtract 2 → 5d = 5. Divide by 5 → d = 1.',
    },
    {
      id: '4',
      question: 'How can we get Equation B from Equation A? A: 3(x + 2) = 18 B: 3x + 6 = 18',
      options: [
        'A) Multiply/divide both sides by the same non-zero constant',
        'B) Multiply/divide only one side by a non-zero constant',
        'C) Rewrite one side (or both) by combining like terms',
        'D) Rewrite one side (or both) using the distributive property',
      ],
      correct: 3,
      explanation: 'We used the distributive property to expand 3(x + 2) into 3x + 6.',
    },
  ];

  // Check if Practice Problems Set 1 already exists
  const [existingPractice1] = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.unitId, unit.id))
    .where(eq(schema.quizzes.title, 'Practice Problems - Set 1'))
    .limit(1);

  if (existingPractice1) {
    await db
      .update(schema.quizzes)
      .set({
        questions: JSON.stringify(practiceSet1Questions),
        updatedAt: new Date(),
      })
      .where(eq(schema.quizzes.id, existingPractice1.id));
    console.log('✅ Updated Practice Problems Set 1');
  } else {
    await db.insert(schema.quizzes).values({
      unitId: unit.id,
      title: 'Practice Problems - Set 1',
      description: 'Practice solving linear equations with distribution and combining like terms',
      questions: JSON.stringify(practiceSet1Questions),
      passingScore: 70,
    });
    console.log('✅ Created Practice Problems Set 1');
  }

  // Create Practice Problems Set 2
  const practiceSet2Questions = [
    {
      id: '1',
      question: 'How many solutions does −6y + 13 + 9y = 8y − 3 have?',
      options: ['No solutions', 'Exactly one solution', 'Infinitely many solutions'],
      correct: 1,
      explanation: 'Combine like terms → 3y + 13 = 8y − 3. Subtract 8y → −5y + 13 = −3. Subtract 13 → −5y = −16. Divide by −5 → y = 16/5. One unique value means exactly one solution.',
    },
    {
      id: '2',
      question: 'What is the solution to −px + r = −8x − 2?',
      options: [
        'x = (r + 2)/(p − 8)',
        'x = (r − 2)/(p − 8)',
        'x = (r + 2)/(8 − p)',
        'x = (r − 2)/(8 − p)',
      ],
      correct: 0,
      explanation: 'Add px to both sides → r = x(p − 8) − 2. Add 2 → r + 2 = x(p − 8). Divide by (p − 8) → x = (r + 2)/(p − 8).',
    },
    {
      id: '3',
      question: 'What is the solution to v(j + y) = 61y + 82?',
      options: [
        'y = (82 − vj)/(v − 61)',
        'y = (vj − 82)/(v − 61)',
        'y = (vj + 82)/(v − 61)',
        'y = (82 − vj)/(61 − v)',
      ],
      correct: 0,
      explanation: 'Distribute v → vj + vy = 61y + 82. Subtract 61y → vj + (v − 61)y = 82. Subtract vj → (v − 61)y = 82 − vj. Divide by (v − 61) → y = (82 − vj)/(v − 61).',
    },
    {
      id: '4',
      question: 'What is the solution to 9f = (1/2)(12f − 2)?',
      options: ['f = 1/6', 'f = 1/3', 'f = 2/3', 'f = 3/2'],
      correct: 1,
      explanation: 'Multiply both sides by 2 → 18f = 12f − 2. Subtract 12f → 6f = −2. Divide by 6 → f = −1/3.',
    },
  ];

  // Check if Practice Problems Set 2 already exists
  const [existingPractice2] = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.unitId, unit.id))
    .where(eq(schema.quizzes.title, 'Practice Problems - Set 2'))
    .limit(1);

  if (existingPractice2) {
    await db
      .update(schema.quizzes)
      .set({
        questions: JSON.stringify(practiceSet2Questions),
        updatedAt: new Date(),
      })
      .where(eq(schema.quizzes.id, existingPractice2.id));
    console.log('✅ Updated Practice Problems Set 2');
  } else {
    await db.insert(schema.quizzes).values({
      unitId: unit.id,
      title: 'Practice Problems - Set 2',
      description: 'Practice solving linear equations with unknown coefficients and multiple solution types',
      questions: JSON.stringify(practiceSet2Questions),
      passingScore: 70,
    });
    console.log('✅ Created Practice Problems Set 2');
  }

  console.log('✅ Linear Equations & Inequalities unit updated successfully!');
}

// Run the update
updateLinearEquationsUnit()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

