import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teachers } from '@/lib/schema'

export async function GET() {
  try {
    const allTeachers = await db
      .select({
        id: teachers.id,
        name: teachers.name,
        email: teachers.email,
        bio: teachers.bio,
        officeHours: teachers.officeHours,
      })
      .from(teachers)
      .orderBy(teachers.name)

    return NextResponse.json({ teachers: allTeachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

