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
  const quizzesData = insertedUnits.map((unit) => ({
    unitId: unit.id,
    title: `${unit.title} Quiz`,
    description: `Test your understanding of ${unit.title.toLowerCase()}.`,
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        id: 1,
        question: 'What is the main concept in this unit?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is the correct answer because...',
      },
      {
        id: 2,
        question: 'How do you solve this type of problem?',
        options: ['Method 1', 'Method 2', 'Method 3', 'Method 4'],
        correctAnswer: 1,
        explanation: 'Method 2 is correct because...',
      },
      {
        id: 3,
        question: 'Which formula applies here?',
        options: ['Formula A', 'Formula B', 'Formula C', 'Formula D'],
        correctAnswer: 2,
        explanation: 'Formula C is the appropriate choice...',
      },
      {
        id: 4,
        question: 'What is the first step?',
        options: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
        correctAnswer: 0,
        explanation: 'We start with Step 1...',
      },
      {
        id: 5,
        question: 'Which answer is equivalent?',
        options: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
        correctAnswer: 3,
        explanation: 'Answer D is equivalent because...',
      },
    ],
  }));

  const existingQuizzes = await db.select().from(schema.quizzes);
  if (existingQuizzes.length === 0) {
    await db.insert(schema.quizzes).values(quizzesData);
    console.log('✅ Created quizzes for all units');
  } else {
    console.log('✅ Quizzes already exist');
  }

  // Create tests for each unit
  const testsData = insertedUnits.map((unit) => ({
    unitId: unit.id,
    title: `${unit.title} Test`,
    description: `Comprehensive assessment of ${unit.title.toLowerCase()}.`,
    timeLimit: 60,
    passingScore: 75,
    questions: [
      ...Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        question: `Test question ${i + 1} about ${unit.title}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: i % 4,
        explanation: `Explanation for question ${i + 1}...`,
      })),
    ],
  }));

  const existingTests = await db.select().from(schema.tests);
  if (existingTests.length === 0) {
    await db.insert(schema.tests).values(testsData);
    console.log('✅ Created tests for all units');
  } else {
    console.log('✅ Tests already exist');
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

