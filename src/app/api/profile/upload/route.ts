import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from '@/lib/drizzle-helpers'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 5MB' }, { status: 400 })
    }

    // Get user's current image to delete later
    const [currentUser] = await db
      .select({ image: users.image })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Update user's image in database
    const imageUrl = `/uploads/profiles/${filename}`
    await db
      .update(users)
      .set({ image: imageUrl })
      .where(eq(users.id, session.user.id))

    // Delete old image if it exists
    if (currentUser?.image && currentUser.image.startsWith('/uploads/profiles/')) {
      const oldFilePath = join(process.cwd(), 'public', currentUser.image)
      if (existsSync(oldFilePath)) {
        try {
          await unlink(oldFilePath)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current image
    const [currentUser] = await db
      .select({ image: users.image })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    // Delete image file if it exists
    if (currentUser?.image && currentUser.image.startsWith('/uploads/profiles/')) {
      const filePath = join(process.cwd(), 'public', currentUser.image)
      if (existsSync(filePath)) {
        try {
          await unlink(filePath)
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }
    }

    // Update user's image to null
    await db
      .update(users)
      .set({ image: null })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing image:', error)
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}


