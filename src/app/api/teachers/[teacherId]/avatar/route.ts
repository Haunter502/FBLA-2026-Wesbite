import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { teachers } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Only TEACHER or ADMIN can update any teacher's avatar */
async function requireTeacherOrAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const role = session.user.role
  if (role !== 'TEACHER' && role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Only teachers and admins can update teacher avatars' }, { status: 403 }) }
  }
  return { session }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const authResult = await requireTeacherOrAdmin()
    if ('error' in authResult) return authResult.error

    const { teacherId } = await params
    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
    }

    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 5MB' }, { status: 400 })
    }

    const [teacher] = await db
      .select({ id: teachers.id, avatar: teachers.avatar })
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1)

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    let bytes: ArrayBuffer
    try {
      bytes = await file.arrayBuffer()
    } catch {
      return NextResponse.json({ error: 'Failed to read file' }, { status: 400 })
    }

    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${teacherId}-${Date.now()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'teachers')

    if (!existsSync(uploadDir)) {
      try {
        mkdirSync(uploadDir, { recursive: true })
      } catch (err) {
        console.error('Error creating teacher upload directory:', err)
        return NextResponse.json(
          { error: 'Server could not create upload folder.' },
          { status: 500 }
        )
      }
    }

    const filepath = join(uploadDir, filename)
    try {
      await writeFile(filepath, buffer)
    } catch (err) {
      console.error('Error writing teacher avatar:', err)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    const avatarUrl = `/uploads/teachers/${filename}`
    await db
      .update(teachers)
      .set({ avatar: avatarUrl })
      .where(eq(teachers.id, teacherId))

    if (teacher.avatar && teacher.avatar.startsWith('/uploads/teachers/')) {
      const oldPath = join(process.cwd(), 'public', teacher.avatar)
      if (existsSync(oldPath)) {
        try {
          await unlink(oldPath)
        } catch (e) {
          console.error('Error deleting old teacher avatar:', e)
        }
      }
    }

    return NextResponse.json({ avatarUrl })
  } catch (error) {
    console.error('Error uploading teacher avatar:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const authResult = await requireTeacherOrAdmin()
    if ('error' in authResult) return authResult.error

    const { teacherId } = await params
    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 })
    }

    const [teacher] = await db
      .select({ avatar: teachers.avatar })
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1)

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    if (teacher.avatar && teacher.avatar.startsWith('/uploads/teachers/')) {
      const filePath = join(process.cwd(), 'public', teacher.avatar)
      if (existsSync(filePath)) {
        try {
          await unlink(filePath)
        } catch (e) {
          console.error('Error deleting teacher avatar file:', e)
        }
      }
    }

    await db
      .update(teachers)
      .set({ avatar: null })
      .where(eq(teachers.id, teacherId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing teacher avatar:', error)
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}
