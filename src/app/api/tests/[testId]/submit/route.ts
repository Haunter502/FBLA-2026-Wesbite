import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tests, progress } from "../../../../../../drizzle/schema"
import { eq, and } from "@/lib/drizzle-helpers"
import { z } from "zod"

const submitSchema = z.object({
  answers: z.record(z.number(), z.number()),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth()
    const { testId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = submitSchema.parse(body)

    // Get test to find unitId
    const [test] = await db.select().from(tests).where(eq(tests.id, testId)).limit(1)

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if progress already exists
    const [existingProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, session.user.id),
          eq(progress.testId, testId)
        )
      )
      .limit(1)

    if (existingProgress) {
      // Update existing progress
      const [updated] = await db
        .update(progress)
        .set({
          status: validated.passed ? "COMPLETED" : "IN_PROGRESS",
          score: validated.score,
          completedAt: validated.passed ? new Date() : undefined,
        })
        .where(eq(progress.id, existingProgress.id))
        .returning()
    } else {
      // Create new progress
      const [newProgress] = await db.insert(progress).values({
        userId: session.user.id,
        unitId: test.unitId || null,
        testId: testId,
        status: validated.passed ? "COMPLETED" : "IN_PROGRESS",
        score: validated.score,
        completedAt: validated.passed ? new Date() : undefined,
      }).returning()
    }

    return NextResponse.json({ success: true, score: validated.score, passed: validated.passed })
  } catch (error) {
    console.error("Error submitting test:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

