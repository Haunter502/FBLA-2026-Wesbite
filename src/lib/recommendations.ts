import { db } from './db';
import { progress, lessons, units } from '../../drizzle/schema';
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
    .filter(p => p.lessonId)
    .map(p => p.lessonId);

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
      lesson => !completedLessonIds.includes(lesson.id)
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
    allUnits.map(async (unit) => {
      const unitLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.unitId, unit.id));

      const completed = await db
        .select()
        .from(progress)
        .where(and(
          eq(progress.userId, userId),
          eq(progress.unitId, unit.id),
          eq(progress.status, 'COMPLETED')
        ));

      return {
        unit,
        totalLessons: unitLessons.length,
        completedLessons: completed.filter(p => p.lessonId).length,
        percentage: unitLessons.length > 0 
          ? Math.round((completed.filter(p => p.lessonId).length / unitLessons.length) * 100)
          : 0,
      };
    })
  );

  return progressByUnit;
}
