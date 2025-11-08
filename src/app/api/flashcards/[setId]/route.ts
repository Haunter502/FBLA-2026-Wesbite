import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { flashcardSets, flashcards } from "../../../../../drizzle/schema"
import { eq, asc } from "@/lib/drizzle-helpers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;
    const [flashcardSet] = await db
      .select()
      .from(flashcardSets)
      .where(eq(flashcardSets.id, setId))
      .limit(1)

    if (!flashcardSet) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
    }

    const cards = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.setId, setId))
      .orderBy(asc(flashcards.order))

    return NextResponse.json({ ...flashcardSet, flashcards: cards })
  } catch (error) {
    console.error("Error fetching flashcard set:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
