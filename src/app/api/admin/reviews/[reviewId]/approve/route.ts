import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth()
    const { reviewId } = await params

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [updated] = await db
      .update(reviews)
      .set({
        moderated: true,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, review: updated })
  } catch (error) {
    console.error('Error approving review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


