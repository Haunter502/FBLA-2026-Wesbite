import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from './schema';
import bcrypt from 'bcryptjs';
import { eq, asc } from '../src/lib/drizzle-helpers';

const db = getDbSync();

async function seed() {
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL || 'file:./dev.db';
  console.log('🌱 Seeding database...');
  console.log('Database:', dbUrl.startsWith('file:') ? `${dbUrl} (cwd: ${process.cwd()})` : dbUrl);

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
    const code = error.cause?.code ?? error.code;
    if (code === 'SQLITE_CONSTRAINT_UNIQUE') {
      insertedUnits = await db.select().from(schema.units).orderBy(asc(schema.units.order));
      console.log(`✅ Units already exist, using existing ones (${insertedUnits.length} units)`);
    } else {
      throw error;
    }
  }

  // Unique embed-safe Khan Academy YouTube ID per video lesson (intro / examples / advanced / applications).
  // Each unit has 4 different videos so the Video Resources grid is not repetitive.
  const lessonYoutubeByUnitSlug: Record<
    string,
    { intro: string; examples: string; advanced: string; applications: string }
  > = {
    'linear-equations': {
      intro: 'bAerID24QJ0',   // Linear equations 1
      examples: 'LzYJVsvqS50', // Understanding steps when solving equations
      advanced: 'p5e5mf_G3FI', // Two-step equation with numerator x
      applications: 'uk7gS3cZVp4', // Graph from slope-intercept (graphing linear)
    },
    'systems-of-equations': {
      intro: 'wYrxKGt_bLg',   // Systems with elimination
      examples: 'SkMNREAMNvc', // Checking solutions to systems
      advanced: 'IWigvJcCAJ0', // Intro to quadratic (algebra connections)
      applications: 'Vm7H0VTlIco', // Polynomials intro (algebra connections)
    },
    polynomials: {
      intro: 'Vm7H0VTlIco',   // Polynomials intro
      examples: 'mDmRYfma9C0', // Quadratic formula (proof) — algebra
      advanced: 'K5ggNnKTmNM', // Factoring quadratics
      applications: 'eF6zYNzlZKQ', // More factoring quadratics examples
    },
    quadratics: {
      intro: 'IWigvJcCAJ0',   // Introduction to the quadratic equation
      examples: '_MllyJivas4', // Strategy in solving quadratic equations
      advanced: '6agzj3A9IgA', // Completing the square example 2
      applications: 'eU41vG9z35M', // Solve by completing the square
    },
    functions: {
      intro: 'za0QJRZ-yQ4',   // Domain and range of a function
      examples: 'uk7gS3cZVp4', // Graph from slope-intercept
      advanced: 'IL3UCuXrUzE', // Slope-intercept form
      applications: 'qgsNNqmlLoA', // Worked examples slope-intercept intro
    },
    'exponents-radicals': {
      intro: '6QJtWfIiyZo',   // Simplifying radicals
      examples: 'kITJ6qH7jS0', // Exponent rules part 1
      advanced: '7Uos1ED3KHI', // Simplifying rational expressions intro
      applications: 'XFwQV-KCudw', // Simplifying rational expressions monomial factors
    },
    'rational-expressions': {
      intro: '7Uos1ED3KHI',   // Simplifying rational expressions introduction
      examples: 'XFwQV-KCudw', // Common monomial factors
      advanced: '6QJtWfIiyZo', // Simplifying radicals
      applications: 'kITJ6qH7jS0', // Exponent rules part 1
    },
    'graphing-functions': {
      intro: 'uk7gS3cZVp4',   // Graph from slope-intercept equation example
      examples: 'IL3UCuXrUzE', // Slope-intercept form
      advanced: 'qgsNNqmlLoA', // Worked examples slope-intercept intro
      applications: 'za0QJRZ-yQ4', // Domain and range
    },
    'absolute-value': {
      intro: 'iI_2Piwn_og',   // Absolute value inequalities
      examples: 'bAerID24QJ0', // Linear equations 1
      advanced: 'LzYJVsvqS50', // Understanding steps solving equations
      applications: 'p5e5mf_G3FI', // Two-step equation
    },
    'exponential-functions': {
      intro: 'm5Tf6vgoJtQ',   // Exponential growth and decay word problems
      examples: 'za0QJRZ-yQ4', // Domain and range
      advanced: '6QJtWfIiyZo', // Simplifying radicals
      applications: 'uhxtUt_-GyM', // Statistics: the average
    },
    sequences: {
      intro: 'IWigvJcCAJ0',   // Quadratic equation intro
      examples: '_MllyJivas4', // Strategy solving quadratics
      advanced: 'K5ggNnKTmNM', // Factoring quadratics
      applications: 'mDmRYfma9C0', // Quadratic formula (proof)
    },
    'data-analysis': {
      intro: 'uhxtUt_-GyM',   // Statistics: the average
      examples: 'xTwDmnEEb9E', // Median in a histogram
      advanced: '6QJtWfIiyZo', // Simplifying radicals
      applications: 'kITJ6qH7jS0', // Exponent rules
    },
    probability: {
      intro: 'uhxtUt_-GyM',   // Statistics: the average
      examples: 'xTwDmnEEb9E', // Median in a histogram
      advanced: 'm5Tf6vgoJtQ', // Exponential word problems
      applications: '7Uos1ED3KHI', // Simplifying rational expressions
    },
    'real-world-applications': {
      intro: 'bAerID24QJ0',   // Linear equations
      examples: 'wYrxKGt_bLg', // Systems elimination
      advanced: 'IWigvJcCAJ0', // Quadratic equation
      applications: 'm5Tf6vgoJtQ', // Exponential word problems
    },
  };

  const fallbackYoutubeId = 'Vm7H0VTlIco'; // Polynomials intro — embed-safe fallback

  // Khan Academy Algebra 1 (x2f8bb11595b61c86) unit URLs — each has practice exercises
  const khanPracticeUrlByUnitSlug: Record<string, string> = {
    'linear-equations': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities',
    'systems-of-equations': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations',
    polynomials: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring',
    quadratics: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations',
    functions: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra',
    'exponents-radicals': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra',
    'rational-expressions': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring',
    'graphing-functions': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs',
    'absolute-value': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities',
    'exponential-functions': 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponential-growth-decay',
    sequences: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:sequences',
    'data-analysis': 'https://www.khanacademy.org/math/algebra',
    probability: 'https://www.khanacademy.org/math/algebra',
    'real-world-applications': 'https://www.khanacademy.org/math/algebra',
  }
  const khanPracticeFallback = 'https://www.khanacademy.org/math/algebra'

  // Create lessons for each unit (6-12 per unit)
  const lessonsData = [];
  for (const unit of insertedUnits) {
    const unitSlug = (unit as typeof schema.units.$inferSelect).slug;
    const videoIds = lessonYoutubeByUnitSlug[unitSlug];
    const practiceUrl = khanPracticeUrlByUnitSlug[unitSlug] ?? khanPracticeFallback;

    const unitLessons = [
      {
        slug: `${unit.slug}-intro`,
        unitId: unit.id,
        title: `Introduction to ${unit.title}`,
        description: `Overview and key concepts of ${unit.title.toLowerCase()}.`,
        type: 'VIDEO' as const,
        khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unit.slug}`,
        youtubeId: videoIds?.intro ?? fallbackYoutubeId,
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
        youtubeId: videoIds?.examples ?? videoIds?.intro ?? fallbackYoutubeId,
        duration: 18,
        order: 3,
      },
      {
        slug: `${unit.slug}-practice-1`,
        unitId: unit.id,
        title: 'Practice Problems - Set 1',
        description: 'Apply what you learned with guided practice.',
        type: 'EXERCISE' as const,
        khanUrl: practiceUrl,
        duration: 20,
        order: 4,
      },
      {
        slug: `${unit.slug}-advanced`,
        unitId: unit.id,
        title: 'Advanced Techniques',
        description: 'More challenging problems and advanced methods.',
        type: 'VIDEO' as const,
        youtubeId: videoIds?.advanced ?? videoIds?.examples ?? videoIds?.intro ?? fallbackYoutubeId,
        duration: 16,
        order: 5,
      },
      {
        slug: `${unit.slug}-practice-2`,
        unitId: unit.id,
        title: 'Practice Problems - Set 2',
        description: 'Additional practice with more complex scenarios.',
        type: 'EXERCISE' as const,
        khanUrl: practiceUrl,
        duration: 25,
        order: 6,
      },
      {
        slug: `${unit.slug}-applications`,
        unitId: unit.id,
        title: 'Real-World Applications',
        description: 'See how these concepts apply to real-world scenarios.',
        type: 'VIDEO' as const,
        youtubeId:
          videoIds?.applications ??
          videoIds?.advanced ??
          videoIds?.examples ??
          videoIds?.intro ??
          fallbackYoutubeId,
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

  // Always refresh lessons so updates to video mappings and content are applied
  await db.delete(schema.lessons);
  const insertedLessons = await db.insert(schema.lessons).values(lessonsData).returning();
  console.log(`✅ Created ${insertedLessons.length} lessons`);

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

  // Create one flashcard set per unit (14 sets) with real term/definition content
  const flashcardTermsBySlug: Record<string, Array<{ front: string; back: string; hint?: string }>> = {
    'linear-equations': [
      { front: 'Linear equation', back: 'An equation where the highest power of the variable is 1 (e.g. 2x + 3 = 7).', hint: 'Think "line" when you see linear.' },
      { front: 'Inverse operations', back: 'Operations that undo each other: addition ↔ subtraction, multiplication ↔ division. Use them to isolate the variable.', hint: 'Opposites.' },
      { front: 'Solution of an equation', back: 'The value(s) of the variable that make the equation true. Substitute back to check.', hint: 'The answer that works.' },
      { front: 'Linear inequality', back: 'A comparison using <, >, ≤, or ≥. Solutions often form a range (e.g. x > 3).', hint: 'Like an equation but with inequality symbols.' },
      { front: 'Slope-intercept form', back: 'y = mx + b, where m is slope and b is the y-intercept. Used to graph lines quickly.', hint: 'm and b tell you the line.' },
    ],
    'systems-of-equations': [
      { front: 'System of equations', back: 'Two or more equations with the same variables. The solution is the point(s) that satisfy all equations.', hint: 'Usually one solution (x, y).' },
      { front: 'Substitution method', back: 'Solve one equation for one variable, then substitute that expression into the other equation.', hint: 'Replace one variable with an expression.' },
      { front: 'Elimination method', back: 'Add or subtract equations to eliminate one variable so you can solve for the other.', hint: 'Make a variable cancel out.' },
      { front: 'Solution of a system', back: 'The ordered pair (x, y) that makes both equations true. Graphically, the intersection of the two lines.', hint: 'Where the lines cross.' },
    ],
    'polynomials': [
      { front: 'Polynomial', back: 'An expression with variables raised to whole-number powers and coefficients (e.g. 3x² + 2x - 1).', hint: 'Sums of terms like axⁿ.' },
      { front: 'Like terms', back: 'Terms with the same variable(s) raised to the same power. Only like terms can be combined (e.g. 2x² and 5x²).', hint: 'Same variable, same exponent.' },
      { front: 'FOIL', back: 'First, Outer, Inner, Last—a way to multiply two binomials: (a+b)(c+d) = ac + ad + bc + bd.', hint: 'Order of products when multiplying binomials.' },
      { front: 'Degree of a polynomial', back: 'The highest power of the variable in the polynomial. 3x² + x has degree 2.', hint: 'Largest exponent.' },
    ],
    'quadratics': [
      { front: 'Quadratic equation', back: 'An equation of the form ax² + bx + c = 0 (a ≠ 0). Has at most 2 real solutions.', hint: 'Squared term.' },
      { front: 'Parabola', back: 'The U-shaped graph of a quadratic function. Opens up if a > 0, down if a < 0.', hint: 'Vertex is the turning point.' },
      { front: 'Vertex', back: 'The highest or lowest point on a parabola. For y = ax² + bx + c, x = -b/(2a).', hint: 'Where the curve turns.' },
      { front: 'Quadratic formula', back: 'x = (-b ± √(b² - 4ac)) / (2a). Solves any quadratic equation.', hint: 'The "±" gives two solutions.' },
      { front: 'Discriminant', back: 'b² - 4ac. If positive: 2 real roots; zero: 1 real root; negative: no real roots.', hint: 'Under the square root in the formula.' },
    ],
    'functions': [
      { front: 'Function', back: 'A relation that assigns exactly one output to each input. Passes the vertical line test.', hint: 'One x → one y.' },
      { front: 'Domain', back: 'The set of all allowed inputs (x-values) for a function.', hint: 'What x can be.' },
      { front: 'Range', back: 'The set of all possible outputs (y-values) of a function.', hint: 'What y can be.' },
      { front: 'Function notation', back: 'f(x) means "f of x"—the output when the input is x. Example: f(2) = 2(2) + 1 = 5.', hint: 'Replace x with the given number.' },
    ],
    'exponents-radicals': [
      { front: 'Product of powers', back: 'aᵐ · aⁿ = aᵐ⁺ⁿ. When multiplying same base, add the exponents.', hint: 'Same base, add exponents.' },
      { front: 'Power of a power', back: '(aᵐ)ⁿ = aᵐⁿ. When raising a power to a power, multiply the exponents.', hint: 'Multiply exponents.' },
      { front: 'Zero exponent', back: 'a⁰ = 1 for any nonzero a.', hint: 'Anything to the 0 power is 1.' },
      { front: 'Square root', back: '√a is the nonnegative number whose square is a. √9 = 3.', hint: 'Undoes squaring.' },
    ],
    'rational-expressions': [
      { front: 'Rational expression', back: 'A fraction whose numerator and denominator are polynomials. Denominator cannot be zero.', hint: 'Algebraic fraction.' },
      { front: 'Simplified form', back: 'Numerator and denominator have no common factors (other than ±1).', hint: 'Cancel common factors.' },
      { front: 'Common denominator', back: 'When adding/subtracting rationals, find a shared denominator (often the product) and convert.', hint: 'Same bottom number.' },
    ],
    'graphing-functions': [
      { front: 'Slope', back: 'Rise over run: (y₂ - y₁)/(x₂ - x₁). Measures steepness of a line.', hint: 'm in y = mx + b.' },
      { front: 'Y-intercept', back: 'Where the graph crosses the y-axis. In y = mx + b, it is (0, b).', hint: 'When x = 0.' },
      { front: 'Axis of symmetry', back: 'For a parabola, the vertical line through the vertex. Equation is x = (vertex x).', hint: 'Folds in half along this line.' },
    ],
    'absolute-value': [
      { front: 'Absolute value', back: '|x| is the distance of x from 0. Always nonnegative. |−5| = 5.', hint: 'Distance from zero.' },
      { front: 'Absolute value equation', back: '|expression| = k has two cases: expression = k or expression = −k. Solve both.', hint: 'Two equations.' },
      { front: 'Absolute value inequality', back: '|x| < k → −k < x < k; |x| > k → x < −k or x > k.', hint: 'And vs or.' },
    ],
    'exponential-functions': [
      { front: 'Exponential function', back: 'y = a·bˣ (b > 0, b ≠ 1). Grows or decays by a constant factor over equal steps.', hint: 'Variable in the exponent.' },
      { front: 'Exponential growth', back: 'When b > 1, the function increases. Doubling or percent increase are examples.', hint: 'Getting bigger.' },
      { front: 'Exponential decay', back: 'When 0 < b < 1, the function decreases. Half-life or percent decrease.', hint: 'Getting smaller.' },
    ],
    'sequences': [
      { front: 'Arithmetic sequence', back: 'Sequence with a common difference d: aₙ = a₁ + (n−1)d.', hint: 'Add the same number each time.' },
      { front: 'Geometric sequence', back: 'Sequence with a common ratio r: aₙ = a₁·rⁿ⁻¹.', hint: 'Multiply by the same number each time.' },
      { front: 'Common difference', back: 'In an arithmetic sequence, d = aₙ₊₁ − aₙ (constant).', hint: 'What you add each time.' },
    ],
    'data-analysis': [
      { front: 'Mean', back: 'Average: sum of values divided by the number of values. Sensitive to outliers.', hint: 'Add them up, divide by count.' },
      { front: 'Median', back: 'Middle value when data are ordered. Better than mean for skewed data.', hint: 'Middle number.' },
      { front: 'Mode', back: 'The value(s) that appear most often. There can be no mode or more than one.', hint: 'Most frequent.' },
    ],
    'probability': [
      { front: 'Probability', back: 'Number of favorable outcomes divided by total outcomes (when equally likely). Between 0 and 1.', hint: 'Chance of an event.' },
      { front: 'Independent events', back: 'Events where one does not affect the other. P(A and B) = P(A)·P(B).', hint: 'No influence.' },
      { front: 'Complement', back: 'P(not A) = 1 − P(A). The probability that A does not happen.', hint: 'Opposite event.' },
    ],
    'real-world-applications': [
      { front: 'Linear model', back: 'Using y = mx + b to represent a real situation (e.g. cost vs. quantity).', hint: 'Constant rate of change.' },
      { front: 'Rate of change', back: 'Slope in context: how much y changes per unit change in x (e.g. dollars per hour).', hint: 'Same as slope.' },
    ],
  };

  // Clear existing resources so this seed always applies the latest worksheets, study guides, videos, and flashcards
  await db.delete(schema.flashcards);
  await db.delete(schema.flashcardSets);
  await db.delete(schema.videoResources);
  await db.delete(schema.studyGuides);
  await db.delete(schema.worksheets);
  console.log('🔄 Cleared existing worksheets, study guides, video resources, and flashcards');

  const flashcardSetsData = insertedUnits.map((unit: typeof schema.units.$inferSelect) => ({
    unitId: unit.id,
    title: `${unit.title} - Key Terms`,
    description: `Key terms and concepts for ${unit.title.toLowerCase()}`,
  }));

  const insertedSets = await db.insert(schema.flashcardSets).values(flashcardSetsData).returning();
  console.log(`✅ Created ${insertedSets.length} flashcard sets`);

  const flashcardsData: Array<{ setId: string; front: string; back: string; hint?: string; order: number }> = [];
  for (const set of insertedSets) {
    const unit = insertedUnits.find((u: typeof schema.units.$inferSelect) => u.id === set.unitId);
    const terms = unit ? flashcardTermsBySlug[(unit as typeof schema.units.$inferSelect).slug] : [];
    terms.forEach((t, i) => {
      flashcardsData.push({
        setId: set.id,
        front: t.front,
        back: t.back,
        hint: t.hint,
        order: i + 1,
      });
    });
  }
  if (flashcardsData.length > 0) {
    await db.insert(schema.flashcards).values(flashcardsData);
    console.log(`✅ Created ${flashcardsData.length} flashcards`);
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
          fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/Multi-Step%20Inequalities.pdf',
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
          fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/Systems%20of%20Equations%20Graphing.pdf',
        },
        {
          unitId: systemsUnit.id,
          title: 'Solving Systems by Substitution',
          description: 'Master the substitution method for solving systems.',
          difficulty: 'Medium',
          estimatedTime: 30,
          fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/Systems%20of%20Equations%20Substitution.pdf',
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
      await db.insert(schema.worksheets).values(worksheetsData);
      console.log(`✅ Created ${worksheetsData.length} worksheets`);
    }
  }

  // Create study guides (one per unit, 14 total)
  const studyGuideBySlug: Record<string, { title: string; description: string; content: string }> = {
    'linear-equations': {
      title: 'Linear Equations & Inequalities Study Guide',
      description: 'Complete guide covering solving and graphing linear equations and inequalities.',
      content: `
        <h2>Linear Equations & Inequalities</h2>
        <p>This guide covers the core skills you need for one-variable linear equations and inequalities.</p>
        <h3>Key Concepts</h3>
        <ul>
          <li><strong>Linear equation:</strong> An equation where the highest power of the variable is 1 (e.g. 2x + 3 = 7).</li>
          <li><strong>Solution:</strong> The value(s) that make the equation true. Use inverse operations to isolate the variable.</li>
          <li><strong>Linear inequality:</strong> Uses &lt;, &gt;, ≤, or ≥ instead of =. Graph solutions on a number line; open vs. closed dots matter.</li>
        </ul>
        <h3>Important Forms</h3>
        <ul>
          <li>Standard form: ax + b = 0</li>
          <li>Slope-intercept form: y = mx + b (for two-variable lines)</li>
        </ul>
        <h3>Problem-Solving Steps</h3>
        <ol>
          <li>Simplify both sides (combine like terms, distribute).</li>
          <li>Use inverse operations to isolate the variable (undo addition, then multiplication).</li>
          <li>Check your solution by substituting back into the original equation.</li>
        </ol>
      `,
    },
    'systems-of-equations': {
      title: 'Systems of Equations Study Guide',
      description: 'Comprehensive guide to solving systems of linear equations.',
      content: `
        <h2>Systems of Equations</h2>
        <p>A system of equations is two or more equations with the same variables. The solution is the point(s) that satisfy all equations.</p>
        <h3>Three Solution Methods</h3>
        <ol>
          <li><strong>Graphing:</strong> Graph both lines and find the intersection. Best when you need a visual or approximate answer.</li>
          <li><strong>Substitution:</strong> Solve one equation for one variable, then substitute into the other. Best when one variable is already isolated (e.g. y = 2x + 1).</li>
          <li><strong>Elimination:</strong> Add or subtract equations to cancel one variable. Best when coefficients line up (e.g. same x-coefficient).</li>
        </ol>
        <h3>When to Use Each</h3>
        <ul>
          <li>Graphing: Visual check or estimating.</li>
          <li>Substitution: One equation already solved for a variable.</li>
          <li>Elimination: Opposite or same coefficients for one variable.</li>
        </ul>
      `,
    },
    'polynomials': {
      title: 'Polynomial Operations Study Guide',
      description: 'Master adding, subtracting, and multiplying polynomials.',
      content: `
        <h2>Polynomial Operations</h2>
        <p>Polynomials are expressions with variables raised to whole-number powers. Like terms have the same variable and exponent.</p>
        <h3>Adding Polynomials</h3>
        <p>Combine like terms only. Example: (3x² + 2x - 1) + (x² - 4x + 5) = 4x² - 2x + 4.</p>
        <h3>Subtracting Polynomials</h3>
        <p>Distribute the negative to the second polynomial, then combine like terms. Example: (3x² + 2x - 1) - (x² - 4x + 5) = 2x² + 6x - 6.</p>
        <h3>Multiplying Polynomials</h3>
        <p>Use the distributive property. For binomials, FOIL (First, Outer, Inner, Last) is helpful: (x + 2)(x + 3) = x² + 5x + 6.</p>
      `,
    },
    'quadratics': {
      title: 'Quadratic Equations & Functions Study Guide',
      description: 'Solve quadratics by factoring, completing the square, and the quadratic formula.',
      content: `
        <h2>Quadratic Equations & Functions</h2>
        <p>Quadratic equations have the form ax² + bx + c = 0. Their graphs are parabolas.</p>
        <h3>Key Concepts</h3>
        <ul>
          <li><strong>Standard form:</strong> ax² + bx + c = 0 (a ≠ 0).</li>
          <li><strong>Vertex form:</strong> y = a(x - h)² + k gives vertex (h, k).</li>
          <li><strong>Solutions:</strong> Up to 2 real roots (x-intercepts).</li>
        </ul>
        <h3>Solution Methods</h3>
        <ol>
          <li><strong>Factoring:</strong> Set equation equal to 0, factor, use zero-product property.</li>
          <li><strong>Quadratic formula:</strong> x = (-b ± √(b² - 4ac)) / (2a). Works for any quadratic.</li>
          <li><strong>Completing the square:</strong> Rewrite in vertex form to solve or find the vertex.</li>
        </ol>
      `,
    },
    'functions': {
      title: 'Functions & Function Notation Study Guide',
      description: 'Understand functions, domain, range, and f(x) notation.',
      content: `
        <h2>Functions & Function Notation</h2>
        <p>A function assigns exactly one output to each input. We write f(x) and read it as "f of x."</p>
        <h3>Key Ideas</h3>
        <ul>
          <li><strong>Domain:</strong> The set of allowed inputs (x-values).</li>
          <li><strong>Range:</strong> The set of possible outputs (y-values).</li>
          <li><strong>Vertical line test:</strong> A graph is a function if no vertical line hits it more than once.</li>
        </ul>
        <h3>Notation & Evaluation</h3>
        <p>f(x) = 2x + 1 means "double x and add 1." So f(3) = 2(3) + 1 = 7. Replace x with the given value and simplify.</p>
      `,
    },
    'exponents-radicals': {
      title: 'Exponents & Radicals Study Guide',
      description: 'Simplify expressions with exponents and radicals, including rational exponents.',
      content: `
        <h2>Exponents & Radicals</h2>
        <p>Exponents show repeated multiplication; radicals (e.g. square roots) undo powers.</p>
        <h3>Exponent Rules</h3>
        <ul>
          <li>aᵐ · aⁿ = aᵐ⁺ⁿ (same base, add exponents)</li>
          <li>aᵐ ÷ aⁿ = aᵐ⁻ⁿ (same base, subtract exponents)</li>
          <li>(aᵐ)ⁿ = aᵐⁿ (power of a power, multiply exponents)</li>
          <li>a⁰ = 1 (a ≠ 0); a⁻ⁿ = 1/aⁿ</li>
        </ul>
        <h3>Radicals & Rational Exponents</h3>
        <p>√a = a^(1/2); ⁿ√a = a^(1/n). Use these to convert between radical and exponent form and simplify.</p>
      `,
    },
    'rational-expressions': {
      title: 'Rational Expressions Study Guide',
      description: 'Simplify, add, subtract, multiply, and divide rational expressions.',
      content: `
        <h2>Rational Expressions</h2>
        <p>Rational expressions are fractions whose numerator and denominator are polynomials. The denominator cannot be zero.</p>
        <h3>Key Skills</h3>
        <ul>
          <li><strong>Simplify:</strong> Factor numerator and denominator; cancel common factors.</li>
          <li><strong>Multiply/divide:</strong> Multiply across or flip and multiply; then simplify.</li>
          <li><strong>Add/subtract:</strong> Find a common denominator (often the product of denominators), then combine numerators.</li>
        </ul>
        <h3>Domain</h3>
        <p>Exclude any x that makes the denominator equal to zero.</p>
      `,
    },
    'graphing-functions': {
      title: 'Graphing Linear & Quadratic Functions Study Guide',
      description: 'Graph lines and parabolas and identify key features.',
      content: `
        <h2>Graphing Linear & Quadratic Functions</h2>
        <p>Linear functions graph as lines; quadratic functions graph as parabolas.</p>
        <h3>Linear: y = mx + b</h3>
        <ul>
          <li>m = slope (rise over run); b = y-intercept.</li>
          <li>Plot the y-intercept, then use slope to find another point.</li>
        </ul>
        <h3>Quadratic: y = ax² + bx + c</h3>
        <ul>
          <li>Vertex: x = -b/(2a); substitute to find y.</li>
          <li>Axis of symmetry: vertical line through the vertex. Parabola opens up if a &gt; 0, down if a &lt; 0.</li>
        </ul>
      `,
    },
    'absolute-value': {
      title: 'Absolute Value Equations & Inequalities Study Guide',
      description: 'Solve and graph absolute value equations and inequalities.',
      content: `
        <h2>Absolute Value Equations & Inequalities</h2>
        <p>|x| is the distance of x from 0. So |x| = 5 means x = 5 or x = -5.</p>
        <h3>Equations</h3>
        <p>|expression| = k (k ≥ 0) gives two cases: expression = k or expression = -k. Solve each.</p>
        <h3>Inequalities</h3>
        <ul>
          <li>|x| &lt; k → -k &lt; x &lt; k (and compound inequality).</li>
          <li>|x| &gt; k → x &lt; -k or x &gt; k (or compound).</li>
        </ul>
      `,
    },
    'exponential-functions': {
      title: 'Exponential Functions Study Guide',
      description: 'Exponential growth and decay, and their graphs and applications.',
      content: `
        <h2>Exponential Functions</h2>
        <p>Exponential functions have the form y = a·bˣ (b &gt; 0, b ≠ 1). They model growth (b &gt; 1) or decay (0 &lt; b &lt; 1).</p>
        <h3>Key Ideas</h3>
        <ul>
          <li>Initial value: when x = 0, y = a.</li>
          <li>Base b: growth/decay factor per unit increase in x.</li>
          <li>Graph: no x-intercept; horizontal asymptote (often y = 0).</li>
        </ul>
        <h3>Applications</h3>
        <p>Used for population growth, radioactive decay, compound interest, and similar real-world situations.</p>
      `,
    },
    'sequences': {
      title: 'Sequences & Series Study Guide',
      description: 'Arithmetic and geometric sequences and their sums.',
      content: `
        <h2>Sequences & Series</h2>
        <p>A sequence is an ordered list of numbers; a series is the sum of terms of a sequence.</p>
        <h3>Arithmetic</h3>
        <p>Common difference d: aₙ = a₁ + (n - 1)d. Sum: Sₙ = n/2 · (first + last).</p>
        <h3>Geometric</h3>
        <p>Common ratio r: aₙ = a₁ · rⁿ⁻¹. Sum (finite): Sₙ = a₁(1 - rⁿ)/(1 - r) when r ≠ 1.</p>
      `,
    },
    'data-analysis': {
      title: 'Data Analysis & Statistics Study Guide',
      description: 'Measures of center, spread, and visual representations of data.',
      content: `
        <h2>Data Analysis & Statistics</h2>
        <p>Use measures of center and spread to summarize and compare data sets.</p>
        <h3>Measures of Center</h3>
        <ul>
          <li><strong>Mean:</strong> Sum of values divided by count (average).</li>
          <li><strong>Median:</strong> Middle value when ordered; use for skewed data.</li>
          <li><strong>Mode:</strong> Most frequent value(s).</li>
        </ul>
        <h3>Spread &amp; Displays</h3>
        <p>Range, IQR, box plots, histograms, and scatter plots help visualize and compare distributions and relationships.</p>
      `,
    },
    'probability': {
      title: 'Probability Study Guide',
      description: 'Calculate probabilities of simple and compound events.',
      content: `
        <h2>Probability</h2>
        <p>Probability of an event = (number of favorable outcomes) / (number of possible outcomes), when outcomes are equally likely.</p>
        <h3>Key Rules</h3>
        <ul>
          <li>P(not A) = 1 - P(A).</li>
          <li>P(A and B) = P(A) · P(B) when A and B are independent.</li>
          <li>P(A or B) = P(A) + P(B) - P(A and B) for overlapping events.</li>
        </ul>
      `,
    },
    'real-world-applications': {
      title: 'Real-World Applications Study Guide',
      description: 'Apply algebra to solve problems in context.',
      content: `
        <h2>Real-World Applications</h2>
        <p>Algebra is used to model and solve problems from finance, science, and daily life.</p>
        <h3>Strategies</h3>
        <ol>
          <li>Define variables (what does x represent?).</li>
          <li>Write an equation or inequality from the situation.</li>
          <li>Solve and interpret the result in context.</li>
        </ol>
        <p>Common topics: linear models, systems (mixing, distance-rate-time), quadratics (area, projectiles), and exponentials (growth/decay).</p>
      `,
    },
  };

  const studyGuidesData = allUnits
    .filter((u: typeof schema.units.$inferSelect) => studyGuideBySlug[u.slug])
    .map((u: typeof schema.units.$inferSelect) => {
      const g = studyGuideBySlug[u.slug];
      return { unitId: u.id, title: g.title, description: g.description, content: g.content };
    });

  if (studyGuidesData.length > 0) {
    await db.insert(schema.studyGuides).values(studyGuidesData);
    console.log(`✅ Created ${studyGuidesData.length} study guides`);
  }

  // Create video resources (Khan Academy Algebra 1) for all 14 units
  const videosByUnitSlug: Record<string, Array<{ title: string; description: string; videoId: string; duration: number }>> = {
    'linear-equations': [
      { title: 'Introduction to Linear Equations', description: 'Khan Academy: basics of linear equations.', videoId: '7q4r7IJWnKE', duration: 12 },
      { title: 'Solving Multi-Step Linear Equations', description: 'Khan Academy: multi-step equation solving.', videoId: 'x-PlBk5nzA0', duration: 15 },
      { title: 'Linear Inequalities', description: 'Khan Academy: solving and graphing inequalities.', videoId: 'JY8w5Xg5Y3Q', duration: 18 },
    ],
    'systems-of-equations': [
      { title: 'Solving Systems by Graphing', description: 'Khan Academy: graphical solution of systems.', videoId: 'uk7gS3cZVp4', duration: 10 },
      { title: 'Substitution Method', description: 'Khan Academy: substitution method for systems.', videoId: 'H9k0z6uG_9k', duration: 14 },
      { title: 'Elimination Method', description: 'Khan Academy: elimination method.', videoId: 'HKgS8O9q9zY', duration: 16 },
    ],
    'polynomials': [
      { title: 'Polynomial Basics', description: 'Khan Academy: introduction to polynomials.', videoId: 'Vm7H0VTlIco', duration: 11 },
      { title: 'Multiplying Polynomials', description: 'Khan Academy: multiplying polynomials.', videoId: 'LK1t6-mOHTQ', duration: 13 },
    ],
    'quadratics': [
      { title: 'Introduction to Quadratic Functions', description: 'Khan Academy: quadratics and parabolas.', videoId: 'R948Tsyq4vA', duration: 14 },
      { title: 'Solving Quadratics by Factoring', description: 'Khan Academy: factoring to solve quadratics.', videoId: 'MRO2iyLeDPk', duration: 14 },
      { title: 'Quadratic Formula', description: 'Khan Academy: the quadratic formula.', videoId: 'zY84UGHEh78', duration: 16 },
    ],
    'functions': [
      { title: 'What is a Function?', description: 'Khan Academy: functions and relations.', videoId: '52tpYl2tTqk', duration: 11 },
      { title: 'Domain and Range', description: 'Khan Academy: domain and range of functions.', videoId: 'dqGT9b0aXV0', duration: 13 },
    ],
    'exponents-radicals': [
      { title: 'Properties of Exponents', description: 'Khan Academy: exponent rules.', videoId: 'kITJ6qH7jS0', duration: 14 },
      { title: 'Simplifying Radicals', description: 'Khan Academy: simplifying radical expressions.', videoId: 'jvTwqN0-4KU', duration: 13 },
    ],
    'rational-expressions': [
      { title: 'Simplifying Rational Expressions', description: 'Khan Academy: simplify rational expressions.', videoId: 'vn9xqWNGOPM', duration: 13 },
      { title: 'Multiplying and Dividing Rationals', description: 'Khan Academy: operations with rationals.', videoId: 'cYXb_6pprdE', duration: 14 },
    ],
    'graphing-functions': [
      { title: 'Slope-Intercept Form', description: 'Khan Academy: graphing lines y = mx + b.', videoId: '9AnhkL5yYVQ', duration: 15 },
      { title: 'Graphing Parabolas', description: 'Khan Academy: graphing quadratic functions.', videoId: 'taooHfbLfvA', duration: 15 },
    ],
    'absolute-value': [
      { title: 'Absolute Value Equations', description: 'Khan Academy: solving absolute value equations.', videoId: 'fH5sLqnXYYg', duration: 10 },
      { title: 'Absolute Value Inequalities', description: 'Khan Academy: absolute value inequalities.', videoId: 'fLXkW3hCHZs', duration: 17 },
    ],
    'exponential-functions': [
      { title: 'Exponential Growth', description: 'Khan Academy: exponential growth functions.', videoId: '6WMZ7J0wwMI', duration: 15 },
      { title: 'Exponential Decay', description: 'Khan Academy: exponential decay.', videoId: 'xwJwLYtvO94', duration: 14 },
    ],
    'sequences': [
      { title: 'Arithmetic Sequences', description: 'Khan Academy: arithmetic sequences.', videoId: 'TW-3vTcGDfk', duration: 13 },
      { title: 'Geometric Sequences', description: 'Khan Academy: geometric sequences.', videoId: 'P9iRhvJqM50', duration: 14 },
    ],
    'data-analysis': [
      { title: 'Mean, Median, Mode', description: 'Khan Academy: measures of center.', videoId: 'B1HEzNTGeZ4', duration: 12 },
      { title: 'Box and Whisker Plots', description: 'Khan Academy: box plots.', videoId: '4iN1wSKqTHw', duration: 13 },
    ],
    'probability': [
      { title: 'Introduction to Probability', description: 'Khan Academy: basic probability.', videoId: 'uzkc-qNVoOk', duration: 14 },
      { title: 'Compound Probability', description: 'Khan Academy: compound events.', videoId: 'JCOaGqxd9as', duration: 16 },
    ],
    'real-world-applications': [
      { title: 'Linear Models Word Problems', description: 'Khan Academy: modeling with linear equations.', videoId: 'IHWJHbM_5zc', duration: 16 },
      { title: 'Quadratic Word Problems', description: 'Khan Academy: applying quadratics.', videoId: '2EeAKoxQyEQ', duration: 12 },
    ],
  };

  const videoResourcesData: Array<{ unitId: string; title: string; description: string; videoUrl: string; videoId: string; duration: number }> = [];
  for (const unit of allUnits) {
    const list = videosByUnitSlug[(unit as typeof schema.units.$inferSelect).slug];
    if (list) {
      for (const v of list) {
        videoResourcesData.push({
          unitId: (unit as typeof schema.units.$inferSelect).id,
          title: v.title,
          description: v.description,
          videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
          videoId: v.videoId,
          duration: v.duration,
        });
      }
    }
  }

  if (videoResourcesData.length > 0) {
    await db.insert(schema.videoResources).values(videoResourcesData);
    console.log(`✅ Created ${videoResourcesData.length} video resources`);
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

  // Create tutoring slots (always refresh so they are correctly categorized)
  await db.delete(schema.tutoringSlots);
  const slotsData = [];
  const now = new Date();

  // Create slots for the next 14 days
  for (let day = 0; day < 14; day++) {
    const slotDate = new Date(now);
    slotDate.setDate(now.getDate() + day);
    const dayOfWeek = slotDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Only create slots on Monday (1), Wednesday (3), and Friday (5)
    if (dayOfWeek !== 1 && dayOfWeek !== 3 && dayOfWeek !== 5) {
      continue;
    }

    // Time slots: Morning (9:00 AM), Afternoon (1:30 PM), Evening (6:00 PM)
    const timeSlots = [
      { hour: 9, minute: 0 },
      { hour: 13, minute: 30 },
      { hour: 18, minute: 0 },
    ];

    for (const teacher of insertedTeachers) {
      // Give each teacher 1 random slot per active day to avoid giving everyone all slots
      // Or just give them all 3 slots for simplicity and populated demo
      for (const time of timeSlots) {
        const start = new Date(slotDate);
        start.setHours(time.hour, time.minute, 0, 0);

        slotsData.push({
          teacherId: teacher.id,
          start: start,
          end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hour later
          capacity: 5,
          spotsLeft: 5,
        });
      }
    }
  }

  if (slotsData.length > 0) {
    await db.insert(schema.tutoringSlots).values(slotsData);
  }
  console.log('✅ Recreated diverse tutoring slots');

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

