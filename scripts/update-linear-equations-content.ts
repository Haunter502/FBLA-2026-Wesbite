import { config } from 'dotenv';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
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
      slug: 'introduction-to-linear-equations-inequalities',
      unitId: unit.id,
      title: 'Introduction to Linear Equations & Inequalities',
      description: 'Learn the basics of linear equations',
      type: 'VIDEO' as const,
      youtubeId: 'DrZJKdXlZ3I',
      duration: 6.5,
      order: 1,
    },
    {
      slug: 'fundamental-concepts-linear-equations',
      unitId: unit.id,
      title: 'Fundamental Concepts',
      description: 'Practice and understand the basics of linear equations',
      type: 'READING' as const,
      khanUrl: 'https://www.khanacademy.org/test-prep/v2-sat-math/x0fcc98a58ba3bea7:algebra-easier/x0fcc98a58ba3bea7:solving-systems-of-linear-equations-easier/a/v2-sat-lesson-solving-systems-of-linear-equations',
      content: `
        <h2>Solving Systems of Linear Equations</h2>
        
        <h3>What is a System of Linear Equations?</h3>
        <p>A system of linear equations is a collection of two or more linear equations that share the same variables. The solution to a system is the set of values for the variables that makes all equations in the system true simultaneously.</p>
        
        <h3>Methods for Solving Systems</h3>
        
        <h4>1. Substitution Method</h4>
        <p>This method involves solving one equation for one variable and then substituting that expression into the other equation(s).</p>
        <p><strong>Steps:</strong></p>
        <ol>
          <li>Solve one equation for one variable (choose the equation that's easiest to solve)</li>
          <li>Substitute the expression into the other equation</li>
          <li>Solve for the remaining variable</li>
          <li>Substitute back to find the other variable</li>
          <li>Check your solution in both original equations</li>
        </ol>
        
        <h4>2. Elimination Method</h4>
        <p>This method involves adding or subtracting equations to eliminate one variable, making it easier to solve for the remaining variable.</p>
        <p><strong>Steps:</strong></p>
        <ol>
          <li>Align the equations so like terms are in the same columns</li>
          <li>Multiply one or both equations by constants so that one variable has opposite coefficients</li>
          <li>Add or subtract the equations to eliminate one variable</li>
          <li>Solve for the remaining variable</li>
          <li>Substitute back to find the other variable</li>
          <li>Check your solution</li>
        </ol>
        
        <h4>3. Graphing Method</h4>
        <p>Graph both equations on the same coordinate plane. The point where the lines intersect is the solution to the system.</p>
        
        <h3>Types of Solutions</h3>
        
        <h4>One Solution</h4>
        <p>When the system has exactly one solution, the lines intersect at a single point. This happens when the equations represent different lines with different slopes.</p>
        
        <h4>No Solution</h4>
        <p>When the system has no solution, the lines are parallel and never intersect. This occurs when the equations have the same slope but different y-intercepts.</p>
        
        <h4>Infinitely Many Solutions</h4>
        <p>When the system has infinitely many solutions, the equations represent the same line. This happens when one equation is a multiple of the other.</p>
        
        <h3>Example: Substitution Method</h3>
        <p>Solve the system:</p>
        <p><strong>Equation 1:</strong> y = 2x + 1</p>
        <p><strong>Equation 2:</strong> 3x + y = 9</p>
        <p><strong>Solution:</strong></p>
        <ol>
          <li>Substitute y from Equation 1 into Equation 2: 3x + (2x + 1) = 9</li>
          <li>Simplify: 5x + 1 = 9</li>
          <li>Solve: 5x = 8, so x = 8/5 = 1.6</li>
          <li>Substitute back: y = 2(1.6) + 1 = 3.2 + 1 = 4.2</li>
          <li>Solution: (1.6, 4.2)</li>
        </ol>
        
        <h3>Example: Elimination Method</h3>
        <p>Solve the system:</p>
        <p><strong>Equation 1:</strong> 2x + 3y = 7</p>
        <p><strong>Equation 2:</strong> x - y = 1</p>
        <p><strong>Solution:</strong></p>
        <ol>
          <li>Multiply Equation 2 by 3: 3x - 3y = 3</li>
          <li>Add to Equation 1: (2x + 3y) + (3x - 3y) = 7 + 3</li>
          <li>Simplify: 5x = 10, so x = 2</li>
          <li>Substitute into Equation 2: 2 - y = 1, so y = 1</li>
          <li>Solution: (2, 1)</li>
        </ol>
        
        <h3>Key Takeaways</h3>
        <ul>
          <li>Systems of equations can be solved using substitution, elimination, or graphing</li>
          <li>A system can have one solution, no solution, or infinitely many solutions</li>
          <li>Always check your solution by substituting back into the original equations</li>
          <li>Choose the method that seems easiest for the given system</li>
        </ul>
      `,
      duration: 15,
      order: 2,
    },
    {
      slug: 'worked-examples-linear-equations',
      unitId: unit.id,
      title: 'Worked Examples',
      description: 'Practice applying concepts through examples',
      type: 'VIDEO' as const,
      youtubeId: '1c5HY3z4k8M',
      duration: 4,
      order: 3,
    },
    {
      slug: 'advanced-techniques-linear-equations',
      unitId: unit.id,
      title: 'Advanced Techniques',
      description: 'Learn how to solve linear equations with unknown coefficients',
      type: 'VIDEO' as const,
      youtubeId: 'adPgapI',
      duration: 6,
      order: 4,
    },
    {
      slug: 'real-world-applications-linear-equations',
      unitId: unit.id,
      title: 'Real-World Applications',
      description: 'To use inequalities to solve problems in a given context and real-world problems',
      type: 'VIDEO' as const,
      youtubeId: 'E6rn-YD_2_Q',
      duration: 4,
      order: 5,
    },
    {
      slug: 'unit-review-linear-equations',
      unitId: unit.id,
      title: 'Unit Review',
      description: 'Practice and understand the basics of linear equations',
      type: 'READING' as const,
      khanUrl: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-inequalities',
      duration: 15,
      order: 6,
    },
  ];

  const insertedLessons = await db.insert(schema.lessons).values(lessons).returning();
  console.log(`✅ Created ${insertedLessons.length} lessons`);

  // Create flashcard sets for each lesson
  console.log('📚 Creating flashcard sets for lessons...');
  const flashcardSetsData = [];
  const flashcardsData = [];

  for (const lesson of insertedLessons) {
    const setId = randomUUID();
    
    // Create a flashcard set for each lesson
    flashcardSetsData.push({
      id: setId,
      lessonId: lesson.id,
      title: `${lesson.title} - Key Terms`,
      description: 'Essential vocabulary and concepts for this lesson',
    });

    // Add sample flashcards (you can customize these)
    const lessonFlashcards = [
      {
        setId: setId,
        front: 'Linear Equation',
        back: 'An equation where the highest power of the variable is 1. General form: ax + b = 0',
        hint: 'Think about equations with variables to the first power',
        order: 1,
      },
      {
        setId: setId,
        front: 'Solution',
        back: 'The value(s) of the variable that make the equation true',
        hint: 'What makes the equation work?',
        order: 2,
      },
      {
        setId: setId,
        front: 'Inverse Operations',
        back: 'Operations that undo each other: addition/subtraction and multiplication/division',
        hint: 'Opposite operations',
        order: 3,
      },
    ];

    flashcardsData.push(...lessonFlashcards);
  }

  if (flashcardSetsData.length > 0) {
    await db.insert(schema.flashcardSets).values(flashcardSetsData);
    console.log(`✅ Created ${flashcardSetsData.length} flashcard sets`);
  }

  if (flashcardsData.length > 0) {
    await db.insert(schema.flashcards).values(flashcardsData);
    console.log(`✅ Created ${flashcardsData.length} flashcards`);
  }

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

  // Update or create the assessment test for this unit
  const [existingTest] = await db
    .select()
    .from(schema.tests)
    .where(eq(schema.tests.unitId, unit.id))
    .limit(1);

  const testQuestions = [
    {
      id: '1',
      question: 'What is the solution to 2x + 5 = 13?',
      options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
      correct: 0,
      explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
    },
    {
      id: '2',
      question: 'What is the solution to 3(x - 4) = 15?',
      options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
      correct: 3,
      explanation: 'Distribute 3 → 3x - 12 = 15. Add 12 → 3x = 27. Divide by 3 → x = 9',
    },
    {
      id: '3',
      question: 'What is the solution to 4x - 7 = 2x + 5?',
      options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
      correct: 2,
      explanation: 'Subtract 2x from both sides → 2x - 7 = 5. Add 7 → 2x = 12. Divide by 2 → x = 6',
    },
    {
      id: '4',
      question: 'How many solutions does 5x + 3 = 5x + 3 have?',
      options: ['No solutions', 'Exactly one solution', 'Infinitely many solutions'],
      correct: 2,
      explanation: 'This simplifies to 3 = 3, which is always true. Therefore, there are infinitely many solutions.',
    },
    {
      id: '5',
      question: 'What is the solution to 2(3x - 1) = 4x + 6?',
      options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
      correct: 1,
      explanation: 'Distribute 2 → 6x - 2 = 4x + 6. Subtract 4x → 2x - 2 = 6. Add 2 → 2x = 8. Divide by 2 → x = 4',
    },
  ];

  if (existingTest) {
    await db
      .update(schema.tests)
      .set({
        questions: JSON.stringify(testQuestions),
        updatedAt: new Date(),
      })
      .where(eq(schema.tests.id, existingTest.id));
    console.log('✅ Updated assessment test with questions');
  } else {
    await db.insert(schema.tests).values({
      unitId: unit.id,
      title: 'Linear Equations & Inequalities - Assessment Test',
      description: 'Comprehensive assessment test for Linear Equations & Inequalities',
      timeLimit: 30,
      passingScore: 70,
      questions: JSON.stringify(testQuestions),
    });
    console.log('✅ Created assessment test with questions');
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

