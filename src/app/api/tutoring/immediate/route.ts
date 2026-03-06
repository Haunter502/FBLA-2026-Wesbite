import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { tutoringRequests } from "@/lib/schema"
import { z } from "zod"

const immediateHelpSchema = z.object({
  topic: z.string().min(1),
  userId: z.string(),
  progressSummary: z.object({
    overallProgress: z.number(),
    currentUnit: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      progress: z.object({
        totalLessons: z.number(),
        completedLessons: z.number(),
        percentage: z.number(),
        grade: z.number().nullable(),
      }),
    }).nullable(),
    nextLesson: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      unitTitle: z.string(),
      unitSlug: z.string(),
    }).nullable(),
    upcomingSessions: z.array(z.any()),
  }).nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { topic, userId, progressSummary } = immediateHelpSchema.parse(body)

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Store progress summary in the topic field as JSON for now
    // In a production system, you might want a separate field for this
    const topicWithSummary = progressSummary 
      ? `${topic}\n\n[PROGRESS_SUMMARY]\n${JSON.stringify(progressSummary)}`
      : topic

    const [request] = await db
      .insert(tutoringRequests)
      .values({
        userId,
        type: "IMMEDIATE",
        topic: topicWithSummary,
        status: "PENDING",
      })
      .returning()

    return NextResponse.json({ 
      requestId: request.id, 
      success: true,
    })
  } catch (error) {
    console.error("Error creating immediate help request:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

