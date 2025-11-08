import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { flashcardSets, flashcards, lessons, units } from "../../../../../../drizzle/schema"
import { FlashcardViewer } from "@/components/flashcards/flashcard-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { eq, asc } from "@/lib/drizzle-helpers"

async function getFlashcardSet(setId: string) {
  const [set] = await db.select().from(flashcardSets).where(eq(flashcardSets.id, setId)).limit(1)

  if (!set) return null

  const cards = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.setId, setId))
    .orderBy(asc(flashcards.order))

  let lesson = null
  let unit = null

  if (set.lessonId) {
    const [l] = await db
      .select({ id: lessons.id, slug: lessons.slug, title: lessons.title })
      .from(lessons)
      .where(eq(lessons.id, set.lessonId))
      .limit(1)
    lesson = l
  }

  if (set.unitId) {
    const [u] = await db
      .select({ id: units.id, slug: units.slug, title: units.title })
      .from(units)
      .where(eq(units.id, set.unitId))
      .limit(1)
    unit = u
  }

  return {
    ...set,
    flashcards: cards,
    lesson,
    unit,
  }
}

export default async function FlashcardPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const set = await getFlashcardSet(setId)

  if (!set) {
    notFound()
  }

  const backLink = set.lesson
    ? `/lessons/${set.lesson.slug}`
    : `/units/${set.unit?.slug}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={backLink}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {set.lesson ? "Lesson" : "Unit"}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{set.title}</h1>
        {set.description && (
          <p className="text-muted-foreground">{set.description}</p>
        )}
      </div>

      <FlashcardViewer flashcards={set.flashcards} />
    </div>
  )
}
