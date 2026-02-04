import { db } from "@/lib/db";
import { streaks, eventLogs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";

/**
 * Update user streak based on activity
 * Returns the new streak count
 */
export async function updateStreak(userId: string): Promise<number> {
  try {
    // Get or create user streak
    let userStreak = await db.query.streaks.findFirst({
      where: eq(streaks.userId, userId),
    });

    if (!userStreak) {
      // Create new streak
      await db.insert(streaks).values({
        id: crypto.randomUUID(),
        userId,
        current: 1,
        longest: 1,
        lastActiveAt: new Date(),
      });
      return 1;
    }

    // Check if streak should continue or reset
    const lastActive = userStreak.lastActiveAt
      ? dayjs(userStreak.lastActiveAt)
      : dayjs().subtract(2, "days");
    const now = dayjs();
    const daysSinceActive = now.diff(lastActive, "days");

    let newCurrent = userStreak.current;

    if (daysSinceActive === 0) {
      // Same day - no change
      newCurrent = userStreak.current;
    } else if (daysSinceActive === 1) {
      // One day gap - continue streak
      newCurrent = userStreak.current + 1;
    } else {
      // More than one day gap - reset streak
      newCurrent = 1;
    }

    // Update longest if needed
    const newLongest = Math.max(newCurrent, userStreak.longest);

    // Update streak
    await db
      .update(streaks)
      .set({
        current: newCurrent,
        longest: newLongest,
        lastActiveAt: new Date(),
      })
      .where(eq(streaks.userId, userId));

    return newCurrent;
  } catch (error) {
    console.error("Error updating streak:", error);
    return 0;
  }
}

/**
 * Get user's current streak info
 */
export async function getUserStreak(userId: string) {
  try {
    const userStreak = await db.query.streaks.findFirst({
      where: eq(streaks.userId, userId),
    });

    return (
      userStreak || {
        current: 0,
        longest: 0,
        lastActiveAt: null,
      }
    );
  } catch (error) {
    console.error("Error getting user streak:", error);
    return {
      current: 0,
      longest: 0,
      lastActiveAt: null,
    };
  }
}

/**
 * Log a learning event (used for analytics and streak tracking)
 */
export async function logEvent(
  userId: string,
  type: string,
  payload: Record<string, any>
) {
  try {
    // Log the event
    await db.insert(eventLogs).values({
      id: crypto.randomUUID(),
      userId,
      type,
      payload: JSON.stringify(payload),
      createdAt: new Date(),
    });

    // Update streak on lesson completion or quiz pass
    if (type === "lesson_completed" || type === "quiz_passed") {
      await updateStreak(userId);
    }

    return true;
  } catch (error) {
    console.error("Error logging event:", error);
    return false;
  }
}

/**
 * Get streak milestone badges
 * Returns list of badges earned based on current streak
 */
export function getStreakMilestones(current: number): string[] {
  const milestones: string[] = [];

  if (current >= 1) milestones.push("starter");
  if (current >= 3) milestones.push("consistent");
  if (current >= 7) milestones.push("week-warrior");
  if (current >= 14) milestones.push("fortnight-hero");
  if (current >= 30) milestones.push("monthly-champion");

  return milestones;
}

