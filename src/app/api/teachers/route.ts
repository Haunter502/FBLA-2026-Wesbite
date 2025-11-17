import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teachers } from "@/lib/schema"
import { asc } from "@/lib/drizzle-helpers"

export async function GET() {
  try {
    const teachersList = await db.select().from(teachers).orderBy(asc(teachers.name))
    return NextResponse.json({ teachers: teachersList })
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json({ teachers: [] }, { status: 500 })
  }
}

