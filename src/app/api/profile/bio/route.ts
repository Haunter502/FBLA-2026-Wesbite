import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { z } from 'zod'

const bioSchema = z.object({
  bio: z.string().max(500).nullable(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = bioSchema.parse(body)

    await db
      .update(users)
      .set({ bio: validated.bio })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating bio:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid bio' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update bio' }, { status: 500 })
  }
}


