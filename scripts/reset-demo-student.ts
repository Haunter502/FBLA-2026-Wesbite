import 'dotenv/config';
import { getDbSync } from '../src/lib/db-server';
import * as schema from '../drizzle/schema';
import { eq } from '../src/lib/drizzle-helpers';

const db = getDbSync();

async function resetDemoStudent() {
  console.log('🔄 Resetting demo student progress...');

  // Find the demo student
  const [student] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'student@example.com'))
    .limit(1);

  if (!student) {
    console.error('❌ Demo student not found!');
    process.exit(1);
  }

  console.log(`✅ Found demo student: ${student.name} (${student.email})`);

  // Delete all progress for the demo student
  const deletedProgress = await db
    .delete(schema.progress)
    .where(eq(schema.progress.userId, student.id))
    .returning();

  console.log(`✅ Deleted ${deletedProgress.length} progress entries`);

  // Reset streak to 0
  await db
    .update(schema.streaks)
    .set({
      current: 0,
      longest: 0,
    })
    .where(eq(schema.streaks.userId, student.id));

  console.log('✅ Reset streak to 0');

  console.log('🎉 Demo student progress reset complete!');
  console.log('   - All lessons: NOT_STARTED');
  console.log('   - All quizzes: NOT_STARTED');
  console.log('   - All tests: NOT_STARTED');
  console.log('   - Streak: 0');
}

resetDemoStudent()
  .catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  });

