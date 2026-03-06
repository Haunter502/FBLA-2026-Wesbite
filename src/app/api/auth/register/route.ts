import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, streaks } from "@/lib/schema"
import { hash } from "bcryptjs"
import { z } from "zod"
import { eq } from "@/lib/drizzle-helpers"

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
      })
      .returning()

    // Create initial streak
    await db.insert(streaks).values({
      userId: user.id,
      current: 0,
      longest: 0,
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
