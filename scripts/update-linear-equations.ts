/**
 * Update Linear Equations & Inequalities Unit
 * 
 * This script updates the Linear Equations & Inequalities unit with specific
 * lessons and practice problem quizzes.
 */

import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from '../drizzle/schema';
import { eq } from '../src/lib/drizzle-helpers';

const db = getDbSync();

async function updateLinearEquationsUnit() {
  console.log('🔄 Updating Linear Equations & Inequalities unit...');

  // Find the unit
  const [unit] = await db
    .select()
    .from(schema.units)
    .where(eq(schema.units.slug, 'linear-equations'))
    .limit(1);

  if (!unit) {
    throw new Error('Linear Equations & Inequalities unit not found');
  }

  console.log(`✅ Found unit: ${unit.title}`);

  // Delete existing lessons for this unit
  const existingLessons = await db
    .select()
    .from(schema.lessons)
    .where(eq(schema.lessons.unitId, unit.id));

  if (existingLessons.length > 0) {
    await db.delete(schema.lessons).where(eq(schema.lessons.unitId, unit.id));
    console.log(`🗑️  Deleted ${existingLessons.length} existing lessons`);
  }

  // Create new lessons
  const lessonsData = [
    {
      slug: 'linear-equations-intro',
      unitId: unit.id,
      title: 'Introduction to Linear Equations & Inequalities',
      description: 'Learn the basics of linear equations',
      type: 'VIDEO' as const,
      youtubeId: 'DrZJKdXlZ3I',
      duration: 7, // 6.5 minutes rounded
      order: 1,
    },
    {
      slug: 'linear-equations-fundamentals',
      unitId: unit.id,
      title: 'Fundamental Concepts',
      description: 'Practice and understand the basics of linear equations',
      type: 'READING' as const,
      duration: 15,
      order: 2,
    },
    {
      slug: 'linear-equations-examples',
      unitId: unit.id,
      title: 'Worked Examples',
      description: 'Practice applying concepts through examples',
      type: 'VIDEO' as const,
      youtubeId: '1c5HY3z4k8M',
      duration: 4,
      order: 3,
    },
    {
      slug: 'linear-equations-practice-1',
      unitId: unit.id,
      title: 'Practice Problems - Set 1',
      description: 'Practice solving linear equations with distributive property and multi-step problems',
      type: 'EXERCISE' as const,
      duration: 20,
      order: 4,
    },
    {
      slug: 'linear-equations-advanced',
      unitId: unit.id,
      title: 'Advanced Techniques',
      description: 'Learn how to solve linear equations with unknown coefficients',
      type: 'VIDEO' as const,
      youtubeId: 'adPgapI-h3g',
      duration: 6,
      order: 5,
    },
    {
      slug: 'linear-equations-practice-2',
      unitId: unit.id,
      title: 'Practice Problems - Set 2',
      description: 'Advanced practice with equations involving unknown coefficients and multiple solution cases',
      type: 'EXERCISE' as const,
      duration: 25,
      order: 6,
    },
    {
      slug: 'linear-equations-applications',
      unitId: unit.id,
      title: 'Real-World Applications',
      description: 'To use inequalities to solve problems in a given context and real-world problems',
      type: 'VIDEO' as const,
      youtubeId: 'E6rn-YD_2_Q',
      duration: 4,
      order: 7,
    },
    {
      slug: 'linear-equations-review',
      unitId: unit.id,
      title: 'Unit Review',
      description: 'Practice and understand the basics of linear equations',
      type: 'READING' as const,
      duration: 15,
      order: 8,
    },
  ];

  const insertedLessons = await db.insert(schema.lessons).values(lessonsData).returning();
  console.log(`✅ Created ${insertedLessons.length} lessons`);

  // Delete existing quizzes for this unit (we'll recreate practice problem quizzes but they won't show in assessments)
  const existingQuizzes = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.unitId, unit.id));

  // Delete practice problem quizzes (they'll be recreated but only accessible via lessons)
  const practiceQuizzes = existingQuizzes.filter((q: typeof schema.quizzes.$inferSelect) => 
    q.title.includes('Practice Problems')
  );

  if (practiceQuizzes.length > 0) {
    for (const quiz of practiceQuizzes) {
      await db.delete(schema.quizzes).where(eq(schema.quizzes.id, quiz.id));
    }
  }

  // Create Practice Problems Set 1 quiz (for lesson linking, not assessments)
  const practiceSet1Questions = [
    {
      id: 1,
      question: 'What is the solution to 2(5 − d) = 2 − 4d?',
      options: ['d = −4', 'd = −2', 'd = 2', 'd = 4'],
      correctAnswer: 0,
      explanation: 'Distribute 2 → 10 − 2d = 2 − 4d. Add 4d to both sides → 10 + 2d = 2. Subtract 10 → 2d = −8. Divide by 2 → d = −4.',
    },
    {
      id: 2,
      question: 'What is the solution to 8(10 − k) = 2k?',
      options: ['k = 4', 'k = 6', 'k = 8', 'k = 10'],
      correctAnswer: 2,
      explanation: 'Distribute 8 → 80 − 8k = 2k. Add 8k to both sides → 80 = 10k. Divide by 10 → k = 8.',
    },
    {
      id: 3,
      question: 'What is the solution to 0.5(7d + 4) = 7 − 1.5d?',
      options: ['d = 1', 'd = 2', 'd = 3', 'd = 4'],
      correctAnswer: 0,
      explanation: 'Distribute 0.5 → 3.5d + 2 = 7 − 1.5d. Add 1.5d to both sides → 5d + 2 = 7. Subtract 2 → 5d = 5. Divide by 5 → d = 1.',
    },
    {
      id: 4,
      question: 'How can we get Equation B from Equation A? A: 3(x + 2) = 18 B: 3x + 6 = 18',
      options: [
        'A) Multiply/divide both sides by the same non-zero constant',
        'B) Multiply/divide only one side by a non-zero constant',
        'C) Rewrite one side (or both) by combining like terms',
        'D) Rewrite one side (or both) using the distributive property',
      ],
      correctAnswer: 3,
      explanation: 'We used the distributive property to expand 3(x + 2) into 3x + 6.',
    },
  ];

  const practiceSet1 = {
    unitId: unit.id,
    title: 'Practice Problems - Set 1',
    description: 'Practice solving linear equations with distributive property and multi-step problems',
    timeLimit: 20,
    passingScore: 70,
    questions: practiceSet1Questions,
  };

  // Create Practice Problems Set 2 quiz (for lesson linking, not assessments)
  const practiceSet2Questions = [
    {
      id: 1,
      question: 'How many solutions does −6y + 13 + 9y = 8y − 3 have?',
      options: ['No solutions', 'Exactly one solution', 'Infinitely many solutions'],
      correctAnswer: 1,
      explanation: 'Combine like terms → 3y + 13 = 8y − 3. Subtract 8y → −5y + 13 = −3. Subtract 13 → −5y = −16. Divide by −5 → y = 16/5. One unique value means exactly one solution.',
    },
    {
      id: 2,
      question: 'What is the solution to −px + r = −8x − 2?',
      options: [
        'x = (r + 2)/(p − 8)',
        'x = (r − 2)/(p − 8)',
        'x = (r + 2)/(8 − p)',
        'x = (r − 2)/(8 − p)',
      ],
      correctAnswer: 0,
      explanation: 'Add px to both sides → r = x(p − 8) − 2. Add 2 → r + 2 = x(p − 8). Divide by (p − 8) → x = (r + 2)/(p − 8).',
    },
    {
      id: 3,
      question: 'What is the solution to v(j + y) = 61y + 82?',
      options: [
        'y = (82 − vj)/(v − 61)',
        'y = (vj − 82)/(v − 61)',
        'y = (vj + 82)/(v − 61)',
        'y = (82 − vj)/(61 − v)',
      ],
      correctAnswer: 0,
      explanation: 'Distribute v → vj + vy = 61y + 82. Subtract 61y → vj + (v − 61)y = 82. Subtract vj → (v − 61)y = 82 − vj. Divide by (v − 61) → y = (82 − vj)/(v − 61).',
    },
    {
      id: 4,
      question: 'What is the solution to 9f = (1/2)(12f − 2)?',
      options: ['f = 1/6', 'f = 1/3', 'f = 2/3', 'f = 3/2'],
      correctAnswer: 1,
      explanation: 'Multiply both sides by 2 → 18f = 12f − 2. Subtract 12f → 6f = −2. Divide by 6 → f = 1/3.',
    },
  ];

  const practiceSet2 = {
    unitId: unit.id,
    title: 'Practice Problems - Set 2',
    description: 'Advanced practice with equations involving unknown coefficients and multiple solution cases',
    timeLimit: 25,
    passingScore: 70,
    questions: practiceSet2Questions,
  };

  const insertedQuizzes = await db.insert(schema.quizzes).values([practiceSet1, practiceSet2]).returning();
  console.log(`✅ Created ${insertedQuizzes.length} practice problem quizzes (linked to lessons only)`);

  // Link practice problem lessons to their quizzes
  const practice1Lesson = insertedLessons.find((l: typeof schema.lessons.$inferSelect) => l.slug === 'linear-equations-practice-1');
  const practice2Lesson = insertedLessons.find((l: typeof schema.lessons.$inferSelect) => l.slug === 'linear-equations-practice-2');

  if (practice1Lesson && insertedQuizzes[0]) {
    await db
      .update(schema.lessons)
      .set({
        khanUrl: `/quizzes/${insertedQuizzes[0].id}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.lessons.id, practice1Lesson.id));
    console.log(`✅ Linked "Practice Problems - Set 1" lesson to quiz`);
  }

  if (practice2Lesson && insertedQuizzes[1]) {
    await db
      .update(schema.lessons)
      .set({
        khanUrl: `/quizzes/${insertedQuizzes[1].id}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.lessons.id, practice2Lesson.id));
    console.log(`✅ Linked "Practice Problems - Set 2" lesson to quiz`);
  }

  // Create study guides for reading lessons with PDF links
  const existingStudyGuides = await db
    .select()
    .from(schema.studyGuides)
    .where(eq(schema.studyGuides.unitId, unit.id));

  // Delete existing study guides for this unit if they exist
  if (existingStudyGuides.length > 0) {
    await db.delete(schema.studyGuides).where(eq(schema.studyGuides.unitId, unit.id));
    console.log(`🗑️  Deleted ${existingStudyGuides.length} existing study guides`);
  }

  // Find the reading lessons to link PDFs
  const fundamentalsLesson = insertedLessons.find((l: typeof schema.lessons.$inferSelect) => l.slug === 'linear-equations-fundamentals');
  const reviewLesson = insertedLessons.find((l: typeof schema.lessons.$inferSelect) => l.slug === 'linear-equations-review');

  const studyGuidesData = [];

  if (fundamentalsLesson) {
    studyGuidesData.push({
      unitId: unit.id,
      title: 'Fundamental Concepts - Linear Equations',
      description: 'Practice and understand the basics of linear equations',
      content: `
        <h2>Fundamental Concepts of Linear Equations</h2>
        <h3>What is a Linear Equation?</h3>
        <p>A linear equation is an equation where the highest power of the variable is 1. The general form is:</p>
        <p><strong>ax + b = 0</strong></p>
        <p>where <em>a</em> and <em>b</em> are constants and <em>a ≠ 0</em>.</p>
        
        <h3>Key Concepts</h3>
        <ul>
          <li><strong>Solution:</strong> The value(s) of the variable that make the equation true</li>
          <li><strong>One Solution:</strong> Most linear equations have exactly one solution</li>
          <li><strong>No Solution:</strong> When the equation simplifies to a false statement (e.g., 5 = 3)</li>
          <li><strong>Infinitely Many Solutions:</strong> When the equation simplifies to a true statement for all values (e.g., 5 = 5)</li>
        </ul>
        
        <h3>Solving Linear Equations</h3>
        <p>The goal is to isolate the variable on one side of the equation. Use inverse operations:</p>
        <ul>
          <li>Addition ↔ Subtraction</li>
          <li>Multiplication ↔ Division</li>
        </ul>
        
        <h3>Example</h3>
        <p>Solve: 3x + 5 = 14</p>
        <p>Step 1: Subtract 5 from both sides → 3x = 9</p>
        <p>Step 2: Divide both sides by 3 → x = 3</p>
        <p><strong>Solution: x = 3</strong></p>
      `,
      fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/One-Step%20Equations.pdf',
    });
  }

  if (reviewLesson) {
    studyGuidesData.push({
      unitId: unit.id,
      title: 'Linear Equations & Inequalities - Unit Review',
      description: 'Comprehensive review of all concepts in this unit',
      content: `
        <h2>Linear Equations & Inequalities - Unit Review</h2>
        
        <h3>1. Solving One-Step Equations</h3>
        <p>Use inverse operations to isolate the variable.</p>
        <p><strong>Example:</strong> x + 7 = 12 → x = 5</p>
        
        <h3>2. Solving Multi-Step Equations</h3>
        <p>Follow these steps:</p>
        <ol>
          <li>Simplify both sides (distribute, combine like terms)</li>
          <li>Move variable terms to one side</li>
          <li>Move constant terms to the other side</li>
          <li>Divide by the coefficient</li>
        </ol>
        <p><strong>Example:</strong> 2(x + 3) = 10 → 2x + 6 = 10 → 2x = 4 → x = 2</p>
        
        <h3>3. Equations with Variables on Both Sides</h3>
        <p>Collect like terms on one side before solving.</p>
        <p><strong>Example:</strong> 3x + 5 = 2x + 8 → x = 3</p>
        
        <h3>4. Equations with Unknown Coefficients</h3>
        <p>Solve for the variable in terms of the parameters.</p>
        <p><strong>Example:</strong> ax + b = c → x = (c - b)/a</p>
        
        <h3>5. Linear Inequalities</h3>
        <p>Similar to equations, but remember:</p>
        <ul>
          <li>When multiplying or dividing by a negative number, flip the inequality sign</li>
          <li>Graph solutions on a number line</li>
        </ul>
        
        <h3>6. Real-World Applications</h3>
        <p>Translate word problems into equations:</p>
        <ul>
          <li>Identify the variable</li>
          <li>Write an equation based on the problem</li>
          <li>Solve the equation</li>
          <li>Check your answer in the context of the problem</li>
        </ul>
        
        <h3>Practice Problems</h3>
        <p>Complete the practice problem sets to reinforce these concepts!</p>
      `,
      fileUrl: 'https://www.kutasoftware.com/FreeWorksheets/Alg1Worksheets/Multi-Step%20Equations.pdf',
    });
  }

  if (studyGuidesData.length > 0) {
    const insertedStudyGuides = await db.insert(schema.studyGuides).values(studyGuidesData).returning();
    console.log(`✅ Created ${insertedStudyGuides.length} study guides with PDF links`);
    
    // Update reading lessons to link to study guides via khanUrl
    if (fundamentalsLesson && insertedStudyGuides[0]) {
      await db
        .update(schema.lessons)
        .set({
          khanUrl: `/resources/study-guides/${insertedStudyGuides[0].id}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.lessons.id, fundamentalsLesson.id));
      console.log(`✅ Linked "Fundamental Concepts" lesson to study guide`);
    }
    
    if (reviewLesson && insertedStudyGuides[1]) {
      await db
        .update(schema.lessons)
        .set({
          khanUrl: `/resources/study-guides/${insertedStudyGuides[1].id}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.lessons.id, reviewLesson.id));
      console.log(`✅ Linked "Unit Review" lesson to study guide`);
    }
  }

  console.log('✅ Successfully updated Linear Equations & Inequalities unit!');
  console.log(`   - ${insertedLessons.length} lessons (including 2 practice problem lessons)`);
  console.log(`   - ${insertedQuizzes.length} practice problem quizzes (linked to lessons, hidden from assessments)`);
  console.log(`   - ${studyGuidesData.length} study guides with PDFs`);
}

// Run the update
updateLinearEquationsUnit()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error updating unit:', error);
    process.exit(1);
  });

