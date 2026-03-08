import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { flashcardSets, flashcards } from "@/lib/schema"
import { FlashcardViewer } from "@/components/flashcards/flashcard-viewer"
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

  return { ...set, flashcards: cards }
}

export default async function ResourceFlashcardPage({
  params,
}: {
  params: Promise<{ setId: string }>
}) {
  const session = await auth()
  if (!session || !session.user?.id) {
    redirect("/auth/sign-in")
  }

  const { setId } = await params
  const set = await getFlashcardSet(setId)
  if (!set) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/resources/flashcards">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
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
