import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { progress, lessons, units, streaks, eventLogs } from '@/lib/schema';
import { eq, and } from '@/lib/drizzle-helpers';
import { z } from 'zod';
import { checkAndAwardBadges } from '@/lib/badges';

const progressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    const { lessonId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = progressSchema.parse(body);

    // Get lesson to find unitId
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if progress already exists
    const [existingProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, session.user.id),
          eq(progress.lessonId, lessonId)
        )
      )
      .limit(1);

    let progressEntry;
    if (existingProgress) {
      // Update existing progress
      [progressEntry] = await db
        .update(progress)
        .set({
          status: validated.status,
          completedAt: validated.status === 'COMPLETED' ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(progress.id, existingProgress.id))
        .returning();
    } else {
      // Create new progress
      [progressEntry] = await db
        .insert(progress)
        .values({
          userId: session.user.id,
          unitId: lesson.unitId,
          lessonId: lessonId,
          status: validated.status,
          completedAt: validated.status === 'COMPLETED' ? new Date() : undefined,
        })
        .returning();
    }

    // If completed, update streak
    if (validated.status === 'COMPLETED') {
      const [userStreak] = await db
        .select()
        .from(streaks)
        .where(eq(streaks.userId, session.user.id))
        .limit(1);

      if (userStreak) {
        const now = new Date();
        const lastActive = userStreak.lastActiveAt ? new Date(userStreak.lastActiveAt) : new Date(0);
        const daysSinceLastActive = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newCurrent = userStreak.current;
        if (daysSinceLastActive === 0) {
          // Same day, don't increment
          newCurrent = userStreak.current;
        } else if (daysSinceLastActive === 1) {
          // Next day, increment
          newCurrent = userStreak.current + 1;
        } else {
          // Streak broken, reset to 1
          newCurrent = 1;
        }

        const newLongest = Math.max(newCurrent, userStreak.longest);

        await db
          .update(streaks)
          .set({
            current: newCurrent,
            longest: newLongest,
            lastActiveAt: now,
          })
          .where(eq(streaks.id, userStreak.id));
      } else {
        // Create streak if doesn't exist
        await db.insert(streaks).values({
          userId: session.user.id,
          current: 1,
          longest: 1,
          lastActiveAt: new Date(),
        });
      }

      // Log event
      await db.insert(eventLogs).values({
        userId: session.user.id,
        type: 'lesson_completed',
        payload: { progressId: progressEntry.id, lessonId },
      });

      // Check and award badges
      await checkAndAwardBadges(session.user.id);
    }

    return NextResponse.json(progressEntry);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

