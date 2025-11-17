import { db } from '../src/lib/db';
import {
  users,
  units,
  lessons,
  quizzes,
  tests,
  skills,
  flashcardSets,
  flashcards,
  badges,
  teachers,
  tutoringSlots,
  reviews,
  streaks,
} from '../src/lib/db/schema';
import { hash } from 'bcryptjs';
import dayjs from 'dayjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await db.delete(flashcards);
  await db.delete(flashcardSets);
  await db.delete(skills);
  await db.delete(tests);
  await db.delete(quizzes);
  await db.delete(lessons);
  await db.delete(units);
  await db.delete(tutoringSlots);
  await db.delete(teachers);
  await db.delete(reviews);
  await db.delete(streaks);
  await db.delete(badges);
  await db.delete(users);

  // Create demo users
  console.log('Creating demo users...');
  const hashedPassword = await hash('Passw0rd!', 10);

  const [studentUser] = await db
    .insert(users)
    .values({
      email: 'student@example.com',
      name: 'Student Demo',
      password: hashedPassword,
      role: 'STUDENT',
    })
    .returning();

  const [teacherUser] = await db
    .insert(users)
    .values({
      email: 'teacher@example.com',
      name: 'Teacher Demo',
      password: hashedPassword,
      role: 'TEACHER',
    })
    .returning();

  const [adminUser] = await db
    .insert(users)
    .values({
      email: 'admin@example.com',
      name: 'Admin Demo',
      password: hashedPassword,
      role: 'ADMIN',
    })
    .returning();

  console.log('✓ Created 3 demo users');

  // Create streak for student
  await db.insert(streaks).values({
    userId: studentUser.id,
    current: 5,
    longest: 12,
  });

  // Create badges
  console.log('Creating badges...');
  const badgeData = [
    {
      slug: 'first-lesson',
      name: 'First Steps',
      description: 'Completed your first lesson',
      icon: 'trophy',
    },
    {
      slug: 'quiz-master',
      name: 'Quiz Master',
      description: 'Passed your first quiz with 90%+',
      icon: 'star',
    },
    {
      slug: 'week-streak',
      name: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      icon: 'flame',
    },
    {
      slug: 'unit-complete',
      name: 'Unit Champion',
      description: 'Completed an entire unit',
      icon: 'award',
    },
    {
      slug: 'perfect-score',
      name: 'Perfectionist',
      description: 'Scored 100% on a test',
      icon: 'check-circle',
    },
  ];

  await db.insert(badges).values(badgeData);
  console.log('✓ Created badges');

  // Create teachers
  console.log('Creating teacher profiles...');
  const teacherData = [
    {
      name: 'Ms. Sarah Chen',
      email: 'sarah.chen@numera.edu',
      bio: 'Passionate math educator with 10 years of experience. Specializes in making algebra accessible and fun for all learners. Former engineer turned teacher.',
      avatar: '/avatars/teacher-1.jpg',
      officeHours: 'Monday-Friday: 3:00 PM - 5:00 PM',
    },
    {
      name: 'Mr. David Rodriguez',
      email: 'david.rodriguez@numera.edu',
      bio: 'Award-winning mathematics teacher focusing on real-world applications of algebra. Loves helping students discover the beauty of mathematical patterns.',
      avatar: '/avatars/teacher-2.jpg',
      officeHours: 'Tuesday-Thursday: 2:30 PM - 4:30 PM',
    },
    {
      name: 'Dr. Emily Watson',
      email: 'emily.watson@numera.edu',
      bio: 'PhD in Mathematics Education. Creates engaging lessons that connect algebra to students\' everyday lives. Strong advocate for inclusive math education.',
      avatar: '/avatars/teacher-3.jpg',
      officeHours: 'Monday-Wednesday: 4:00 PM - 6:00 PM',
    },
  ];

  const insertedTeachers = await db.insert(teachers).values(teacherData).returning();
  console.log('✓ Created 3 teacher profiles');

  // Create tutoring slots for next 2 weeks
  console.log('Creating tutoring slots...');
  const slots = [];
  for (let day = 0; day < 14; day++) {
    for (let teacher of insertedTeachers) {
      const slotDate = dayjs().add(day, 'day');
      // Morning slot
      slots.push({
        teacherId: teacher.id,
        start: slotDate.hour(10).minute(0).toDate(),
        end: slotDate.hour(11).minute(0).toDate(),
        capacity: 5,
        spotsLeft: 5,
      });
      // Afternoon slot
      slots.push({
        teacherId: teacher.id,
        start: slotDate.hour(15).minute(0).toDate(),
        end: slotDate.hour(16).minute(0).toDate(),
        capacity: 5,
        spotsLeft: 5,
      });
    }
  }
  await db.insert(tutoringSlots).values(slots);
  console.log('✓ Created tutoring slots');

  // Create 14 Algebra 1 Units
  console.log('Creating 14 Algebra 1 units...');

  const unitData = [
    {
      slug: 'foundations-of-algebra',
      title: 'Foundations of Algebra',
      description:
        'Master the building blocks of algebra including variables, expressions, and basic operations. Learn the language of mathematics.',
      order: 1,
    },
    {
      slug: 'solving-linear-equations',
      title: 'Solving Linear Equations',
      description:
        'Develop powerful problem-solving skills by learning multiple methods for solving linear equations in one variable.',
      order: 2,
    },
    {
      slug: 'linear-inequalities',
      title: 'Linear Inequalities',
      description:
        'Extend equation-solving techniques to inequalities. Understand how to graph and interpret solutions on number lines.',
      order: 3,
    },
    {
      slug: 'graphing-linear-equations',
      title: 'Graphing Linear Equations',
      description:
        'Visualize mathematical relationships by graphing lines. Master slope, intercepts, and different forms of linear equations.',
      order: 4,
    },
    {
      slug: 'writing-linear-equations',
      title: 'Writing Linear Equations',
      description:
        'Learn to translate real-world scenarios into algebraic equations. Write equations from graphs, tables, and word problems.',
      order: 5,
    },
    {
      slug: 'systems-of-equations',
      title: 'Systems of Linear Equations',
      description:
        'Solve problems involving multiple equations simultaneously. Master graphing, substitution, and elimination methods.',
      order: 6,
    },
    {
      slug: 'exponents-exponential-functions',
      title: 'Exponents & Exponential Functions',
      description:
        'Explore the power of exponents and exponential growth. Apply these concepts to real-world scenarios like compound interest.',
      order: 7,
    },
    {
      slug: 'polynomials-factoring',
      title: 'Polynomials & Factoring',
      description:
        'Master operations with polynomials and various factoring techniques. Build foundation for advanced algebra.',
      order: 8,
    },
    {
      slug: 'quadratic-equations-functions',
      title: 'Quadratic Equations & Functions',
      description:
        'Dive into parabolas and quadratic relationships. Learn multiple methods for solving quadratic equations.',
      order: 9,
    },
    {
      slug: 'radical-expressions',
      title: 'Radical Expressions & Equations',
      description:
        'Understand square roots and other radicals. Simplify radical expressions and solve radical equations.',
      order: 10,
    },
    {
      slug: 'rational-expressions',
      title: 'Rational Expressions & Equations',
      description:
        'Work with algebraic fractions. Learn to simplify, add, subtract, multiply, and divide rational expressions.',
      order: 11,
    },
    {
      slug: 'data-analysis',
      title: 'Data Analysis & Probability',
      description:
        'Apply algebra to statistics and probability. Analyze data sets and make predictions using mathematical models.',
      order: 12,
    },
    {
      slug: 'sequences-series',
      title: 'Sequences & Series',
      description:
        'Explore patterns in numbers. Master arithmetic and geometric sequences and their real-world applications.',
      order: 13,
    },
    {
      slug: 'advanced-functions',
      title: 'Advanced Functions & Modeling',
      description:
        'Synthesize your algebra knowledge. Work with various function types and create mathematical models for complex problems.',
      order: 14,
    },
  ];

  const insertedUnits = await db.insert(units).values(unitData).returning();
  console.log('✓ Created 14 units');

  // Create lessons for each unit (8-10 lessons per unit)
  console.log('Creating lessons for all units...');

  const lessonsData = [
    // Unit 1: Foundations
    {
      unitId: insertedUnits[0].id,
      slug: 'variables-and-expressions',
      title: 'Variables and Expressions',
      description: 'Learn what variables are and how to write algebraic expressions',
      type: 'VIDEO' as const,
      khanUrl: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86',
      youtubeId: 'JnpqlXN9Whw',
      duration: 12,
      order: 1,
    },
    {
      unitId: insertedUnits[0].id,
      slug: 'evaluating-expressions',
      title: 'Evaluating Expressions',
      description: 'Substitute values and calculate the result of algebraic expressions',
      type: 'VIDEO' as const,
      youtubeId: 'qVYKW7XKkAU',
      duration: 10,
      order: 2,
    },
    {
      unitId: insertedUnits[0].id,
      slug: 'combining-like-terms',
      title: 'Combining Like Terms',
      description: 'Simplify expressions by combining similar terms',
      type: 'VIDEO' as const,
      youtubeId: 'Nd-PiVGMqjo',
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[0].id,
      slug: 'distributive-property',
      title: 'The Distributive Property',
      description: 'Master this essential property for simplifying expressions',
      type: 'VIDEO' as const,
      youtubeId: 'v-6MShC82ow',
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[0].id,
      slug: 'order-of-operations',
      title: 'Order of Operations (PEMDAS)',
      description: 'Learn the correct order for mathematical operations',
      type: 'READING' as const,
      duration: 8,
      order: 5,
    },
    {
      unitId: insertedUnits[0].id,
      slug: 'properties-of-numbers',
      title: 'Properties of Real Numbers',
      description: 'Commutative, associative, and identity properties',
      type: 'VIDEO' as const,
      youtubeId: 'HVsNSg-qzDQ',
      duration: 11,
      order: 6,
    },
    {
      unitId: insertedUnits[0].id,
      slug: 'foundations-practice',
      title: 'Practice: Foundation Skills',
      description: 'Apply what you learned with practice problems',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 7,
    },

    // Unit 2: Solving Linear Equations
    {
      unitId: insertedUnits[1].id,
      slug: 'one-step-equations',
      title: 'Solving One-Step Equations',
      description: 'Learn the basics of isolating variables',
      type: 'VIDEO' as const,
      youtubeId: 'jSD8pVjuDZE',
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'two-step-equations',
      title: 'Solving Two-Step Equations',
      description: 'Solve equations requiring two operations',
      type: 'VIDEO' as const,
      youtubeId: 'jvyQmazFfcw',
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'multi-step-equations',
      title: 'Multi-Step Equations',
      description: 'Tackle more complex equations with multiple steps',
      type: 'VIDEO' as const,
      youtubeId: 'l7pMJBw0Xw4',
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'equations-with-variables-both-sides',
      title: 'Variables on Both Sides',
      description: 'Solve equations where the variable appears on both sides',
      type: 'VIDEO' as const,
      youtubeId: 'L36giMVWiVQ',
      duration: 13,
      order: 4,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'equations-with-fractions',
      title: 'Equations with Fractions',
      description: 'Use the LCD to clear fractions from equations',
      type: 'VIDEO' as const,
      youtubeId: 'KeYVFSqJpjQ',
      duration: 16,
      order: 5,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'equations-with-decimals',
      title: 'Equations with Decimals',
      description: 'Strategies for solving equations containing decimals',
      type: 'READING' as const,
      duration: 8,
      order: 6,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'literal-equations',
      title: 'Literal Equations & Formulas',
      description: 'Rearrange formulas to solve for different variables',
      type: 'VIDEO' as const,
      youtubeId: 'g0kVM-6YlGw',
      duration: 14,
      order: 7,
    },
    {
      unitId: insertedUnits[1].id,
      slug: 'word-problems-linear-equations',
      title: 'Word Problems with Linear Equations',
      description: 'Translate real-world problems into equations',
      type: 'VIDEO' as const,
      youtubeId: 'CDvPPsB3nEM',
      duration: 18,
      order: 8,
    },

    // Unit 3: Linear Inequalities
    {
      unitId: insertedUnits[2].id,
      slug: 'solving-inequalities',
      title: 'Solving One-Step Inequalities',
      description: 'Learn inequality notation and basic solving techniques',
      type: 'VIDEO' as const,
      youtubeId: 'Vj_t3ČZ8',
      duration: 11,
      order: 1,
    },
    {
      unitId: insertedUnits[2].id,
      slug: 'multi-step-inequalities',
      title: 'Multi-Step Inequalities',
      description: 'Solve complex inequalities step by step',
      type: 'VIDEO' as const,
      youtubeId: 'MYY3-8GPZ5Y',
      duration: 13,
      order: 2,
    },
    {
      unitId: insertedUnits[2].id,
      slug: 'compound-inequalities',
      title: 'Compound Inequalities',
      description: 'Work with AND and OR inequalities',
      type: 'VIDEO' as const,
      youtubeId: 'ZIjRYhkzQCk',
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[2].id,
      slug: 'absolute-value-inequalities',
      title: 'Absolute Value Inequalities',
      description: 'Solve and graph absolute value inequalities',
      type: 'VIDEO' as const,
      youtubeId: 'fLXkW3hCHZs',
      duration: 17,
      order: 4,
    },
    {
      unitId: insertedUnits[2].id,
      slug: 'graphing-inequalities-number-line',
      title: 'Graphing on a Number Line',
      description: 'Visualize inequality solutions with number lines',
      type: 'READING' as const,
      duration: 7,
      order: 5,
    },
    {
      unitId: insertedUnits[2].id,
      slug: 'inequality-word-problems',
      title: 'Inequality Word Problems',
      description: 'Apply inequalities to real-world scenarios',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 6,
    },

    // Unit 4: Graphing Linear Equations
    {
      unitId: insertedUnits[3].id,
      slug: 'coordinate-plane',
      title: 'The Coordinate Plane',
      description: 'Introduction to graphing points on the coordinate plane',
      type: 'VIDEO' as const,
      youtubeId: 'Db8O4BjhX18',
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[3].id,
      slug: 'slope',
      title: 'Understanding Slope',
      description: 'Learn what slope means and how to calculate it',
      type: 'VIDEO' as const,
      youtubeId: 'R948Tsyq4vA',
      duration: 14,
      order: 2,
    },
    {
      unitId: insertedUnits[3].id,
      slug: 'slope-intercept-form',
      title: 'Slope-Intercept Form (y = mx + b)',
      description: 'Graph lines using slope and y-intercept',
      type: 'VIDEO' as const,
      youtubeId: '9AnhkL5yYVQ',
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[3].id,
      slug: 'point-slope-form',
      title: 'Point-Slope Form',
      description: 'Write equations using a point and slope',
      type: 'VIDEO' as const,
      youtubeId: 'FdNPY_Uq7xs',
      duration: 12,
      order: 4,
    },
    {
      unitId: insertedUnits[3].id,
      slug: 'standard-form',
      title: 'Standard Form (Ax + By = C)',
      description: 'Work with the standard form of linear equations',
      type: 'VIDEO' as const,
      youtubeId: 'dCXMYDL5Zl8',
      duration: 13,
      order: 5,
    },
    {
      unitId: insertedUnits[3].id,
      slug: 'parallel-perpendicular-lines',
      title: 'Parallel & Perpendicular Lines',
      description: 'Identify and write equations for parallel and perpendicular lines',
      type: 'VIDEO' as const,
      youtubeId: '5jXLICjJGME',
      duration: 16,
      order: 6,
    },
    {
      unitId: insertedUnits[3].id,
      slug: 'graphing-practice',
      title: 'Graphing Practice',
      description: 'Master graphing with varied practice problems',
      type: 'EXERCISE' as const,
      duration: 25,
      order: 7,
    },

    // Unit 5: Writing Linear Equations
    {
      unitId: insertedUnits[4].id,
      slug: 'writing-equations-from-graphs',
      title: 'Writing Equations from Graphs',
      description: 'Determine equations by analyzing graphs',
      type: 'VIDEO' as const,
      youtubeId: 'bWThHW7HTsA',
      duration: 13,
      order: 1,
    },
    {
      unitId: insertedUnits[4].id,
      slug: 'writing-equations-from-tables',
      title: 'Writing Equations from Tables',
      description: 'Use patterns in tables to write equations',
      type: 'VIDEO' as const,
      youtubeId: 'U5srBqZqzbE',
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[4].id,
      slug: 'writing-equations-from-word-problems',
      title: 'Equations from Word Problems',
      description: 'Translate word problems into algebraic equations',
      type: 'VIDEO' as const,
      youtubeId: 'IHWJHbM_5zc',
      duration: 16,
      order: 3,
    },
    {
      unitId: insertedUnits[4].id,
      slug: 'direct-variation',
      title: 'Direct Variation',
      description: 'Understand and work with direct variation relationships',
      type: 'VIDEO' as const,
      youtubeId: 'AxA5NRxpmVQ',
      duration: 11,
      order: 4,
    },
    {
      unitId: insertedUnits[4].id,
      slug: 'scatter-plots-trend-lines',
      title: 'Scatter Plots & Trend Lines',
      description: 'Analyze data and create linear models',
      type: 'VIDEO' as const,
      youtubeId: 'GAmzwIR3A90',
      duration: 14,
      order: 5,
    },
    {
      unitId: insertedUnits[4].id,
      slug: 'writing-equations-practice',
      title: 'Writing Equations Practice',
      description: 'Comprehensive practice with various representations',
      type: 'EXERCISE' as const,
      duration: 22,
      order: 6,
    },

    // Unit 6: Systems of Equations
    {
      unitId: insertedUnits[5].id,
      slug: 'intro-to-systems',
      title: 'Introduction to Systems of Equations',
      description: 'Understand what systems of equations are',
      type: 'VIDEO' as const,
      youtubeId: 'FRaJv2Faass',
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[5].id,
      slug: 'solving-systems-by-graphing',
      title: 'Solving by Graphing',
      description: 'Find solutions by graphing both equations',
      type: 'VIDEO' as const,
      youtubeId: '60jOhNzV3dA',
      duration: 13,
      order: 2,
    },
    {
      unitId: insertedUnits[5].id,
      slug: 'solving-systems-by-substitution',
      title: 'Solving by Substitution',
      description: 'Substitute one equation into another',
      type: 'VIDEO' as const,
      youtubeId: 'r0zb4B7FJEw',
      duration: 15,
      order: 3,
    },
    {
      unitId: insertedUnits[5].id,
      slug: 'solving-systems-by-elimination',
      title: 'Solving by Elimination',
      description: 'Add or subtract equations to eliminate variables',
      type: 'VIDEO' as const,
      youtubeId: 'no3zEPq8RAo',
      duration: 16,
      order: 4,
    },
    {
      unitId: insertedUnits[5].id,
      slug: 'systems-word-problems',
      title: 'Systems in Word Problems',
      description: 'Apply systems to real-world scenarios',
      type: 'VIDEO' as const,
      youtubeId: 'FqOXYzx-Q6k',
      duration: 18,
      order: 5,
    },
    {
      unitId: insertedUnits[5].id,
      slug: 'special-systems',
      title: 'Special Systems (No Solution & Infinite Solutions)',
      description: 'Identify inconsistent and dependent systems',
      type: 'READING' as const,
      duration: 9,
      order: 6,
    },

    // Unit 7: Exponents & Exponential Functions
    {
      unitId: insertedUnits[6].id,
      slug: 'properties-of-exponents',
      title: 'Properties of Exponents',
      description: 'Master the rules for working with exponents',
      type: 'VIDEO' as const,
      youtubeId: 'kITJ6qH7jS0',
      duration: 14,
      order: 1,
    },
    {
      unitId: insertedUnits[6].id,
      slug: 'negative-zero-exponents',
      title: 'Negative and Zero Exponents',
      description: 'Understand special cases of exponents',
      type: 'VIDEO' as const,
      youtubeId: 'JnpqlXN9Whw',
      duration: 12,
      order: 2,
    },
    {
      unitId: insertedUnits[6].id,
      slug: 'scientific-notation',
      title: 'Scientific Notation',
      description: 'Express very large and small numbers efficiently',
      type: 'VIDEO' as const,
      youtubeId: 'i6lfVUp5RW8',
      duration: 13,
      order: 3,
    },
    {
      unitId: insertedUnits[6].id,
      slug: 'exponential-growth',
      title: 'Exponential Growth',
      description: 'Model situations with exponential growth',
      type: 'VIDEO' as const,
      youtubeId: '6WMZ7J0wwMI',
      duration: 15,
      order: 4,
    },
    {
      unitId: insertedUnits[6].id,
      slug: 'exponential-decay',
      title: 'Exponential Decay',
      description: 'Model situations with exponential decay',
      type: 'VIDEO' as const,
      youtubeId: 'xwJwLYtvO94',
      duration: 14,
      order: 5,
    },
    {
      unitId: insertedUnits[6].id,
      slug: 'graphing-exponential-functions',
      title: 'Graphing Exponential Functions',
      description: 'Visualize exponential relationships',
      type: 'VIDEO' as const,
      youtubeId: '7J2wDDH3ZjI',
      duration: 16,
      order: 6,
    },

    // Unit 8: Polynomials & Factoring
    {
      unitId: insertedUnits[7].id,
      slug: 'adding-subtracting-polynomials',
      title: 'Adding & Subtracting Polynomials',
      description: 'Combine polynomials using like terms',
      type: 'VIDEO' as const,
      youtubeId: 'U0-2jHfaao8',
      duration: 11,
      order: 1,
    },
    {
      unitId: insertedUnits[7].id,
      slug: 'multiplying-polynomials',
      title: 'Multiplying Polynomials',
      description: 'Use the distributive property with polynomials',
      type: 'VIDEO' as const,
      youtubeId: 'PgxvWSXLFZQ',
      duration: 14,
      order: 2,
    },
    {
      unitId: insertedUnits[7].id,
      slug: 'special-products',
      title: 'Special Products (Binomial Patterns)',
      description: 'Recognize and use special polynomial patterns',
      type: 'VIDEO' as const,
      youtubeId: 'UAXfgKjG-i4',
      duration: 13,
      order: 3,
    },
    {
      unitId: insertedUnits[7].id,
      slug: 'factoring-gcf',
      title: 'Factoring with GCF',
      description: 'Factor out the greatest common factor',
      type: 'VIDEO' as const,
      youtubeId: 'fH5sLqnXYYg',
      duration: 10,
      order: 4,
    },
    {
      unitId: insertedUnits[7].id,
      slug: 'factoring-trinomials',
      title: 'Factoring Trinomials',
      description: 'Factor trinomials of the form x² + bx + c',
      type: 'VIDEO' as const,
      youtubeId: 'H-YJy0UX8iw',
      duration: 16,
      order: 5,
    },
    {
      unitId: insertedUnits[7].id,
      slug: 'factoring-special-cases',
      title: 'Factoring Special Cases',
      description: 'Factor difference of squares and perfect squares',
      type: 'VIDEO' as const,
      youtubeId: 'cqWLPxPpO7A',
      duration: 15,
      order: 6,
    },
    {
      unitId: insertedUnits[7].id,
      slug: 'factoring-completely',
      title: 'Factoring Completely',
      description: 'Combine all factoring techniques',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 7,
    },

    // Unit 9: Quadratic Equations & Functions
    {
      unitId: insertedUnits[8].id,
      slug: 'intro-to-quadratics',
      title: 'Introduction to Quadratic Functions',
      description: 'Understand the shape and features of parabolas',
      type: 'VIDEO' as const,
      youtubeId: 'q0Xv0-2JpDw',
      duration: 12,
      order: 1,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'graphing-parabolas',
      title: 'Graphing Parabolas',
      description: 'Graph quadratic functions and identify key features',
      type: 'VIDEO' as const,
      youtubeId: 'taooHfbLfvA',
      duration: 15,
      order: 2,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'solving-by-factoring',
      title: 'Solving Quadratics by Factoring',
      description: 'Use factoring to solve quadratic equations',
      type: 'VIDEO' as const,
      youtubeId: 'MRO2iyLeDPk',
      duration: 14,
      order: 3,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'solving-by-square-roots',
      title: 'Solving by Taking Square Roots',
      description: 'Solve quadratics using square roots',
      type: 'VIDEO' as const,
      youtubeId: 'o5PQLUWcMcg',
      duration: 11,
      order: 4,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'completing-the-square',
      title: 'Completing the Square',
      description: 'Transform quadratics into perfect square form',
      type: 'VIDEO' as const,
      youtubeId: 'ykXxNpsczHE',
      duration: 17,
      order: 5,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'quadratic-formula',
      title: 'The Quadratic Formula',
      description: 'Use the universal quadratic formula to solve any quadratic',
      type: 'VIDEO' as const,
      youtubeId: 'zY84UGHEh78',
      duration: 16,
      order: 6,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'discriminant',
      title: 'The Discriminant',
      description: 'Predict the number and type of solutions',
      type: 'READING' as const,
      duration: 8,
      order: 7,
    },
    {
      unitId: insertedUnits[8].id,
      slug: 'quadratic-word-problems',
      title: 'Quadratic Word Problems',
      description: 'Apply quadratics to real-world problems',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 8,
    },

    // Unit 10: Radical Expressions
    {
      unitId: insertedUnits[9].id,
      slug: 'simplifying-radicals',
      title: 'Simplifying Radical Expressions',
      description: 'Simplify square roots and other radicals',
      type: 'VIDEO' as const,
      youtubeId: 'jvTwqN0-4KU',
      duration: 13,
      order: 1,
    },
    {
      unitId: insertedUnits[9].id,
      slug: 'operations-with-radicals',
      title: 'Operations with Radicals',
      description: 'Add, subtract, multiply, and divide radicals',
      type: 'VIDEO' as const,
      youtubeId: 'jcECL5Wk7NE',
      duration: 15,
      order: 2,
    },
    {
      unitId: insertedUnits[9].id,
      slug: 'rationalizing-denominators',
      title: 'Rationalizing Denominators',
      description: 'Eliminate radicals from denominators',
      type: 'VIDEO' as const,
      youtubeId: '_WfCf9Jq5A0',
      duration: 12,
      order: 3,
    },
    {
      unitId: insertedUnits[9].id,
      slug: 'solving-radical-equations',
      title: 'Solving Radical Equations',
      description: 'Solve equations containing radicals',
      type: 'VIDEO' as const,
      youtubeId: 'lfZ8xvPQiQU',
      duration: 16,
      order: 4,
    },
    {
      unitId: insertedUnits[9].id,
      slug: 'pythagorean-theorem',
      title: 'The Pythagorean Theorem',
      description: 'Apply radicals to right triangle problems',
      type: 'VIDEO' as const,
      youtubeId: 'AA6RfgP-AHU',
      duration: 14,
      order: 5,
    },
    {
      unitId: insertedUnits[9].id,
      slug: 'distance-formula',
      title: 'Distance Formula',
      description: 'Calculate distances using the coordinate plane',
      type: 'READING' as const,
      duration: 9,
      order: 6,
    },

    // Unit 11: Rational Expressions
    {
      unitId: insertedUnits[10].id,
      slug: 'simplifying-rational-expressions',
      title: 'Simplifying Rational Expressions',
      description: 'Reduce algebraic fractions to lowest terms',
      type: 'VIDEO' as const,
      youtubeId: 'vn9xqWNGOPM',
      duration: 13,
      order: 1,
    },
    {
      unitId: insertedUnits[10].id,
      slug: 'multiplying-dividing-rationals',
      title: 'Multiplying & Dividing Rational Expressions',
      description: 'Operate with algebraic fractions',
      type: 'VIDEO' as const,
      youtubeId: 'cYXb_6pprdE',
      duration: 14,
      order: 2,
    },
    {
      unitId: insertedUnits[10].id,
      slug: 'adding-subtracting-rationals',
      title: 'Adding & Subtracting Rational Expressions',
      description: 'Find common denominators for rational expressions',
      type: 'VIDEO' as const,
      youtubeId: '6fzpJjW0qqw',
      duration: 16,
      order: 3,
    },
    {
      unitId: insertedUnits[10].id,
      slug: 'complex-fractions',
      title: 'Complex Fractions',
      description: 'Simplify fractions within fractions',
      type: 'VIDEO' as const,
      youtubeId: 'fT-VoZo0fis',
      duration: 15,
      order: 4,
    },
    {
      unitId: insertedUnits[10].id,
      slug: 'solving-rational-equations',
      title: 'Solving Rational Equations',
      description: 'Solve equations containing rational expressions',
      type: 'VIDEO' as const,
      youtubeId: '8NvGC52P6uQ',
      duration: 17,
      order: 5,
    },
    {
      unitId: insertedUnits[10].id,
      slug: 'rational-word-problems',
      title: 'Work and Rate Problems',
      description: 'Apply rational equations to real-world scenarios',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 6,
    },

    // Unit 12: Data Analysis
    {
      unitId: insertedUnits[11].id,
      slug: 'measures-of-central-tendency',
      title: 'Mean, Median, Mode, and Range',
      description: 'Analyze data sets with statistical measures',
      type: 'VIDEO' as const,
      youtubeId: 'B1HEzNTGeZ4',
      duration: 12,
      order: 1,
    },
    {
      unitId: insertedUnits[11].id,
      slug: 'box-plots',
      title: 'Box-and-Whisker Plots',
      description: 'Visualize data distribution with box plots',
      type: 'VIDEO' as const,
      youtubeId: '4iN1wSKqTHw',
      duration: 13,
      order: 2,
    },
    {
      unitId: insertedUnits[11].id,
      slug: 'histograms',
      title: 'Histograms and Frequency Tables',
      description: 'Organize and display data with histograms',
      type: 'VIDEO' as const,
      youtubeId: 'gSEYtAjuZ-Y',
      duration: 11,
      order: 3,
    },
    {
      unitId: insertedUnits[11].id,
      slug: 'basic-probability',
      title: 'Introduction to Probability',
      description: 'Calculate probabilities of events',
      type: 'VIDEO' as const,
      youtubeId: 'uzkc-qNVoOk',
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[11].id,
      slug: 'compound-probability',
      title: 'Compound Probability',
      description: 'Calculate probabilities of combined events',
      type: 'VIDEO' as const,
      youtubeId: 'JCOaGqxd9as',
      duration: 16,
      order: 5,
    },
    {
      unitId: insertedUnits[11].id,
      slug: 'data-analysis-practice',
      title: 'Data Analysis Practice',
      description: 'Apply statistics to real data sets',
      type: 'EXERCISE' as const,
      duration: 18,
      order: 6,
    },

    // Unit 13: Sequences & Series
    {
      unitId: insertedUnits[12].id,
      slug: 'intro-to-sequences',
      title: 'Introduction to Sequences',
      description: 'Understand patterns and terminology of sequences',
      type: 'VIDEO' as const,
      youtubeId: 'xEfKX_byFoU',
      duration: 10,
      order: 1,
    },
    {
      unitId: insertedUnits[12].id,
      slug: 'arithmetic-sequences',
      title: 'Arithmetic Sequences',
      description: 'Work with sequences that have a common difference',
      type: 'VIDEO' as const,
      youtubeId: 'TW-3vTcGDfk',
      duration: 13,
      order: 2,
    },
    {
      unitId: insertedUnits[12].id,
      slug: 'geometric-sequences',
      title: 'Geometric Sequences',
      description: 'Work with sequences that have a common ratio',
      type: 'VIDEO' as const,
      youtubeId: 'P9iRhvJqM50',
      duration: 14,
      order: 3,
    },
    {
      unitId: insertedUnits[12].id,
      slug: 'arithmetic-series',
      title: 'Arithmetic Series',
      description: 'Find sums of arithmetic sequences',
      type: 'VIDEO' as const,
      youtubeId: 'L3VjXdsMdvk',
      duration: 15,
      order: 4,
    },
    {
      unitId: insertedUnits[12].id,
      slug: 'geometric-series',
      title: 'Geometric Series',
      description: 'Find sums of geometric sequences',
      type: 'VIDEO' as const,
      youtubeId: 'gDwPmXfAhJA',
      duration: 16,
      order: 5,
    },
    {
      unitId: insertedUnits[12].id,
      slug: 'sequences-in-real-world',
      title: 'Real-World Applications',
      description: 'Apply sequences to finance and growth problems',
      type: 'EXERCISE' as const,
      duration: 17,
      order: 6,
    },

    // Unit 14: Advanced Functions
    {
      unitId: insertedUnits[13].id,
      slug: 'function-notation',
      title: 'Function Notation and Evaluation',
      description: 'Master f(x) notation and function evaluation',
      type: 'VIDEO' as const,
      youtubeId: '52tpYl2tTqk',
      duration: 11,
      order: 1,
    },
    {
      unitId: insertedUnits[13].id,
      slug: 'domain-and-range',
      title: 'Domain and Range',
      description: 'Identify the domain and range of functions',
      type: 'VIDEO' as const,
      youtubeId: 'dqGT9b0aXV0',
      duration: 13,
      order: 2,
    },
    {
      unitId: insertedUnits[13].id,
      slug: 'transformations-of-functions',
      title: 'Transformations of Functions',
      description: 'Shift, stretch, and reflect functions',
      type: 'VIDEO' as const,
      youtubeId: '1n-9fVYHUqM',
      duration: 16,
      order: 3,
    },
    {
      unitId: insertedUnits[13].id,
      slug: 'piecewise-functions',
      title: 'Piecewise Functions',
      description: 'Work with functions defined in pieces',
      type: 'VIDEO' as const,
      youtubeId: 'YFBNq0vXLzs',
      duration: 14,
      order: 4,
    },
    {
      unitId: insertedUnits[13].id,
      slug: 'inverse-functions',
      title: 'Inverse Functions',
      description: 'Find and work with inverse functions',
      type: 'VIDEO' as const,
      youtubeId: 'bVXXs2_BDys',
      duration: 15,
      order: 5,
    },
    {
      unitId: insertedUnits[13].id,
      slug: 'composition-of-functions',
      title: 'Composition of Functions',
      description: 'Combine functions using composition',
      type: 'VIDEO' as const,
      youtubeId: 'eYruXMjYX6I',
      duration: 13,
      order: 6,
    },
    {
      unitId: insertedUnits[13].id,
      slug: 'mathematical-modeling',
      title: 'Mathematical Modeling',
      description: 'Create models for complex real-world problems',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 7,
    },
  ];

  const insertedLessons = await db.insert(lessons).values(lessonsData).returning();
  console.log(`✓ Created ${insertedLessons.length} lessons`);

  // Create quizzes for each unit
  console.log('Creating quizzes...');
  const quizData = insertedUnits.map((unit: typeof insertedUnits[0], idx) => ({
    unitId: unit.id,
    title: `${unit.title} - Unit Quiz`,
    description: `Test your understanding of ${unit.title.toLowerCase()} concepts`,
    timeLimit: 30,
    passingScore: 70,
    questions: JSON.stringify([
      {
        id: `q1-unit${idx + 1}`,
        question: `What is a key concept in ${unit.title}?`,
        type: 'multiple-choice',
        options: [
          'Understanding the fundamentals',
          'Memorizing formulas',
          'Random guessing',
          'Skipping practice',
        ],
        correctAnswer: 0,
        explanation: 'Understanding the fundamentals is essential for mastery.',
      },
      {
        id: `q2-unit${idx + 1}`,
        question: 'True or False: Practice is important for success.',
        type: 'true-false',
        correctAnswer: true,
        explanation: 'Regular practice helps solidify concepts.',
      },
    ]),
  }));

  await db.insert(quizzes).values(quizData);
  console.log(`✓ Created ${quizData.length} quizzes`);

  // Create tests (one for each unit)
  console.log('Creating tests...');
  const testData = insertedUnits.map((unit, idx) => ({
    unitId: unit.id,
    title: `${unit.title} - Comprehensive Test`,
    description: `Final assessment for ${unit.title.toLowerCase()}`,
    timeLimit: 60,
    passingScore: 75,
    questions: JSON.stringify([
      {
        id: `t1-unit${idx + 1}`,
        question: `Advanced problem related to ${unit.title}`,
        type: 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 1,
        explanation: 'Detailed explanation of the concept.',
      },
    ]),
  }));

  await db.insert(tests).values(testData);
  console.log(`✓ Created ${testData.length} tests`);

  // Create skills
  console.log('Creating skills...');
  const skillsData = [];
  for (let unit of insertedUnits) {
    skillsData.push(
      {
        unitId: unit.id,
        slug: `${unit.slug}-skill-1`,
        name: `${unit.title} - Core Skill 1`,
        description: 'Essential skill for this unit',
      },
      {
        unitId: unit.id,
        slug: `${unit.slug}-skill-2`,
        name: `${unit.title} - Core Skill 2`,
        description: 'Advanced skill for this unit',
      }
    );
  }
  await db.insert(skills).values(skillsData);
  console.log(`✓ Created ${skillsData.length} skills`);

  // Create flashcard sets (2-3 per unit)
  console.log('Creating flashcard sets...');
  const flashcardSetsData = [];
  const flashcardsData = [];

  for (let i = 0; i < insertedUnits.length; i++) {
    const unit = insertedUnits[i];
    const setId1 = crypto.randomUUID();
    const setId2 = crypto.randomUUID();

    flashcardSetsData.push(
      {
        id: setId1,
        unitId: unit.id,
        title: `${unit.title} - Key Terms`,
        description: 'Essential vocabulary and definitions',
      },
      {
        id: setId2,
        unitId: unit.id,
        title: `${unit.title} - Key Concepts`,
        description: 'Important concepts and formulas',
      }
    );

    // Add flashcards for each set
    for (let j = 1; j <= 5; j++) {
      flashcardsData.push({
        setId: setId1,
        front: `Term ${j} for ${unit.title}`,
        back: `Definition or explanation of term ${j}`,
        hint: `Think about the core concept`,
        order: j,
      });
    }

    for (let j = 1; j <= 5; j++) {
      flashcardsData.push({
        setId: setId2,
        front: `Concept ${j} for ${unit.title}`,
        back: `Explanation of concept ${j} with examples`,
        hint: `Consider how this applies`,
        order: j,
      });
    }
  }

  await db.insert(flashcardSets).values(flashcardSetsData);
  await db.insert(flashcards).values(flashcardsData);
  console.log(`✓ Created ${flashcardSetsData.length} flashcard sets with ${flashcardsData.length} flashcards`);

  // Create reviews
  console.log('Creating reviews...');
  const reviewsData = [
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'Numera has completely transformed how I learn math! The lessons are clear, and the practice problems are super helpful.',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'The interactive quizzes and flashcards make studying so much easier. I actually enjoy learning algebra now!',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 4,
      comment:
        'Great platform! The video lessons are easy to follow, and I love being able to track my progress.',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'The tutoring feature is amazing. Getting help when I need it has really boosted my confidence in math.',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'Best math learning platform I\'ve used! The dashboard motivates me to keep my streak going.',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 4,
      comment:
        'Really appreciate the clear explanations and step-by-step approach. My grades have improved significantly!',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'The Khan Academy integration is perfect. I can watch videos and practice all in one place.',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'Numera makes algebra less intimidating. The teachers are great, and the resources are top-notch.',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 4,
      comment:
        'I love the badge system and progress tracking. It makes learning feel like a game!',
      moderated: true,
    },
    {
      userId: studentUser.id,
      rating: 5,
      comment:
        'This platform has everything I need to succeed in Algebra 1. Highly recommend to all students!',
      moderated: true,
    },
  ];

  await db.insert(reviews).values(reviewsData);
  console.log(`✓ Created ${reviewsData.length} reviews`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • Users: 3 (student, teacher, admin)`);
  console.log(`   • Units: ${insertedUnits.length}`);
  console.log(`   • Lessons: ${insertedLessons.length}`);
  console.log(`   • Quizzes: ${quizData.length}`);
  console.log(`   • Tests: ${testData.length}`);
  console.log(`   • Skills: ${skillsData.length}`);
  console.log(`   • Flashcard Sets: ${flashcardSetsData.length}`);
  console.log(`   • Flashcards: ${flashcardsData.length}`);
  console.log(`   • Teachers: ${insertedTeachers.length}`);
  console.log(`   • Tutoring Slots: ${slots.length}`);
  console.log(`   • Reviews: ${reviewsData.length}`);
  console.log(`   • Badges: ${badgeData.length}`);
  console.log('\n✅ Ready to start development!');
  console.log('\nDemo Accounts:');
  console.log('   student@example.com / Passw0rd!');
  console.log('   teacher@example.com / Passw0rd!');
  console.log('   admin@example.com / Passw0rd!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

