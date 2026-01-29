import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from './schema';
import bcrypt from 'bcryptjs';
import { eq, asc } from '../src/lib/drizzle-helpers';

const db = getDbSync();

async function seed() {
  console.log('🌱 Seeding database...');
  console.log('Database path:', process.env.DATABASE_URL);

  // Create demo users (or get existing ones)
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  
  let student, teacher, admin;
  
  // Try to get existing users first
  [student] = await db.select().from(schema.users).where(eq(schema.users.email, 'student@example.com')).limit(1);
  if (!student) {
    [student] = await db.insert(schema.users).values({
      email: 'student@example.com',
      name: 'Demo Student',
      password: hashedPassword,
      role: 'STUDENT',
    }).returning();
  }

  [teacher] = await db.select().from(schema.users).where(eq(schema.users.email, 'teacher@example.com')).limit(1);
  if (!teacher) {
    [teacher] = await db.insert(schema.users).values({
      email: 'teacher@example.com',
      name: 'Demo Teacher',
      password: hashedPassword,
      role: 'TEACHER',
    }).returning();
  }

  [admin] = await db.select().from(schema.users).where(eq(schema.users.email, 'admin@example.com')).limit(1);
  if (!admin) {
    [admin] = await db.insert(schema.users).values({
      email: 'admin@example.com',
      name: 'Demo Admin',
      password: hashedPassword,
      role: 'ADMIN',
    }).returning();
  }

  console.log('✅ Users ready');

  // Create 14 Algebra 1 units
  const unitsData = [
    {
      slug: 'linear-equations',
      title: 'Linear Equations & Inequalities',
      description: 'Master solving and graphing linear equations and inequalities in one and two variables.',
      order: 1,
    },
    {
      slug: 'systems-of-equations',
      title: 'Systems of Equations',
      description: 'Learn to solve systems of linear equations using substitution, elimination, and graphing.',
      order: 2,
    },
    {
      slug: 'polynomials',
      title: 'Polynomial Operations',
      description: 'Add, subtract, multiply, and factor polynomials with confidence.',
      order: 3,
    },
    {
      slug: 'quadratics',
      title: 'Quadratic Equations',
      description: 'Solve quadratic equations by factoring, completing the square, and using the quadratic formula.',
      order: 4,
    },
    {
      slug: 'functions',
      title: 'Functions & Function Notation',
      description: 'Understand functions, domain, range, and function notation.',
      order: 5,
    },
    {
      slug: 'exponents-radicals',
      title: 'Exponents & Radicals',
      description: 'Simplify expressions with exponents and radicals, including rational exponents.',
      order: 6,
    },
    {
      slug: 'rational-expressions',
      title: 'Rational Expressions',
      description: 'Simplify, add, subtract, multiply, and divide rational expressions.',
      order: 7,
    },
    {
      slug: 'graphing-functions',
      title: 'Graphing Linear & Quadratic Functions',
      description: 'Graph linear and quadratic functions and identify key features.',
      order: 8,
    },
    {
      slug: 'absolute-value',
      title: 'Absolute Value Equations',
      description: 'Solve and graph absolute value equations and inequalities.',
      order: 9,
    },
    {
      slug: 'exponential-functions',
      title: 'Exponential Functions',
      description: 'Explore exponential growth and decay through functions and applications.',
      order: 10,
    },
    {
      slug: 'sequences',
      title: 'Sequences & Series',
      description: 'Work with arithmetic and geometric sequences and their sums.',
      order: 11,
    },
    {
      slug: 'data-analysis',
      title: 'Data Analysis & Statistics',
      description: 'Analyze data using measures of center, spread, and visual representations.',
      order: 12,
    },
    {
      slug: 'probability',
      title: 'Probability',
      description: 'Calculate probabilities of simple and compound events.',
      order: 13,
    },
    {
      slug: 'real-world-applications',
      title: 'Real-World Applications',
      description: 'Apply algebra to solve real-world problems in various contexts.',
      order: 14,
    },
  ];

  // Insert units (will skip if already exist)
  type Unit = typeof schema.units.$inferSelect;
  let insertedUnits: Unit[];
  try {
    console.log('Attempting to insert units...');
    insertedUnits = await db.insert(schema.units).values(unitsData).returning();
    console.log(`✅ Created ${insertedUnits.length} units`);
  } catch (error: any) {
    console.log('Insert failed with error:', error.message, 'code:', error.code);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      insertedUnits = await db.select().from(schema.units).orderBy(asc(schema.units.order));
      console.log(`✅ Units already exist, using existing ones (${insertedUnits.length} units)`);
    } else {
      throw error;
    }
  }

  // Create lessons for each unit (6-12 per unit)
  const lessonsData = [];
  for (const unit of insertedUnits) {
    const unitLessons = [
      {
        slug: `${unit.slug}-intro`,
        unitId: unit.id,
        title: `Introduction to ${unit.title}`,
        description: `Overview and key concepts of ${unit.title.toLowerCase()}.`,
        type: 'VIDEO' as const,
        khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unit.slug}`,
        youtubeId: 'dQw4w9WgXcQ',
        duration: 12,
        order: 1,
      },
      {
        slug: `${unit.slug}-fundamentals`,
        unitId: unit.id,
        title: 'Fundamental Concepts',
        description: 'Core principles and foundational understanding.',
        type: 'READING' as const,
        duration: 15,
        order: 2,
      },
      {
        slug: `${unit.slug}-examples`,
        unitId: unit.id,
        title: 'Worked Examples',
        description: 'Step-by-step examples demonstrating key techniques.',
        type: 'VIDEO' as const,
        khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unit.slug}-examples`,
        youtubeId: 'dQw4w9WgXcQ',
        duration: 18,
        order: 3,
      },
      {
        slug: `${unit.slug}-practice-1`,
        unitId: unit.id,
        title: 'Practice Problems - Set 1',
        description: 'Apply what you learned with guided practice.',
        type: 'EXERCISE' as const,
        khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unit.slug}-practice`,
        duration: 20,
        order: 4,
      },
      {
        slug: `${unit.slug}-advanced`,
        unitId: unit.id,
        title: 'Advanced Techniques',
        description: 'More challenging problems and advanced methods.',
        type: 'VIDEO' as const,
        youtubeId: 'dQw4w9WgXcQ',
        duration: 16,
        order: 5,
      },
      {
        slug: `${unit.slug}-practice-2`,
        unitId: unit.id,
        title: 'Practice Problems - Set 2',
        description: 'Additional practice with more complex scenarios.',
        type: 'EXERCISE' as const,
        khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unit.slug}-advanced`,
        duration: 25,
        order: 6,
      },
      {
        slug: `${unit.slug}-applications`,
        unitId: unit.id,
        title: 'Real-World Applications',
        description: 'See how these concepts apply to real-world scenarios.',
        type: 'VIDEO' as const,
        youtubeId: 'dQw4w9WgXcQ',
        duration: 14,
        order: 7,
      },
      {
        slug: `${unit.slug}-review`,
        unitId: unit.id,
        title: 'Unit Review',
        description: 'Comprehensive review of all unit concepts.',
        type: 'READING' as const,
        duration: 10,
        order: 8,
      },
    ];
    lessonsData.push(...unitLessons);
  }

  // Check if lessons already exist
  const existingLessons = await db.select().from(schema.lessons);
  let insertedLessons;
  
  if (existingLessons.length === 0) {
    insertedLessons = await db.insert(schema.lessons).values(lessonsData).returning();
    console.log(`✅ Created ${insertedLessons.length} lessons`);
  } else {
    insertedLessons = existingLessons;
    console.log(`✅ Lessons already exist, using existing ones (${existingLessons.length} lessons)`);
  }

  // Create quizzes for each unit
  type MCQ = { id: number; question: string; options: string[]; correctAnswer: number; explanation?: string }

  const buildQuestionBank = (slug: string): { quiz: Omit<MCQ, 'id'>[]; test: Omit<MCQ, 'id'>[] } => {
    // A lightweight but "real" Algebra 1 question bank by unit slug.
    // (IDs are assigned later so they stay 1..N as expected by QuizViewer.)
    switch (slug) {
      case 'linear-equations':
        return {
          quiz: [
            {
              question: 'Solve: 3x − 5 = 16',
              options: ['x = 7', 'x = 11', 'x = 21', 'x = 3'],
              correctAnswer: 0,
              explanation: 'Add 5: 3x = 21, then divide by 3 → x = 7.',
            },
            {
              question: 'Solve: 2(4x + 1) = 18',
              options: ['x = 2', 'x = 4', 'x = 8', 'x = 3'],
              correctAnswer: 0,
              explanation: 'Distribute: 8x + 2 = 18 → 8x = 16 → x = 2.',
            },
            {
              question: 'Which equation has the solution x = −3?',
              options: ['x + 5 = 2', '2x − 1 = −5', '3x + 6 = 0', '4x + 12 = 0'],
              correctAnswer: 3,
              explanation: '4(−3)+12 = 0, so x = −3 satisfies 4x + 12 = 0.',
            },
            {
              question: 'Solve the inequality: x − 4 > 9',
              options: ['x > 5', 'x > 13', 'x < 13', 'x < 5'],
              correctAnswer: 1,
              explanation: 'Add 4 to both sides: x > 13.',
            },
            {
              question: 'What is the slope of the line y = −2x + 7?',
              options: ['7', '−2', '2', '−7'],
              correctAnswer: 1,
              explanation: 'In y = mx + b, the slope is m = −2.',
            },
          ],
          test: [
            {
              question: 'Solve: 5x + 4 = 2x − 11',
              options: ['x = −5', 'x = 5', 'x = −3', 'x = 3'],
              correctAnswer: 0,
              explanation: 'Subtract 2x: 3x + 4 = −11 → 3x = −15 → x = −5.',
            },
            {
              question: 'Solve: 3(2x − 5) + 4 = 2x + 1',
              options: ['x = 3', 'x = 5', 'x = 7', 'x = 1'],
              correctAnswer: 0,
              explanation: '6x − 15 + 4 = 2x + 1 → 6x − 11 = 2x + 1 → 4x = 12 → x = 3.',
            },
            {
              question: 'Solve the inequality: −2x ≤ 8',
              options: ['x ≤ −4', 'x ≥ −4', 'x ≤ 4', 'x ≥ 4'],
              correctAnswer: 1,
              explanation: 'Divide by −2 and flip the sign: x ≥ −4.',
            },
            {
              question: 'Which point lies on the graph of y = 3x − 2?',
              options: ['(0, 3)', '(1, 1)', '(2, 8)', '(−1, −1)'],
              correctAnswer: 1,
              explanation: 'Plug x=1: y=3(1)−2=1, so (1,1) lies on the line.',
            },
            {
              question: 'Find the y-intercept of 4x − 2y = 10.',
              options: ['(0, −5)', '(0, 5)', '(5, 0)', '(−5, 0)'],
              correctAnswer: 0,
              explanation: 'Set x=0: −2y=10 → y=−5, so (0,−5).',
            },
            {
              question: 'Solve: |x − 6| = 4',
              options: ['x = 2 or 10', 'x = 6 or 4', 'x = −2 or 10', 'x = 2 only'],
              correctAnswer: 0,
              explanation: 'x−6=4 or x−6=−4 → x=10 or x=2.',
            },
            {
              question: 'If a line has slope 0, it is…',
              options: ['Vertical', 'Horizontal', 'Undefined', 'A parabola'],
              correctAnswer: 1,
              explanation: 'Slope 0 means no rise → horizontal line.',
            },
            {
              question: 'Solve: 7 − (2x − 3) = 12',
              options: ['x = −1', 'x = 1', 'x = 2', 'x = −2'],
              correctAnswer: 0,
              explanation: '7−2x+3=12 → 10−2x=12 → −2x=2 → x=−1.',
            },
            {
              question: 'Which is equivalent to 2(x − 3) + 4?',
              options: ['2x − 2', '2x − 6', '2x + 1', 'x − 2'],
              correctAnswer: 0,
              explanation: 'Distribute: 2x−6+4 = 2x−2.',
            },
            {
              question: 'Solve: 9x/3 = 12',
              options: ['x = 4', 'x = 6', 'x = 9', 'x = 36'],
              correctAnswer: 0,
              explanation: '9x/3 = 3x, so 3x=12 → x=4.',
            },
          ],
        }
      case 'systems-of-equations':
        return {
          quiz: [
            {
              question: 'Solve the system: x + y = 7 and x = 3. What is y?',
              options: ['y = 4', 'y = 10', 'y = 7', 'y = 3'],
              correctAnswer: 0,
              explanation: 'Substitute x=3 into x+y=7 → 3+y=7 → y=4.',
            },
            {
              question: 'How many solutions can a system of two linear equations have?',
              options: ['Exactly one', 'Exactly two', '0, 1, or infinitely many', 'Always infinitely many'],
              correctAnswer: 2,
              explanation: 'Lines can intersect once, be parallel (0), or be the same line (∞).',
            },
            {
              question: 'Solve: y = 2x and y = x + 3. What is x?',
              options: ['x = 3', 'x = 0', 'x = −3', 'x = 1'],
              correctAnswer: 0,
              explanation: 'Set equal: 2x = x+3 → x=3.',
            },
            {
              question: 'If two lines are parallel, the system has…',
              options: ['One solution', 'No solution', 'Infinite solutions', 'Two solutions'],
              correctAnswer: 1,
              explanation: 'Parallel lines never intersect.',
            },
            {
              question: 'Elimination works best when…',
              options: ['Both equations are identical', 'A variable is isolated', 'Coefficients can be made opposites', 'There are no variables'],
              correctAnswer: 2,
              explanation: 'You add/subtract equations to eliminate a variable.',
            },
          ],
          test: [
            {
              question: 'Solve: 2x + y = 11 and x − y = 1. What is x?',
              options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
              correctAnswer: 1,
              explanation: 'Add equations: (2x+y)+(x−y)=11+1 → 3x=12 → x=4.',
            },
            {
              question: 'Solve: x + y = 8 and x − y = 2. What is (x, y)?',
              options: ['(5, 3)', '(3, 5)', '(4, 4)', '(6, 2)'],
              correctAnswer: 0,
              explanation: 'Add equations: 2x=10 → x=5; then y=3.',
            },
            {
              question: 'Solve: 3x + 2y = 14 and 3x − 2y = 6. What is y?',
              options: ['y = 1', 'y = 2', 'y = 3', 'y = 4'],
              correctAnswer: 1,
              explanation: 'Subtract: (3x+2y)−(3x−2y)=14−6 → 4y=8 → y=2.',
            },
            {
              question: 'Solve: 2x + 3y = 12 and 2x − 3y = 0. What is y?',
              options: ['y = 1', 'y = 2', 'y = 3', 'y = 4'],
              correctAnswer: 1,
              explanation: 'Subtract: 6y=12 → y=2.',
            },
            {
              question: 'Solve: y = −x + 5 and y = 2x − 1. What is y?',
              options: ['y = 3', 'y = 1', 'y = 2', 'y = 4'],
              correctAnswer: 0,
              explanation: 'Set equal: −x+5=2x−1 → 3x=6 → x=2 → y=3.',
            },
            {
              question: 'A system with infinitely many solutions means the lines are…',
              options: ['Parallel', 'Perpendicular', 'The same line', 'Unrelated'],
              correctAnswer: 2,
              explanation: 'Same slope and intercept → identical equations.',
            },
            {
              question: 'Which is equivalent to x + y = 6?',
              options: ['y = x − 6', 'y = 6 − x', 'y = x + 6', 'y = 6x'],
              correctAnswer: 1,
              explanation: 'Solve for y: y=6−x.',
            },
            {
              question: 'Solve: x = 2y and x + y = 9. What is y?',
              options: ['y = 3', 'y = 2', 'y = 1', 'y = 6'],
              correctAnswer: 0,
              explanation: 'Substitute: 2y + y = 9 → 3y=9 → y=3.',
            },
            {
              question: 'If a system has no solution, the slopes are…',
              options: ['Different', 'Equal', 'Zero', 'Undefined only'],
              correctAnswer: 1,
              explanation: 'No solution means parallel distinct lines → equal slopes.',
            },
            {
              question: 'Solve: 4x − y = 7 and y = 3. What is x?',
              options: ['x = 1', 'x = 2', 'x = 2.5', 'x = 1.5'],
              correctAnswer: 2,
              explanation: '4x − 3 = 7 → 4x = 10 → x = 2.5.',
            },
          ],
        }
      default:
        // Generic Algebra 1 questions (still real, but not unit-specific)
        return {
          quiz: [
            {
              question: 'Simplify: 3x + 2x',
              options: ['5x', '6x', 'x', '3x²'],
              correctAnswer: 0,
              explanation: 'Combine like terms: 3x+2x=5x.',
            },
            {
              question: 'Evaluate: 2(5) + 3',
              options: ['13', '16', '10', '8'],
              correctAnswer: 0,
              explanation: '2·5+3=10+3=13.',
            },
            {
              question: 'Which is a solution to x² = 16?',
              options: ['x = 4 only', 'x = −4 only', 'x = 4 or x = −4', 'x = 8'],
              correctAnswer: 2,
              explanation: 'Both 4² and (−4)² equal 16.',
            },
            {
              question: 'Solve: x/3 = 6',
              options: ['x = 2', 'x = 9', 'x = 18', 'x = 3'],
              correctAnswer: 2,
              explanation: 'Multiply both sides by 3: x=18.',
            },
            {
              question: 'Simplify: (x + 4)(x + 2)',
              options: ['x² + 6x + 8', 'x² + 8x + 6', 'x² + 2x + 4', 'x² + 6x + 6'],
              correctAnswer: 0,
              explanation: 'FOIL: x²+2x+4x+8 = x²+6x+8.',
            },
          ],
          test: [
            {
              question: 'Solve: 4x − 9 = 7',
              options: ['x = 4', 'x = 2', 'x = −4', 'x = 1'],
              correctAnswer: 0,
              explanation: '4x=16 → x=4.',
            },
            {
              question: 'Factor: x² − 9',
              options: ['(x − 9)(x + 1)', '(x − 3)(x + 3)', '(x − 1)(x + 9)', 'Prime'],
              correctAnswer: 1,
              explanation: 'Difference of squares: x²−3²=(x−3)(x+3).',
            },
            {
              question: 'Solve: x² − 5x = 0',
              options: ['x = 0 or 5', 'x = −5 or 0', 'x = 5 only', 'x = 0 only'],
              correctAnswer: 0,
              explanation: 'Factor x(x−5)=0 → x=0 or x=5.',
            },
            {
              question: 'Simplify: 2x(3x)',
              options: ['6x', '6x²', '5x²', 'x²'],
              correctAnswer: 1,
              explanation: 'Multiply coefficients and variables: 2·3 x·x = 6x².',
            },
            {
              question: 'Solve the inequality: x + 2 ≥ 9',
              options: ['x ≥ 7', 'x ≤ 7', 'x ≥ 11', 'x ≤ 11'],
              correctAnswer: 0,
              explanation: 'Subtract 2: x ≥ 7.',
            },
            {
              question: 'What is the slope of the line through (0, 2) and (4, 10)?',
              options: ['2', '−2', '1/2', '8'],
              correctAnswer: 0,
              explanation: 'Slope = (10−2)/(4−0)=8/4=2.',
            },
            {
              question: 'Simplify: (x − 1)²',
              options: ['x² − 1', 'x² − 2x + 1', 'x² + 2x + 1', 'x² − x + 1'],
              correctAnswer: 1,
              explanation: '(x−1)(x−1)=x²−2x+1.',
            },
            {
              question: 'Solve: 2x + 3 = 15',
              options: ['x = 6', 'x = 9', 'x = 12', 'x = 5'],
              correctAnswer: 0,
              explanation: '2x=12 → x=6.',
            },
            {
              question: 'Which expression is equivalent to 5(x − 2) + 10?',
              options: ['5x', '5x − 10', '5x + 10', 'x + 8'],
              correctAnswer: 0,
              explanation: '5x−10+10 = 5x.',
            },
            {
              question: 'If f(x) = x + 3, what is f(−2)?',
              options: ['1', '−1', '5', '−5'],
              correctAnswer: 0,
              explanation: 'f(−2)=−2+3=1.',
            },
          ],
        }
    }
  }

  const withIds = (qs: Omit<MCQ, 'id'>[], count: number): MCQ[] =>
    qs.slice(0, count).map((q, idx) => ({ id: idx + 1, ...q }))

  const quizzesData = insertedUnits.map((unit) => {
    const bank = buildQuestionBank(unit.slug)
    return {
      unitId: unit.id,
      title: `${unit.title} Quiz`,
      description: `Test your understanding of ${unit.title.toLowerCase()}.`,
      timeLimit: 30,
      passingScore: 70,
      questions: withIds(bank.quiz, 5),
    }
  })

  const existingQuizzes = await db.select().from(schema.quizzes);
  if (existingQuizzes.length === 0) {
    await db.insert(schema.quizzes).values(quizzesData);
    console.log('✅ Created quizzes for all units');
  } else {
    // Keep questions fresh/real (safe + idempotent).
    for (const unit of insertedUnits) {
      const bank = buildQuestionBank(unit.slug)
      await db
        .update(schema.quizzes)
        .set({ questions: withIds(bank.quiz, 5) })
        .where(eq(schema.quizzes.unitId, unit.id))
    }
    console.log('✅ Updated quizzes with real questions');
  }

  // Create tests for each unit
  const testsData = insertedUnits.map((unit) => {
    const bank = buildQuestionBank(unit.slug)
    return {
      unitId: unit.id,
      title: `${unit.title} Test`,
      description: `Comprehensive assessment of ${unit.title.toLowerCase()}.`,
      timeLimit: 60,
      passingScore: 75,
      questions: withIds(bank.test, 10),
    }
  })

  const existingTests = await db.select().from(schema.tests);
  if (existingTests.length === 0) {
    await db.insert(schema.tests).values(testsData);
    console.log('✅ Created tests for all units');
  } else {
    // Keep questions fresh/real (safe + idempotent).
    for (const unit of insertedUnits) {
      const bank = buildQuestionBank(unit.slug)
      await db
        .update(schema.tests)
        .set({ questions: withIds(bank.test, 10) })
        .where(eq(schema.tests.unitId, unit.id))
    }
    console.log('✅ Updated tests with real questions');
  }

  // Create flashcard sets for some lessons
  const flashcardSetsData = [];
  for (let i = 0; i < Math.min(20, insertedLessons.length); i++) {
    const lesson = insertedLessons[i];
    flashcardSetsData.push({
      lessonId: lesson.id,
      title: `${lesson.title} - Key Terms`,
      description: `Flashcards for mastering ${lesson.title.toLowerCase()}`,
    });
  }

  const existingFlashcardSets = await db.select().from(schema.flashcardSets);
  let insertedSets;
  if (existingFlashcardSets.length === 0) {
    insertedSets = await db.insert(schema.flashcardSets).values(flashcardSetsData).returning();
    console.log(`✅ Created ${insertedSets.length} flashcard sets`);
  } else {
    insertedSets = existingFlashcardSets;
    console.log(`✅ Flashcard sets already exist`);
  }

  // Create flashcards
  const existingFlashcards = await db.select().from(schema.flashcards);
  if (existingFlashcards.length === 0) {
    const flashcardsData = [];
    for (const set of insertedSets) {
      for (let i = 1; i <= 8; i++) {
        flashcardsData.push({
          setId: set.id,
          front: `Term ${i}`,
          back: `Definition ${i}: This is an important concept that helps understand the material.`,
          hint: i % 3 === 0 ? `Hint: Think about the fundamentals` : undefined,
          order: i,
        });
      }
    }
    await db.insert(schema.flashcards).values(flashcardsData);
    console.log(`✅ Created ${flashcardsData.length} flashcards`);
  } else {
    console.log(`✅ Flashcards already exist`);
  }

  // Create badges
  const badgesData = [
    {
      slug: 'first-quiz',
      name: 'Quiz Master',
      description: 'Passed your first quiz!',
      icon: '🎯',
    },
    {
      slug: 'unit-complete',
      name: 'Unit Complete',
      description: 'Completed your first unit!',
      icon: '✅',
    },
    {
      slug: 'week-streak',
      name: 'Weekly Warrior',
      description: 'Maintained a 7-day streak!',
      icon: '🔥',
    },
    {
      slug: 'perfect-score',
      name: 'Perfect Score',
      description: 'Got 100% on a quiz or test!',
      icon: '💯',
    },
    {
      slug: 'early-bird',
      name: 'Early Bird',
      description: 'Completed a lesson before 8 AM!',
      icon: '🌅',
    },
  ];

  // Check if badges already exist
  const existingBadges = await db.select().from(schema.badges);
  if (existingBadges.length === 0) {
    await db.insert(schema.badges).values(badgesData);
    console.log('✅ Created badges');
  } else {
    console.log('✅ Badges already exist');
  }

  // Create streak for student (check if exists first)
  const [existingStreak] = await db.select().from(schema.streaks).where(eq(schema.streaks.userId, student.id)).limit(1);
  if (!existingStreak) {
    await db.insert(schema.streaks).values({
      userId: student.id,
      current: 3,
      longest: 7,
    });
  }

  // Get all units for seeding resources
  const allUnits = await db.select().from(schema.units).orderBy(asc(schema.units.order));
  const linearEquationsUnit = allUnits.find((u: typeof schema.units.$inferSelect) => u.slug === 'linear-equations');
  const systemsUnit = allUnits.find((u: typeof schema.units.$inferSelect) => u.slug === 'systems-of-equations');
  const polynomialsUnit = allUnits.find((u: typeof schema.units.$inferSelect) => u.slug === 'polynomials');

  // Create worksheets
  if (linearEquationsUnit || systemsUnit || polynomialsUnit) {
    const worksheetsData = [];
    
    if (linearEquationsUnit) {
      worksheetsData.push(
        {
          unitId: linearEquationsUnit.id,
          title: 'Linear Equations Practice Set 1',
          description: 'Basic linear equations with one variable. Perfect for beginners.',
          difficulty: 'Easy',
          estimatedTime: 20,
          fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/One-Step%20Equations.pdf',
        },
        {
          unitId: linearEquationsUnit.id,
          title: 'Linear Equations Practice Set 2',
          description: 'Multi-step linear equations with distributive property.',
          difficulty: 'Medium',
          estimatedTime: 30,
          fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/Multi-Step%20Equations.pdf',
        },
        {
          unitId: linearEquationsUnit.id,
          title: 'Linear Inequalities Worksheet',
          description: 'Solving and graphing linear inequalities.',
          difficulty: 'Medium',
          estimatedTime: 25,
        }
      );
    }

    if (systemsUnit) {
      worksheetsData.push(
        {
          unitId: systemsUnit.id,
          title: 'Solving Systems by Graphing',
          description: 'Practice solving systems of equations by graphing.',
          difficulty: 'Easy',
          estimatedTime: 25,
        },
        {
          unitId: systemsUnit.id,
          title: 'Solving Systems by Substitution',
          description: 'Master the substitution method for solving systems.',
          difficulty: 'Medium',
          estimatedTime: 30,
        },
        {
          unitId: systemsUnit.id,
          title: 'Solving Systems by Elimination',
          description: 'Advanced problems using the elimination method.',
          difficulty: 'Hard',
          estimatedTime: 35,
        }
      );
    }

    if (polynomialsUnit) {
      worksheetsData.push(
        {
          unitId: polynomialsUnit.id,
          title: 'Adding and Subtracting Polynomials',
          description: 'Basic operations with polynomials.',
          difficulty: 'Easy',
          estimatedTime: 20,
        },
        {
          unitId: polynomialsUnit.id,
          title: 'Multiplying Polynomials',
          description: 'Practice multiplying binomials and trinomials.',
          difficulty: 'Medium',
          estimatedTime: 30,
        }
      );
    }

    if (worksheetsData.length > 0) {
      const existingWorksheets = await db.select().from(schema.worksheets);
      if (existingWorksheets.length === 0) {
        await db.insert(schema.worksheets).values(worksheetsData);
        console.log(`✅ Created ${worksheetsData.length} worksheets`);
      } else {
        console.log('✅ Worksheets already exist');
      }
    }
  }

  // Create study guides
  if (linearEquationsUnit || systemsUnit || polynomialsUnit) {
    const studyGuidesData = [];
    
    if (linearEquationsUnit) {
      studyGuidesData.push(
        {
          unitId: linearEquationsUnit.id,
          title: 'Linear Equations & Inequalities Study Guide',
          description: 'Complete guide covering all concepts in this unit.',
          content: `
            <h2>Linear Equations & Inequalities</h2>
            <h3>Key Concepts</h3>
            <ul>
              <li><strong>Linear Equations:</strong> An equation where the highest power of the variable is 1</li>
              <li><strong>Solving:</strong> Use inverse operations to isolate the variable</li>
              <li><strong>Linear Inequalities:</strong> Similar to equations but use &lt;, &gt;, ≤, or ≥</li>
            </ul>
            <h3>Important Formulas</h3>
            <ul>
              <li>Standard form: ax + b = 0</li>
              <li>Slope-intercept form: y = mx + b</li>
            </ul>
            <h3>Problem-Solving Strategies</h3>
            <ol>
              <li>Simplify both sides of the equation</li>
              <li>Use inverse operations</li>
              <li>Check your solution</li>
            </ol>
          `,
        }
      );
    }

    if (systemsUnit) {
      studyGuidesData.push(
        {
          unitId: systemsUnit.id,
          title: 'Systems of Equations Study Guide',
          description: 'Comprehensive guide to solving systems of equations.',
          content: `
            <h2>Systems of Equations</h2>
            <h3>Three Methods</h3>
            <ol>
              <li><strong>Graphing:</strong> Plot both equations and find the intersection</li>
              <li><strong>Substitution:</strong> Solve one equation for a variable, substitute into the other</li>
              <li><strong>Elimination:</strong> Add or subtract equations to eliminate a variable</li>
            </ol>
            <h3>When to Use Each Method</h3>
            <ul>
              <li>Graphing: When you need a visual representation</li>
              <li>Substitution: When one variable is already isolated</li>
              <li>Elimination: When coefficients are easily matched</li>
            </ul>
          `,
        }
      );
    }

    if (polynomialsUnit) {
      studyGuidesData.push(
        {
          unitId: polynomialsUnit.id,
          title: 'Polynomial Operations Study Guide',
          description: 'Master adding, subtracting, and multiplying polynomials.',
          content: `
            <h2>Polynomial Operations</h2>
            <h3>Adding Polynomials</h3>
            <p>Combine like terms: (3x² + 2x - 1) + (x² - 4x + 5) = 4x² - 2x + 4</p>
            <h3>Subtracting Polynomials</h3>
            <p>Distribute the negative: (3x² + 2x - 1) - (x² - 4x + 5) = 2x² + 6x - 6</p>
            <h3>Multiplying Polynomials</h3>
            <p>Use FOIL for binomials: (x + 2)(x + 3) = x² + 5x + 6</p>
          `,
        }
      );
    }

    if (studyGuidesData.length > 0) {
      const existingStudyGuides = await db.select().from(schema.studyGuides);
      if (existingStudyGuides.length === 0) {
        await db.insert(schema.studyGuides).values(studyGuidesData);
        console.log(`✅ Created ${studyGuidesData.length} study guides`);
      } else {
        console.log('✅ Study guides already exist');
      }
    }
  }

  // Create video resources
  if (linearEquationsUnit || systemsUnit || polynomialsUnit) {
    const videoResourcesData = [];
    
    if (linearEquationsUnit) {
      videoResourcesData.push(
        {
          unitId: linearEquationsUnit.id,
          title: 'Introduction to Linear Equations',
          description: 'Learn the basics of linear equations with clear examples.',
          videoUrl: 'https://www.youtube.com/watch?v=7q4r7IJWnKE',
          videoId: '7q4r7IJWnKE',
          duration: 12,
        },
        {
          unitId: linearEquationsUnit.id,
          title: 'Solving Multi-Step Linear Equations',
          description: 'Master solving complex linear equations step by step.',
          videoUrl: 'https://www.youtube.com/watch?v=x-PlBk5nzA0',
          videoId: 'x-PlBk5nzA0',
          duration: 15,
        },
        {
          unitId: linearEquationsUnit.id,
          title: 'Linear Inequalities Explained',
          description: 'Understand how to solve and graph linear inequalities.',
          videoUrl: 'https://www.youtube.com/watch?v=JY8w5Xg5Y3Q',
          videoId: 'JY8w5Xg5Y3Q',
          duration: 18,
        }
      );
    }

    if (systemsUnit) {
      videoResourcesData.push(
        {
          unitId: systemsUnit.id,
          title: 'Solving Systems by Graphing',
          description: 'Visual method for solving systems of equations.',
          videoUrl: 'https://www.youtube.com/watch?v=uk7gS3cZVp4',
          videoId: 'uk7gS3cZVp4',
          duration: 10,
        },
        {
          unitId: systemsUnit.id,
          title: 'Substitution Method Tutorial',
          description: 'Step-by-step guide to the substitution method.',
          videoUrl: 'https://www.youtube.com/watch?v=H9k0z6uG_9k',
          videoId: 'H9k0z6uG_9k',
          duration: 14,
        },
        {
          unitId: systemsUnit.id,
          title: 'Elimination Method Deep Dive',
          description: 'Master the elimination method with practice problems.',
          videoUrl: 'https://www.youtube.com/watch?v=HKgS8O9q9zY',
          videoId: 'HKgS8O9q9zY',
          duration: 16,
        }
      );
    }

    if (polynomialsUnit) {
      videoResourcesData.push(
        {
          unitId: polynomialsUnit.id,
          title: 'Polynomial Basics',
          description: 'Introduction to polynomials and their properties.',
          videoUrl: 'https://www.youtube.com/watch?v=Vm7H0VTlIco',
          videoId: 'Vm7H0VTlIco',
          duration: 11,
        },
        {
          unitId: polynomialsUnit.id,
          title: 'Multiplying Polynomials',
          description: 'Learn how to multiply polynomials using various methods.',
          videoUrl: 'https://www.youtube.com/watch?v=LK1t6-mOHTQ',
          videoId: 'LK1t6-mOHTQ',
          duration: 13,
        }
      );
    }

    if (videoResourcesData.length > 0) {
      const existingVideos = await db.select().from(schema.videoResources);
      if (existingVideos.length === 0) {
        await db.insert(schema.videoResources).values(videoResourcesData);
        console.log(`✅ Created ${videoResourcesData.length} video resources`);
      } else {
        console.log('✅ Video resources already exist');
      }
    }
  }

  // Create sample reviews
  const reviewsData = [
    {
      userId: student.id,
      rating: 5,
      comment: 'This platform is amazing! The lessons are clear and the practice problems really help.',
      moderated: true,
    },
    {
      userId: student.id,
      rating: 5,
      comment: 'Love the flashcards feature. Makes studying so much easier!',
      moderated: true,
    },
    {
      userId: student.id,
      rating: 4,
      comment: 'Great content and well-organized. The tutoring feature is super helpful.',
      moderated: true,
    },
  ];

  const existingReviews = await db.select().from(schema.reviews);
  if (existingReviews.length === 0) {
    await db.insert(schema.reviews).values(reviewsData);
    console.log('✅ Created reviews');
  } else {
    console.log('✅ Reviews already exist');
  }

  // Create teacher profiles
  const teachersData = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@numera.edu',
      bio: 'Ph.D. in Mathematics Education with 15 years of teaching experience. Passionate about making algebra accessible and fun for all students.',
      avatar: 'https://i.pravatar.cc/150?img=1',
      officeHours: 'Mon-Fri: 3:00 PM - 5:00 PM EST',
    },
    {
      name: 'Prof. Michael Chen',
      email: 'michael.chen@numera.edu',
      bio: 'Former engineer turned educator. Specializes in real-world applications of algebra and problem-solving strategies.',
      avatar: 'https://i.pravatar.cc/150?img=12',
      officeHours: 'Tue-Thu: 4:00 PM - 6:00 PM EST',
    },
    {
      name: 'Ms. Emily Rodriguez',
      email: 'emily.rodriguez@numera.edu',
      bio: 'National Board Certified Teacher with expertise in differentiated instruction. Loves helping students build confidence in math.',
      avatar: 'https://i.pravatar.cc/150?img=5',
      officeHours: 'Mon-Wed: 2:00 PM - 4:00 PM EST',
    },
  ];

  const existingTeachers = await db.select().from(schema.teachers);
  let insertedTeachers;
  if (existingTeachers.length === 0) {
    insertedTeachers = await db.insert(schema.teachers).values(teachersData).returning();
    console.log('✅ Created teacher profiles');
  } else {
    insertedTeachers = existingTeachers;
    console.log('✅ Teachers already exist');
  }

  // Create tutoring slots
  const existingSlots = await db.select().from(schema.tutoringSlots);
  if (existingSlots.length === 0) {
    const slotsData = [];
    const now = new Date();
    for (const teacher of insertedTeachers) {
      for (let day = 0; day < 7; day++) {
        const slotDate = new Date(now);
        slotDate.setDate(now.getDate() + day);
        slotDate.setHours(15, 0, 0, 0); // 3 PM
        
        slotsData.push({
          teacherId: teacher.id,
          start: slotDate,
          end: new Date(slotDate.getTime() + 60 * 60 * 1000), // 1 hour later
          capacity: 5,
          spotsLeft: 5,
        });
      }
    }
    await db.insert(schema.tutoringSlots).values(slotsData);
    console.log('✅ Created tutoring slots');
  } else {
    console.log('✅ Tutoring slots already exist');
  }

  // Create some progress for the student
  const existingProgress = await db.select().from(schema.progress).where(eq(schema.progress.userId, student.id));
  if (existingProgress.length === 0) {
    const firstUnit = insertedUnits[0];
    const firstUnitLessons = insertedLessons.filter((l: typeof schema.lessons.$inferSelect) => l.unitId === firstUnit.id).slice(0, 3);
    
    for (const lesson of firstUnitLessons) {
      await db.insert(schema.progress).values({
        userId: student.id,
        unitId: firstUnit.id,
        lessonId: lesson.id,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }
    console.log('✅ Created sample progress');
  } else {
    console.log('✅ Progress already exists');
  }

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

