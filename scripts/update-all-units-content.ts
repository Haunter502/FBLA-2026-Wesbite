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

// Generic lesson structure for all units
function createUnitLessons(unit: typeof schema.units.$inferSelect, unitSlug: string) {
  return [
    {
      slug: `${unitSlug}-intro-1`,
      unitId: unit.id,
      title: `Introduction to ${unit.title}`,
      description: `Learn the basics of ${unit.title.toLowerCase()}`,
      type: 'VIDEO' as const,
      youtubeId: 'DrZJKdXlZ3I', // Generic video - can be updated per unit
      duration: 6.5,
      order: 1,
    },
    {
      slug: `${unitSlug}-intro-2`,
      unitId: unit.id,
      title: `Introduction to ${unit.title}`,
      description: `Learn the basics of ${unit.title.toLowerCase()}`,
      type: 'VIDEO' as const,
      youtubeId: 'DrZJKdXlZ3I',
      duration: 6.5,
      order: 2,
    },
    {
      slug: `${unitSlug}-fundamentals`,
      unitId: unit.id,
      title: 'Fundamental Concepts',
      description: `Practice and understand the basics of ${unit.title.toLowerCase()}`,
      type: 'READING' as const,
      khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unitSlug}`,
      duration: 15,
      order: 3,
    },
    {
      slug: `${unitSlug}-worked-examples`,
      unitId: unit.id,
      title: 'Worked Examples',
      description: 'Practice applying concepts through examples',
      type: 'VIDEO' as const,
      youtubeId: '1c5HY3z4k8M',
      duration: 4,
      order: 4,
    },
    {
      slug: `${unitSlug}-advanced`,
      unitId: unit.id,
      title: 'Advanced Techniques',
      description: `Learn advanced methods for ${unit.title.toLowerCase()}`,
      type: 'VIDEO' as const,
      youtubeId: 'adPgapI',
      duration: 6,
      order: 6,
    },
    {
      slug: `${unitSlug}-applications`,
      unitId: unit.id,
      title: 'Real-World Applications',
      description: `Use ${unit.title.toLowerCase()} to solve problems in a given context and real-world problems`,
      type: 'VIDEO' as const,
      youtubeId: 'E6rn-YD_2_Q',
      duration: 4,
      order: 7,
    },
    {
      slug: `${unitSlug}-review`,
      unitId: unit.id,
      title: 'Unit Review',
      description: `Comprehensive review of ${unit.title.toLowerCase()}`,
      type: 'READING' as const,
      khanUrl: `https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:${unitSlug}`,
      duration: 15,
      order: 8,
    },
  ];
}

async function updateAllUnits() {
  console.log('🔄 Updating all units with standard lesson structure...');

  // Get all units except Linear Equations (already updated)
  const allUnits = await db
    .select()
    .from(schema.units)
    .where(eq(schema.units.slug, 'linear-equations'))
    .limit(1);

  const otherUnits = await db
    .select()
    .from(schema.units)
    .orderBy(schema.units.order);

  console.log(`📚 Found ${otherUnits.length} units to update`);

  for (const unit of otherUnits) {
    // Skip Linear Equations as it's already updated
    if (unit.slug === 'linear-equations') {
      console.log(`⏭️  Skipping ${unit.title} (already updated)`);
      continue;
    }

    console.log(`\n📝 Updating ${unit.title}...`);

    // Delete existing lessons
    await db.delete(schema.lessons).where(eq(schema.lessons.unitId, unit.id));

    // Create new lessons
    const lessons = createUnitLessons(unit, unit.slug);
    await db.insert(schema.lessons).values(lessons);
    console.log(`  ✅ Created ${lessons.length} lessons`);

    // Create Practice Problems Set 1 (generic questions)
    const practiceSet1Questions = [
      {
        id: '1',
        question: `What is a key concept in ${unit.title}?`,
        options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
        correct: 0,
        explanation: 'This is the correct answer because it represents a fundamental concept.',
      },
      {
        id: '2',
        question: `How do you solve problems in ${unit.title}?`,
        options: ['Method 1', 'Method 2', 'Method 3', 'Method 4'],
        correct: 1,
        explanation: 'Method 2 is the most effective approach for this type of problem.',
      },
      {
        id: '3',
        question: `Which formula applies to ${unit.title}?`,
        options: ['Formula A', 'Formula B', 'Formula C', 'Formula D'],
        correct: 2,
        explanation: 'Formula C is the appropriate choice for solving these problems.',
      },
      {
        id: '4',
        question: `What is the first step in ${unit.title}?`,
        options: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
        correct: 0,
        explanation: 'We start with Step 1 to establish the foundation.',
      },
    ];

    // Check if Practice Problems Set 1 exists
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
      console.log(`  ✅ Updated Practice Problems Set 1`);
    } else {
      await db.insert(schema.quizzes).values({
        unitId: unit.id,
        title: 'Practice Problems - Set 1',
        description: `Practice solving ${unit.title.toLowerCase()} problems`,
        questions: JSON.stringify(practiceSet1Questions),
        passingScore: 70,
      });
      console.log(`  ✅ Created Practice Problems Set 1`);
    }

    // Create Practice Problems Set 2
    const practiceSet2Questions = [
      {
        id: '1',
        question: `How many solutions does a typical ${unit.title} problem have?`,
        options: ['No solutions', 'Exactly one solution', 'Infinitely many solutions'],
        correct: 1,
        explanation: 'Most problems in this unit have exactly one solution.',
      },
      {
        id: '2',
        question: `What is the advanced technique in ${unit.title}?`,
        options: ['Technique A', 'Technique B', 'Technique C', 'Technique D'],
        correct: 1,
        explanation: 'Technique B is the advanced method for solving complex problems.',
      },
      {
        id: '3',
        question: `Which method is most efficient for ${unit.title}?`,
        options: ['Method A', 'Method B', 'Method C', 'Method D'],
        correct: 2,
        explanation: 'Method C provides the most efficient solution approach.',
      },
      {
        id: '4',
        question: `What is the final step in ${unit.title}?`,
        options: ['Step A', 'Step B', 'Step C', 'Step D'],
        correct: 3,
        explanation: 'Step D completes the problem-solving process.',
      },
    ];

    // Check if Practice Problems Set 2 exists
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
      console.log(`  ✅ Updated Practice Problems Set 2`);
    } else {
      await db.insert(schema.quizzes).values({
        unitId: unit.id,
        title: 'Practice Problems - Set 2',
        description: `Advanced practice with ${unit.title.toLowerCase()}`,
        questions: JSON.stringify(practiceSet2Questions),
        passingScore: 70,
      });
      console.log(`  ✅ Created Practice Problems Set 2`);
    }
  }

  console.log('\n✅ All units updated successfully!');
}

// Run the update
updateAllUnits()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

