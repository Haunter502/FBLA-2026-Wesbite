import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { progress, lessons, units, streaks, eventLogs } from '@/lib/schema';
import { eq, and } from '@/lib/drizzle-helpers';
import { z } from 'zod';

const progressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  score: z.number().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = progressSchema.parse(body);

    // Update progress
    const [updated] = await db
      .update(progress)
      .set({
        status: validated.status,
        score: validated.score,
        completedAt: validated.status === 'COMPLETED' ? new Date() : undefined,
      })
      .where(eq(progress.id, id))
      .returning();

    // If completed, update streak
    if (validated.status === 'COMPLETED') {
      const [userStreak] = await db
        .select()
        .from(streaks)
        .where(eq(streaks.userId, session.user.id));

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
        payload: { progressId: id, score: validated.score },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating progress:', error);
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

