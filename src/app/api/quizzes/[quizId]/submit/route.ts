import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { quizzes, progress } from "../../../../../../drizzle/schema"
import { eq, and } from "@/lib/drizzle-helpers"
import { z } from "zod"

const submitSchema = z.object({
  answers: z.record(z.number(), z.number()),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth()
    const { quizId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = submitSchema.parse(body)

    // Get quiz to find unitId
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Check if progress already exists
    const [existingProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, session.user.id),
          eq(progress.quizId, quizId)
        )
      )
      .limit(1)
    
    console.log('Quiz unitId:', quiz.unitId)
    console.log('Existing progress:', existingProgress ? 'found' : 'not found')

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
        unitId: quiz.unitId || null,
        quizId: quizId,
        status: validated.passed ? "COMPLETED" : "IN_PROGRESS",
        score: validated.score,
        completedAt: validated.passed ? new Date() : undefined,
      }).returning()
    }

    return NextResponse.json({ success: true, score: validated.score, passed: validated.passed })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

