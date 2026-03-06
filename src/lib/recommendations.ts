import { db } from './db';
import { progress, lessons, units, quizzes, tests } from '@/lib/schema';
import { eq, and, isNull, asc } from '@/lib/drizzle-helpers';

export async function getNextBestLesson(userId: string) {
  // Get all lesson progress for the user
  const userProgress = await db
    .select()
    .from(progress)
    .where(and(
      eq(progress.userId, userId),
      eq(progress.status, 'COMPLETED')
    ));

  const completedLessonIds = userProgress
    .filter((p: typeof userProgress[0]) => p.lessonId)
    .map((p: typeof userProgress[0]) => p.lessonId);

  // Find the first unit that's not fully completed
  const allUnits = await db.select().from(units).orderBy(asc(units.order));

  for (const unit of allUnits) {
    const unitLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(asc(lessons.order));

    // Find first incomplete lesson in this unit
    const nextLesson = unitLessons.find(
      (lesson: typeof unitLessons[0]) => !completedLessonIds.includes(lesson.id)
    );

    if (nextLesson) {
      return {
        lesson: nextLesson,
        unit: unit,
      };
    }
  }

  // All lessons completed - return null or first lesson
  if (allUnits.length > 0) {
    const firstUnit = allUnits[0];
    const firstLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.unitId, firstUnit.id))
      .orderBy(asc(lessons.order))
      .limit(1);

    if (firstLessons.length > 0) {
      return {
        lesson: firstLessons[0],
        unit: firstUnit,
      };
    }
  }

  return null;
}

export async function getUserProgressByUnit(userId: string) {
  const allUnits = await db.select().from(units).orderBy(asc(units.order));
  
  const progressByUnit = await Promise.all(
    allUnits.map(async (unit: typeof allUnits[0]) => {
      const [unitLessons, unitQuizzes, unitTests] = await Promise.all([
        db.select().from(lessons).where(eq(lessons.unitId, unit.id)),
        db.select().from(quizzes).where(eq(quizzes.unitId, unit.id)),
        db.select().from(tests).where(eq(tests.unitId, unit.id)),
      ]);

      // Get all progress for this user, then filter for this unit
      // This ensures we catch progress even if unitId wasn't set
      const allUserProgress = await db
        .select()
        .from(progress)
        .where(eq(progress.userId, userId))

      // Get IDs of quizzes and tests in this unit
      const unitQuizIds = new Set(unitQuizzes.map((q: typeof unitQuizzes[0]) => q.id))
      const unitTestIds = new Set(unitTests.map((t: typeof unitTests[0]) => t.id))
      const unitLessonIds = new Set(unitLessons.map((l: typeof unitLessons[0]) => l.id))

      // Filter to only include progress for this unit's content
      const uniqueProgress = allUserProgress.filter((p: typeof allUserProgress[0]) => 
        p.unitId === unit.id || 
        (p.quizId && unitQuizIds.has(p.quizId)) ||
        (p.testId && unitTestIds.has(p.testId)) ||
        (p.lessonId && unitLessonIds.has(p.lessonId))
      )

      const completed = uniqueProgress.filter((p: typeof uniqueProgress[0]) => p.status === 'COMPLETED');

      // Calculate unit grade from quiz and test scores
      const quizScores: number[] = []
      const testScores: number[] = []
      
      unitQuizzes.forEach((quiz: typeof unitQuizzes[0]) => {
        const quizProgress = uniqueProgress.find((p: typeof uniqueProgress[0]) => p.quizId === quiz.id && p.score !== null)
        if (quizProgress?.score !== null && quizProgress?.score !== undefined) {
          quizScores.push(quizProgress.score)
        }
      })
      
      unitTests.forEach((test: typeof unitTests[0]) => {
        const testProgress = uniqueProgress.find((p: typeof uniqueProgress[0]) => p.testId === test.id && p.score !== null)
        if (testProgress?.score !== null && testProgress?.score !== undefined) {
          testScores.push(testProgress.score)
        }
      })

      // Calculate average grade (weighted: tests count 2x quizzes)
      let unitGrade: number | null = null
      if (quizScores.length > 0 || testScores.length > 0) {
        const totalQuizPoints = quizScores.reduce((sum, score) => sum + score, 0)
        const totalTestPoints = testScores.reduce((sum, score) => sum + score, 0)
        const totalWeight = quizScores.length + (testScores.length * 2)
        const totalPoints = totalQuizPoints + (totalTestPoints * 2)
        unitGrade = totalWeight > 0 ? Math.round(totalPoints / totalWeight) : null
      }

      return {
        unit,
        totalLessons: unitLessons.length,
        completedLessons: completed.filter((p: typeof completed[0]) => p.lessonId).length,
        percentage: unitLessons.length > 0 
          ? Math.round((completed.filter((p: typeof completed[0]) => p.lessonId).length / unitLessons.length) * 100)
          : 0,
        grade: unitGrade,
      };
    })
  );

  return progressByUnit;
}
